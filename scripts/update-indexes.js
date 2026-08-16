/**
 * 更新HTML页面索引 - 将新文章添加到列表中
 */

const fs = require('fs');
const path = require('path');

/**
 * 更新 ai-module.html
 */
function updateAiModuleHTML(articleInfo) {
    const filePath = path.join(__dirname, '..', 'ai-module.html');
    let html = fs.readFileSync(filePath, 'utf-8');

    const newsItemHTML = `                <div class="news-item">
                    <div class="news-header">
                        <a href="news-detail.html?id=${articleInfo.id}" class="news-title">${articleInfo.title}</a>
                        <span class="news-date">${articleInfo.date}</span>
                    </div>
                    <div class="news-description">${articleInfo.description}</div>
                </div>
`;

    // 找到公司与历程板块的新闻列表
    const companyBlockStart = html.indexOf('<!-- 维度1: 公司与历程 -->');
    const companyBlockEnd = html.indexOf('<!-- 维度2: 产品与应用 -->');

    if (companyBlockStart === -1 || companyBlockEnd === -1) {
        console.error('❌ 找不到公司与历程板块');
        return false;
    }

    // 找到 <div class="news-list"> 和它的结束标签
    const newsListStartTag = '<div class="news-list">';
    const listStart = html.indexOf(newsListStartTag, companyBlockStart);
    const listContentStart = listStart + newsListStartTag.length;

    // 找到对应的 </div> (news-list的结束)
    let listEnd = listContentStart;
    let depth = 1;
    let i = listContentStart;
    while (i < companyBlockEnd && depth > 0) {
        if (html.substring(i, i + 5) === '<div ') {
            depth++;
            i += 5;
        } else if (html.substring(i, i + 6) === '</div>') {
            depth--;
            if (depth === 0) {
                listEnd = i;
                break;
            }
            i += 6;
        } else {
            i++;
        }
    }

    // 提取现有的所有新闻项
    const newsListContent = html.substring(listContentStart, listEnd);
    const newsItemRegex = /<div class="news-item">\s*<div class="news-header">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
    const existingItems = newsListContent.match(newsItemRegex) || [];

    // 插入新文章到最前面，只保留最新3条
    const allItems = [newsItemHTML, ...existingItems];
    const limitedItems = allItems.slice(0, 3).join('\n');

    // 替换整个新闻列表内容
    const beforeList = html.substring(0, listContentStart);
    const afterList = html.substring(listEnd);
    html = beforeList + '\n' + limitedItems + '\n            ' + afterList;

    fs.writeFileSync(filePath, html, 'utf-8');
    console.log('✅ 更新 ai-module.html（保留最新3条）');
    return true;
}

/**
 * 更新 ai-dimension.html
 */
function updateAiDimensionHTML(articleInfo) {
    const filePath = path.join(__dirname, '..', 'ai-dimension.html');

    if (!fs.existsSync(filePath)) {
        console.log('⚠️ ai-dimension.html 不存在，跳过更新');
        return false;
    }

    let html = fs.readFileSync(filePath, 'utf-8');

    // 构造新的数据项
    const newItem = `                {
                    id: '${articleInfo.id}',
                    title: '${articleInfo.title}',
                    date: '${articleInfo.date}',
                    description: '${articleInfo.description}'
                },
                `;

    // 在 'company': [ 后面插入新数据
    const companyArrayStart = html.indexOf("'company': [");

    if (companyArrayStart === -1) {
        console.error('❌ 找不到 company 数组');
        return false;
    }

    // 找到数组开始的位置（第一个 { 之前）
    const arrayContentStart = html.indexOf('[', companyArrayStart) + 1;

    // 在数组开头插入新项
    html = html.substring(0, arrayContentStart) + '\n' + newItem + html.substring(arrayContentStart);

    fs.writeFileSync(filePath, html, 'utf-8');
    console.log('✅ 更新 ai-dimension.html');
    return true;
}

/**
 * 更新 news-detail.html 路由（如果需要）
 */
function updateNewsDetailRouter(articleInfo) {
    const filePath = path.join(__dirname, '..', 'news-detail.html');

    if (!fs.existsSync(filePath)) {
        console.log('⚠️ news-detail.html 不存在，跳过更新');
        return false;
    }

    // 这里可以添加路由更新逻辑（如果有的话）
    console.log('✅ 更新 news-detail.html 路由');
    return true;
}

/**
 * 更新 cognova.html 主页 - 人工智能模块（只保留最新3条）
 */
function updateCognovaHTML(articleInfo) {
    const filePath = path.join(__dirname, '..', 'cognova.html');
    let html = fs.readFileSync(filePath, 'utf-8');

    const newsItemHTML = `                    <div class="news-item">
                        <div class="news-meta">
                            <a href="news-detail.html?id=${articleInfo.id}" class="news-title">${articleInfo.title}</a>
                            <span class="news-date">${articleInfo.date}</span>
                        </div>
                        <div class="news-description">${articleInfo.description}</div>
                    </div>
`;

    // 找到人工智能模块的新闻列表
    const aiModuleStart = html.indexOf('<!-- 人工智能 -->');
    if (aiModuleStart === -1) {
        console.error('❌ 找不到人工智能模块标记');
        return false;
    }

    // 找到该模块内的 news-list
    const afterAiModule = html.substring(aiModuleStart);
    const newsListStartTag = '<div class="news-list">';
    const newsListStart = afterAiModule.indexOf(newsListStartTag);

    if (newsListStart === -1) {
        console.error('❌ 找不到人工智能模块的 news-list');
        return false;
    }

    // 找到下一个模块的开始（典型精英）
    const nextModuleStart = afterAiModule.indexOf('<!-- 典型精英 -->');
    if (nextModuleStart === -1) {
        console.error('❌ 找不到下一个模块标记');
        return false;
    }

    // 提取新闻列表区域
    const newsListContent = afterAiModule.substring(newsListStart + newsListStartTag.length, nextModuleStart);

    // 提取现有的所有新闻项（注意 cognova.html 的结构是三层 div 嵌套）
    const newsItemRegex = /<div class="news-item">[\s\S]*?<div class="news-description">[\s\S]*?<\/div>\s*<\/div>/g;
    const existingItems = newsListContent.match(newsItemRegex) || [];

    // 插入新文章到最前面，只保留最新3条
    const allItems = [newsItemHTML.trim(), ...existingItems];
    const limitedItems = allItems.slice(0, 3);
    const newListContent = '\n' + limitedItems.join('\n') + '\n                ';

    // 重建HTML
    const beforeList = html.substring(0, aiModuleStart) + afterAiModule.substring(0, newsListStart + newsListStartTag.length);
    const afterList = html.substring(aiModuleStart + newsListStart + newsListStartTag.length + newsListContent.length);
    html = beforeList + newListContent + afterList;

    fs.writeFileSync(filePath, html, 'utf-8');
    console.log('✅ 更新 cognova.html 主页（保留最新3条）');
    return true;
}

/**
 * 主函数：更新所有索引页
 */
function updateAllIndexes(articleInfo) {
    console.log('\n📄 开始更新索引页面...');
    console.log('文章信息:', articleInfo);

    const results = {
        cognova: updateCognovaHTML(articleInfo),
        aiModule: updateAiModuleHTML(articleInfo),
        aiDimension: updateAiDimensionHTML(articleInfo),
        newsDetail: updateNewsDetailRouter(articleInfo)
    };

    console.log('\n更新结果:', results);

    const allSuccess = Object.values(results).every(r => r !== false);

    if (allSuccess) {
        console.log('✅ 所有索引页面更新完成');
    } else {
        console.log('⚠️ 部分索引页面更新失败');
    }

    return allSuccess;
}

// 如果直接运行此脚本
if (require.main === module) {
    const testArticle = {
        id: 'ai-c-anthropic-20260813',
        title: 'Anthropic - 公司研究与发展历程',
        description: '本文深入研究Anthropic的发展历程，从创始背景、发展阶段、商业模式、组织管理、风险教训到未来展望，全面拆解其成功经验与失败教训，提炼可学习借鉴的底层逻辑。',
        date: '2026-08-13 01:15'
    };

    updateAllIndexes(testArticle);
}

module.exports = { updateAllIndexes, updateCognovaHTML, updateAiModuleHTML, updateAiDimensionHTML };
