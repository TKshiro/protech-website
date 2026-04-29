const fs = require('fs');
const path = require('path');

const targetBlog = path.join(__dirname, '../frontend/blog/inbound-data-ai-dx-2026.html');
let content = fs.readFileSync(targetBlog, 'utf8');

// 1. Fix Layout of inbound-data-ai-dx-2026.html
const heroStart = content.indexOf('<main class="pt-24 pb-20">');
const heroEnd = content.indexOf('</header>') + '</header>'.length;

if (heroStart !== -1 && heroEnd !== -1) {
    const mainToHeader = content.substring(heroStart, heroEnd);
    
    const newHero = `
    <!-- ARTICLE HERO -->
    <div class="pt-24 md:pt-32 pb-0 bg-gradient-to-b from-slate-50 to-white">
        <div class="max-w-3xl mx-auto px-6 md:px-8">
            <!-- Breadcrumb -->
            <nav class="text-xs text-gray-400 mb-6 flex items-center gap-2" data-aos="fade-up">
                <a href="../index.html" class="hover:text-coral transition">トップ</a>
                <span>›</span>
                <a href="../blog.html" class="hover:text-coral transition">ブログ</a>
                <span>›</span>
                <span class="text-gray-600">データとAIで勝つインバウンド集客</span>
            </nav>

            <!-- Category + Date -->
            <div class="flex items-center gap-3 mb-5" data-aos="fade-up">
                <span class="text-[10px] font-bold bg-coral/10 text-coral px-3 py-1 rounded-full tracking-widest uppercase">DX・AI</span>
                <span class="text-xs text-gray-400">2026.04.29</span>
            </div>

            <!-- Title -->
            <h1 class="text-3xl md:text-4xl font-bold text-tech-blue leading-tight mb-8" data-aos="fade-up">
                【2026年最新】データとAIで勝つインバウンド集客：「量から質」への転換とDX戦略の正解
            </h1>

            <!-- Hero image -->
            <div class="rounded-2xl overflow-hidden shadow-xl mb-0" data-aos="zoom-in">
                <img src="../assets/images/inbound-data-ai-hero.jpeg" alt="データとAIで勝つインバウンド集客" class="w-full h-64 md:h-96 object-cover">
            </div>
        </div>
    </div>

    <!-- ARTICLE LAYOUT: content + sidebar -->
    <div class="max-w-6xl mx-auto px-6 md:px-8 py-16 flex flex-col lg:flex-row gap-16">`;

    content = content.replace(mainToHeader, newHero);
    
    // Fix layout closing tags
    content = content.replace('<div class="flex flex-col lg:flex-row gap-10">', '');
    content = content.replace('</article>\n    </main>', '</article>\n    </div>');
    
    // Re-adjust article classes
    content = content.replace('<article class="lg:w-2/3 article-body">', '<article class="lg:w-2/3 article-body" data-aos="fade-up">');
    
    // Change この記事を書いた人 to 編集者
    content = content.replace('この記事を書いた人', '編集者');
    
    fs.writeFileSync(targetBlog, content);
    console.log("Fixed layout for inbound-data-ai-dx-2026.html");
}

// 2. Add Author Module to all other blog posts
const authorModule = `
                <!-- Author/Company -->
                <div class="bg-slate-50 rounded-xl p-6 mb-6 border border-gray-100">
                    <h3 class="font-bold text-tech-blue mb-4 pb-2 border-b border-gray-200">編集者</h3>
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-12 h-12 rounded-full bg-tech-blue flex items-center justify-center text-white font-bold">
                            PR
                        </div>
                        <div>
                            <p class="font-bold text-sm">PROTECH 編集部</p>
                            <p class="text-xs text-gray-500">インバウンド・DX専門チーム</p>
                        </div>
                    </div>
                    <p class="text-xs text-gray-600">中国をはじめとするアジア市場や、欧米市場向けのインバウンドマーケティングをワンストップで支援。テクノロジーと独自のデータを活用し、数多くの企業の海外進出を成功に導いています。</p>
                </div>`;

const blogDir = path.join(__dirname, '../frontend/blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));

for (const file of files) {
    if (file === 'inbound-data-ai-dx-2026.html') continue;
    
    const filePath = path.join(blogDir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Only inject if it doesn't already have it
    if (!html.includes('PROTECH 編集部')) {
        // Inject right before the TOC or at the top of the sidebar
        const tocIndex = html.indexOf('<div class="sticky top-28 space-y-6">');
        if (tocIndex !== -1) {
            const injectPoint = tocIndex + '<div class="sticky top-28 space-y-6">\n'.length;
            html = html.slice(0, injectPoint) + authorModule + '\n' + html.slice(injectPoint);
            fs.writeFileSync(filePath, html);
            console.log(`Injected author module to ${file}`);
        }
    }
}
