const cron = require('node-cron');
const { main } = require('./auto-update-ai-news');

console.log('🚀 智灵湖AI新闻自动更新服务已启动');
console.log('⏰ 每天早上8点自动更新');

// 每天早上8点执行
// cron格式: 分 时 日 月 星期
// 0 8 * * * 表示每天8:00
cron.schedule('0 8 * * *', async () => {
    console.log('\n⏰ 定时任务触发 - ' + new Date().toLocaleString('zh-CN'));
    try {
        await main();
    } catch (error) {
        console.error('❌ 更新失败:', error);
    }
}, {
    timezone: "Asia/Shanghai"
});

// 立即执行一次（测试用）
// 如果不需要立即执行，可以注释掉下面这行
console.log('\n🧪 执行测试运行...\n');
main().catch(console.error);

// 保持进程运行
process.on('SIGINT', () => {
    console.log('\n👋 服务已停止');
    process.exit();
});

console.log('\n✅ 服务正在运行中，按 Ctrl+C 停止');
