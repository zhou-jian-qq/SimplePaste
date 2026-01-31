import { Env } from '../types';

// 获取今天的日期字符串（YYYY-MM-DD）
function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 生成随机 ID（6 位数字：前2位日期 + 中间3位流水号 + 最后1位随机数字）
export async function generateId(env: Env): Promise<string> {
  const now = new Date();
  const today = getTodayString();
  const counterKey = `id_counter:${today}`;
  
  // 获取当前序号
  let counterData = await env.PASTE_KV.get(counterKey);
  let sequence = 1;
  
  if (counterData) {
    const parsed = JSON.parse(counterData);
    sequence = parsed.sequence || 1;
    
    // 如果序号达到999，重置为1
    if (sequence >= 999) {
      sequence = 1;
    } else {
      sequence++;
    }
  }
  
  // 保存新的序号
  await env.PASTE_KV.put(counterKey, JSON.stringify({ 
    sequence,
    date: today 
  }), { expirationTtl: 86400 }); // 24小时后过期
  
  // 前2位：当前日期（01-31）
  const dayPart = String(now.getDate()).padStart(2, '0');
  
  // 中间3位：流水号（001-999）
  const sequencePart = String(sequence).padStart(3, '0');
  
  // 最后1位：随机数字（0-9）
  const randomValues = new Uint8Array(1);
  crypto.getRandomValues(randomValues);
  const randomDigit = String(randomValues[0] % 10);
  
  // 组合：日期(2位) + 流水号(3位) + 随机数字(1位)
  return dayPart + sequencePart + randomDigit;
}

// SHA-256 哈希
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 生成管理 Token
export async function generateAdminToken(password: string): Promise<string> {
  const timestamp = Date.now();
  const data = `${password}:${timestamp}`;
  const hash = await sha256(data);
  // Token 格式：timestamp.hash
  return `${timestamp}.${hash}`;
}

// 验证管理 Token（24小时有效）
export async function verifyAdminToken(token: string, password: string): Promise<boolean> {
  if (!token) return false;
  
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  
  const [timestampStr, hash] = parts;
  const timestamp = parseInt(timestampStr, 10);
  
  if (isNaN(timestamp)) return false;
  
  // 检查是否过期（24小时）
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  if (now - timestamp > maxAge) return false;
  
  // 验证 hash
  const expectedHash = await sha256(`${password}:${timestamp}`);
  return hash === expectedHash;
}

// 获取客户端 IP
export function getClientIp(request: Request): string {
  // Cloudflare 生产环境
  const cfIp = request.headers.get('CF-Connecting-IP');
  if (cfIp) return cfIp;
  
  // 代理环境
  const forwardedFor = request.headers.get('X-Forwarded-For');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  
  // 其他常见头
  const realIp = request.headers.get('X-Real-IP');
  if (realIp) return realIp;
  
  // 本地开发环境 - 尝试从 URL 获取
  try {
    const url = new URL(request.url);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return '127.0.0.1 (本地)';
    }
  } catch {}
  
  return 'unknown';
}

// 创建 JSON 响应
export function jsonResponse<T>(data: T, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    },
  });
}

// 创建错误响应
export function errorResponse(message: string, status: number = 400): Response {
  return jsonResponse({ success: false, error: message }, status);
}

// 创建成功响应
export function successResponse<T>(data: T): Response {
  return jsonResponse({ success: true, data });
}

// 截取内容预览
export function getContentPreview(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
}

// 解析过期时间
export function parseExpiresIn(expiresIn?: number): number | null {
  if (!expiresIn || expiresIn <= 0) {
    // 默认 7 天
    return Date.now() + 7 * 24 * 60 * 60 * 1000;
  }
  return Date.now() + expiresIn * 1000;
}

// 计算 KV TTL（秒）
export function calculateTtl(expiresAt: number | null): number | undefined {
  if (!expiresAt) return undefined;
  const ttl = Math.floor((expiresAt - Date.now()) / 1000);
  return ttl > 0 ? ttl : 60; // 最小 60 秒
}
