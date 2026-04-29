const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'frontend/blog');

const desktopNav = `            <div class="hidden md:flex items-center space-x-10 text-sm font-bold tracking-widest uppercase text-slate-600">
                <a href="/" class="nav-link">トップ</a>
                <a href="/services" class="nav-link">サービス</a>
                <a href="/company" class="nav-link">会社概要</a>
                <a href="/blog" class="nav-link">ニュース</a>
                <a href="/blog" class="nav-link text-coral">ブログ</a>
                <a href="/contact" class="btn-coral px-6 py-2.5 text-xs tracking-widest rounded-full font-bold">お問合せ</a>
            </div>`;

const latestArticlesBlock = `
    <!-- Latest Articles at Bottom -->
    <div class="max-w-6xl mx-auto px-6 md:px-8 py-16 border-t border-gray-100">
        <h3 class="text-2xl font-bold text-tech-blue mb-8 text-center">最新の記事</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="/blog/inbound-sns-strategy-2026" class="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-50">
                <div class="h-40 bg-slate-100 overflow-hidden">
                    <img src="../assets/images/blog-sns-strategy-2026.jpg" alt="SNS戦略2026" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                </div>
                <div class="p-6">
                    <div class="mb-3">
                        <span class="text-[10px] font-bold bg-blue-50 text-blue-500 px-2 py-1 rounded tracking-widest uppercase">マーケティング</span>
                    </div>
                    <h4 class="font-bold text-sm text-tech-blue group-hover:text-coral transition leading-snug">中国人観光客を集客するSNS戦略2026年版</h4>
                </div>
            </a>
            <a href="/blog/miniprogram-cost-period" class="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-50">
                <div class="h-40 bg-slate-100 overflow-hidden">
                    <img src="../assets/images/blog-miniprogram-cost.jpg" alt="ミニプログラム開発" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                </div>
                <div class="p-6">
                    <div class="mb-3">
                        <span class="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-1 rounded tracking-widest uppercase">開発・費用</span>
                    </div>
                    <h4 class="font-bold text-sm text-tech-blue group-hover:text-coral transition leading-snug">WeChat小程序（ミニプログラム）開発の費用と期間の目安</h4>
                </div>
            </a>
            <a href="/blog/dazhong-dianping-guide" class="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-50">
                <div class="h-40 bg-slate-100 overflow-hidden">
                    <img src="../assets/images/大衆点評×中国都市インバウンドマーケティング.jpg" alt="大衆点評ガイド" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='../assets/images/case-tourism.jpg'">
                </div>
                <div class="p-6">
                    <div class="mb-3">
                        <span class="text-[10px] font-bold bg-purple-50 text-purple-500 px-2 py-1 rounded tracking-widest uppercase">マーケティング</span>
                    </div>
                    <h4 class="font-bold text-sm text-tech-blue group-hover:text-coral transition leading-snug">大衆点評とは？簡単な使い方とインバウンド集客活用法</h4>
                </div>
            </a>
        </div>
    </div>
`;

const relatedArticlesBlock = `
                <!-- Related articles -->
                <div class="bg-white border border-gray-100 rounded-2xl p-6">
                    <h3 class="font-bold text-tech-blue text-sm mb-4 tracking-wider">関連記事</h3>
                    <div class="space-y-4">
                        <a href="/blog/inbound-xiaohongshu-2026" class="flex gap-3 group">
                            <img src="../assets/images/case-tourism.jpg" class="w-16 h-16 object-cover rounded-lg flex-shrink-0" alt="">
                            <p class="text-xs text-gray-600 group-hover:text-coral transition leading-relaxed">インバウンド集客を小紅書で加速させる方法</p>
                        </a>
                        <a href="/blog/kol-koc-guide" class="flex gap-3 group">
                            <img src="../assets/images/hero-cityscape.jpg" class="w-16 h-16 object-cover rounded-lg flex-shrink-0" alt="">
                            <p class="text-xs text-gray-600 group-hover:text-coral transition leading-relaxed">KOL・KOCマーケティング完全ガイド</p>
                        </a>
                        <a href="/blog/agency-checklist" class="flex gap-3 group">
                            <img src="../assets/images/office.jpg" class="w-16 h-16 object-cover rounded-lg flex-shrink-0" alt="">
                            <p class="text-xs text-gray-600 group-hover:text-coral transition leading-relaxed">小紅書運用代行を選ぶ際の7つのチェックポイント</p>
                        </a>
                    </div>
                </div>
`;

const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(blogDir, file), 'utf-8');
    let changed = false;

    // Fix 1: inbound-funnel-design.html - missing desktop nav links
    // The nav closes after PROTECH logo with </div></nav> without the links
    if (!content.includes('hidden md:flex')) {
        // Find the nav closing pattern where PROTECH link closes and nav div closes
        const oldNavClose = `            <a href="/" class="text-xl md:text-2xl font-bold tracking-tighter text-tech-blue z-50 relative">PROTECH</a>
        </div>
    </nav>`;
        const newNavClose = `            <a href="/" class="text-xl md:text-2xl font-bold tracking-tighter text-tech-blue z-50 relative">PROTECH</a>
${desktopNav}
            <button id="menu-btn" class="md:hidden p-2 text-tech-blue z-50 relative focus:outline-none hamburger">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <line id="line1" x1="4" y1="6" x2="20" y2="6"></line>
                    <line id="line2" x1="4" y1="12" x2="20" y2="12"></line>
                    <line id="line3" x1="4" y1="18" x2="20" y2="18"></line>
                </svg>
            </button>
        </div>
    </nav>`;
        if (content.includes(oldNavClose)) {
            content = content.replace(oldNavClose, newNavClose);
            changed = true;
            console.log(`  → Fixed desktop nav in ${file}`);
        }
    }

    // Fix 2: missing 最新の記事 block
    if (!content.includes('最新の記事')) {
        const backLinkPattern = '<!-- Back to blog -->';
        if (content.includes(backLinkPattern)) {
            content = content.replace(backLinkPattern, latestArticlesBlock + '\n    <!-- Back to blog -->');
            changed = true;
            console.log(`  → Added 最新の記事 to ${file}`);
        }
    }

    // Fix 3: missing 関連記事 in sidebar
    if (!content.includes('関連記事')) {
        const ctaPattern = '<div class="bg-tech-blue rounded-2xl p-6 text-white text-center">';
        if (content.includes(ctaPattern)) {
            content = content.replace(ctaPattern, relatedArticlesBlock + '\n                ' + ctaPattern);
            changed = true;
            console.log(`  → Added 関連記事 to ${file}`);
        }
    }

    if (changed) {
        fs.writeFileSync(path.join(blogDir, file), content, 'utf-8');
        console.log(`✅ Fixed: ${file}`);
    } else {
        console.log(`✅ OK: ${file}`);
    }
});
