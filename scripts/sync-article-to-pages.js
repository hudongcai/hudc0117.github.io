/**
 * 自动同步新生成的文章到各个页面
 */

const fs = require('fs');
const path = require('path');

function syncArticleToPages(company, articleUrl, summary, templateName) {
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const articleId = `ai-c-${company.name.toLowerCase().replace(/\s+/g, '-')}`;

    const newArticle = {
        id: articleId,
        title: company.nameZh,
        date: timestamp,
        description: summary || `本文深入研究${company.nameZh}的发展历程与核心策略。`,
        url: articleUrl,
        templateName: templateName
    };

    console.log('📝 准备同步文章:', newArticle);

    // 同步到 cognova.html (主页)
    syncToCognova(newArticle);

    // 同步到 ai-module.html (AI模块)
    syncToAiModule(newArticle);

    // 同步到 ai-dimension.html (公司维度)
    syncToAiDimension(newArticle);

    console.log('✅ 文章已同步到所有页面');
}

function syncToAiDimension(article) {
    const filePath = path.join(__dirname, '..', 'ai-dimension.html');
    let content = fs.readFileSync(filePath, 'utf-8');

    // 查找 'company': [ 后面插入新文章
    const companyPattern = /(const newsData = \{[\s\S]*?'company':\s*\[)/;
    const match = content.match(companyPattern);

    if (match) {
        const insertPosition = match[0].length;
        const articleJson = `
                {
                    id: '${article.id}',
                    title: '${article.title}',
                    date: '${article.date}',
                    description: '${article.description}'
                },`;

        content = content.slice(0, match.index + insertPosition) +
                  articleJson +
                  content.slice(match.index + insertPosition);

        fs.writeFileSync(filePath, content, 'utf-8');
        console.log('✅ 已同步到 ai-dimension.html');
    } else {
        console.log('⚠️ 未找到插入位置');
    }
}

function syncToCognova(article) {
    const filePath = path.join(__dirname, '..', 'cognova.html');
    let content = fs.readFileSync(filePath, 'utf-8');

    // 查找 const articles = [ 后面插入新文章
    const articlesPattern = /(const articles = \[)/;
    const match = content.match(articlesPattern);

    if (match) {
        const insertPosition = match[0].length;
        const articleJson = `
                {
                    id: '${article.id}',
                    title: '${article.title}',
                    date: '${article.date}',
                    description: '${article.description}',
                    url: '${article.url}'
                },`;

        content = content.slice(0, match.index + insertPosition) +
                  articleJson +
                  content.slice(match.index + insertPosition);

        fs.writeFileSync(filePath, content, 'utf-8');
        console.log('✅ 已同步到 cognova.html');
    } else {
        console.log('⚠️ cognova.html: 未找到插入位置');
    }
}

function syncToAiModule(article) {
    const filePath = path.join(__dirname, '..', 'ai-module.html');
    let content = fs.readFileSync(filePath, 'utf-8');

    // 查找 const articles = [ 后面插入新文章
    const articlesPattern = /(const articles = \[)/;
    const match = content.match(articlesPattern);

    if (match) {
        const insertPosition = match[0].length;
        const articleJson = `
                {
                    id: '${article.id}',
                    title: '${article.title}',
                    date: '${article.date}',
                    description: '${article.description}',
                    url: '${article.url}'
                },`;

        content = content.slice(0, match.index + insertPosition) +
                  articleJson +
                  content.slice(match.index + insertPosition);

        fs.writeFileSync(filePath, content, 'utf-8');
        console.log('✅ 已同步到 ai-module.html');
    } else {
        console.log('⚠️ ai-module.html: 未找到插入位置');
    }
}

module.exports = { syncArticleToPages };
