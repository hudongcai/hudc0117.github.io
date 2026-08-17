# SSL 证书配置指南

## 方案1：使用 Let's Encrypt（推荐，免费）

### 在 Windows Server 上安装证书

1. **安装 Win-ACME**
   - 下载：https://github.com/win-acme/win-acme/releases
   - 解压到 `C:\win-acme`

2. **运行 Win-ACME**
   ```powershell
   cd C:\win-acme
   .\wacs.exe
   ```

3. **选择配置选项**
   - 选择 `N: Create certificate (full options)`
   - 选择 `Manual input`
   - 输入域名：`intellake.com`
   - 验证方式选择：`http-01` (需要80端口开放)
   - 证书导出位置：`C:\Cognova\ssl`

4. **证书文件**
   生成的证书文件会保存在：
   - 证书：`C:\Cognova\ssl\cert.pem`
   - 私钥：`C:\Cognova\ssl\key.pem`

## 方案2：使用 Certbot（需要 Python）

```powershell
# 安装 Certbot
pip install certbot

# 获取证书（需要80端口）
certbot certonly --standalone -d intellake.com

# 证书位置：C:\Certbot\live\intellake.com\
# 复制到项目目录：
mkdir C:\Cognova\ssl
copy "C:\Certbot\live\intellake.com\fullchain.pem" "C:\Cognova\ssl\cert.pem"
copy "C:\Certbot\live\intellake.com\privkey.pem" "C:\Cognova\ssl\key.pem"
```

## 方案3：自签名证书（仅用于测试）

```powershell
# 创建 SSL 目录
mkdir C:\Cognova\ssl
cd C:\Cognova\ssl

# 生成自签名证书（需要 OpenSSL）
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

**注意**：自签名证书浏览器会提示不安全，仅用于开发测试。

## 配置防火墙

```powershell
# 允许 5001 端口
netsh advfirewall firewall add rule name="Node.js API Server" dir=in action=allow protocol=TCP localport=5001
```

## 配置域名解析

在域名服务商（如阿里云、腾讯云）添加 A 记录：
- 主机记录：`@` 或 `intellake.com`
- 记录类型：`A`
- 记录值：你的服务器公网IP

## 测试配置

1. **测试 HTTPS 服务器**
   ```powershell
   node server.js
   ```

2. **访问测试**
   - 本地：https://localhost:5001/api/test
   - 外网：https://intellake.com:5001/api/test

3. **测试跨域访问**
   - 打开 GitHub Pages：https://hudongcai.github.io/Cognova/cognova.html
   - 查看控制台是否有 CORS 错误

## 证书续期

Let's Encrypt 证书有效期90天，需要定期续期：

```powershell
# Win-ACME 会自动设置定时任务
# 或手动续期：
cd C:\win-acme
.\wacs.exe --renew

# Certbot 续期：
certbot renew
```

## 当前状态

- ✅ CORS 已配置：允许 GitHub Pages 访问
- ✅ HTTPS 支持已添加（需要证书文件）
- ⏳ 需要创建 `C:\Cognova\ssl\` 目录并放置证书
- ⏳ 需要配置防火墙开放 5001 端口
- ⏳ 需要确保域名解析到服务器IP
