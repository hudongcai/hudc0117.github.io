# 智灵湖 AI 新闻自动更新系统

每天早上8点自动生成并发布高质量的AI行业"公司与历程"新闻文章。

## 🎯 功能特性

- ✅ 每天早上8点（北京时间）自动更新
- ✅ 自动生成高质量AI公司动态文章
- ✅ 涵盖12家主流AI公司
- ✅ 5个维度内容框架（公司战略、企业里程碑、技术突破、市场扩张、社会责任）
- ✅ 自动更新网站所有相关页面
- ✅ 自动提交到GitHub并部署

## 📁 文件结构

```
Cognova/
├── scripts/
│   ├── auto-update-ai-news.js    # 主更新脚本
│   ├── scheduler.js               # 本地定时任务
│   └── article-template.html     # 文章模板
├── .github/
│   └── workflows/
│       └── auto-update.yml        # GitHub Actions配置
├── package.json                   # Node.js依赖配置
└── README-AUTO-UPDATE.md          # 本说明文档
```

## 🚀 部署方式

### 方案1：GitHub Actions（推荐）

**优点**：无需服务器，完全自动化，免费

**步骤**：

1. **启用GitHub Actions**
   - 访问：https://github.com/hudongcai/hudc0117.github.io/settings/actions
   - 确保 "Allow all actions and reusable workflows" 已启用

2. **设置权限**
   - 访问：https://github.com/hudongcai/hudc0117.github.io/settings/actions
   - 找到 "Workflow permissions"
   - 选择 "Read and write permissions"
   - 勾选 "Allow GitHub Actions to create and approve pull requests"
   - 点击 Save

3. **推送代码**
   ```bash
   cd C:\Cognova
   git add .
   git commit -m "Add auto-update system"
   git push origin main
   ```

4. **测试运行**
   - 访问：https://github.com/hudongcai/hudc0117.github.io/actions
   - 选择 "Auto Update AI News"
   - 点击 "Run workflow" → "Run workflow" 手动触发测试

5. **完成**
   - 从第二天开始，每天早上8点（北京时间）自动运行

### 方案2：本地服务器运行

**适用场景**：有自己的服务器，希望更灵活地控制

**步骤**：

1. **安装Node.js**
   ```bash
   # 确保已安装Node.js 16+
   node --version
   ```

2. **安装依赖**
   ```bash
   cd C:\Cognova
   npm install
   ```

3. **启动定时服务**
   ```bash
   node scripts/scheduler.js
   ```

4. **使用PM2保持后台运行（可选）**
   ```bash
   npm install -g pm2
   pm2 start scripts/scheduler.js --name intellake-auto-update
   pm2 save
   pm2 startup
   ```

## 📝 自动生成的文章内容

### 涵盖的AI公司：
- OpenAI
- Anthropic
- Google DeepMind
- Meta
- Microsoft
- Amazon
- NVIDIA
- 百度
- 阿里巴巴
- 腾讯
- 字节跳动
- 商汤科技

### 文章结构（5个维度）：
1. **公司战略与动向**
   - 重大融资、战略转型、业务调整、高层人事

2. **企业里程碑**
   - 用户增长、营收数据、市场地位、认证奖项

3. **技术突破与创新**
   - 新产品发布、专利研发、研究成果、实验室建设

4. **市场扩张**
   - 国际化布局、数据中心、合作伙伴、垂直行业

5. **企业文化与社会责任**
   - ESG举措、公益基金、教育普及、开源贡献、员工关怀、多元化

## 🔧 配置选项

### 修改更新时间

编辑 `.github/workflows/auto-update.yml`：

```yaml
on:
  schedule:
    # 格式: 分 时 日 月 星期（UTC时间）
    # 北京时间8点 = UTC时间0点
    - cron: '0 0 * * *'
```

常见时间对照：
- 北京时间 6:00 → `0 22 * * *`（前一天22:00 UTC）
- 北京时间 8:00 → `0 0 * * *`
- 北京时间 12:00 → `0 4 * * *`
- 北京时间 20:00 → `0 12 * * *`

### 修改目标公司

编辑 `scripts/auto-update-ai-news.js`：

```javascript
const AI_COMPANIES = [
    { name: 'OpenAI', nameZh: 'OpenAI', focus: ['GPT系列', 'ChatGPT'] },
    // 添加或删除公司...
];
```

## 🎨 提升内容质量（可选）

当前版本使用模板生成内容。如果需要更高质量的AI生成内容，可以接入AI API：

### 接入Claude API

1. **获取API Key**
   - 访问：https://console.anthropic.com/
   - 创建API Key

2. **设置GitHub Secret**
   - 访问：https://github.com/hudongcai/hudc0117.github.io/settings/secrets/actions
   - 点击 "New repository secret"
   - Name: `ANTHROPIC_API_KEY`
   - Value: 你的API Key
   - 点击 Add secret

3. **修改代码**
   在 `auto-update-ai-news.js` 中添加API调用：

```javascript
async function generateFullContent(company, newsType, date) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (apiKey) {
        // 调用Claude API生成高质量内容
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 4096,
                messages: [{
                    role: 'user',
                    content: `请生成一篇关于${company.nameZh}的AI行业新闻文章...`
                }]
            })
        });
        
        const data = await response.json();
        return data.content[0].text;
    }
    
    // 如果没有API Key，使用模板
    return generateTemplateContent(company, newsType, date);
}
```

## 📊 监控和日志

### 查看GitHub Actions运行日志

1. 访问：https://github.com/hudongcai/hudc0117.github.io/actions
2. 点击具体的运行记录
3. 查看每个步骤的详细日志

### 接收运行通知

在 `.github/workflows/auto-update.yml` 中添加：

```yaml
    - name: Send notification on failure
      if: failure()
      run: |
        # 可以添加邮件通知、企业微信通知等
        echo "更新失败，请检查日志"
```

## ⚠️ 注意事项

1. **GitHub Actions限制**
   - 免费账户：每月2000分钟
   - 本脚本每次运行约1-2分钟
   - 每天运行一次，一个月约30-60分钟

2. **Git配置**
   - 确保已配置Git用户信息
   - GitHub Actions会自动使用配置的凭证

3. **内容质量**
   - 模板生成的内容是基础版本
   - 建议接入AI API以获得更高质量内容
   - 可以定期人工审核和优化

4. **备份**
   - GitHub自动保存所有历史版本
   - 可以随时回滚到之前的版本

## 🆘 故障排除

### 问题1：GitHub Actions没有自动运行

**解决方案**：
- 检查是否启用了Actions权限
- 确认cron时间格式正确
- 手动触发一次测试

### 问题2：Git推送失败

**解决方案**：
- 检查Workflow permissions是否设置为"Read and write"
- 确认Git用户信息配置正确

### 问题3：生成的文章格式有问题

**解决方案**：
- 检查 `article-template.html` 模板
- 确认替换标记（{{TITLE}}等）正确

## 📞 联系支持

如有问题，请联系：
- Email: hudongcai@intellake.com
- GitHub Issues: https://github.com/hudongcai/hudc0117.github.io/issues

## 📄 许可证

MIT License
