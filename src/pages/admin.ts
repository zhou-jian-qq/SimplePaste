export function getAdminPage(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SimplePaste - 管理后台</title>
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
      max-width: 1200px;
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
      margin-bottom: 20px;
    }
    .login-card {
      max-width: 400px;
      margin: 0 auto;
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
    .btn-danger {
      background: #dc2626;
    }
    .btn-danger:hover {
      background: #b91c1c;
    }
    .btn-small {
      padding: 6px 12px;
      font-size: 0.85rem;
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
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      background: rgba(0, 0, 0, 0.2);
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 0.85rem;
      color: #d1d5db;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    td {
      padding: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 0.85rem;
    }
    tr:hover td {
      background: rgba(255, 255, 255, 0.05);
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      margin-right: 5px;
    }
    .badge-password {
      background: rgba(251, 191, 36, 0.2);
      color: #fbbf24;
    }
    .badge-burn {
      background: rgba(239, 68, 68, 0.2);
      color: #fca5a5;
    }
    .loading {
      text-align: center;
      padding: 40px;
      color: #9ca3af;
    }
    .empty {
      text-align: center;
      padding: 40px;
      color: #9ca3af;
    }
    @media (max-width: 768px) {
      table {
        font-size: 0.75rem;
      }
      th, td {
        padding: 8px 4px;
      }
      .toolbar {
        flex-direction: column;
        align-items: stretch;
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
      <p class="subtitle">管理后台</p>
    </header>

    <!-- Login Area -->
    <div id="loginArea">
      <div class="card login-card">
        <h2 style="text-align: center; margin-bottom: 20px;">管理员登录</h2>
        <div id="loginError" class="error"></div>
        <form id="loginForm">
          <div class="form-group">
            <label for="adminPassword">管理密码</label>
            <input 
              type="password" 
              id="adminPassword" 
              placeholder="请输入管理密码"
              required
            />
          </div>
          <button type="submit" class="btn" style="width: 100%;">登录</button>
        </form>
      </div>
    </div>

    <!-- Admin Panel -->
    <div id="adminPanel" style="display: none;">
      <div class="card">
        <div class="toolbar">
          <div>
            <span style="color: #9ca3af;">已登录</span>
            <button class="btn btn-secondary btn-small" onclick="logout()" style="margin-left: 10px;">退出登录</button>
          </div>
          <button class="btn btn-secondary" onclick="loadPastes()">刷新列表</button>
        </div>
      </div>

      <div class="card">
        <div id="loading" class="loading">加载中...</div>
        <div id="error" class="error"></div>
        <div id="pasteList" style="display: none;">
          <div style="overflow-x: auto;">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>内容预览</th>
                  <th>创建者 IP</th>
                  <th>创建时间</th>
                  <th>过期时间</th>
                  <th>查看次数</th>
                  <th>属性</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody id="pasteTableBody">
              </tbody>
            </table>
          </div>
          <div id="empty" class="empty" style="display: none;">暂无分享</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    let adminToken = localStorage.getItem('adminToken');

    // 检查是否已登录
    if (adminToken) {
      showAdminPanel();
      loadPastes();
    }

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = document.getElementById('adminPassword').value;
      const errorDiv = document.getElementById('loginError');

      try {
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || '登录失败');
        }

        adminToken = data.data.token;
        localStorage.setItem('adminToken', adminToken);
        showAdminPanel();
        loadPastes();
      } catch (error) {
        errorDiv.textContent = error.message || '登录失败，请重试';
        errorDiv.classList.add('show');
      }
    });

    function showAdminPanel() {
      document.getElementById('loginArea').style.display = 'none';
      document.getElementById('adminPanel').style.display = 'block';
    }

    function logout() {
      adminToken = null;
      localStorage.removeItem('adminToken');
      document.getElementById('loginArea').style.display = 'block';
      document.getElementById('adminPanel').style.display = 'none';
      document.getElementById('adminPassword').value = '';
    }

    async function loadPastes() {
      const loading = document.getElementById('loading');
      const error = document.getElementById('error');
      const pasteList = document.getElementById('pasteList');
      const tableBody = document.getElementById('pasteTableBody');
      const empty = document.getElementById('empty');

      loading.style.display = 'block';
      error.style.display = 'none';
      pasteList.style.display = 'none';
      empty.style.display = 'none';

      try {
        const response = await fetch('/api/admin/list', {
          headers: {
            'X-Admin-Token': adminToken,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          if (response.status === 401) {
            logout();
            throw new Error('登录已过期，请重新登录');
          }
          throw new Error(data.error || '加载失败');
        }

        const items = data.data.items || [];

        if (items.length === 0) {
          loading.style.display = 'none';
          empty.style.display = 'block';
          return;
        }

        tableBody.innerHTML = items.map(item => {
          const createdAt = new Date(item.createdAt).toLocaleString('zh-CN');
          const expiresAt = item.expiresAt 
            ? new Date(item.expiresAt).toLocaleString('zh-CN')
            : '永久';
          
          return \`
            <tr>
              <td><code><a href="/\${item.id}" style="color: #6366f1; text-decoration: none;" target="_blank">\${item.id}</a></code></td>
              <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">\${escapeHtml(item.contentPreview)}</td>
              <td>\${item.creatorIp}</td>
              <td>\${createdAt}</td>
              <td>\${expiresAt}</td>
              <td>\${item.viewCount}</td>
              <td>
                \${item.hasPassword ? '<span class="badge badge-password">密码</span>' : ''}
                \${item.burnAfterRead ? '<span class="badge badge-burn">阅后即焚</span>' : ''}
              </td>
              <td>
                <button class="btn btn-danger btn-small" onclick="deletePaste('\${item.id}')">删除</button>
              </td>
            </tr>
          \`;
        }).join('');

        loading.style.display = 'none';
        pasteList.style.display = 'block';
      } catch (err) {
        loading.style.display = 'none';
        error.style.display = 'block';
        error.textContent = err.message || '加载失败，请重试';
      }
    }

    async function deletePaste(id) {
      if (!confirm('确定要删除这个分享吗？')) {
        return;
      }

      try {
        const response = await fetch(\`/api/admin/paste/\${id}\`, {
          method: 'DELETE',
          headers: {
            'X-Admin-Token': adminToken,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          if (response.status === 401) {
            logout();
            throw new Error('登录已过期，请重新登录');
          }
          throw new Error(data.error || '删除失败');
        }

        loadPastes();
      } catch (error) {
        alert(error.message || '删除失败');
      }
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  </script>
</body>
</html>`;
}
