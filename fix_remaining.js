const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'frontend/blog');

const latestArticlesHTML = `
    <!-- Latest Articles at Bottom -->
    <div class="max-w-6xl mx-auto px-6 md:px-8 py-16 border-t border-gray-100">
        <h3 class="text-2xl font-bold text-tech-blue mb-8 text-center">最新の記事</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="inbound-sns-strategy-2026.html" class="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-50">
                <div class="h-40 bg-slate-100 overflow-hidden">
                    <img src="../assets/images/blog-sns-strategy-2026.jpg" alt="SNS戦略2026" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                </div>
                <div class="p-6">
                    <div class="mb-3"><span class="text-[10px] font-bold bg-blue-50 text-blue-500 px-2 py-1 rounded tracking-widest uppercase">マーケティング</span></div>
                    <h4 class="font-bold text-sm text-tech-blue group-hover:text-coral transition leading-snug">中国人観光客を集客するSNS戦略2026年版</h4>
                </div>
            </a>
            <a href="miniprogram-cost-period.html" class="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-50">
                <div class="h-40 bg-slate-100 overflow-hidden">
                    <img src="../assets/images/blog-miniprogram-cost.jpg" alt="ミニプログラム開発" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                </div>
                <div class="p-6">
                    <div class="mb-3"><span class="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-1 rounded tracking-widest uppercase">開発・費用</span></div>
                    <h4 class="font-bold text-sm text-tech-blue group-hover:text-coral transition leading-snug">WeChat小程序（ミニプログラム）開発の費用と期間の目安</h4>
                </div>
            </a>
            <a href="dazhong-dianping-guide.html" class="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-50">
                <div class="h-40 bg-slate-100 overflow-hidden">
                    <img src="../assets/images/大衆点評×中国都市インバウンドマーケティング.jpg" alt="大衆点評ガイド" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='../assets/images/case-tourism.jpg'">
                </div>
                <div class="p-6">
                    <div class="mb-3"><span class="text-[10px] font-bold bg-purple-50 text-purple-500 px-2 py-1 rounded tracking-widest uppercase">マーケティング</span></div>
                    <h4 class="font-bold text-sm text-tech-blue group-hover:text-coral transition leading-snug">大衆点評とは？簡単な使い方とインバウンド集客活用法</h4>
                </div>
            </a>
        </div>
    </div>
`;

['agency-checklist.html', 'kol-koc-guide.html'].forEach(file => {
    let content = fs.readFileSync(path.join(blogDir, file), 'utf-8');
    
    if (!content.includes('最新の記事')) {
        // Find the footer tag and insert before it
        const footerIndex = content.indexOf('\n    <footer');
        if (footerIndex !== -1) {
            content = content.slice(0, footerIndex) + '\n' + latestArticlesHTML + content.slice(footerIndex);
            fs.writeFileSync(path.join(blogDir, file), content, 'utf-8');
            console.log('Fixed: ' + file);
        }
    } else {
        console.log('Already OK: ' + file);
    }
});
