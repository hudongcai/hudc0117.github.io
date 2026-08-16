/**
 * 公司主题选择器
 * 功能：智能选择生成主题，避免重复
 */

const fs = require('fs');
const path = require('path');

class CompanySelector {
    constructor(dataDir) {
        this.dataDir = dataDir;
        this.companiesPath = path.join(dataDir, 'companies.json');
        this.historyPath = path.join(dataDir, 'generated-history.json');
    }

    /**
     * 加载公司列表
     */
    loadCompanies() {
        if (!fs.existsSync(this.companiesPath)) {
            throw new Error('公司数据文件不存在: ' + this.companiesPath);
        }
        const data = JSON.parse(fs.readFileSync(this.companiesPath, 'utf-8'));
        return data.companies || [];
    }

    /**
     * 加载生成历史
     */
    loadHistory() {
        if (!fs.existsSync(this.historyPath)) {
            return [];
        }
        try {
            const data = JSON.parse(fs.readFileSync(this.historyPath, 'utf-8'));
            return data.companies || [];
        } catch (error) {
            console.error('加载历史记录失败:', error);
            return [];
        }
    }

    /**
     * 保存生成历史
     */
    saveHistory(history) {
        try {
            fs.writeFileSync(this.historyPath, JSON.stringify({ companies: history }, null, 2));
        } catch (error) {
            console.error('保存历史记录失败:', error);
        }
    }

    /**
     * 选择一个未重复的公司
     * @param {Object} options - 选项
     * @param {Function} options.onLog - 日志回调函数
     * @returns {Object} 选中的公司对象
     */
    selectUnique(options = {}) {
        const { onLog } = options;
        const log = onLog || ((msg) => console.log(msg));

        // 加载数据
        const allCompanies = this.loadCompanies();
        const history = this.loadHistory();

        log('📋 公司总数: ' + allCompanies.length + ', 已生成: ' + history.length);

        // 过滤出未生成过的公司
        const availableCompanies = allCompanies.filter(
            company => !history.includes(company.name)
        );

        // 如果所有公司都生成过，重置历史
        if (availableCompanies.length === 0) {
            log('🔄 所有公司已生成过，重置历史记录');
            this.saveHistory([]);
            return this.selectUnique(options);
        }

        // 随机选择一个
        const randomIndex = Math.floor(Math.random() * availableCompanies.length);
        const selected = availableCompanies[randomIndex];

        log('✅ 选择主题公司: ' + selected.nameZh + ' (剩余可选: ' + (availableCompanies.length - 1) + ')');

        // 添加到历史
        history.push(selected.name);
        this.saveHistory(history);

        return selected;
    }

    /**
     * 重置历史记录
     */
    resetHistory() {
        this.saveHistory([]);
        console.log('历史记录已重置');
    }

    /**
     * 获取统计信息
     */
    getStats() {
        const allCompanies = this.loadCompanies();
        const history = this.loadHistory();
        return {
            total: allCompanies.length,
            generated: history.length,
            remaining: allCompanies.length - history.length,
            history: history
        };
    }
}

module.exports = CompanySelector;
