/**
 * 每日文章自动生成调度器
 * 功能：
 * 1. 每天自动生成一篇公司研究文章
 * 2. 确保每天选择不同的公司（避免重复）
 * 3. 从全球AI领域动态搜索适合的公司
 * 4. 记录已生成公司历史，智能选择新公司
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// 初始化Anthropic客户端
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

// 历史记录文件路径
const HISTORY_FILE = path.join(__dirname, '..', 'data', 'generated-companies-history.json');

// 公司模板路径
const TEMPLATE_PATH = path.join(__dirname, 'company-article-template.js');

// 确保数据目录存在
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * 加载已生成公司历史
 */
function loadHistory() {
    if (!fs.existsSync(HISTORY_FILE)) {
        return { companies: [], lastGenerated: null };
    }

    try {
        const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ 加载历史记录失败:', error.message);
        return { companies: [], lastGenerated: null };
    }
}

/**
 * 保存已生成公司历史
 */
function saveHistory(history) {
    try {
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
        console.log('✅ 历史记录已保存');
    } catch (error) {
        console.error('❌ 保存历史记录失败:', error.message);
    }
}

/**
 * 获取今天的日期（YYYY-MM-DD格式）
 */
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 检查今天是否已经生成过文章
 */
function checkTodayGenerated(history) {
    const today = getTodayDate();
    return history.lastGenerated === today;
}

/**
 * 使用AI搜索并选择今天适合的公司
 * 基于历史记录、当前热点、行业影响力等因素
 */
async function selectCompanyForToday(history) {
    console.log('🔍 正在使用AI分析并选择今天适合的公司...');

    const generatedCompanies = history.companies.map(c => c.name).join('、');
    const recentCount = history.companies.slice(-30).length; // 最近30天

    const prompt = `你是一个AI行业分析专家。请根据以下要求，为今天（${getTodayDate()}）选择一家最适合深入研究的AI公司。

**已生成公司历史**（共${history.companies.length}家，最近30天生成${recentCount}家）：
${generatedCompanies || '无'}

**选择标准**：
1. **不重复**：绝对不能选择已生成过的公司
2. **影响力**：优先选择当前在AI领域有重大影响力的公司
3. **热度**：考虑近期是否有重要动态、融资、产品发布等
4. **多样性**：平衡地域（美国、中国、欧洲等）、规模（大厂、独角兽、创业公司）、方向（大模型、芯片、应用等）
5. **可研究性**：公司信息相对公开，有足够的发展历程可以研究

**覆盖范围**：
- 美国：OpenAI、Anthropic、Google DeepMind、Microsoft、Meta、Amazon、NVIDIA、Cohere、AI21 Labs、Adept、Perplexity、Character.AI、Hugging Face等
- 中国：百度、阿里巴巴、腾讯、字节跳动、商汤、旷视、依图、云从、第四范式、智谱AI、MiniMax、月之暗面、阶跃星辰、零一万物、面壁智能、循环智能、澜舟科技等
- 欧洲：Mistral AI、Stability AI、Aleph Alpha、DeepL等
- 其他：Cohere（加拿大）、Naver（韩国）、Preferred Networks（日本）等

请以JSON格式返回你的选择：
{
    "name": "公司英文名",
    "nameZh": "公司中文名",
    "founded": "创立时间（YYYY-MM格式）",
    "founders": ["创始人1", "创始人2"],
    "mainProduct": "主要产品/服务",
    "region": "所属地区",
    "reason": "选择理由（100字以内）"
}`;

    try {
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            messages: [{
                role: 'user',
                content: prompt
            }]
        });

        const responseText = message.content[0].text;

        // 提取JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AI返回格式错误');
        }

        const company = JSON.parse(jsonMatch[0]);

        console.log(`✅ AI选择了公司: ${company.nameZh} (${company.name})`);
        console.log(`📝 选择理由: ${company.reason}`);

        return company;

    } catch (error) {
        console.error('❌ AI选择公司失败:', error.message);
        throw error;
    }
}

/**
 * 生成子章节内容
 */
async function generateSubsectionContent(company, subsection, model = 'claude-haiku-4-5-20251001') {
    const prompt = `你是一位资深的商业分析师和企业研究专家。请为"${company.nameZh}"（${company.name}）公司研究文章撰写以下子章节的内容。

**子章节信息**：
- 编号：${subsection.id}
- 标题：${subsection.subtitle}

**内容指引**：
${subsection.contentGuide.map((guide, idx) => `${idx + 1}. ${guide}`).join('\n')}

**思考要点**：
${subsection.thinkingPoints.map((point, idx) => `${idx + 1}. ${point}`).join('\n')}

**公司基础信息**：
- 公司名称：${company.nameZh} (${company.name})
- 创立时间：${company.founded}
- 创始人：${company.founders.join('、')}
- 主要产品：${company.mainProduct}
- 所属地区：${company.region}

**撰写要求**：
1. 内容必须真实准确，基于公开信息
2. 语言精简专业，避免空话套话
3. 突出关键信息和可学习的经验
4. 字数控制在200-400字
5. 直接输出正文内容，不要标题和编号

请开始撰写：`;

    try {
        const message = await anthropic.messages.create({
            model: model,
            max_tokens: 1500,
            messages: [{
                role: 'user',
                content: prompt
            }]
        });

        return message.content[0].text.trim();
    } catch (error) {
        console.error(`❌ 生成子章节 ${subsection.id} 失败:`, error.message);
        throw error;
    }
}

/**
 * 生成完整文章
 */
async function generateArticle(company, model = 'claude-haiku-4-5-20251001') {
    console.log(`\n📝 开始为 ${company.nameZh} 生成文章内容...`);

    // 加载模板
    const template = require(TEMPLATE_PATH);
    const articleTemplate = template.companyArticleTemplate;

    // 生成所有子章节内容
    let completedCount = 0;
    const totalCount = articleTemplate.sections.reduce((sum, section) => sum + section.subsections.length, 0);

    for (const section of articleTemplate.sections) {
        for (const subsection of section.subsections) {
            completedCount++;
            console.log(`   📄 [${completedCount}/${totalCount}] 生成 ${subsection.id} ${subsection.subtitle}...`);

            subsection.content = await generateSubsectionContent(company, subsection, model);

            // 延迟1秒，避免API限流
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log('✅ 所有子章节内容生成完成！');
    return articleTemplate;
}

/**
 * 创建文章HTML文件
 */
function createArticleFile(company, articleData) {
    const today = getTodayDate();
    const todayDisplay = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(/\//g, '-').replace(',', '');

    const fileDate = today.replace(/-/g, '');
    const companyId = company.name.toLowerCase().replace(/\s+/g, '-');
    const articleId = `ai-c-${companyId}-${fileDate}`;
    const fileName = `news-detail-${articleId}.html`;
    const filePath = path.join(__dirname, '..', fileName);

    // 生成文章简介
    const articleSummary = `本文深入研究${company.nameZh}的发展历程，从创始背景、发展阶段、商业模式、组织管理、风险教训到未来展望，全面拆解其成功经验与失败教训，提炼可学习借鉴的底层逻辑。`;

    // 生成HTML内容
    let htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${articleSummary}">
    <meta name="article-module" content="ai">
    <meta name="article-type" content="company">
    <meta name="article-dimension" content="公司与历程">
    <title>${company.nameZh} - 公司研究与发展历程</title>
    <link rel="stylesheet" href="styles/article.css">
</head>
<body>
    <div class="article-container">
        <div class="article-header">
            <h1 class="article-title">${company.nameZh} - 公司研究与发展历程</h1>
            <div class="article-meta">
                <span class="article-date">📅 ${todayDisplay}</span>
                <span class="article-category">🏢 公司研究</span>
                <span class="article-author">✍️ AI生成 · 智灵新知</span>
            </div>
        </div>

        <div class="article-intro">
            <p>${articleSummary}</p>
        </div>

        <div class="article-content">
`;

    // 添加所有章节和子章节
    articleData.sections.forEach(section => {
        htmlContent += `            <div class="section">
                <h2 class="section-title">${section.id}. ${section.title}</h2>
`;

        section.subsections.forEach(subsection => {
            htmlContent += `                <div class="subsection">
                    <h3 class="subsection-title">${subsection.id} ${subsection.subtitle}</h3>
                    <div class="subsection-content">
                        <p>${subsection.content}</p>
                    </div>
                </div>
`;
        });

        htmlContent += `            </div>
`;
    });

    // 添加研究方法论
    htmlContent += `            <div class="section methodology">
                <h2 class="section-title">研究方法论</h2>
                <div class="methodology-content">
                    ${articleData.researchMethodology}
                </div>
            </div>
        </div>

        <div class="article-footer">
            <a href="/ai-content-generator-v2.html" class="back-button" style="margin-right: 15px;">← 返回配置中心</a>
            <a href="/cognova.html" class="back-button" style="margin-right: 15px;">📰 查看所有文章</a>
            <a href="/ai-dimension.html?type=company" class="back-button">🏢 公司研究专栏</a>
        </div>
    </div>
</body>
</html>`;

    // 写入文件
    fs.writeFileSync(filePath, htmlContent, 'utf-8');
    console.log(`✅ 创建文章详情页: ${fileName}`);

    return {
        articleId,
        fileName,
        filePath
    };
}

/**
 * 更新首页和维度页
 */
function updateIndexPages(company, articleInfo) {
    const today = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(/\//g, '-').replace(',', '');

    const newsItem = {
        id: articleInfo.articleId,
        title: `${company.nameZh} - 公司研究与发展历程`,
        description: `本文深入研究${company.nameZh}的发展历程，从创始背景、发展阶段、商业模式、组织管理、风险教训到未来展望，全面拆解其成功经验与失败教训，提炼可学习借鉴的底层逻辑。`,
        date: today,
        category: 'company'
    };

    // 这里应该更新 ai-module.html 和 ai-dimension.html
    // 由于需要解析HTML并插入，这里先输出信息
    console.log('✅ 文章信息：', newsItem);
    console.log('💡 提示：请手动或通过脚本更新 ai-module.html 和 ai-dimension.html');
}

/**
 * 主执行函数
 */
async function main() {
    console.log('🚀 每日文章自动生成调度器启动...');
    console.log(`📅 当前日期: ${getTodayDate()}\n`);

    // 加载历史记录
    const history = loadHistory();
    console.log(`📚 历史记录: 已生成 ${history.companies.length} 家公司`);

    // 检查今天是否已生成
    if (checkTodayGenerated(history)) {
        console.log('✅ 今天已经生成过文章，无需重复生成');
        console.log(`📄 上次生成日期: ${history.lastGenerated}`);
        return;
    }

    try {
        // 1. 选择公司
        const company = await selectCompanyForToday(history);

        // 2. 生成文章
        const model = process.env.MODEL || 'claude-haiku-4-5-20251001';
        console.log(`🤖 使用模型: ${model}`);

        const articleData = await generateArticle(company, model);

        // 3. 创建文章文件
        const articleInfo = createArticleFile(company, articleData);

        // 4. 更新索引页
        updateIndexPages(company, articleInfo);

        // 5. 更新历史记录
        history.companies.push({
            name: company.name,
            nameZh: company.nameZh,
            generatedDate: getTodayDate(),
            articleId: articleInfo.articleId,
            reason: company.reason
        });
        history.lastGenerated = getTodayDate();
        saveHistory(history);

        console.log('\n✅ 每日文章生成完成！');
        console.log(`📄 文章ID: ${articleInfo.articleId}`);
        console.log(`📰 文章标题: ${company.nameZh} - 公司研究与发展历程`);
        console.log(`🔗 访问地址: http://localhost:8080/${articleInfo.fileName}`);

    } catch (error) {
        console.error('\n❌ 文章生成失败:', error.message);
        process.exit(1);
    }
}

// 执行
if (require.main === module) {
    main();
}

module.exports = { main };
