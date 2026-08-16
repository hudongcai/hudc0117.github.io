const fs = require('fs');
const path = require('path');
const { companyArticleTemplate } = require('./company-article-template.js');

// AI公司基础信息数据库
const AI_COMPANIES = [
    {
        name: 'OpenAI',
        nameZh: 'OpenAI',
        founded: '2015-12',
        founders: ['Sam Altman', 'Elon Musk', 'Ilya Sutskever', 'Greg Brockman'],
        mainProduct: 'ChatGPT, GPT系列模型'
    },
    {
        name: 'Google DeepMind',
        nameZh: '谷歌DeepMind',
        founded: '2010-09',
        founders: ['Demis Hassabis', 'Shane Legg', 'Mustafa Suleyman'],
        mainProduct: 'Gemini, AlphaGo, AlphaFold'
    },
    {
        name: 'Anthropic',
        nameZh: 'Anthropic',
        founded: '2021-01',
        founders: ['Dario Amodei', 'Daniela Amodei'],
        mainProduct: 'Claude系列模型'
    },
    {
        name: 'Baidu',
        nameZh: '百度',
        founded: '2000-01',
        founders: ['李彦宏', '徐勇'],
        mainProduct: '文心一言, 搜索引擎'
    },
    {
        name: 'Tencent',
        nameZh: '腾讯',
        founded: '1998-11',
        founders: ['马化腾', '张志东', '许晨晔', '陈一丹', '曾李青'],
        mainProduct: '微信, 腾讯云, 混元大模型'
    }
];

// 获取今天的日期和时间
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const hour = String(today.getHours()).padStart(2, '0');
    const minute = String(today.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
}

// 获取日期用于文件名（不含时间）
function getDateForFilename() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 生成文章ID（文件名用，不含时间）
function generateArticleId(company, dateSlug) {
    const companySlug = company.name.toLowerCase().replace(/\s+/g, '-');
    return `ai-c-${companySlug}-${dateSlug}`;
}

// 根据新模板生成文章内容（带占位符的完整结构）
function generateArticleFromTemplate(company, date) {
    const title = `${company.nameZh} - 公司研究与发展历程`;

    // 从第一个章节的第一个子章节提取摘要（占位符）
    const summary = `本文深入研究${company.nameZh}的发展历程，从创始背景、发展阶段、商业模式、组织管理、风险教训到未来展望，全面拆解其成功经验与失败教训，提炼可学习借鉴的底层逻辑。`;

    let contentHtml = '';

    // 遍历6大模块
    companyArticleTemplate.sections.forEach(section => {
        contentHtml += `        <h2>${section.title}</h2>\n`;
        contentHtml += `        <p class="section-description"><em>${section.description}</em></p>\n\n`;

        // 遍历每个子章节
        section.subsections.forEach(subsection => {
            contentHtml += `        <h3>${subsection.subtitle}</h3>\n\n`;

            // 内容方向
            contentHtml += `        <div class="content-guide">\n`;
            contentHtml += `            <h4>内容方向：</h4>\n`;
            contentHtml += `            <ul>\n`;
            subsection.contentGuide.forEach(guide => {
                contentHtml += `                <li>${guide}</li>\n`;
            });
            contentHtml += `            </ul>\n`;
            contentHtml += `        </div>\n\n`;

            // 实际内容（占位符 - 待填充）
            contentHtml += `        <div class="actual-content">\n`;
            contentHtml += `            <p><strong>[此处需填充${subsection.subtitle}的具体内容]</strong></p>\n`;
            contentHtml += `            <p class="placeholder-hint">根据上述内容方向，填写关于${company.nameZh}的真实信息和分析。要求：精简语言、逻辑清晰、重点突出。</p>\n`;
            contentHtml += `        </div>\n\n`;

            // 学习思考点
            contentHtml += `        <div class="thinking-points">\n`;
            contentHtml += `            <h4>✅ 学习思考点：</h4>\n`;
            contentHtml += `            <ul>\n`;
            subsection.thinkingPoints.forEach(point => {
                contentHtml += `                <li>${point}</li>\n`;
            });
            contentHtml += `            </ul>\n`;
            contentHtml += `        </div>\n\n`;
        });
    });

    // 添加研究方法提示
    contentHtml += `        <hr style="margin: 40px 0; border: none; border-top: 2px solid #e5e7eb;">\n\n`;
    contentHtml += `        <h2>研究方法提示</h2>\n\n`;
    contentHtml += `        <h3>实操步骤：</h3>\n`;
    contentHtml += `        <ol>\n`;
    companyArticleTemplate.researchMethodology.steps.forEach(step => {
        contentHtml += `            <li>${step}</li>\n`;
    });
    contentHtml += `        </ol>\n\n`;
    contentHtml += `        <h3>核心原则：</h3>\n`;
    contentHtml += `        <p><strong>${companyArticleTemplate.researchMethodology.keyPrinciple}</strong></p>\n\n`;

    const references = [
        { text: `${company.nameZh}官方网站`, url: `https://${company.name.toLowerCase().replace(/\s+/g, '')}.com` },
        { text: `${company.nameZh}年度报告`, url: `https://${company.name.toLowerCase().replace(/\s+/g, '')}.com/investors` },
        { text: 'TechCrunch 科技新闻', url: 'https://techcrunch.com' },
        { text: 'The Information 深度报道', url: 'https://www.theinformation.com' },
        { text: 'Bloomberg 商业资讯', url: 'https://www.bloomberg.com' }
    ];

    return { title, summary, content: contentHtml, references, date, company: company.nameZh };
}

// 创建文章详情页（HTML）
function createArticleDetailPage(articleId, articleData) {
    const filename = `news-detail-${articleId}.html`;
    const filepath = path.join(__dirname, '..', filename);

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${articleData.title} - 智灵·新知</title>
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
            padding: 20px;
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
            margin-bottom: 20px;
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
            padding: 25px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.08);
            margin-bottom: 20px;
        }

        .article-title {
            font-size: 1.6em;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 15px;
            line-height: 1.3;
        }

        .article-meta {
            display: flex;
            gap: 15px;
            padding-bottom: 15px;
            margin-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
            color: #6b7280;
            font-size: 0.85em;
        }

        .article-summary {
            background: #f0f4ff;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin-bottom: 20px;
            font-size: 0.95em;
            color: #374151;
            line-height: 1.6;
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
            margin-top: 25px;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
        }

        .article-content h3 {
            font-size: 1.1em;
            font-weight: 600;
            color: #374151;
            margin-top: 18px;
            margin-bottom: 10px;
        }

        .article-content h4 {
            font-size: 1em;
            font-weight: 600;
            color: #4b5563;
            margin-top: 12px;
            margin-bottom: 8px;
        }

        .article-content p {
            margin-bottom: 12px;
        }

        .section-description {
            color: #6b7280;
            font-style: italic;
            margin-bottom: 15px;
        }

        .content-guide {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin: 15px 0;
        }

        .content-guide h4 {
            color: #92400e;
            margin-bottom: 8px;
        }

        .content-guide ul {
            margin-left: 20px;
            color: #78350f;
        }

        .content-guide li {
            margin-bottom: 5px;
        }

        .actual-content {
            background: #f9fafb;
            border-left: 4px solid #d1d5db;
            padding: 15px;
            margin: 15px 0;
        }

        .placeholder-hint {
            color: #6b7280;
            font-size: 0.9em;
            font-style: italic;
            margin-top: 10px;
        }

        .thinking-points {
            background: #dbeafe;
            border-left: 4px solid #3b82f6;
            padding: 12px;
            margin: 15px 0;
        }

        .thinking-points h4 {
            color: #1e40af;
            margin-bottom: 8px;
        }

        .thinking-points ul {
            margin-left: 20px;
            color: #1e3a8a;
        }

        .thinking-points li {
            margin-bottom: 5px;
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
            margin-bottom: 10px;
        }

        .references ul {
            list-style: none;
            padding: 0;
        }

        .references li {
            margin-bottom: 8px;
        }

        .references a {
            color: #667eea;
            text-decoration: none;
            font-size: 0.95em;
        }

        .references a:hover {
            text-decoration: underline;
        }

        .footer {
            background: #2d3748;
            color: white;
            text-align: center;
            padding: 20px;
            margin-top: 30px;
        }

        .footer p {
            margin: 8px 0;
            opacity: 0.9;
        }

        @media (max-width: 768px) {
            .header {
                padding: 20px 15px;
            }

            .header h1 {
                font-size: 1.3em;
            }

            .article {
                padding: 20px;
            }

            .article-title {
                font-size: 1.4em;
            }

            .article-content {
                font-size: 0.9em;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>智灵·新知</h1>
        <p>Intellake.Cognova - 认知智能湖</p>
    </div>

    <div class="nav">
        <a href="index.html">← 返回首页</a>
        <a href="cognova.html">智灵·新知</a>
        <a href="ai-module.html">人工智能</a>
    </div>

    <div class="container">
        <article class="article">
            <h1 class="article-title">${articleData.title}</h1>

            <div class="article-meta">
                <span>📅 ${articleData.date}</span>
                <span>🏢 ${articleData.company}</span>
                <span>📖 公司研究与发展历程</span>
            </div>

            <div class="article-summary">
                <strong>摘要：</strong>${articleData.summary}
            </div>

            <div class="article-content">
${articleData.content}
            </div>

            <div class="references">
                <h3>参考资料</h3>
                <ul>
${articleData.references.map(ref => `                    <li><a href="${ref.url}" target="_blank">${ref.text} ↗</a></li>`).join('\n')}
                </ul>
            </div>
        </article>
    </div>

    <div class="footer">
        <p>&copy; 2026 Intellake.Cognova - 认知智能湖</p>
        <p>探索AI世界的深度与广度</p>
    </div>
</body>
</html>`;

    fs.writeFileSync(filepath, html, 'utf-8');
    console.log(`✅ 创建文章详情页: ${filename}`);
}

// 更新ai-module.html首页
function updateAIModulePage(articleId, articleData) {
    const filepath = path.join(__dirname, '..', 'ai-module.html');
    let content = fs.readFileSync(filepath, 'utf-8');

    const newItem = `                <div class="news-item">
                    <div class="news-header">
                        <a href="news-detail.html?id=${articleId}" class="news-title">${articleData.title}</a>
                        <span class="news-date">${articleData.date}</span>
                    </div>
                    <div class="news-description">${articleData.summary}</div>
                </div>

                `;

    // 在第一个news-item之前插入
    const marker = '<div class="news-item">';
    const insertPosition = content.indexOf(marker);

    if (insertPosition !== -1) {
        content = content.slice(0, insertPosition) + newItem + content.slice(insertPosition);
        fs.writeFileSync(filepath, content, 'utf-8');
        console.log('✅ 更新ai-module.html');
    }
}

// 更新ai-dimension.html（公司维度）
function updateAIDimensionPage(articleId, articleData) {
    const filepath = path.join(__dirname, '..', 'ai-dimension.html');
    let content = fs.readFileSync(filepath, 'utf-8');

    const newItem = `                {
                    id: '${articleId}',
                    title: '${articleData.title}',
                    date: '${articleData.date}',
                    description: '${articleData.summary}'
                },
                `;

    // 在'company'数组的第一个元素之前插入
    const marker = "'company': [";
    const insertPosition = content.indexOf(marker) + marker.length;

    if (insertPosition > marker.length) {
        content = content.slice(0, insertPosition) + '\n' + newItem + content.slice(insertPosition);
        fs.writeFileSync(filepath, content, 'utf-8');
        console.log('✅ 更新ai-dimension.html');
    }
}

// 更新news-detail.html路由
function updateNewsDetailRouter(articleId) {
    const filepath = path.join(__dirname, '..', 'news-detail.html');
    let content = fs.readFileSync(filepath, 'utf-8');

    const newRoute = `
        if (articleId === '${articleId}') {
            window.location.href = 'news-detail-${articleId}.html';
        }
        `;

    // 在第一个if之前插入
    const marker = "// 如果是特定的文章ID，跳转到对应的独立页面";
    const insertPosition = content.indexOf(marker) + marker.length;

    content = content.slice(0, insertPosition) + '\n' + newRoute + content.slice(insertPosition);

    fs.writeFileSync(filepath, content, 'utf-8');
    console.log('✅ 更新news-detail.html路由');
}

// 主函数
async function main() {
    console.log('🚀 开始生成基于新模板的公司文章...');

    const dateWithTime = getTodayDate(); // 带时间的日期，用于显示
    const dateForFile = getDateForFilename(); // 不带时间的日期，用于文件名

    console.log(`📅 日期: ${dateWithTime}`);

    // 随机选择一家AI公司
    const company = AI_COMPANIES[Math.floor(Math.random() * AI_COMPANIES.length)];
    console.log(`🏢 选择公司: ${company.nameZh}`);
    console.log(`📰 文章类型: 公司研究与发展历程（新模板）`);

    const dateSlug = dateForFile.replace(/-/g, ''); // 20260813 格式
    const articleId = generateArticleId(company, dateSlug);

    // 生成基于新模板的文章
    console.log('📝 根据固定模板生成文章结构...');
    const articleData = generateArticleFromTemplate(company, dateWithTime);

    // 创建和更新页面
    createArticleDetailPage(articleId, articleData);
    updateAIModulePage(articleId, articleData);
    updateAIDimensionPage(articleId, articleData);
    updateNewsDetailRouter(articleId);

    console.log('✅ 新模板文章生成完成！');
    console.log(`📄 文章ID: ${articleId}`);
    console.log(`📰 文章标题: ${articleData.title}`);
    console.log('⚠️  注意：文章内容为模板结构，需要手动填充具体内容');
}

// 执行
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 错误:', error);
        process.exit(1);
    });
}

module.exports = { generateArticleFromTemplate, AI_COMPANIES };
