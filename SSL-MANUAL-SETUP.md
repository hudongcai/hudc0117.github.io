# 手动获取 SSL 证书指南

由于 HTTP-01 验证失败（云服务商可能阻止了 80 端口入站），我们有以下替代方案：

## 方案1：使用 Certbot 的 DNS 验证（推荐）

### 1. 安装 Certbot
```powershell
# 下载 Certbot
Invoke-WebRequest -Uri "https://github.com/certbot/certbot/releases/latest/download/certbot-beta-installer-win_amd64_signed.exe" -OutFile "C:\certbot-installer.exe"

# 运行安装程序
C:\certbot-installer.exe
```

### 2. 使用 DNS 验证获取证书
```powershell
certbot certonly --manual --preferred-challenges dns -d api.intellake.com
```

Certbot 会提示你添加一条 TXT 记录：
- **主机记录**: `_acme-challenge.api`
- **记录类型**: `TXT`
- **记录值**: （Certbot 会显示）

添加后等待几分钟，按回车继续。

### 3. 复制证书
```powershell
# 证书位置：C:\Certbot\live\api.intellake.com\
copy "C:\Certbot\live\api.intellake.com\fullchain.pem" "C:\Cognova\ssl\cert.pem"
copy "C:\Certbot\live\api.intellake.com\privkey.pem" "C:\Cognova\ssl\key.pem"
```

## 方案2：云服务商提供的免费 SSL 证书

如果你的服务器在阿里云/腾讯云/AWS，可以直接在控制台申请免费证书：

### 阿里云
1. 进入"SSL 证书"服务
2. 购买免费证书（DV SSL，免费）
3. 填写域名：`api.intellake.com`
4. 下载证书（选择 PEM 格式）
5. 上传到 `C:\Cognova\ssl\`

### 腾讯云
1. 进入"SSL 证书管理"
2. 申请免费证书
3. 填写域名：`api.intellake.com`
4. DNS 验证
5. 下载证书（Nginx 格式）
6. 上传到 `C:\Cognova\ssl\`

## 方案3：临时使用自签名证书（仅测试）

```powershell
# 需要 OpenSSL
choco install openssl -y

# 生成自签名证书
cd C:\Cognova\ssl
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=api.intellake.com"
```

**注意**: 浏览器会警告不安全，但可以用于测试。

## 方案4：联系云服务商开放 80 端口

如果服务器在云上（阿里云/腾讯云/AWS等）：
1. 进入安全组/防火墙设置
2. 添加入站规则：端口 80，来源 0.0.0.0/0
3. 重新运行 Win-ACME

## 我建议你使用哪个方案？

**最简单**: 方案2（云服务商免费证书）- 无需命令行，界面操作
**最标准**: 方案1（Certbot DNS）- Let's Encrypt 官方工具
**最快速**: 方案3（自签名）- 但只能测试用

你想用哪个方案？
