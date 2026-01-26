export function getViewPage(id: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SimplePaste - 查看分享</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      color: #e5e5e5;
      padding: 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    header {
      text-align: center;
      margin-bottom: 30px;
    }
    h1 {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 10px;
    }
    h1 a {
      text-decoration: none;
    }
    .card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      margin-bottom: 20px;
    }
    .password-form {
      margin-bottom: 20px;
    }
    label {
      display: block;
      font-size: 0.9rem;
      color: #d1d5db;
      margin-bottom: 8px;
      font-weight: 500;
    }
    input {
      width: 100%;
      padding: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.3);
      color: #e5e5e5;
      font-size: 0.95rem;
      font-family: inherit;
    }
    input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
    .btn {
      padding: 12px 24px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-right: 10px;
      margin-top: 10px;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
    }
    .btn-secondary {
      background: #374151;
    }
    .btn-secondary:hover {
      background: #4b5563;
    }
    .content-wrapper {
      position: relative;
      margin-bottom: 15px;
    }
    .content-box {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 20px;
      font-family: 'Courier New', monospace;
      font-size: 0.95rem;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-x: auto;
      min-height: 200px;
    }
    .copy-content-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 8px 16px;
      background: rgba(99, 102, 241, 0.8);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(10px);
    }
    .copy-content-btn:hover {
      background: rgba(99, 102, 241, 1);
      transform: translateY(-1px);
    }
    .copy-content-btn:active {
      transform: translateY(0);
    }
    .loading {
      text-align: center;
      padding: 40px;
      color: #9ca3af;
    }
    .error {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.5);
      color: #fca5a5;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .info {
      color: #9ca3af;
      font-size: 0.85rem;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    @media (max-width: 640px) {
      h1 {
        font-size: 2rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <a href="/">
        <h1>SimplePaste</h1>
      </a>
    </header>

    <div class="card">
      <div id="passwordForm" class="password-form" style="display: none;">
        <label for="password">请输入访问密码</label>
        <input 
          type="text" 
          id="password" 
          placeholder="输入密码"
          onkeypress="if(event.key==='Enter') loadContent()"
        />
        <button class="btn" onclick="loadContent()">查看</button>
      </div>

      <div id="loading" class="loading">加载中...</div>
      <div id="error" class="error" style="display: none;"></div>
      <div id="content" style="display: none;">
        <div class="content-wrapper">
          <button class="copy-content-btn" onclick="copyContent()" title="复制内容">复制内容</button>
          <div class="content-box" id="contentBox"></div>
        </div>
        <div class="info">
          <div>查看次数: <span id="viewCount">0</span></div>
          <div style="margin-top: 5px;">创建时间: <span id="createdAt"></span></div>
        </div>
        <button class="btn" onclick="copyUrl()">复制链接</button>
        <button class="btn btn-secondary" onclick="window.location.href='/'">返回首页</button>
      </div>
    </div>
  </div>

  <script>
    const pasteId = '${id}';
    let shareUrl = window.location.href;

    async function loadContent() {
      const password = document.getElementById('password')?.value || '';
      const passwordForm = document.getElementById('passwordForm');
      const loading = document.getElementById('loading');
      const error = document.getElementById('error');
      const content = document.getElementById('content');

      loading.style.display = 'block';
      error.style.display = 'none';
      content.style.display = 'none';
      if (passwordForm) passwordForm.style.display = 'none';

      try {
        const url = password 
          ? \`/api/paste/\${pasteId}?password=\${encodeURIComponent(password)}\`
          : \`/api/paste/\${pasteId}\`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || !data.success) {
          if (data.error === 'Invalid password') {
            throw new Error('密码错误');
          } else if (data.data?.requirePassword) {
            passwordForm.style.display = 'block';
            loading.style.display = 'none';
            return;
          } else {
            throw new Error(data.error || '加载失败');
          }
        }

        if (data.data.requirePassword) {
          passwordForm.style.display = 'block';
          loading.style.display = 'none';
          return;
        }

        document.getElementById('contentBox').textContent = data.data.content || '';
        document.getElementById('viewCount').textContent = data.data.viewCount || 0;
        
        if (data.data.createdAt) {
          const date = new Date(data.data.createdAt);
          document.getElementById('createdAt').textContent = date.toLocaleString('zh-CN');
        }

        loading.style.display = 'none';
        content.style.display = 'block';
      } catch (err) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.textContent = err.message || '加载失败，请重试';
      }
    }

    function copyContent() {
      const contentBox = document.getElementById('contentBox');
      const content = contentBox ? contentBox.textContent || '' : '';
      const btn = document.querySelector('.copy-content-btn');
      
      if (!content) {
        return;
      }
      
      const updateButton = () => {
        if (btn) {
          const originalText = btn.textContent;
          btn.textContent = '已复制';
          btn.style.background = 'rgba(34, 197, 94, 0.8)';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
          }, 2000);
        }
      };
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content).then(() => {
          updateButton();
        }).catch(() => {
          fallbackCopy(content, updateButton);
        });
      } else {
        fallbackCopy(content, updateButton);
      }
    }
    
    function fallbackCopy(text, updateButton) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        if (updateButton) updateButton();
      } catch (err) {
        // 复制失败，不做任何操作
      }
      document.body.removeChild(textarea);
    }

    function copyUrl() {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('链接已复制到剪贴板');
      }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('链接已复制到剪贴板');
      });
    }

    // 页面加载时自动加载内容
    loadContent();
  </script>
</body>
</html>`;
}
