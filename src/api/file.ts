import { Env, PasteData } from '../types';
import {
    generateId,
    sha256,
    getClientIp,
    successResponse,
    errorResponse,
    calculateTtl,
} from './utils';

const KV_PREFIX = 'paste:';
const R2_PREFIX = 'files/';
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

// 解析文件过期时间（最大 30 天）
function parseFileExpiresIn(expiresIn?: number): number {
    const maxExpiry = 30 * 24 * 60 * 60; // 30 天（秒）
    
    if (!expiresIn || expiresIn <= 0) {
        // 默认 7 天
        return Date.now() + 7 * 24 * 60 * 60 * 1000;
    }
    
    // 限制最大 30 天
    const actualExpiry = Math.min(expiresIn, maxExpiry);
    return Date.now() + actualExpiry * 1000;
}

// 上传文件
export async function uploadFile(
    request: Request,
    env: Env
): Promise<Response> {
    try {
        // 解析 FormData
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        
        if (!file) {
            return errorResponse('No file provided', 400);
        }

        // 检查文件大小
        if (file.size > MAX_FILE_SIZE) {
            return errorResponse(`File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`, 400);
        }

        if (file.size === 0) {
            return errorResponse('File is empty', 400);
        }

        // 获取其他参数
        const password = formData.get('password') as string | null;
        const burnAfterRead = formData.get('burnAfterRead') === 'true';
        const expiresInStr = formData.get('expiresIn') as string | null;
        const expiresIn = expiresInStr ? parseInt(expiresInStr, 10) : undefined;

        const id = await generateId(env);
        const now = Date.now();
        const expiresAt = parseFileExpiresIn(expiresIn);
        const clientIp = getClientIp(request);

        // 创建元数据
        const pasteData: PasteData = {
            id,
            type: 'file',
            content: '',  // 文件类型不存储内容
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type || 'application/octet-stream',
            lang: 'file',
            password: password ? await sha256(password) : null,
            rawPassword: password || null,
            burnAfterRead,
            createdAt: now,
            expiresAt,
            viewCount: 0,
            creatorIp: clientIp,
        };

        // 上传文件到 R2
        const fileBuffer = await file.arrayBuffer();
        await env.FILE_BUCKET.put(R2_PREFIX + id, fileBuffer, {
            httpMetadata: {
                contentType: file.type || 'application/octet-stream',
            },
            customMetadata: {
                originalName: file.name,
            },
        });

        // 存储元数据到 KV
        const ttl = calculateTtl(expiresAt);
        await env.PASTE_KV.put(
            KV_PREFIX + id,
            JSON.stringify(pasteData),
            ttl ? { expirationTtl: ttl } : undefined
        );

        // 构建 URL
        const url = new URL(request.url);
        const shareUrl = `${url.protocol}//${url.host}/${id}`;

        return successResponse({
            id,
            url: shareUrl,
            fileName: file.name,
            fileSize: file.size,
            createdAt: now,
            expiresAt,
        });
    } catch (error) {
        console.error('Upload file error:', error);
        return errorResponse('Failed to upload file', 500);
    }
}

// 下载文件
export async function downloadFile(
    request: Request,
    env: Env,
    id: string
): Promise<Response> {
    try {
        const url = new URL(request.url);
        const password = url.searchParams.get('password');

        // 获取元数据
        const data = await env.PASTE_KV.get(KV_PREFIX + id);

        if (!data) {
            return errorResponse('File not found', 404);
        }

        const paste: PasteData = JSON.parse(data);

        // 确认是文件类型
        if (paste.type !== 'file') {
            return errorResponse('Not a file', 400);
        }

        // 验证密码
        if (paste.password) {
            if (!password) {
                return successResponse({
                    id: paste.id,
                    type: 'file',
                    requirePassword: true,
                    fileName: paste.fileName,
                    fileSize: paste.fileSize,
                    createdAt: paste.createdAt,
                });
            }

            const hashedPassword = await sha256(password);
            if (hashedPassword !== paste.password) {
                return errorResponse('Invalid password', 403);
            }
        }

        // 从 R2 获取文件
        const fileObject = await env.FILE_BUCKET.get(R2_PREFIX + id);

        if (!fileObject) {
            // R2 中文件不存在，清理 KV 中的元数据
            await env.PASTE_KV.delete(KV_PREFIX + id);
            return errorResponse('File not found in storage', 404);
        }

        // 更新查看次数
        paste.viewCount++;

        // 检查阅后即焚
        if (paste.burnAfterRead) {
            // 删除 KV 元数据和 R2 文件
            await env.PASTE_KV.delete(KV_PREFIX + id);
            await env.FILE_BUCKET.delete(R2_PREFIX + id);
        } else {
            // 更新查看次数
            const ttl = calculateTtl(paste.expiresAt);
            await env.PASTE_KV.put(
                KV_PREFIX + id,
                JSON.stringify(paste),
                ttl ? { expirationTtl: ttl } : undefined
            );
        }

        // 返回文件
        const headers = new Headers();
        headers.set('Content-Type', paste.mimeType || 'application/octet-stream');
        headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(paste.fileName || 'download')}"`);
        headers.set('Content-Length', String(paste.fileSize || fileObject.size));
        headers.set('Access-Control-Allow-Origin', '*');

        return new Response(fileObject.body, {
            headers,
        });
    } catch (error) {
        console.error('Download file error:', error);
        return errorResponse('Failed to download file', 500);
    }
}

// 获取文件信息（不下载）
export async function getFileInfo(
    request: Request,
    env: Env,
    id: string
): Promise<Response> {
    try {
        const url = new URL(request.url);
        const password = url.searchParams.get('password');

        const data = await env.PASTE_KV.get(KV_PREFIX + id);

        if (!data) {
            return errorResponse('File not found', 404);
        }

        const paste: PasteData = JSON.parse(data);

        if (paste.type !== 'file') {
            return errorResponse('Not a file', 400);
        }

        // 验证密码
        if (paste.password) {
            if (!password) {
                return successResponse({
                    id: paste.id,
                    type: 'file',
                    requirePassword: true,
                    fileName: paste.fileName,
                    fileSize: paste.fileSize,
                    createdAt: paste.createdAt,
                });
            }

            const hashedPassword = await sha256(password);
            if (hashedPassword !== paste.password) {
                return errorResponse('Invalid password', 403);
            }
        }

        return successResponse({
            id: paste.id,
            type: 'file',
            fileName: paste.fileName,
            fileSize: paste.fileSize,
            mimeType: paste.mimeType,
            createdAt: paste.createdAt,
            expiresAt: paste.expiresAt,
            viewCount: paste.viewCount,
            burnAfterRead: paste.burnAfterRead,
        });
    } catch (error) {
        console.error('Get file info error:', error);
        return errorResponse('Failed to get file info', 500);
    }
}

// 删除文件（管理员用）
export async function deleteFile(
    env: Env,
    id: string
): Promise<void> {
    // 删除 R2 中的文件
    await env.FILE_BUCKET.delete(R2_PREFIX + id);
}
