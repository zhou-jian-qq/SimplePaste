export function getViewPage(id: string, isFile: boolean = false): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SimplePaste - ${isFile ? '文件下载' : '查看分享'}</title>
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
    /* 文件下载样式 */
    .file-download-box {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin-bottom: 20px;
    }
    .file-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }
    .file-name-display {
      font-size: 1.2rem;
      font-weight: 600;
      color: #e5e5e5;
      word-break: break-all;
      margin-bottom: 10px;
    }
    .file-size-display {
      color: #9ca3af;
      font-size: 0.95rem;
      margin-bottom: 20px;
    }
    .download-btn {
      display: inline-block;
      padding: 14px 40px;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
    }
    .download-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(34, 197, 94, 0.3);
    }
    .download-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    .burn-warning {
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid rgba(245, 158, 11, 0.5);
      color: #fcd34d;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 0.9rem;
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
      
      <!-- 文本内容显示 -->
      <div id="textContent" style="display: none;">
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

      <!-- 文件下载显示 -->
      <div id="fileContent" style="display: none;">
        <div id="burnWarning" class="burn-warning" style="display: none;">
          注意：此文件设置了阅后即焚，下载后将自动删除！
        </div>
        <div class="file-download-box">
          <div class="file-icon">📄</div>
          <div class="file-name-display" id="fileNameDisplay"></div>
          <div class="file-size-display" id="fileSizeDisplay"></div>
          <button class="download-btn" id="downloadBtn" onclick="downloadFile()">下载文件</button>
        </div>
        <div class="info">
          <div>下载次数: <span id="fileViewCount">0</span></div>
          <div style="margin-top: 5px;">创建时间: <span id="fileCreatedAt"></span></div>
        </div>
        <button class="btn" onclick="copyUrl()">复制链接</button>
        <button class="btn btn-secondary" onclick="window.location.href='/'">返回首页</button>
      </div>
    </div>
  </div>

  <script>
    const pasteId = '${id}';
    const isFile = ${isFile};
    let shareUrl = window.location.href;
    let currentPassword = '';
    let fileData = null;

    async function loadContent() {
      const password = document.getElementById('password')?.value || '';
      currentPassword = password;
      const passwordForm = document.getElementById('passwordForm');
      const loading = document.getElementById('loading');
      const error = document.getElementById('error');
      const textContent = document.getElementById('textContent');
      const fileContent = document.getElementById('fileContent');

      loading.style.display = 'block';
      error.style.display = 'none';
      textContent.style.display = 'none';
      fileContent.style.display = 'none';
      if (passwordForm) passwordForm.style.display = 'none';

      try {
        // 根据类型选择不同的 API
        const apiPath = isFile ? '/api/file/' + pasteId + '/info' : '/api/paste/' + pasteId;
        const url = password 
          ? apiPath + '?password=' + encodeURIComponent(password)
          : apiPath;
        
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

        loading.style.display = 'none';

        if (isFile) {
          // 显示文件信息
          fileData = data.data;
          document.getElementById('fileNameDisplay').textContent = data.data.fileName || '未知文件';
          document.getElementById('fileSizeDisplay').textContent = formatFileSize(data.data.fileSize || 0);
          document.getElementById('fileViewCount').textContent = data.data.viewCount || 0;
          
          if (data.data.burnAfterRead) {
            document.getElementById('burnWarning').style.display = 'block';
          }
          
          if (data.data.createdAt) {
            const date = new Date(data.data.createdAt);
            document.getElementById('fileCreatedAt').textContent = date.toLocaleString('zh-CN');
          }
          
          fileContent.style.display = 'block';
        } else {
          // 显示文本内容
          document.getElementById('contentBox').textContent = data.data.content || '';
          document.getElementById('viewCount').textContent = data.data.viewCount || 0;
          
          if (data.data.createdAt) {
            const date = new Date(data.data.createdAt);
            document.getElementById('createdAt').textContent = date.toLocaleString('zh-CN');
          }
          
          textContent.style.display = 'block';
        }
      } catch (err) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.textContent = err.message || '加载失败，请重试';
      }
    }

    function formatFileSize(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async function downloadFile() {
      const downloadBtn = document.getElementById('downloadBtn');
      downloadBtn.disabled = true;
      downloadBtn.textContent = '下载中...';

      try {
        const url = currentPassword 
          ? '/api/file/' + pasteId + '?password=' + encodeURIComponent(currentPassword)
          : '/api/file/' + pasteId;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || '下载失败');
        }

        // 获取文件内容
        const blob = await response.blob();
        
        // 创建下载链接
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileData?.fileName || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);

        // 如果是阅后即焚，显示提示
        if (fileData?.burnAfterRead) {
          alert('文件已下载，此分享已自动删除');
          window.location.href = '/';
        }
      } catch (err) {
        alert(err.message || '下载失败，请重试');
      } finally {
        downloadBtn.disabled = false;
        downloadBtn.textContent = '下载文件';
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
