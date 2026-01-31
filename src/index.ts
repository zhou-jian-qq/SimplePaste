import { Env, PasteData } from './types';
import { createPaste, getPaste, getRawPaste, checkPasteExists } from './api/paste';
import { uploadFile, downloadFile, getFileInfo } from './api/file';
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
  // POST /api/paste - 创建文本分享
  if (path === '/api/paste' && method === 'POST') {
    return await createPaste(request, env);
  }

  // POST /api/file - 上传文件
  if (path === '/api/file' && method === 'POST') {
    return await uploadFile(request, env);
  }

  // GET /api/file/:id - 下载文件
  const fileDownloadMatch = path.match(/^\/api\/file\/([a-zA-Z0-9]+)$/);
  if (fileDownloadMatch && method === 'GET') {
    return await downloadFile(request, env, fileDownloadMatch[1]);
  }

  // GET /api/file/:id/info - 获取文件信息
  const fileInfoMatch = path.match(/^\/api\/file\/([a-zA-Z0-9]+)\/info$/);
  if (fileInfoMatch && method === 'GET') {
    return await getFileInfo(request, env, fileInfoMatch[1]);
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
  // Favicon
  if (path === '/favicon.ico') {
    // 返回一个简单的 SVG favicon（符合项目的紫色渐变主题）
    const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="6" fill="url(#grad)"/>
      <text x="16" y="22" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">S</text>
    </svg>`;
    return new Response(faviconSvg, {
      headers: { 
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  }

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

    // 解析数据判断类型
    const paste: PasteData = JSON.parse(data);
    const isFile = paste.type === 'file';
    
    return new Response(getViewPage(id, isFile), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // 404
  return new Response(get404Page(), {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
