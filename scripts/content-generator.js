/**
 * AI内容生成器 - 统一生成脚本
 * 集成：模板加载、公司选择、AI生成、文章输出
 */

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

class ContentGenerator {
    constructor(config) {
        this.baseDir = config.baseDir || process.cwd();
        this.dataDir = path.join(this.baseDir, 'data');
        this.templatesDir = path.join(this.baseDir, 'scripts', 'templates');
        this.outputDir = path.join(this.baseDir, 'articles');
        this.apiKey = config.apiKey;
        this.apiBaseUrl = config.apiBaseUrl || 'https://api.anthropic.com';
        this.apiModel = config.apiModel;
        this.onLog = config.onLog || ((msg) => console.log(msg));
        this.onProgress = config.onProgress || (() => {});
        this.onContentGenerated = config.onContentGenerated || (() => {});

        // 🔍 调试：打印接收到的API配置
        console.log('🔍 ContentGenerator 接收到的配置:', {
            apiKey: this.apiKey ? `${this.apiKey.substring(0, 8)}...${this.apiKey.slice(-4)}` : 'undefined',
            apiBaseUrl: this.apiBaseUrl,
            apiModel: this.apiModel
        });
    }

    /**
     * 执行生成任务
     */
    async execute(task) {
        try {
            this.log('📋 开始执行任务: ' + task.name);

            // 1. 加载模板
            const template = this.loadTemplate(task.templateId);
            this.log('✅ 加载模板: ' + template.name);

            // 2. 加载维度配置
            const dimension = this.loadDimension(task.dimensionId);
            this.log('✅ 加载子模块: ' + dimension.name);

            // 3. 选择公司主题
            const company = this.selectCompany(template);
            this.log('✅ 确认主题: ' + company.nameZh);

            // 4. 初始化AI客户端
            console.log('🔍 [BEFORE] this.apiKey =', this.apiKey ? `${this.apiKey.substring(0, 8)}...${this.apiKey.slice(-4)}` : 'undefined');
            console.log('🔍 [BEFORE] this.apiBaseUrl =', this.apiBaseUrl);

            const anthropic = new Anthropic({
                apiKey: this.apiKey,
                baseURL: this.apiBaseUrl
            });

            console.log('🔍 [AFTER] anthropic.apiKey =', anthropic.apiKey ? `${anthropic.apiKey.substring(0, 8)}...${anthropic.apiKey.slice(-4)}` : 'undefined');
            console.log('🔍 [AFTER] anthropic.baseURL =', anthropic.baseURL);

            // 使用配置的模型，如果没有则根据任务选择
            const modelName = this.apiModel || (task.model === 'haiku'
                ? 'claude-haiku-4-5-20251001'
                : 'claude-sonnet-5');

            this.log('🤖 使用模型: ' + modelName);
            this.log('🔗 API 端点: ' + this.apiBaseUrl);

            // 5. 生成内容
            const generatedContent = await this.generateContent(
                anthropic,
                modelName,
                template,
                dimension,
                company
            );

            // 6. 生成HTML文章
            const summary = this.generateSummary(generatedContent);
            this.log('✅ 文章摘要: ' + summary.substring(0, 100) + '...');

            const articlePath = this.generateArticle(company, generatedContent, template, dimension, summary);
            this.log('✅ 文章已生成: ' + articlePath);

            const articleUrl = 'http://localhost:5001/articles/' + company.name + '.html';

            // 7. 同步到其他页面
            try {
                const { syncArticleToPages } = require('./sync-article-to-pages.js');
                syncArticleToPages(company, articleUrl, summary, template.name, dimension);
                this.log('✅ 文章已同步到所有页面');
            } catch (error) {
                this.log('⚠️ 同步到页面失败: ' + error.message);
            }

            return {
                success: true,
                company: company,
                articlePath: articlePath,
                url: articleUrl,
                summary: summary
            };

        } catch (error) {
            this.log('❌ 生成失败: ' + error.message);
            throw error;
        }
    }

    /**
     * 加载模板
     */
    loadTemplate(templateId) {
        const templatePath = path.join(this.templatesDir, templateId + '.json');
        if (!fs.existsSync(templatePath)) {
            throw new Error('模板不存在: ' + templateId);
        }
        return JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
    }

    /**
     * 加载维度配置
     */
    loadDimension(dimensionId) {
        const dimensionsPath = path.join(this.dataDir, 'dimensions.json');
        const data = JSON.parse(fs.readFileSync(dimensionsPath, 'utf-8'));
        const dimension = data.dimensions.find(d => d.id === dimensionId);
        if (!dimension) {
            throw new Error('维度不存在: ' + dimensionId);
        }
        return dimension;
    }

    /**
     * 选择公司主题 - 智能去重
     */
    selectCompany(template) {
        // 读取公司数据
        const companiesPath = path.join(this.dataDir, 'companies.json');
        const companiesData = JSON.parse(fs.readFileSync(companiesPath, 'utf-8'));
        const allCompanies = companiesData.companies;

        // 读取生成历史
        const historyPath = path.join(this.dataDir, 'generated-history.json');
        let history = [];
        if (fs.existsSync(historyPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
                history = data.companies || [];
            } catch (error) {
                this.log('⚠️ 历史记录读取失败，重新开始');
                history = [];
            }
        }

        this.log('📊 公司池: ' + allCompanies.length + ' 家, 已生成: ' + history.length + ' 家');

        // 应用模板中的筛选条件（如果有）
        let filteredCompanies = allCompanies;
        if (template.companySelector && template.companySelector.filters) {
            const filters = template.companySelector.filters;

            // 按行业筛选
            if (filters.industry && filters.industry.length > 0) {
                filteredCompanies = filteredCompanies.filter(c =>
                    c.industry && filters.industry.includes(c.industry)
                );
                this.log('🔍 按行业筛选: ' + filters.industry.join(', '));
            }

            // 按成立时间筛选
            if (filters.founded_after) {
                filteredCompanies = filteredCompanies.filter(c =>
                    parseInt(c.founded) >= parseInt(filters.founded_after)
                );
                this.log('🔍 成立时间 >= ' + filters.founded_after);
            }

            this.log('📊 筛选后剩余: ' + filteredCompanies.length + ' 家');
        }

        // 过滤出未生成过的公司
        const availableCompanies = filteredCompanies.filter(
            company => !history.includes(company.name)
        );

        // 如果都生成过了，重置历史
        if (availableCompanies.length === 0) {
            this.log('🔄 所有公司已生成过，重置历史');
            history = [];
            fs.writeFileSync(historyPath, JSON.stringify({ companies: [] }, null, 2));
            return this.selectCompany(template);
        }

        // 随机选择
        const randomIndex = Math.floor(Math.random() * availableCompanies.length);
        const selected = availableCompanies[randomIndex];

        this.log('🎯 随机选择: ' + selected.nameZh + ' (剩余 ' + (availableCompanies.length - 1) + ' 家)');

        // 记录到历史
        history.push(selected.name);
        fs.writeFileSync(historyPath, JSON.stringify({ companies: history }, null, 2));

        return selected;
    }

    /**
     * 生成所有章节内容
     */
    async generateContent(anthropic, modelName, template, dimension, company) {
        const generatedContent = {};
        const allSubsections = [];

        // 收集所有子章节
        template.sections.forEach(section => {
            if (section.subsections) {
                section.subsections.forEach(sub => {
                    allSubsections.push({
                        id: sub.id,
                        title: sub.subtitle || sub.title,
                        contentGuide: sub.contentGuide,
                        thinkingPoints: sub.thinkingPoints
                    });
                });
            }
        });

        this.log('📝 总共需要生成 ' + allSubsections.length + ' 个子章节');

        // 逐个生成
        for (let i = 0; i < allSubsections.length; i++) {
            const subsection = allSubsections[i];
            const progress = Math.round(((i + 1) / allSubsections.length) * 100);

            this.log('⏳ [' + (i + 1) + '/' + allSubsections.length + '] 生成: ' + subsection.id + ' ' + subsection.title);
            this.onProgress({
                current: i + 1,
                total: allSubsections.length,
                progress: progress,
                subsection: subsection
            });

            try {
                // 构建提示词
                const prompt = this.buildPrompt(subsection, company, dimension);

                // 调用AI
                const message = await anthropic.messages.create({
                    model: modelName,
                    max_tokens: 8000,
                    thinking: {
                        type: "disabled",
                        budget_tokens: 0
                    },
                    system: dimension.systemPrompt,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                });

                // 打印完整响应用于调试
                this.log('🔍 API响应: ' + JSON.stringify(message).substring(0, 500));

                // 提取内容（兼容不同的响应格式）
                let content;
                if (message.content && Array.isArray(message.content) && message.content.length > 0) {
                    // DeepSeek可能返回多个content块，需要找到type为"text"的块
                    const textBlock = message.content.find(block => block.type === 'text');
                    if (textBlock && textBlock.text) {
                        content = textBlock.text;
                    } else if (textBlock) {
                        this.log('⚠️ 找到text块但没有text属性: ' + JSON.stringify(textBlock));
                    } else {
                        // 打印所有块的类型
                        const types = message.content.map(b => b.type).join(', ');
                        this.log('⚠️ 没有找到text类型的块，所有块类型: ' + types);
                        // 如果没有text类型，尝试取第一个有text属性的
                        content = message.content[0].text;
                    }
                } else if (message.content && typeof message.content === 'string') {
                    content = message.content;
                } else if (message.text) {
                    content = message.text;
                } else {
                    this.log('⚠️ 无法识别的响应格式');
                    throw new Error('无法从响应中提取文本内容');
                }

                if (!content) {
                    this.log('⚠️ content值: ' + JSON.stringify(content));
                    this.log('⚠️ 完整message.content: ' + JSON.stringify(message.content));
                    throw new Error('生成的内容为空');
                }

                generatedContent[subsection.id] = {
                    title: subsection.title,
                    content: content
                };

                // 通知前端新生成的内容
                this.onContentGenerated(subsection.id, subsection.title, content);

                this.log('✅ 完成: ' + subsection.id + ' (' + content.length + ' 字符)');

            } catch (error) {
                this.log('❌ 生成失败 ' + subsection.id + ': ' + error.message);
                throw error;
            }
        }

        return generatedContent;
    }

    /**
     * 构建AI提示词
     */
    buildPrompt(subsection, company, dimension) {
        let prompt = '请为公司 "' + company.nameZh + '" (' + company.name + ') 撰写以下章节内容：\n\n';
        prompt += '章节标题：' + subsection.title + '\n\n';

        if (subsection.contentGuide && subsection.contentGuide.length > 0) {
            prompt += '内容指南：\n';
            subsection.contentGuide.forEach(guide => {
                prompt += '- ' + guide + '\n';
            });
            prompt += '\n';
        }

        if (subsection.thinkingPoints && subsection.thinkingPoints.length > 0) {
            prompt += '思考要点：\n';
            subsection.thinkingPoints.forEach(point => {
                prompt += '- ' + point + '\n';
            });
            prompt += '\n';
        }

        prompt += '公司基本信息：\n';
        prompt += '- 中文名：' + company.nameZh + '\n';
        prompt += '- 英文名：' + company.name + '\n';
        prompt += '- 成立时间：' + company.founded + '年\n';
        prompt += '- 主要产品：' + company.mainProduct + '\n';
        if (company.description) {
            prompt += '- 简介：' + company.description + '\n';
        }
        prompt += '\n';

        prompt += '要求：\n';
        prompt += '1. 基于真实公开信息进行分析\n';
        prompt += '2. 内容专业、客观、有深度\n';
        prompt += '3. 语言流畅，逻辑清晰\n';
        prompt += '4. 每个段落3-5句话，内容充实\n';
        prompt += '5. 直接输出正文内容，不需要章节标题\n';

        return prompt;
    }

    /**
     * 生成HTML文章
     */
    generateArticle(company, content, template, dimension, summary) {
        let sectionsHtml = '';
        let currentSection = '';

        for (const [id, section] of Object.entries(content)) {
            // 检测是否是新的一级章节（如 1.x -> 2.x）
            const sectionNum = id.split('.')[0];
            if (sectionNum !== currentSection) {
                currentSection = sectionNum;
                // 查找对应的一级标题
                const mainSection = template.sections.find(s => s.id === 'section-' + sectionNum);
                if (mainSection) {
                    sectionsHtml += `
            <h1 style="font-size: 28px; color: #1a1a1a; margin-top: 50px; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 4px solid #667eea;">${mainSection.title}</h1>
                    `;
                }
            }

            // 清理内容中的markdown符号
            let cleanContent = section.content
                .replace(/^##\s+/gm, '')  // 移除markdown标题符号
                .replace(/\*\*(.*?)\*\*/g, '$1');  // 移除加粗符号

            const paragraphs = cleanContent.split('\n\n').filter(p => p.trim().length > 0);
            const paragraphsHtml = paragraphs.map(p => '<p>' + p.trim() + '</p>').join('\n                ');

            sectionsHtml += `
            <h2>${section.title}</h2>
            <div class="content-section">
                ${paragraphsHtml}
            </div>
        `;
        }

        const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${summary || ''}">
    <meta name="article-module" content="ai">
    <meta name="article-type" content="${dimension.id}">
    <meta name="article-dimension" content="${dimension.name}">
    <title>${company.nameZh}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.8;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 60px;
        }
        .header {
            text-align: center;
            margin-bottom: 50px;
            padding-bottom: 30px;
            border-bottom: 2px solid #eee;
        }
        .badge {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        h1 {
            font-size: 42px;
            color: #1a1a1a;
            margin-bottom: 15px;
            font-weight: 700;
        }
        .meta {
            color: #666;
            font-size: 15px;
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
        }
        .content { margin-top: 40px; }
        h2 {
            font-size: 24px;
            color: #2d3748;
            margin-top: 40px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }
        .content-section { margin-bottom: 30px; }
        p {
            font-size: 16px;
            line-height: 1.9;
            margin-bottom: 18px;
            text-align: justify;
            color: #444;
        }
        .success-message {
            background: #d4edda;
            border: 2px solid #28a745;
            color: #155724;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 40px;
            text-align: center;
            font-weight: 600;
        }
        .back-link {
            display: inline-block;
            margin-top: 50px;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: transform 0.2s;
        }
        .back-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- 顶部返回按钮 -->
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
            <a href="/ai-content-generator-v2.html" class="back-link" style="margin-right: 15px;">← 返回配置中心</a>
            <a href="/cognova.html" class="back-link" style="margin-right: 15px;">📰 查看所有文章</a>
            <a href="/ai-dimension.html?type=company" class="back-link">🏢 公司研究专栏</a>
        </div>

        <div class="header">
            <div class="badge">✅ AI生成成功</div>
            <h1>${company.nameZh}</h1>
            <div class="meta">
                <div>📅 成立时间: ${company.founded}年</div>
                <div>🎯 主要产品: ${company.mainProduct}</div>
                <div>🤖 生成时间: ${new Date().toLocaleString('zh-CN')}</div>
            </div>
        </div>

        <div class="success-message">
            🎉 此文章由Claude AI自动生成完成！
        </div>

        <div class="content">
            ${sectionsHtml}
        </div>

        <div style="text-align: center; margin-top: 50px;">
            <a href="/ai-content-generator-v2.html" class="back-link" style="margin-right: 15px;">← 返回配置中心</a>
            <a href="/cognova.html" class="back-link" style="margin-right: 15px;">📰 查看所有文章</a>
            <a href="/ai-dimension.html?type=company" class="back-link">🏢 公司研究专栏</a>
        </div>
    </div>
</body>
</html>`;

        // 确保输出目录存在
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        // 写入文件
        const articlePath = path.join(this.outputDir, company.name + '.html');
        fs.writeFileSync(articlePath, html, 'utf-8');

        return articlePath;
    }

    /**
     * 生成文章摘要
     */
    generateSummary(content) {
        // 提取前3个段落作为摘要
        const allText = [];
        for (const [id, section] of Object.entries(content)) {
            const cleanContent = section.content
                .replace(/^##\s+/gm, '')
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .trim();
            const paragraphs = cleanContent.split('\n\n').filter(p => p.trim().length > 0);
            allText.push(...paragraphs);
            if (allText.length >= 3) break;
        }

        // 取前3段，最多200字
        const summary = allText.slice(0, 3).join(' ').substring(0, 200);
        return summary + (summary.length >= 200 ? '...' : '');
    }

    /**
     * 日志输出
     */
    log(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.onLog('[' + timestamp + '] ' + message);
    }
}

module.exports = ContentGenerator;
