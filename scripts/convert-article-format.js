// 将 OpenAI 文章转换为腾讯样式模板
const fs = require('fs');
const path = require('path');

// 读取 OpenAI 原文件
const openaiFile = path.join(__dirname, '..', 'news-detail-ai-c-openai-20260812.html');
const content = fs.readFileSync(openaiFile, 'utf-8');

// 提取文章内容 - 从 <div class="article-content"> 开始
const contentMatch = content.match(/<div class="article-content">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/body>/);
if (!contentMatch) {
    console.error('无法找到文章内容');
    process.exit(1);
}

let articleContent = contentMatch[1];

// 清理内容中的多余 div 结构
articleContent = articleContent
    .replace(/<div class="section">/g, '')
    .replace(/<div class="subsection">/g, '')
    .replace(/<div class="subsection-content">/g, '')
    .replace(/<\/div>/g, '')
    .replace(/<h2 class="section-title">/g, '<h2>')
    .replace(/<h3 class="subsection-title">/g, '<h3>')
    .trim();

// 生成新的 HTML
const newHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OpenAI - 公司研究与发展历程 - 智灵·新知</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
            background: #f5f7fa;
            color: #333;
            line-height: 1.5;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header h1 {
            font-size: 1.6em;
            margin-bottom: 5px;
        }

        .nav {
            background: white;
            padding: 12px 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            margin-bottom: 12px;
        }

        .nav a {
            color: #667eea;
            text-decoration: none;
            font-size: 0.95em;
            margin-right: 20px;
        }

        .nav a:hover {
            text-decoration: underline;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 15px;
        }

        .article {
            background: white;
            border-radius: 10px;
            padding: 18px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.08);
            margin-bottom: 12px;
        }

        .article-title {
            font-size: 1.6em;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 12px;
            line-height: 1.3;
        }

        .article-meta {
            display: flex;
            gap: 15px;
            padding-bottom: 15px;
            margin-bottom: 12px;
            border-bottom: 2px solid #e5e7eb;
            color: #6b7280;
            font-size: 0.95em;
        }

        .article-summary {
            background: #f0f4ff;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin-bottom: 12px;
            font-size: 0.95em;
            color: #374151;
            line-height: 1.5;
        }

        .article-content {
            font-size: 0.95em;
            color: #374151;
            line-height: 1.7;
        }

        .article-content h2 {
            font-size: 1.3em;
            font-weight: 700;
            color: #1f2937;
            margin-top: 18px;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
        }

        .article-content h3 {
            font-size: 1.1em;
            font-weight: 600;
            color: #374151;
            margin-top: 18px;
            margin-bottom: 6px;
        }

        .article-content p {
            margin-bottom: 12px;
        }

        .article-content ul, .article-content ol {
            margin-bottom: 12px;
            padding-left: 25px;
        }

        .article-content li {
            margin-bottom: 6px;
        }

        .article-content strong {
            color: #1f2937;
            font-weight: 600;
        }

        .references {
            background: #f9fafb;
            border-radius: 8px;
            padding: 18px;
            margin-top: 25px;
        }

        .references h3 {
            font-size: 1.1em;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 6px;
        }

        .references ul {
            list-style: none;
            padding: 0;
        }

        .references li {
            margin-bottom: 6px;
        }

        .references a {
            color: #667eea;
            text-decoration: none;
            transition: color 0.2s ease;
        }

        .references a:hover {
            color: #5568d3;
            text-decoration: underline;
        }

        .footer {
            background: #2d3748;
            color: white;
            text-align: center;
            padding: 15px;
            margin-top: 50px;
        }

        .footer p {
            margin: 8px 0;
            opacity: 0.9;
        }

        @media (max-width: 768px) {
            .header {
                padding: 25px 15px;
            }

            .header h1 {
                font-size: 1.3em;
            }

            .container {
                padding: 15px;
            }

            .article {
                padding: 20px 15px;
                margin-bottom: 12px;
            }

            .article-title {
                font-size: 1.4em;
                line-height: 1.3;
            }

            .article-meta {
                flex-direction: column;
                gap: 8px;
                font-size: 0.9em;
            }

            .article-summary {
                padding: 15px;
                font-size: 1em;
                margin-bottom: 25px;
            }

            .article-content {
                font-size: 1em;
            }

            .article-content h2 {
                font-size: 1.3em;
                margin-top: 30px;
                margin-bottom: 6px;
            }

            .article-content h3 {
                font-size: 1.1em;
                margin-top: 20px;
                margin-bottom: 12px;
            }

            .article-content p {
                margin-bottom: 6px;
            }

            .article-content ul,
            .article-content ol {
                padding-left: 20px;
            }

            .references {
                padding: 20px 15px;
            }

            .references h3 {
                font-size: 1.1em;
            }

            .references li {
                font-size: 0.9em;
                line-height: 1.6;
            }

            .nav {
                padding: 12px 15px;
                font-size: 0.9em;
            }

            .footer {
                padding: 20px 15px;
                font-size: 0.9em;
            }
        }

        @media (max-width: 480px) {
            .article {
                padding: 15px 12px;
            }

            .article-title {
                font-size: 1.1em;
            }

            .article-content h2 {
                font-size: 1.1em;
            }

            .article-content h3 {
                font-size: 1em;
            }

            .article-content {
                font-size: 0.95em;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📰 资讯详情</h1>
    </div>

    <div class="nav">
        <a href="javascript:history.back()">← 返回</a>
    </div>

    <div class="container">
        <article class="article">
            <h1 class="article-title">OpenAI - 公司研究与发展历程</h1>

            <div class="article-meta">
                <span>📅 发布日期：2026-08-13</span>
                <span>📂 分类：公司与历程</span>
                <span>👁️ 阅读量：<span id="view-count">加载中...</span></span>
            </div>

            <div class="article-summary">
                <strong>摘要：</strong>本文深入研究OpenAI的发展历程，从创始背景、发展阶段、商业模式、组织管理、风险教训到未来展望，全面拆解其成功经验与失败教训，提炼可学习借鉴的底层逻辑。
            </div>

            <div class="article-content">
${articleContent}
            </div>

            <div class="references">
                <h3>📚 参考来源</h3>
                <ul>
                    <li>• <a href="https://openai.com/" target="_blank">OpenAI 官方网站</a></li>
                    <li>• <a href="https://www.techcrunch.com/tag/openai/" target="_blank">TechCrunch: OpenAI 报道</a></li>
                    <li>• <a href="https://www.theverge.com/23610427/chatgpt-openai-ai" target="_blank">The Verge: ChatGPT 深度分析</a></li>
                    <li>• <a href="https://www.reuters.com/technology/artificial-intelligence/" target="_blank">路透社: AI 行业报道</a></li>
                </ul>
            </div>
        </article>
    </div>

    <div class="footer">
        <p>上海智灵湖智能信息科技有限公司</p>
        <p>&copy; 2026 Intellake.com - 智灵湖 版权所有</p>
    </div>

    <script>
        // 文章ID
        const articleId = 'ai-c-openai-20260812';

        // 获取并更新阅读量
        function updateViewCount() {
            // 从localStorage获取所有文章的阅读量
            let viewData = localStorage.getItem('article-views');
            let views = viewData ? JSON.parse(viewData) : {};

            // 检查是否已经阅读过（使用sessionStorage避免刷新重复计数）
            const hasViewed = sessionStorage.getItem('viewed-' + articleId);

            if (!hasViewed) {
                // 首次访问，增加阅读量
                views[articleId] = (views[articleId] || 0) + 1;
                localStorage.setItem('article-views', JSON.stringify(views));
                sessionStorage.setItem('viewed-' + articleId, 'true');
            }

            // 显示阅读量
            const count = views[articleId] || 0;
            document.getElementById('view-count').textContent = count.toLocaleString();
        }

        // 页面加载时更新阅读量
        updateViewCount();
    </script>
</body>
</html>`;

// 写入新文件
const outputFile = path.join(__dirname, '..', 'news-detail-ai-c-openai-20260812.html');
fs.writeFileSync(outputFile, newHtml, 'utf-8');

console.log('✅ OpenAI 文章格式转换完成！');
console.log('输出文件:', outputFile);
