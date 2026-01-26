// 环境变量类型
export interface Env {
  PASTE_KV: KVNamespace;
  ADMIN_PASSWORD: string;
}

// 分享数据结构
export interface PasteData {
  id: string;
  content: string;
  lang: string;
  password: string | null;
  burnAfterRead: boolean;
  createdAt: number;
  expiresAt: number | null;
  viewCount: number;
  creatorIp: string;
}

// 创建分享请求
export interface CreatePasteRequest {
  content: string;
  lang?: string;
  password?: string;
  burnAfterRead?: boolean;
  expiresIn?: number; // 过期时间（秒）
}

// 列表项（管理后台用）
export interface PasteListItem {
  id: string;
  lang: string;
  hasPassword: boolean;
  burnAfterRead: boolean;
  createdAt: number;
  expiresAt: number | null;
  viewCount: number;
  contentPreview: string;
  creatorIp: string;
}

// API 响应格式
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// 列表响应
export interface ListResponse {
  items: PasteListItem[];
  cursor: string | null;
}
