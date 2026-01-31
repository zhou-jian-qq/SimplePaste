// 环境变量类型
export interface Env {
    PASTE_KV: KVNamespace;
    FILE_BUCKET: R2Bucket;
    ADMIN_PASSWORD: string;
}

// 分享数据结构
export interface PasteData {
    id: string;
    type: 'text' | 'file';       // 类型：文本或文件
    content: string;              // 文本内容（type=text 时使用）
    fileName?: string;            // 原始文件名（type=file 时使用）
    fileSize?: number;            // 文件大小（字节）
    mimeType?: string;            // 文件 MIME 类型
    lang: string;
    password: string | null;      // SHA-256 哈希后的密码
    rawPassword?: string | null;  // 原始密码（仅管理员可见）
    burnAfterRead: boolean;
    createdAt: number;
    expiresAt: number | null;
    viewCount: number;
    creatorIp: string;
}

// 创建文本分享请求
export interface CreatePasteRequest {
    content: string;
    lang?: string;
    password?: string;
    burnAfterRead?: boolean;
    expiresIn?: number; // 过期时间（秒）
}

// 创建文件分享请求（通过 FormData 传递）
export interface CreateFileRequest {
    password?: string;
    burnAfterRead?: boolean;
    expiresIn?: number; // 过期时间（秒），最大 30 天
}

// 列表项（管理后台用）
export interface PasteListItem {
    id: string;
    type: 'text' | 'file';        // 类型：文本或文件
    lang: string;
    hasPassword: boolean;
    rawPassword?: string | null;  // 原始密码（仅管理员可见）
    burnAfterRead: boolean;
    createdAt: number;
    expiresAt: number | null;
    viewCount: number;
    contentPreview: string;        // 文本预览或文件名
    fileSize?: number;             // 文件大小（仅文件类型）
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
