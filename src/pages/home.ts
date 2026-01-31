export function getHomePage(): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SimplePaste - 文本分享</title>
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
      max-width: 800px;
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
    .subtitle {
      color: #9ca3af;
      font-size: 0.9rem;
    }
    .card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      font-size: 0.9rem;
      color: #d1d5db;
      margin-bottom: 8px;
      font-weight: 500;
    }
    textarea, input, select {
      width: 100%;
      padding: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.3);
      color: #e5e5e5;
      font-size: 0.95rem;
      font-family: inherit;
    }
    textarea {
      resize: vertical;
      min-height: 200px;
      font-family: 'Courier New', monospace;
    }
    textarea:focus, input:focus, select:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
    .row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
    }
    .checkbox-group input[type="checkbox"] {
      width: auto;
      cursor: pointer;
    }
    .btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
    }
    .btn:active {
      transform: translateY(0);
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }
    .modal.show {
      display: flex;
    }
    .modal-content {
      background: #1a1a2e;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      text-align: center;
    }
    .modal-content h2 {
      margin-bottom: 15px;
      color: #6366f1;
    }
    .modal-content p {
      margin-bottom: 20px;
      color: #d1d5db;
      word-break: break-all;
    }
    .btn-secondary {
      background: #374151;
      margin-top: 10px;
    }
    .btn-secondary:hover {
      background: #4b5563;
    }
    .error {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.5);
      color: #fca5a5;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: none;
    }
    .error.show {
      display: block;
    }
    .lookup-card {
      margin-bottom: 20px;
      padding: 20px 30px;
    }
    .lookup-section label {
      display: block;
      font-size: 0.9rem;
      color: #d1d5db;
      margin-bottom: 10px;
      font-weight: 500;
    }
    .lookup-row {
      display: flex;
      gap: 10px;
    }
    .lookup-row input {
      flex: 1;
      text-align: center;
      font-size: 1.2rem;
      letter-spacing: 0.3em;
      font-weight: 600;
    }
    .lookup-btn {
      width: auto;
      padding: 12px 24px;
      white-space: nowrap;
    }
    .share-code-display {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 12px;
      padding: 20px;
      margin: 15px 0;
    }
    .share-code-label {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 8px;
    }
    .share-code-value {
      font-size: 2.5rem;
      font-weight: 700;
      letter-spacing: 0.3em;
      color: #fff;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      font-family: 'Courier New', monospace;
    }
    .share-url-display {
      font-size: 0.85rem;
      color: #9ca3af;
      word-break: break-all;
      margin-top: 10px;
    }
    @media (max-width: 640px) {
      h1 {
        font-size: 2rem;
      }
      .row {
        grid-template-columns: 1fr;
      }
      .lookup-row {
        flex-direction: column;
      }
      .lookup-btn {
        width: 100%;
      }
      .share-code-value {
        font-size: 2rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>SimplePaste</h1>
      <p class="subtitle">轻量级文本分享工具</p>
    </header>

    <!-- 分享码查询区域 -->
    <div class="card lookup-card">
      <div class="lookup-section">
        <label for="codeInput">输入分享码查看内容</label>
        <div class="lookup-row">
          <input 
            type="text" 
            id="codeInput" 
            placeholder="请输入6位分享码"
            maxlength="6"
            pattern="[0-9]*"
            inputmode="numeric"
          />
          <button type="button" class="btn lookup-btn" onclick="goToShare()">查看</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div id="error" class="error"></div>
      
      <form id="pasteForm">
        <div class="form-group">
          <label for="content">内容</label>
          <textarea 
            id="content" 
            placeholder="在这里粘贴你的文本..."
            required
          ></textarea>
        </div>

        <div class="row">
          <div class="form-group">
            <label for="expiresIn">过期时间</label>
            <select id="expiresIn">
              <option value="3600">1 小时</option>
              <option value="86400" selected>1 天</option>
              <option value="604800">7 天</option>
              <option value="2592000">30 天</option>
              <option value="0">永久</option>
            </select>
          </div>

          <div class="form-group">
            <label for="password">访问密码（可选）</label>
            <input 
              type="text" 
              id="password" 
              placeholder="留空则无需密码"
            />
          </div>
        </div>

        <div class="checkbox-group">
          <input type="checkbox" id="burnAfterRead" />
          <label for="burnAfterRead">阅后即焚（查看一次后自动删除）</label>
        </div>

        <button type="submit" class="btn" id="submitBtn">创建分享</button>
      </form>
    </div>
  </div>

  <!-- Success Modal -->
  <div id="successModal" class="modal">
    <div class="modal-content">
      <h2>分享创建成功！</h2>
      <div class="share-code-display">
        <div class="share-code-label">分享码</div>
        <div class="share-code-value" id="shareCode"></div>
      </div>
      <p class="share-url-display" id="shareUrl"></p>
      <button class="btn" onclick="copyCode()">复制分享码</button>
      <button class="btn btn-secondary" onclick="copyUrl()">复制完整链接</button>
      <button class="btn btn-secondary" onclick="closeModal()">关闭</button>
    </div>
  </div>

  <script>
    let shareUrl = '';
    let shareCodeValue = '';

    document.getElementById('pasteForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById('submitBtn');
      const errorDiv = document.getElementById('error');
      errorDiv.classList.remove('show');
      
      const content = document.getElementById('content').value.trim();
      if (!content) {
        showError('请输入内容');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = '创建中...';

      try {
        const response = await fetch('/api/paste', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            password: document.getElementById('password').value || undefined,
            burnAfterRead: document.getElementById('burnAfterRead').checked,
            expiresIn: parseInt(document.getElementById('expiresIn').value),
            lang: 'plaintext',
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || '创建失败');
        }

        shareUrl = data.data.url;
        // 从 URL 中提取分享码
        shareCodeValue = data.data.id || shareUrl.split('/').pop();
        document.getElementById('shareCode').textContent = shareCodeValue;
        document.getElementById('shareUrl').textContent = shareUrl;
        document.getElementById('successModal').classList.add('show');
        
        // 清空表单
        document.getElementById('pasteForm').reset();
      } catch (error) {
        showError(error.message || '创建失败，请重试');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '创建分享';
      }
    });

    function showError(message) {
      const errorDiv = document.getElementById('error');
      errorDiv.textContent = message;
      errorDiv.classList.add('show');
    }

    function copyCode() {
      navigator.clipboard.writeText(shareCodeValue).then(() => {
        closeModal();
      }).catch(() => {
        fallbackCopy(shareCodeValue);
        closeModal();
      });
    }

    function copyUrl() {
      navigator.clipboard.writeText(shareUrl).then(() => {
        closeModal();
      }).catch(() => {
        fallbackCopy(shareUrl);
        closeModal();
      });
    }

    function fallbackCopy(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    function closeModal() {
      document.getElementById('successModal').classList.remove('show');
    }

    function goToShare() {
      const codeInput = document.getElementById('codeInput');
      const code = codeInput.value.trim();
      if (!code) {
        codeInput.focus();
        return;
      }
      if (!/^[0-9]+$/.test(code)) {
        showError('分享码只能包含数字');
        return;
      }
      window.location.href = '/' + code;
    }

    // 支持回车键提交分享码
    document.getElementById('codeInput').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        goToShare();
      }
    });
  </script>
</body>
</html>`;
}
