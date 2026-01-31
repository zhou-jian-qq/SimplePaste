import { Env, PasteData, CreatePasteRequest } from '../types';
import {
    generateId,
    sha256,
    getClientIp,
    successResponse,
    errorResponse,
    getContentPreview,
    parseExpiresIn,
    calculateTtl,
} from './utils';

const KV_PREFIX = 'paste:';

// 创建分享
export async function createPaste(
    request: Request,
    env: Env
): Promise<Response> {
    try {
        const body = await request.json() as CreatePasteRequest;

        if (!body.content || body.content.trim() === '') {
            return errorResponse('Content is required', 400);
        }

        // 限制内容大小（1MB）
        if (body.content.length > 1024 * 1024) {
            return errorResponse('Content too large (max 1MB)', 400);
        }

        const id = await generateId(env);
        const now = Date.now();
        const expiresAt = parseExpiresIn(body.expiresIn);
        const clientIp = getClientIp(request);

        const pasteData: PasteData = {
            id,
            type: 'text',
            content: body.content,
            lang: body.lang || 'plaintext',
            password: body.password ? await sha256(body.password) : null,
            rawPassword: body.password || null,
            burnAfterRead: body.burnAfterRead || false,
            createdAt: now,
            expiresAt,
            viewCount: 0,
            creatorIp: clientIp,
        };

        // 计算 TTL
        const ttl = calculateTtl(expiresAt);

        // 存储到 KV
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
            createdAt: now,
            expiresAt,
        });
    } catch (error) {
        console.error('Create paste error:', error);
        return errorResponse('Failed to create paste', 500);
    }
}

// 获取分享
export async function getPaste(
    request: Request,
    env: Env,
    id: string
): Promise<Response> {
    try {
        const url = new URL(request.url);
        const password = url.searchParams.get('password');

        const data = await env.PASTE_KV.get(KV_PREFIX + id);

        if (!data) {
            return errorResponse('Paste not found', 404);
        }

        const paste: PasteData = JSON.parse(data);

        // 验证密码
        if (paste.password) {
            if (!password) {
                return successResponse({
                    id: paste.id,
                    requirePassword: true,
                    lang: paste.lang,
                    createdAt: paste.createdAt,
                });
            }

            const hashedPassword = await sha256(password);
            if (hashedPassword !== paste.password) {
                return errorResponse('Invalid password', 403);
            }
        }

        // 更新查看次数
        paste.viewCount++;

        // 检查阅后即焚
        if (paste.burnAfterRead) {
            // 删除
            await env.PASTE_KV.delete(KV_PREFIX + id);
        } else {
            // 更新查看次数
            const ttl = calculateTtl(paste.expiresAt);
            await env.PASTE_KV.put(
                KV_PREFIX + id,
                JSON.stringify(paste),
                ttl ? { expirationTtl: ttl } : undefined
            );
        }

        return successResponse({
            id: paste.id,
            content: paste.content,
            lang: paste.lang,
            createdAt: paste.createdAt,
            expiresAt: paste.expiresAt,
            viewCount: paste.viewCount,
            burnAfterRead: paste.burnAfterRead,
        });
    } catch (error) {
        console.error('Get paste error:', error);
        return errorResponse('Failed to get paste', 500);
    }
}

// 获取原始文本
export async function getRawPaste(
    request: Request,
    env: Env,
    id: string
): Promise<Response> {
    try {
        const url = new URL(request.url);
        const password = url.searchParams.get('password');

        const data = await env.PASTE_KV.get(KV_PREFIX + id);

        if (!data) {
            return new Response('Not found', { status: 404 });
        }

        const paste: PasteData = JSON.parse(data);

        // 验证密码
        if (paste.password) {
            if (!password) {
                return new Response('Password required', { status: 401 });
            }

            const hashedPassword = await sha256(password);
            if (hashedPassword !== paste.password) {
                return new Response('Invalid password', { status: 403 });
            }
        }

        // 更新查看次数
        paste.viewCount++;

        // 检查阅后即焚
        if (paste.burnAfterRead) {
            await env.PASTE_KV.delete(KV_PREFIX + id);
        } else {
            const ttl = calculateTtl(paste.expiresAt);
            await env.PASTE_KV.put(
                KV_PREFIX + id,
                JSON.stringify(paste),
                ttl ? { expirationTtl: ttl } : undefined
            );
        }

        return new Response(paste.content, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });
    } catch (error) {
        console.error('Get raw paste error:', error);
        return new Response('Internal error', { status: 500 });
    }
}

// 检查是否存在
export async function checkPasteExists(
    env: Env,
    id: string
): Promise<Response> {
    const data = await env.PASTE_KV.get(KV_PREFIX + id);

    if (!data) {
        return successResponse({ exists: false });
    }

    const paste: PasteData = JSON.parse(data);

    return successResponse({
        exists: true,
        requirePassword: paste.password !== null,
        burnAfterRead: paste.burnAfterRead,
    });
}
