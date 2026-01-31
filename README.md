# SimplePaste

一个基于 Cloudflare Workers + KV + R2 的轻量级文本/文件分享工具，**完全无外部依赖**，所有 CSS 和 JavaScript 均内联。

## ✨ 功能特性

- ✅ **文本分享** - 支持纯文本分享
- ✅ **文件分享** - 支持最大 25MB 文件上传和下载（使用 R2 存储）
- ✅ **密码保护** - 可选设置访问密码
- ✅ **阅后即焚** - 查看/下载一次后自动删除
- ✅ **过期时间** - 文本可设置永久，文件最长 30 天
- ✅ **管理后台** - 查看所有分享、删除管理
- ✅ **完全免费** - 基于 Cloudflare 免费套餐
- ✅ **无外部依赖** - 所有资源内联，完全离线可用

## 🎯 与 CloudPaste 的区别

- **无外部依赖**：所有 CSS 和 JavaScript 内联，不依赖任何 CDN
- **简化功能**：移除了代码高亮、语言选择等美化功能
- **更轻量**：页面更简洁，加载更快
- **完全离线**：本地开发时无需网络连接即可运行

## 🚀 快速部署

### 方式一：GitHub Actions 自动部署（推荐）

1. **Fork 本仓库**

2. **获取 Cloudflare 凭据**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 获取 Account ID（在右侧边栏）
   - 创建 API Token（选择 `Edit Cloudflare Workers` 模板）

3. **配置 GitHub Secrets**
   - 进入 `Settings` → `Secrets and variables` → `Actions`
   - 添加以下 Secrets：
     - `CLOUDFLARE_API_TOKEN` - 你的 API Token
     - `CLOUDFLARE_ACCOUNT_ID` - 你的 Account ID
     - `ADMIN_PASSWORD` - 管理密码
     - `CUSTOM_DOMAIN` - 自定义域名（可选，如：paste.example.com）

4. **运行部署**
   - 进入 `Actions` 标签页
   - 点击 `Run workflow` → `Run workflow`
   - 等待部署完成

### 方式二：手动部署（Wrangler CLI）

1. **克隆项目**
   ```bash
   git clone https://github.com/YOUR_USERNAME/SimplePaste.git
   cd SimplePaste
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **登录 Cloudflare**
   ```bash
   npx wrangler login
   ```

4. **创建 KV 命名空间**
   ```bash
   npx wrangler kv:namespace create PASTE_KV
   ```
   将输出的 `id` 值复制到 `wrangler.toml` 文件中。

5. **创建 R2 存储桶**
   ```bash
   npx wrangler r2 bucket create simplepaste-files
   ```

6. **设置管理密码**
   ```bash
   npx wrangler secret put ADMIN_PASSWORD
   ```

7. **部署**
   ```bash
   npm run deploy
   ```

8. **配置 R2 生命周期规则**（可选但推荐）
   - 进入 Cloudflare Dashboard → R2 → simplepaste-files → Settings
   - 添加 Object lifecycle rule：Delete objects after 30 days
   - 这将自动清理过期文件，节省存储空间

## 💻 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问
open http://localhost:8787
```

注意：本地开发时需要创建一个预览用的 KV 命名空间：

```bash
npx wrangler kv:namespace create PASTE_KV --preview
```

然后将 `preview_id` 添加到 `wrangler.toml`。

## 📁 项目结构

```
SimplePaste/
├── src/
│   ├── index.ts          # Worker 入口，路由处理
│   ├── types.ts          # TypeScript 类型定义
│   ├── api/
│   │   ├── paste.ts      # 文本分享 API
│   │   ├── file.ts       # 文件分享 API（R2 存储）
│   │   ├── admin.ts      # 管理相关 API
│   │   └── utils.ts      # 工具函数
│   └── pages/
│       ├── home.ts       # 首页 HTML（内联 CSS/JS）
│       ├── view.ts       # 查看页 HTML（内联 CSS/JS）
│       ├── admin.ts      # 管理页 HTML（内联 CSS/JS）
│       └── 404.ts        # 404 页面 HTML（内联 CSS）
├── wrangler.toml         # Cloudflare Workers 配置
├── tsconfig.json         # TypeScript 配置
├── package.json          # 项目依赖
└── README.md
```

## 📡 API 接口

### 文本分享接口

| 方法 | 端点 | 功能 |
|------|------|------|
| `POST` | `/api/paste` | 创建文本分享 |
| `GET` | `/api/paste/:id` | 获取文本（需密码验证） |
| `GET` | `/api/paste/:id/raw` | 获取原始文本 |
| `GET` | `/api/paste/:id/exists` | 检查分享是否存在 |

### 文件分享接口

| 方法 | 端点 | 功能 |
|------|------|------|
| `POST` | `/api/file` | 上传文件（FormData） |
| `GET` | `/api/file/:id` | 下载文件（需密码验证） |
| `GET` | `/api/file/:id/info` | 获取文件信息 |

### 管理接口（需认证）

| 方法 | 端点 | 功能 |
|------|------|------|
| `POST` | `/api/admin/login` | 管理员登录 |
| `GET` | `/api/admin/list` | 获取分享列表 |
| `DELETE` | `/api/admin/paste/:id` | 删除指定分享（含文件） |

## 🔒 安全说明

- 密码使用 SHA-256 哈希存储
- 管理 Token 有效期 24 小时
- 阅后即焚的分享查看后立即删除
- 过期分享由 Cloudflare KV 自动清理

## 📊 Cloudflare 免费配额

| 资源 | 免费配额 | 说明 |
|------|----------|------|
| Workers 请求 | 100,000 次/天 | 足够个人使用 |
| KV 读取 | 100,000 次/天 | 每次访问分享 |
| KV 写入 | 1,000 次/天 | 每次创建分享 |
| KV 存储 | 1 GB | 可存储大量文本 |
| R2 存储 | 10 GB | 文件存储空间 |
| R2 A 类操作 | 1,000,000 次/月 | 上传、列表等 |
| R2 B 类操作 | 10,000,000 次/月 | 下载 |

## 🌐 自定义域名

如果配置了 `CUSTOM_DOMAIN` Secret，部署时会自动绑定自定义域名。确保：

1. 域名已添加到 Cloudflare 账户并已激活
2. 域名不能有现有的 CNAME 记录
3. API Token 有足够的权限

## 📝 更新日志

### v1.1.0

- ✅ 新增文件分享功能（最大 25MB）
- ✅ 使用 Cloudflare R2 存储文件
- ✅ 文件支持密码保护和阅后即焚
- ✅ 管理后台支持文件类型显示和删除
- ✅ R2 生命周期规则自动清理过期文件

### v1.0.0

- ✅ 基本文本分享功能
- ✅ 密码保护
- ✅ 阅后即焚
- ✅ 过期时间设置
- ✅ 管理后台
- ✅ 完全无外部依赖

## 📄 License

MIT License

## 🙏 致谢

- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless 平台
- [Cloudflare R2](https://developers.cloudflare.com/r2/) - 对象存储
- 基于 [CloudPaste](https://github.com/YOUR_USERNAME/CloudPaste) 项目简化而来
