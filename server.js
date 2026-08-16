const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname)));

// Generation state
let generationState = {
    isGenerating: false,
    progress: 0,
    company: null,
    currentSubsection: null,
    logs: [],
    error: null,
    result: null
};

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

// Dimensions API
app.get('/api/dimensions/list', (req, res) => {
    const dimensionsPath = path.join(__dirname, 'data', 'dimensions.json');

    if (!fs.existsSync(dimensionsPath)) {
        const defaultDimensions = {
            'company': { name: '公司与历程', icon: '🏢', description: '研究公司发展历程和核心团队' },
            'product': { name: '产品与应用', icon: '💻', description: '分析产品特性和应用场景' },
            'business': { name: '商业模式', icon: '💼', description: '探讨商业模式和盈利方式' },
            'policy': { name: '政策法规', icon: '📜', description: '关注政策影响和合规要求' },
            'industry': { name: '行业动态', icon: '🏭', description: '追踪行业趋势和竞争格局' }
        };
        return res.json({ success: true, dimensions: defaultDimensions });
    }

    try {
        const data = JSON.parse(fs.readFileSync(dimensionsPath, 'utf-8'));
        // 将数组格式转换为对象格式 { id: {name, icon, description} }
        const dimensionsObj = {};
        if (data.dimensions && Array.isArray(data.dimensions)) {
            data.dimensions.forEach(dim => {
                dimensionsObj[dim.id] = {
                    name: dim.name,
                    icon: dim.icon,
                    description: dim.description
                };
            });
        }
        res.json({ success: true, dimensions: dimensionsObj });
    } catch (error) {
        res.json({ success: false, error: '读取子模块数据失败' });
    }
});

// Templates API
app.get('/api/templates/list', (req, res) => {
    const templatesDir = path.join(__dirname, 'scripts', 'templates');

    if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
    }

    try {
        const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.json'));
        const templates = files.map(file => {
            const content = JSON.parse(fs.readFileSync(path.join(templatesDir, file), 'utf-8'));
            return {
                id: file.replace('.json', ''),
                name: content.name || content.meta?.description || file,
                current: file === 'company-article-template.json'
            };
        });

        res.json({ success: true, templates });
    } catch (error) {
        console.error('获取模板列表失败:', error);
        res.json({ success: false, error: '获取模板列表失败' });
    }
});

// Get single template
app.get('/api/templates/get/:templateId', (req, res) => {
    const { templateId } = req.params;
    const templatePath = path.join(__dirname, 'scripts', 'templates', templateId + '.json');

    if (!fs.existsSync(templatePath)) {
        return res.json({ success: false, error: '模板不存在' });
    }

    try {
        const template = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
        res.json({ success: true, template });
    } catch (error) {
        res.json({ success: false, error: '读取模板失败' });
    }
});

// Tasks API
app.get('/api/tasks/list', (req, res) => {
    const tasksPath = path.join(__dirname, 'data', 'tasks.json');

    if (!fs.existsSync(tasksPath)) {
        const defaultTasks = [{
            id: 'task-default-1',
            name: '公司与历程 - 每日更新',
            dimensionId: 'company',
            templateId: 'company-article-template',
            schedule: 'daily',
            scheduleTime: '08:00',
            model: 'haiku',
            enabled: true
        }];
        return res.json({ success: true, tasks: defaultTasks });
    }

    try {
        const data = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
        res.json({ success: true, tasks: data.tasks || [] });
    } catch (error) {
        res.json({ success: false, error: '读取任务失败' });
    }
});

// Save tasks
app.post('/api/tasks/save', (req, res) => {
    const { tasks } = req.body;
    const tasksPath = path.join(__dirname, 'data', 'tasks.json');

    try {
        const dir = path.dirname(tasksPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(tasksPath, JSON.stringify({ tasks }, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: '保存任务失败' });
    }
});

// Run/test a task
app.post('/api/tasks/run/:taskId', async (req, res) => {
    const { taskId } = req.params;
    const { apiKey, apiBaseUrl, apiModel } = req.body;

    // 🔍 调试：打印接收到的API配置
    console.log('🔍 后端接收到的API配置:', {
        apiKey: apiKey ? `${apiKey.substring(0, 8)}...${apiKey.slice(-4)}` : 'undefined',
        apiBaseUrl,
        apiModel
    });

    try {
        const tasksPath = path.join(__dirname, 'data', 'tasks.json');
        const tasksData = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
        const task = tasksData.tasks.find(t => t.id === taskId);

        if (!task) {
            return res.json({ success: false, error: '任务不存在' });
        }

        if (!apiKey) {
            return res.json({ success: false, error: 'API密钥未提供' });
        }

        // Reset generation state
        generationState = {
            isGenerating: true,
            progress: 0,
            company: null,
            currentSubsection: null,
            generatedContent: {},
            logs: [],
            error: null,
            result: null
        };

        // Add initial log
        const timestamp = new Date().toLocaleTimeString();
        generationState.logs.push('[' + timestamp + '] 任务已启动: ' + task.name);
        generationState.logs.push('[' + timestamp + '] 使用模板: ' + task.templateId);

        // Start generation in background - use real generation
        realGeneration(task, { apiKey, apiBaseUrl, apiModel });

        res.json({
            success: true,
            message: '任务已启动',
            taskId: taskId,
            taskName: task.name
        });
    } catch (error) {
        console.error('执行任务失败:', error);
        res.json({ success: false, error: '执行任务失败: ' + error.message });
    }
});

// Real generation process using unified script
async function realGeneration(task, apiConfig) {
    try {
        // Clear module cache to get latest version
        const generatorPath = path.join(__dirname, 'scripts', 'content-generator.js');
        delete require.cache[require.resolve(generatorPath)];

        // Use unified content generator script
        const ContentGenerator = require('./scripts/content-generator.js');

        const generator = new ContentGenerator({
            baseDir: __dirname,
            apiKey: apiConfig.apiKey,
            apiBaseUrl: apiConfig.apiBaseUrl,
            apiModel: apiConfig.apiModel,
            onLog: (msg) => {
                generationState.logs.push(msg);
            },
            onProgress: (info) => {
                generationState.currentSubsection = info.subsection;
                generationState.progress = info.progress;
            },
            onContentGenerated: (subsectionId, title, content) => {
                generationState.generatedContent[subsectionId] = {
                    title: title,
                    content: content
                };
            }
        });

        // Execute generation
        const result = await generator.execute(task);

        // Set company info
        generationState.company = result.company;

        // Mark as completed
        const timestamp = new Date().toLocaleTimeString();
        generationState.isGenerating = false;
        generationState.progress = 100;
        generationState.logs.push('[' + timestamp + '] 🎉 生成完成!');
        generationState.result = {
            url: result.url,
            articleId: 'ai-c-' + result.company.name
        };

    } catch (error) {
        const timestamp = new Date().toLocaleTimeString();
        generationState.isGenerating = false;
        generationState.error = error.message;
        generationState.logs.push('[' + timestamp + '] ❌ 生成失败: ' + error.message);
        console.error('生成失败:', error);
    }
}

// Generation status endpoint
app.get('/api/generation/status', (req, res) => {
    res.json(generationState);
});

// Company selection stats endpoint
app.get('/api/companies/stats', (req, res) => {
    try {
        const CompanySelector = require('./scripts/company-selector.js');
        const selector = new CompanySelector(path.join(__dirname, 'data'));
        const stats = selector.getStats();
        res.json({ success: true, stats: stats });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Reset company selection history
app.post('/api/companies/reset-history', (req, res) => {
    try {
        const CompanySelector = require('./scripts/company-selector.js');
        const selector = new CompanySelector(path.join(__dirname, 'data'));
        selector.resetHistory();
        res.json({ success: true, message: '历史记录已重置' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Get script content
app.get('/api/scripts/get/:scriptName', (req, res) => {
    const { scriptName } = req.params;
    try {
        const scriptPath = path.join(__dirname, 'scripts', scriptName + '.js');
        if (!fs.existsSync(scriptPath)) {
            return res.json({ success: false, error: '脚本文件不存在' });
        }
        const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
        res.json({ success: true, script: scriptContent });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Save script content
app.post('/api/scripts/save/:scriptName', (req, res) => {
    const { scriptName } = req.params;
    const { script } = req.body;
    try {
        const scriptPath = path.join(__dirname, 'scripts', scriptName + '.js');

        // Create backup before saving
        if (fs.existsSync(scriptPath)) {
            const backupPath = path.join(__dirname, 'scripts', scriptName + '.backup.js');
            fs.copyFileSync(scriptPath, backupPath);
        }

        fs.writeFileSync(scriptPath, script, 'utf-8');
        res.json({ success: true, message: '脚本已保存（原文件已备份为 .backup.js）' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// ========== 文章管理 API ==========

// List all articles
app.get('/api/articles/list', (req, res) => {
    try {
        const articlesFromDirs = [];

        // 扫描 articles/ 目录
        const articlesDir = path.join(__dirname, 'articles');
        if (fs.existsSync(articlesDir)) {
            const files = fs.readdirSync(articlesDir);
            files.filter(file => file.endsWith('.html')).forEach(file => {
                const filePath = path.join(articlesDir, file);
                const stats = fs.statSync(filePath);

                let title = file.replace('.html', '');
                let description = '';
                let articleModule = '';
                let articleType = '';
                let articleDimension = '';
                try {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
                    if (titleMatch) {
                        title = titleMatch[1];
                    }
                    // 提取描述
                    const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
                    if (descMatch) {
                        description = descMatch[1];
                    }
                    // 提取分类信息
                    const moduleMatch = content.match(/<meta\s+name=["']article-module["']\s+content=["'](.*?)["']/i);
                    if (moduleMatch) {
                        articleModule = moduleMatch[1];
                    }
                    const typeMatch = content.match(/<meta\s+name=["']article-type["']\s+content=["'](.*?)["']/i);
                    if (typeMatch) {
                        articleType = typeMatch[1];
                    }
                    const dimensionMatch = content.match(/<meta\s+name=["']article-dimension["']\s+content=["'](.*?)["']/i);
                    if (dimensionMatch) {
                        articleDimension = dimensionMatch[1];
                    }
                } catch (err) {
                    console.error('读取文件标题失败:', err);
                }

                articlesFromDirs.push({
                    fileName: file,
                    title: title,
                    description: description,
                    module: articleModule,
                    type: articleType,
                    dimension: articleDimension,
                    size: stats.size,
                    modified: stats.mtime,
                    created: stats.birthtime,
                    directory: 'articles'
                });
            });
        }

        // 扫描根目录下的 news-detail-*.html 文件
        const rootFiles = fs.readdirSync(__dirname);
        rootFiles.filter(file => file.startsWith('news-detail-') && file.endsWith('.html')).forEach(file => {
            const filePath = path.join(__dirname, file);

            // 跳过大小为0的文件
            const stats = fs.statSync(filePath);
            if (stats.size === 0) {
                return;
            }

            let title = file.replace('.html', '');
            let description = '';
            let articleModule = '';
            let articleType = '';
            let articleDimension = '';
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                const titleMatch = content.match(/<title>(.*?)<\/title>/i);
                if (titleMatch) {
                    title = titleMatch[1];
                }
                // 提取描述
                const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
                if (descMatch) {
                    description = descMatch[1];
                }
                // 提取分类信息
                const moduleMatch = content.match(/<meta\s+name=["']article-module["']\s+content=["'](.*?)["']/i);
                if (moduleMatch) {
                    articleModule = moduleMatch[1];
                }
                const typeMatch = content.match(/<meta\s+name=["']article-type["']\s+content=["'](.*?)["']/i);
                if (typeMatch) {
                    articleType = typeMatch[1];
                }
                const dimensionMatch = content.match(/<meta\s+name=["']article-dimension["']\s+content=["'](.*?)["']/i);
                if (dimensionMatch) {
                    articleDimension = dimensionMatch[1];
                }
            } catch (err) {
                console.error('读取文件失败:', err);
            }

            articlesFromDirs.push({
                fileName: file,
                title: title,
                description: description,
                module: articleModule,
                type: articleType,
                dimension: articleDimension,
                size: stats.size,
                modified: stats.mtime,
                created: stats.birthtime,
                directory: 'root'
            });
        });

        // Sort by modified date descending
        articlesFromDirs.sort((a, b) => b.modified - a.modified);

        res.json({ success: true, articles: articlesFromDirs });
    } catch (error) {
        console.error('列出文章失败:', error);
        res.json({ success: false, error: error.message });
    }
});

// Read article content
app.get('/api/articles/read/:fileName', (req, res) => {
    try {
        const { fileName } = req.params;

        // 先尝试 articles/ 目录
        let filePath = path.join(__dirname, 'articles', fileName);

        // 如果不存在，尝试根目录
        if (!fs.existsSync(filePath)) {
            filePath = path.join(__dirname, fileName);
        }

        if (!fs.existsSync(filePath)) {
            return res.json({ success: false, error: '文章不存在' });
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        res.json({ success: true, content: content });
    } catch (error) {
        console.error('读取文章失败:', error);
        res.json({ success: false, error: error.message });
    }
});

// Save article content
app.post('/api/articles/save', (req, res) => {
    try {
        const { fileName, content } = req.body;

        if (!fileName || !content) {
            return res.json({ success: false, error: '缺少文件名或内容' });
        }

        // 确定文件位置
        let filePath = path.join(__dirname, 'articles', fileName);
        if (!fs.existsSync(filePath)) {
            filePath = path.join(__dirname, fileName);
        }

        if (!fs.existsSync(filePath)) {
            return res.json({ success: false, error: '文章不存在' });
        }

        // Create backup before saving
        const backupDir = path.join(path.dirname(filePath), '.backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const backupPath = path.join(backupDir, `${fileName}.${timestamp}.backup`);
        fs.copyFileSync(filePath, backupPath);

        fs.writeFileSync(filePath, content, 'utf-8');
        res.json({ success: true, message: '文章已保存' });
    } catch (error) {
        console.error('保存文章失败:', error);
        res.json({ success: false, error: error.message });
    }
});

// Delete article
app.delete('/api/articles/delete/:fileName', (req, res) => {
    try {
        const { fileName } = req.params;

        // 确定文件位置
        let filePath = path.join(__dirname, 'articles', fileName);
        if (!fs.existsSync(filePath)) {
            filePath = path.join(__dirname, fileName);
        }

        if (!fs.existsSync(filePath)) {
            return res.json({ success: false, error: '文章不存在' });
        }

        // Move to trash instead of direct delete
        const trashDir = path.join(path.dirname(filePath), '.trash');
        if (!fs.existsSync(trashDir)) {
            fs.mkdirSync(trashDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const trashPath = path.join(trashDir, `${fileName}.${timestamp}.deleted`);
        fs.renameSync(filePath, trashPath);

        res.json({ success: true, message: '文章已删除（已移至 .trash 目录）' });
    } catch (error) {
        console.error('删除文章失败:', error);
        res.json({ success: false, error: error.message });
    }
});

// Get articles by module and type (for frontend pages)
app.get('/api/articles/by-category', (req, res) => {
    try {
        const { module, type } = req.query;

        const articlesFromDirs = [];

        // 扫描 articles/ 目录
        const articlesDir = path.join(__dirname, 'articles');
        if (fs.existsSync(articlesDir)) {
            const files = fs.readdirSync(articlesDir);
            files.filter(file => file.endsWith('.html')).forEach(file => {
                const filePath = path.join(articlesDir, file);
                const stats = fs.statSync(filePath);

                let title = file.replace('.html', '');
                let description = '';
                let articleModule = '';
                let articleType = '';
                let articleDimension = '';
                try {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
                    if (titleMatch) {
                        title = titleMatch[1];
                    }
                    // 提取描述
                    const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
                    if (descMatch) {
                        description = descMatch[1];
                    }
                    // 提取分类信息
                    const moduleMatch = content.match(/<meta\s+name=["']article-module["']\s+content=["'](.*?)["']/i);
                    if (moduleMatch) {
                        articleModule = moduleMatch[1];
                    }
                    const typeMatch = content.match(/<meta\s+name=["']article-type["']\s+content=["'](.*?)["']/i);
                    if (typeMatch) {
                        articleType = typeMatch[1];
                    }
                    const dimensionMatch = content.match(/<meta\s+name=["']article-dimension["']\s+content=["'](.*?)["']/i);
                    if (dimensionMatch) {
                        articleDimension = dimensionMatch[1];
                    }
                } catch (err) {
                    console.error('读取文件失败:', err);
                }

                // 根据查询参数过滤
                if (module && articleModule !== module) {
                    return;
                }
                if (type && articleType !== type) {
                    return;
                }

                articlesFromDirs.push({
                    fileName: file,
                    title: title,
                    description: description,
                    module: articleModule,
                    type: articleType,
                    dimension: articleDimension,
                    size: stats.size,
                    modified: stats.mtime,
                    created: stats.birthtime,
                    directory: 'articles'
                });
            });
        }

        // 扫描根目录下的 news-detail-*.html 文件
        const rootFiles = fs.readdirSync(__dirname);
        rootFiles.filter(file => file.startsWith('news-detail-') && file.endsWith('.html')).forEach(file => {
            const filePath = path.join(__dirname, file);

            // 跳过大小为0的文件
            const stats = fs.statSync(filePath);
            if (stats.size === 0) {
                return;
            }

            let title = file.replace('.html', '');
            let description = '';
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                const titleMatch = content.match(/<title>(.*?)<\/title>/i);
                if (titleMatch) {
                    title = titleMatch[1];
                }
                // 提取描述
                const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
                if (descMatch) {
                    description = descMatch[1];
                }
            } catch (err) {
                console.error('读取文件失败:', err);
            }

            articlesFromDirs.push({
                fileName: file,
                title: title,
                description: description,
                size: stats.size,
                modified: stats.mtime,
                created: stats.birthtime,
                directory: 'root'
            });
        });

        // 解析每篇文章的分类（只对没有分类信息的文章进行解析）
        articlesFromDirs.forEach(article => {
            // 如果文章已经有 module 和 type（从 meta 标签提取），则不覆盖
            if (!article.module || !article.type) {
                const parsed = parseArticleCategory(article.fileName);
                article.module = article.module || parsed.module;
                article.type = article.type || parsed.type;
            }
            article.id = article.fileName.replace('.html', '');
            article.date = new Date(article.modified).toLocaleString('zh-CN');
        });

        // 根据查询参数过滤
        let filtered = articlesFromDirs;
        if (module) {
            filtered = filtered.filter(a => a.module === module);
        }
        if (type) {
            filtered = filtered.filter(a => a.type === type);
        }

        // 按修改时间降序排序
        filtered.sort((a, b) => b.modified - a.modified);

        res.json({ success: true, articles: filtered });
    } catch (error) {
        console.error('获取分类文章失败:', error);
        res.json({ success: false, error: error.message });
    }
});

// 解析文章分类的辅助函数
function parseArticleCategory(fileName) {
    // 格式: news-detail-ai-c-google-deepmind-20260815.html
    // 或: ai-c-nvidia.html
    const name = fileName.replace('news-detail-', '').replace('.html', '');
    const parts = name.split('-');

    let module = 'ai'; // 默认人工智能
    let type = 'company'; // 默认公司与历程

    if (parts.length >= 2) {
        module = parts[0]; // 第一部分是模块ID

        // 类型ID映射
        const typeMap = {
            'c': 'company',
            'p': 'product',
            'b': 'business',
            'pol': 'policy',
            'i': 'impact'
        };

        type = typeMap[parts[1]] || parts[1];
    }

    return { module, type };
}

app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('智灵新知 - 内容生成服务');
    console.log('='.repeat(50));
    console.log('服务器运行在: http://localhost:' + PORT);
    console.log('配置中心: http://localhost:' + PORT + '/ai-content-generator-v2.html');
    console.log('='.repeat(50));
});
