import { Env, PasteData, PasteListItem, ListResponse } from '../types';
import {
    sha256,
    generateAdminToken,
    verifyAdminToken,
    successResponse,
    errorResponse,
    getContentPreview,
} from './utils';

const KV_PREFIX = 'paste:';

// 管理员登录
export async function adminLogin(
    request: Request,
    env: Env
): Promise<Response> {
    try {
        const body = await request.json() as { password: string };

        if (!body.password) {
            return errorResponse('Password is required', 400);
        }

        // 验证密码
        if (body.password !== env.ADMIN_PASSWORD) {
            return errorResponse('Invalid password', 403);
        }

        // 生成 Token
        const token = await generateAdminToken(env.ADMIN_PASSWORD);

        return successResponse({
            token,
            expiresIn: 24 * 60 * 60, // 24 hours in seconds
        });
    } catch (error) {
        console.error('Admin login error:', error);
        return errorResponse('Login failed', 500);
    }
}

// 验证管理员 Token
export async function verifyAdmin(
    request: Request,
    env: Env
): Promise<boolean> {
    const token = request.headers.get('X-Admin-Token');
    if (!token) return false;
    return await verifyAdminToken(token, env.ADMIN_PASSWORD);
}

// 获取分享列表
export async function listPastes(
    request: Request,
    env: Env
): Promise<Response> {
    try {
        // 验证权限
        if (!await verifyAdmin(request, env)) {
            return errorResponse('Unauthorized', 401);
        }

        const url = new URL(request.url);
        const cursor = url.searchParams.get('cursor') || undefined;
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);

        // 列出所有 keys
        const listResult = await env.PASTE_KV.list({
            prefix: KV_PREFIX,
            limit,
            cursor,
        });

        const items: PasteListItem[] = [];

        // 获取每个 paste 的详细信息
        for (const key of listResult.keys) {
            const data = await env.PASTE_KV.get(key.name);
            if (data) {
                const paste: PasteData = JSON.parse(data);
                items.push({
                    id: paste.id,
                    lang: paste.lang,
                    hasPassword: paste.password !== null,
                    burnAfterRead: paste.burnAfterRead,
                    createdAt: paste.createdAt,
                    expiresAt: paste.expiresAt,
                    viewCount: paste.viewCount,
                    contentPreview: getContentPreview(paste.content),
                    creatorIp: paste.creatorIp,
                });
            }
        }

        // 按创建时间倒序排序
        items.sort((a, b) => b.createdAt - a.createdAt);

        const response: ListResponse = {
            items,
            cursor: listResult.list_complete ? null : listResult.cursor,
        };

        return successResponse(response);
    } catch (error) {
        console.error('List pastes error:', error);
        return errorResponse('Failed to list pastes', 500);
    }
}

// 删除分享
export async function deletePaste(
    request: Request,
    env: Env,
    id: string
): Promise<Response> {
    try {
        // 验证权限
        if (!await verifyAdmin(request, env)) {
            return errorResponse('Unauthorized', 401);
        }

        // 检查是否存在
        const data = await env.PASTE_KV.get(KV_PREFIX + id);
        if (!data) {
            return errorResponse('Paste not found', 404);
        }

        // 删除
        await env.PASTE_KV.delete(KV_PREFIX + id);

        return successResponse({ deleted: true, id });
    } catch (error) {
        console.error('Delete paste error:', error);
        return errorResponse('Failed to delete paste', 500);
    }
}
