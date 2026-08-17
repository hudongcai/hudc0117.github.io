# 服务器部署配置总结

## 🎯 架构说明

**前端（GitHub Pages）** ← HTTPS API → **后端（intellake.com 服务器）**

- 前端：静态网页托管在 GitHub Pages
- 后端：Node.js 服务器运行在 intellake.com:5001
- 文章生成：在本地服务器定时执行
- 文章展示：前端通过 API 从服务器获取文章列表

## ✅ 已完成配置

### 1. 服务器端 (server.js)
- ✅ 配置 CORS 允许 GitHub Pages 跨域访问
- ✅ 添加 HTTPS 支持（自动检测 SSL 证书）
- ✅ 支持 HTTP 降级（无证书时使用 HTTP）
- ✅ 增大请求体限制到 50MB

### 2. 前端 (cognova.html)
- ✅ API 地址自动切换
  - 本地开发：`http://localhost:5001`
  - 线上环境：`https://intellake.com:5001`

### 3. 代码已提交
- ✅ Commit: `b5e5bed` - 配置服务器支持 HTTPS 和跨域访问
- ⏳ 等待推送到 GitHub（网络问题）

## 📋 待完成任务

### 1. SSL 证书配置 ⭐ 最重要
参考：[SSL-SETUP.md](SSL-SETUP.md)

**推荐方案：Win-ACME + Let's Encrypt（免费）**

```powershell
# 1. 下载 Win-ACME
# https://github.com/win-acme/win-acme/releases

# 2. 运行配置
cd C:\win-acme
.\wacs.exe

# 3. 证书保存到
C:\Cognova\ssl\cert.pem
C:\Cognova\ssl\key.pem
```

### 2. 域名解析 ⭐ 重要
在域名服务商（阿里云/腾讯云）配置：
- 主机记录：`intellake.com`
- 记录类型：`A`
- 记录值：服务器公网 IP

### 3. 防火墙配置 ⭐ 重要
```powershell
# 开放 5001 端口
netsh advfirewall firewall add rule name="Node.js API Server" dir=in action=allow protocol=TCP localport=5001
```

### 4. 启动服务器
```powershell
# 方法1：使用启动脚本
.\start-server.bat

# 方法2：直接运行
node server.js

# 方法3：使用 PM2（推荐用于生产环境）
npm install -g pm2
pm2 start server.js --name "cognova-api"
pm2 save
pm2 startup
```

### 5. 推送代码到 GitHub
```bash
git push origin main
```

## 🧪 测试步骤

### 本地测试
```powershell
# 1. 启动服务器
node server.js

# 2. 测试 API
# 浏览器访问: http://localhost:5001/api/test

# 3. 测试文章列表
# 浏览器访问: http://localhost:5001/api/articles/by-category?module=ai

# 4. 测试前端
# 浏览器访问: http://localhost:5001/cognova.html
```

### 线上测试（配置完成后）
```
# 1. 测试服务器 API
https://intellake.com:5001/api/test

# 2. 测试 GitHub Pages
https://hudongcai.github.io/Cognova/cognova.html
# 查看控制台，应该能成功获取文章列表
```

## 🔍 问题排查

### 问题1：CORS 错误
**症状**：浏览器控制台显示 `Access-Control-Allow-Origin` 错误

**解决**：
- 检查 server.js 的 CORS 配置是否包含 GitHub Pages 域名
- 确认服务器正在运行

### 问题2：证书错误
**症状**：`NET::ERR_CERT_AUTHORITY_INVALID`

**解决**：
- 使用 Let's Encrypt 获取有效证书
- 或者暂时使用 HTTP 模式测试（修改 cognova.html 中的 API_BASE_URL）

### 问题3：无法连接服务器
**症状**：`Failed to fetch` 或 `Connection refused`

**检查清单**：
- [ ] 服务器是否正在运行？
- [ ] 防火墙是否开放 5001 端口？
- [ ] 域名是否正确解析到服务器 IP？
- [ ] 服务器公网 IP 是否可访问？

### 问题4：文章列表为空
**症状**：前端显示"暂无文章"

**排查**：
```powershell
# 检查文章文件是否存在
dir articles\*.html
dir news-detail-*.html

# 测试 API 响应
curl http://localhost:5001/api/articles/by-category?module=ai
```

## 📊 API 端点列表

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/test` | GET | 健康检查 |
| `/api/articles/list` | GET | 获取所有文章 |
| `/api/articles/by-category` | GET | 按分类获取文章 |
| `/api/articles/read/:fileName` | GET | 读取文章内容 |
| `/api/tasks/list` | GET | 获取任务列表 |
| `/api/tasks/run/:taskId` | POST | 执行任务 |
| `/api/generation/status` | GET | 获取生成状态 |

## 🔐 安全建议

1. **SSL 证书**：生产环境必须使用 HTTPS
2. **API 密钥**：不要在前端代码中暴露 API 密钥
3. **CORS**：只允许可信域名访问
4. **防火墙**：只开放必要的端口
5. **定期更新**：保持 Node.js 和依赖包更新

## 📅 定时任务配置

文章自动生成可以使用：

### 方案1：Windows 任务计划程序
1. 打开"任务计划程序"
2. 创建基本任务
3. 设置触发器（每天特定时间）
4. 操作：启动程序 `node C:\Cognova\scripts\daily-article-scheduler.js`

### 方案2：PM2 Cron
```powershell
pm2 start scripts/daily-article-scheduler.js --cron "0 8 * * *" --name "daily-article"
```

## 💡 优化建议

1. **使用 PM2**：进程管理和自动重启
2. **添加日志**：使用 Winston 或 Morgan 记录访问日志
3. **CDN 加速**：静态资源使用 CDN
4. **数据库**：考虑使用数据库存储文章元数据
5. **缓存**：添加 Redis 缓存热门文章

## 📞 联系支持

遇到问题？检查：
1. [SSL-SETUP.md](SSL-SETUP.md) - SSL 证书配置详情
2. Server 日志：`server.log`
3. 浏览器控制台错误信息
