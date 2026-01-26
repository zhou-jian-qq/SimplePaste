import { Env } from './types';
import { createPaste, getPaste, getRawPaste, checkPasteExists } from './api/paste';
import { adminLogin, listPastes, deletePaste } from './api/admin';
import { errorResponse } from './api/utils';

// 页面 HTML
import { getHomePage } from './pages/home';
import { getViewPage } from './pages/view';
import { getAdminPage } from './pages/admin';
import { get404Page } from './pages/404';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS 预检请求
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    try {
      // API 路由
      if (path.startsWith('/api/')) {
        return await handleApiRoute(request, env, path, method);
      }

      // 页面路由
      return await handlePageRoute(request, env, path);
    } catch (error) {
      console.error('Unhandled error:', error);
      return errorResponse('Internal server error', 500);
    }
  },
};

// 处理 API 路由
async function handleApiRoute(
  request: Request,
  env: Env,
  path: string,
  method: string
): Promise<Response> {
  // POST /api/paste - 创建分享
  if (path === '/api/paste' && method === 'POST') {
    return await createPaste(request, env);
  }

  // GET /api/paste/:id - 获取分享
  const pasteMatch = path.match(/^\/api\/paste\/([a-zA-Z0-9]+)$/);
  if (pasteMatch && method === 'GET') {
    return await getPaste(request, env, pasteMatch[1]);
  }

  // GET /api/paste/:id/raw - 获取原始文本
  const rawMatch = path.match(/^\/api\/paste\/([a-zA-Z0-9]+)\/raw$/);
  if (rawMatch && method === 'GET') {
    return await getRawPaste(request, env, rawMatch[1]);
  }

  // GET /api/paste/:id/exists - 检查是否存在
  const existsMatch = path.match(/^\/api\/paste\/([a-zA-Z0-9]+)\/exists$/);
  if (existsMatch && method === 'GET') {
    return await checkPasteExists(env, existsMatch[1]);
  }

  // POST /api/admin/login - 管理员登录
  if (path === '/api/admin/login' && method === 'POST') {
    return await adminLogin(request, env);
  }

  // GET /api/admin/list - 获取列表
  if (path === '/api/admin/list' && method === 'GET') {
    return await listPastes(request, env);
  }

  // DELETE /api/admin/paste/:id - 删除分享
  const deleteMatch = path.match(/^\/api\/admin\/paste\/([a-zA-Z0-9]+)$/);
  if (deleteMatch && method === 'DELETE') {
    return await deletePaste(request, env, deleteMatch[1]);
  }

  return errorResponse('Not found', 404);
}

// 处理页面路由
async function handlePageRoute(
  request: Request,
  env: Env,
  path: string
): Promise<Response> {
  // 首页
  if (path === '/' || path === '') {
    return new Response(getHomePage(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // 管理页面
  if (path === '/admin') {
    return new Response(getAdminPage(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // 查看页面 (/:id)
  const viewMatch = path.match(/^\/([a-zA-Z0-9]+)$/);
  if (viewMatch) {
    // 检查是否存在
    const id = viewMatch[1];
    const data = await env.PASTE_KV.get(`paste:${id}`);
    
    if (!data) {
      return new Response(get404Page(), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    
    return new Response(getViewPage(id), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // 404
  return new Response(get404Page(), {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
