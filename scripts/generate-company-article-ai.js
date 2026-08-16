const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
const { companyArticleTemplate } = require('./company-article-template.js');

// 初始化Anthropic客户端
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// AI公司数据库（扩展版 - 涵盖全球主要AI公司）
const AI_COMPANIES = [
    // 美国公司
    {
        name: 'OpenAI',
        nameZh: 'OpenAI',
        founded: '2015-12',
        founders: ['Sam Altman', 'Elon Musk', 'Ilya Sutskever', 'Greg Brockman'],
        mainProduct: 'ChatGPT, GPT系列模型',
        region: '美国'
    },
    {
        name: 'Anthropic',
        nameZh: 'Anthropic',
        founded: '2021-01',
        founders: ['Dario Amodei', 'Daniela Amodei'],
        mainProduct: 'Claude系列模型',
        region: '美国'
    },
    {
        name: 'Google DeepMind',
        nameZh: '谷歌DeepMind',
        founded: '2010-09',
        founders: ['Demis Hassabis', 'Shane Legg', 'Mustafa Suleyman'],
        mainProduct: 'Gemini, AlphaGo, AlphaFold',
        region: '美国/英国'
    },
    {
        name: 'Microsoft',
        nameZh: '微软',
        founded: '1975-04',
        founders: ['Bill Gates', 'Paul Allen'],
        mainProduct: 'Azure AI, Copilot, GPT集成',
        region: '美国'
    },
    {
        name: 'Meta',
        nameZh: 'Meta（Facebook）',
        founded: '2004-02',
        founders: ['Mark Zuckerberg'],
        mainProduct: 'Llama模型, PyTorch',
        region: '美国'
    },
    {
        name: 'Amazon',
        nameZh: '亚马逊',
        founded: '1994-07',
        founders: ['Jeff Bezos'],
        mainProduct: 'AWS AI服务, Alexa, Bedrock',
        region: '美国'
    },
    {
        name: 'NVIDIA',
        nameZh: '英伟达',
        founded: '1993-04',
        founders: ['Jensen Huang', '克里斯·马拉科夫斯基', '柯蒂斯·普里姆'],
        mainProduct: 'GPU, CUDA, AI芯片',
        region: '美国'
    },
    // 中国公司
    {
        name: 'Baidu',
        nameZh: '百度',
        founded: '2000-01',
        founders: ['李彦宏', '徐勇'],
        mainProduct: '文心一言, 搜索引擎, Apollo',
        region: '中国'
    },
    {
        name: 'Alibaba',
        nameZh: '阿里巴巴',
        founded: '1999-04',
        founders: ['马云', '蔡崇信等18人'],
        mainProduct: '通义千问, 阿里云, 达摩院',
        region: '中国'
    },
    {
        name: 'Tencent',
        nameZh: '腾讯',
        founded: '1998-11',
        founders: ['马化腾', '张志东', '许晨晔', '陈一丹', '曾李青'],
        mainProduct: '微信, 腾讯云, 混元大模型',
        region: '中国'
    },
    {
        name: 'ByteDance',
        nameZh: '字节跳动',
        founded: '2012-03',
        founders: ['张一鸣', '梁汝波'],
        mainProduct: 'TikTok, 抖音, 豆包AI',
        region: '中国'
    },
    {
        name: 'SenseTime',
        nameZh: '商汤科技',
        founded: '2014-10',
        founders: ['汤晓鸥', '徐立'],
        mainProduct: '计算机视觉, 日日新大模型',
        region: '中国'
    },
    {
        name: 'iFLYTEK',
        nameZh: '科大讯飞',
        founded: '1999-12',
        founders: ['刘庆峰'],
        mainProduct: '语音识别, 星火大模型',
        region: '中国'
    },
    {
        name: 'Zhipu AI',
        nameZh: '智谱AI',
        founded: '2019-03',
        founders: ['张鹏', '唐杰'],
        mainProduct: 'ChatGLM, GLM系列模型',
        region: '中国'
    },
    {
        name: 'MiniMax',
        nameZh: '稀宇科技（MiniMax）',
        founded: '2021-12',
        founders: ['闫俊杰', '周鸿祎（投资方）'],
        mainProduct: 'Glow, ABAB大模型',
        region: '中国'
    },
    // 欧洲公司
    {
        name: 'Mistral AI',
        nameZh: 'Mistral AI',
        founded: '2023-04',
        founders: ['Arthur Mensch', 'Guillaume Lample', 'Timothée Lacroix'],
        mainProduct: 'Mistral模型系列',
        region: '法国'
    },
    {
        name: 'Stability AI',
        nameZh: 'Stability AI',
        founded: '2020-01',
        founders: ['Emad Mostaque'],
        mainProduct: 'Stable Diffusion',
        region: '英国'
    },
    // 其他地区
    {
        name: 'Cohere',
        nameZh: 'Cohere',
        founded: '2019-11',
        founders: ['Aidan Gomez', 'Ivan Zhang', 'Nick Frosst'],
        mainProduct: 'Command模型, 企业AI解决方案',
        region: '加拿大'
    },
    {
        name: 'AI21 Labs',
        nameZh: 'AI21 Labs',
        founded: '2017-08',
        founders: ['Yoav Shoham', 'Ori Goshen', 'Amnon Shashua'],
        mainProduct: 'Jurassic模型系列',
        region: '以色列'
    },
    {
        name: 'Adept',
        nameZh: 'Adept',
        founded: '2022-04',
        founders: ['David Luan', 'Niki Parmar', 'Ashish Vaswani'],
        mainProduct: 'ACT-1, 行动AI',
        region: '美国'
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

// 使用Claude API生成子章节内容
async function generateSubsectionContent(company, section, subsection) {
    const prompt = `你是一位专业的商业分析师和公司研究专家。请根据以下要求，为${company.nameZh}撰写公司研究文章的一个章节内容。

**公司基本信息：**
- 公司名称：${company.nameZh}
- 成立时间：${company.founded}
- 创始人：${company.founders.join('、')}
- 核心产品：${company.mainProduct}

**当前章节：**
${section.title}
${subsection.subtitle}

**内容方向：**
${subsection.contentGuide.map((guide, idx) => `${idx + 1}. ${guide}`).join('\n')}

**学习思考点（供参考）：**
${subsection.thinkingPoints.map((point, idx) => `${idx + 1}. ${point}`).join('\n')}

**写作要求：**
1. 内容必须基于真实信息和公开资料
2. 语言精简、逻辑清晰、重点突出
3. 字数控制在300-500字
4. 分2-3个自然段落
5. 突出可学习借鉴的经验和教训
6. 避免堆砌数据，注重洞察和分析

请直接输出章节内容，不要包含任何前缀说明或标题。`;

    try {
        const message = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1500,
            messages: [{
                role: 'user',
                content: prompt
            }]
        });

        return message.content[0].text.trim();
    } catch (error) {
        console.error(`❌ 生成内容失败 (${subsection.subtitle}):`, error.message);
        return `[内容生成失败：${error.message}]`;
    }
}

// 使用AI生成完整文章内容
async function generateArticleWithAI(company, date) {
    const title = `${company.nameZh} - 公司研究与发展历程`;
    const summary = `本文深入研究${company.nameZh}的发展历程，从创始背景、发展阶段、商业模式、组织管理、风险教训到未来展望，全面拆解其成功经验与失败教训，提炼可学习借鉴的底层逻辑。`;

    let contentHtml = '';
    let subsectionCount = 0;
    const totalSubsections = companyArticleTemplate.sections.reduce((sum, section) => sum + section.subsections.length, 0);

    console.log(`📝 开始生成${totalSubsections}个子章节的内容...`);

    // 遍历6大模块
    for (const section of companyArticleTemplate.sections) {
        contentHtml += `        <h2>${section.title}</h2>\n`;
        contentHtml += `        <p class="section-description"><em>${section.description}</em></p>\n\n`;

        // 遍历每个子章节
        for (const subsection of section.subsections) {
            subsectionCount++;
            console.log(`   📄 [${subsectionCount}/${totalSubsections}] 生成 ${subsection.subtitle}...`);

            contentHtml += `        <h3>${subsection.subtitle}</h3>\n\n`;

            // 生成实际内容
            const content = await generateSubsectionContent(company, section, subsection);
            const paragraphs = content.split('\n\n').filter(p => p.trim());

            contentHtml += `        <div class="actual-content">\n`;
            paragraphs.forEach(para => {
                if (para.trim()) {
                    contentHtml += `            <p>${para.trim()}</p>\n`;
                }
            });
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

            // 添加小延迟，避免API限流
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

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

        .actual-content {
            background: #f9fafb;
            border-left: 4px solid #10b981;
            padding: 15px;
            margin: 15px 0;
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
    console.log('🚀 开始生成基于新模板的AI驱动公司文章...');

    // 检查API Key
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('❌ 错误：未设置 ANTHROPIC_API_KEY 环境变量');
        console.log('请设置环境变量：export ANTHROPIC_API_KEY=your-api-key');
        process.exit(1);
    }

    const dateWithTime = getTodayDate(); // 带时间的日期，用于显示
    const dateForFile = getDateForFilename(); // 不带时间的日期，用于文件名

    console.log(`📅 日期: ${dateWithTime}`);

    // 随机选择一家AI公司
    const company = AI_COMPANIES[Math.floor(Math.random() * AI_COMPANIES.length)];
    console.log(`🏢 选择公司: ${company.nameZh}`);
    console.log(`📰 文章类型: 公司研究与发展历程（AI生成）`);

    const dateSlug = dateForFile.replace(/-/g, ''); // 20260813 格式
    const articleId = generateArticleId(company, dateSlug);

    // 使用AI生成完整文章内容
    console.log('🤖 使用Claude AI生成文章内容...');
    const articleData = await generateArticleWithAI(company, dateWithTime);

    // 创建和更新页面
    console.log('\n📄 创建和更新页面...');
    createArticleDetailPage(articleId, articleData);
    updateAIModulePage(articleId, articleData);
    updateAIDimensionPage(articleId, articleData);
    updateNewsDetailRouter(articleId);

    console.log('\n✅ AI驱动的公司研究文章生成完成！');
    console.log(`📄 文章ID: ${articleId}`);
    console.log(`📰 文章标题: ${articleData.title}`);
    console.log(`🔗 访问地址: http://localhost:8080/news-detail-${articleId}.html`);
}

// 执行
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 错误:', error);
        process.exit(1);
    });
}

module.exports = { generateArticleWithAI, AI_COMPANIES };
