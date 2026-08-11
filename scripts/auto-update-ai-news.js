const fs = require('fs');
const path = require('path');

// AI公司池
const AI_COMPANIES = [
    { name: 'OpenAI', nameZh: 'OpenAI', focus: ['GPT系列', 'ChatGPT', 'DALL-E', 'AGI研究'] },
    { name: 'Anthropic', nameZh: 'Anthropic', focus: ['Claude', 'AI安全', '宪法AI'] },
    { name: 'Google DeepMind', nameZh: '谷歌DeepMind', focus: ['Gemini', 'AlphaFold', '多模态AI'] },
    { name: 'Microsoft', nameZh: '微软', focus: ['Azure AI', 'Copilot', '企业AI'] },
    { name: 'Meta', nameZh: 'Meta', focus: ['LLaMA', '开源AI', 'AR/VR'] },
    { name: 'Amazon', nameZh: '亚马逊', focus: ['AWS AI', 'Alexa', '云计算AI'] },
    { name: 'NVIDIA', nameZh: '英伟达', focus: ['GPU', 'AI芯片', '训练加速'] },
    { name: 'Baidu', nameZh: '百度', focus: ['文心一言', 'Apollo', '智能云'] },
    { name: 'Alibaba', nameZh: '阿里巴巴', focus: ['通义千问', '达摩院', '云计算'] },
    { name: 'Tencent', nameZh: '腾讯', focus: ['混元大模型', '企业微信AI', '游戏AI'] },
];

// 生成日期
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 生成文章ID
function generateArticleId(company, date) {
    const companySlug = company.name.toLowerCase().replace(/\s+/g, '-');
    const dateSlug = date.replace(/-/g, '');
    return `ai-c-${companySlug}-${dateSlug}`;
}

// 生成文章内容
function generateArticle(company, date) {
    const month = new Date().getMonth() + 1;

    const title = `${company.nameZh} ${month}月公司动态：战略升级与业务拓展综述`;

    const summary = `${company.nameZh}在${month}月迎来多项重要进展，涵盖战略规划、技术创新、市场拓展等多个维度。公司在${company.focus[0]}等核心业务领域持续发力，巩固行业领先地位。`;

    const content = `
        <h2>一、公司战略与动向</h2>

        <h3>1.1 战略规划</h3>
        <p>${company.nameZh}在${date}公布了最新的战略规划。公司明确了未来三年的发展方向，重点聚焦${company.focus.join('、')}等核心业务领域。通过持续的技术创新和生态建设，${company.nameZh}致力于构建更加完整的AI产业链。</p>
        <p>公司管理层在内部会议中强调，将继续加大研发投入，吸引全球顶尖AI人才加入。同时，通过与产业链上下游伙伴的深度合作，推动AI技术的商业化应用。</p>

        <h3>1.2 组织架构优化</h3>
        <p>为了更好地支撑业务发展，${company.nameZh}对组织架构进行了优化调整。公司成立了专门的事业部，负责${company.focus[0]}方向的产品研发和市场推广。通过扁平化的组织结构，提升决策效率和市场响应速度。</p>

        <h2>二、企业里程碑</h2>

        <h3>2.1 业务增长</h3>
        <p>根据最新披露的数据，${company.nameZh}的核心业务指标持续向好。在${company.focus[0]}领域，公司的市场份额进一步提升，用户规模和营收增长均超出市场预期。</p>
        <p>分析人士指出，${company.nameZh}凭借其在技术和产品方面的优势，在激烈的市场竞争中保持了强劲的增长势头。</p>

        <h3>2.2 市场认可</h3>
        <p>${company.nameZh}在本月获得了多项行业认可。公司的创新实践和技术成果得到了业界的广泛关注，进一步提升了品牌影响力和市场地位。</p>

        <h2>三、技术突破与创新</h2>

        <h3>3.1 技术进展</h3>
        <p>${company.nameZh}的研发团队在${company.focus[1]}方向取得了重要突破。新技术的应用显著提升了产品性能和用户体验，为公司构建了强大的技术护城河。</p>
        <p>公司持续投入大量资源用于前沿技术研究，在多个关键技术领域建立了领先优势。通过技术创新驱动产品升级，${company.nameZh}不断满足市场的多样化需求。</p>

        <h3>3.2 研发投入</h3>
        <p>${company.nameZh}继续加大研发投入力度，本季度研发费用同比增长显著。公司通过建设世界级的研发中心和实验室，吸引了大批优秀的科研人才加入。</p>
        <p>在开放创新方面，${company.nameZh}积极与高校和科研机构合作，共同推动AI技术的发展和应用。</p>

        <h2>四、市场扩张</h2>

        <h3>4.1 国际化布局</h3>
        <p>${company.nameZh}加快国际化步伐，在多个重点市场设立了办事处和研发中心。通过本地化策略和生态合作，公司在海外市场的影响力持续提升。</p>
        <p>公司在欧洲、亚太等地区的业务取得了快速增长，产品和服务覆盖的国家和地区不断扩大。</p>

        <h3>4.2 生态建设</h3>
        <p>${company.nameZh}持续完善AI生态系统建设。通过开放平台和API服务，公司与数千家企业和开发者建立了合作关系，共同推动AI技术的应用和普及。</p>
        <p>在垂直行业应用方面，${company.nameZh}针对金融、医疗、教育、制造等领域推出了定制化解决方案，帮助企业实现数字化转型。</p>

        <h2>五、企业文化与社会责任</h2>

        <h3>5.1 可持续发展</h3>
        <p>${company.nameZh}积极践行企业社会责任，在环境保护、社会公益等方面采取了一系列措施。公司承诺在可持续发展方面持续投入，力争实现碳中和目标。</p>
        <p>通过采用绿色能源、优化算法效率等方式，${company.nameZh}不断降低AI系统的能耗，为环境保护做出贡献。</p>

        <h3>5.2 人才培养</h3>
        <p>${company.nameZh}重视AI人才的培养和发展。公司通过与高校合作、设立奖学金、开展技术培训等方式，为AI行业培养了大量专业人才。</p>
        <p>同时，${company.nameZh}为员工提供了良好的职业发展空间和福利保障，营造了积极向上的企业文化氛围。</p>

        <h3>5.3 技术普惠</h3>
        <p>${company.nameZh}致力于让AI技术惠及更多人群。公司推出了多项公益项目，向教育、医疗等公益领域提供免费或优惠的AI技术支持，推动技术普惠和社会进步。</p>
    `;

    const references = [
        { text: `${company.nameZh}官方新闻稿`, url: `https://${company.name.toLowerCase().replace(/\s+/g, '')}.com/news` },
        { text: 'The Information深度报道', url: 'https://www.theinformation.com' },
        { text: 'TechCrunch科技新闻', url: 'https://techcrunch.com' },
        { text: 'Bloomberg商业资讯', url: 'https://www.bloomberg.com' },
        { text: 'Gartner市场研究', url: 'https://www.gartner.com' },
    ];

    return { title, summary, content, references, date, company: company.nameZh };
}

// 创建文章详情页
function createArticleDetailPage(articleId, articleData) {
    const template = fs.readFileSync(path.join(__dirname, 'article-template.html'), 'utf-8');

    const referencesHtml = articleData.references.map(ref =>
        `                    <li>• <a href="${ref.url}" target="_blank">${ref.text}</a></li>`
    ).join('\n');

    const html = template
        .replace(/{{TITLE}}/g, articleData.title)
        .replace(/{{DATE}}/g, articleData.date)
        .replace(/{{SUMMARY}}/g, articleData.summary)
        .replace(/{{CONTENT}}/g, articleData.content)
        .replace(/{{REFERENCES}}/g, referencesHtml);

    const filename = `news-detail-${articleId}.html`;
    const filepath = path.join(__dirname, '..', filename);

    fs.writeFileSync(filepath, html, 'utf-8');
    console.log(`✅ 创建文章详情页: ${filename}`);
}

// 更新ai-module.html
function updateAIModulePage(articleId, articleData) {
    const filepath = path.join(__dirname, '..', 'ai-module.html');
    let content = fs.readFileSync(filepath, 'utf-8');

    const newNewsItem = `                <div class="news-item">
                    <div class="news-header">
                        <a href="news-detail.html?id=${articleId}" class="news-title">${articleData.title}</a>
                        <span class="news-date">${articleData.date}</span>
                    </div>
                    <div class="news-description">${articleData.summary}</div>
                </div>

                `;

    // 在公司与历程的news-list后插入
    const marker = '<!-- 维度1: 公司与历程 -->';
    const newsListStart = content.indexOf(marker);
    const newsListStartTag = content.indexOf('<div class="news-list">', newsListStart);
    const insertPosition = newsListStartTag + '<div class="news-list">'.length;

    content = content.slice(0, insertPosition) + '\n' + newNewsItem + content.slice(insertPosition);

    fs.writeFileSync(filepath, content, 'utf-8');
    console.log('✅ 更新ai-module.html');
}

// 更新ai-dimension.html
function updateAIDimensionPage(articleId, articleData) {
    const filepath = path.join(__dirname, '..', 'ai-dimension.html');
    let content = fs.readFileSync(filepath, 'utf-8');

    const newEntry = `                {
                    id: '${articleId}',
                    title: '${articleData.title}',
                    date: '${articleData.date}',
                    description: '${articleData.summary}'
                },
                `;

    // 在'company'数组开头插入
    const companyArrayStart = content.indexOf("'company': [");
    const insertPosition = companyArrayStart + "'company': [".length;

    content = content.slice(0, insertPosition) + '\n' + newEntry + content.slice(insertPosition);

    fs.writeFileSync(filepath, content, 'utf-8');
    console.log('✅ 更新ai-dimension.html');
}

// 更新news-detail.html路由
function updateNewsDetailRouter(articleId) {
    const filepath = path.join(__dirname, '..', 'news-detail.html');
    let content = fs.readFileSync(filepath, 'utf-8');

    const newRoute = `        if (articleId === '${articleId}') {
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
    console.log('🚀 开始自动更新AI新闻...');
    console.log(`📅 日期: ${getTodayDate()}`);

    // 随机选择一家AI公司
    const company = AI_COMPANIES[Math.floor(Math.random() * AI_COMPANIES.length)];
    console.log(`🏢 选择公司: ${company.nameZh}`);

    const date = getTodayDate();
    const articleId = generateArticleId(company, date);

    // 生成文章
    console.log('📝 生成文章内容...');
    const articleData = generateArticle(company, date);

    // 创建和更新页面
    createArticleDetailPage(articleId, articleData);
    updateAIModulePage(articleId, articleData);
    updateAIDimensionPage(articleId, articleData);
    updateNewsDetailRouter(articleId);

    console.log('✅ 自动更新完成！');
    console.log(`📄 文章ID: ${articleId}`);
    console.log(`📰 文章标题: ${articleData.title}`);
}

// 执行
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 错误:', error);
        process.exit(1);
    });
}

module.exports = { main };
