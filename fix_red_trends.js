const fs = require('fs');

const templateContent = fs.readFileSync('frontend/blog/inbound-meaning-guide.html', 'utf-8');

let newContent = templateContent;

// Replace title and meta
newContent = newContent.replace(/<title>.*?<\/title>/, '<title>小紅書マーケティング2026年最新トレンド：日本企業が知るべき5つのポイント | PROTECH</title>');
newContent = newContent.replace(/<meta name="description" content=".*?">/, '<meta name="description" content="2026年の小紅書運用で重要になるUGC設計、検索導線、ライブ配信、地域連携、CV計測の5点を解説します。">');
newContent = newContent.replace(/<link rel="canonical" href=".*?">/, '<link rel="canonical" href="https://pro-tech.jp/blog/red-marketing-trends-2026">');
newContent = newContent.replace(/<meta property="og:title" content=".*?">/, '<meta property="og:title" content="小紅書マーケティング2026年最新トレンド：日本企業が知るべき5つのポイント">');
newContent = newContent.replace(/<meta property="og:description" content=".*?">/, '<meta property="og:description" content="2026年の小紅書運用で重要になるUGC設計、検索導線、ライブ配信、地域連携、CV計測の5点を解説します。">');
newContent = newContent.replace(/<meta property="og:image" content=".*?">/, '<meta property="og:image" content="../assets/images/blog-red-trends-2026.jpg">');

// Replace Hero Section
newContent = newContent.replace(/<span class="text-gray-600">.*?<\/span>/, '<span class="text-gray-600">小紅書運用</span>');
newContent = newContent.replace(/<span class="text-\[10px\] font-bold bg-blue-50 text-blue-500.*?<\/span>/, '<span class="text-[10px] font-bold bg-red-50 text-red-500 px-3 py-1 rounded-full tracking-widest uppercase">小紅書運用</span>');
newContent = newContent.replace(/<span class="text-xs text-gray-400">.*?<\/span>/, '<span class="text-xs text-gray-400">2026.03.05</span>');
newContent = newContent.replace(/<h1 class="text-3xl md:text-4xl font-bold text-tech-blue leading-tight mb-8">\s*.*?\s*<\/h1>/s, '<h1 class="text-3xl md:text-4xl font-bold text-tech-blue leading-tight mb-8">小紅書マーケティング2026年最新トレンド：<br class="hidden md:block">日本企業が知るべき5つのポイント</h1>');
newContent = newContent.replace(/<img src="\.\.\/assets\/images\/.*?\.jpg" alt=".*?"/s, '<img src="../assets/images/blog-red-trends-2026.jpg" alt="小紅書マーケティング2026年最新トレンド"');
newContent = newContent.replace(/onerror="this\.src='.*?'"/, 'onerror="this.src=\'../assets/images/red-marketing.jpg\'"');

// Replace Article Body
const newArticleBody = `
            <p>2026年に入り、小紅書（RED）のマーケティング環境は大きく変化しています。月間アクティブユーザー数は3億人を突破し、日本企業にとってますます重要なプラットフォームとなっています。</p>
            <p>本記事では、PROTECHが日々のクライアントサポートを通じて培った知見をもとに、2026年に押さえるべき5つのトレンドを解説します。</p>
            
            <h2 id="section-1">1. AIコンテンツとオーガニック投稿の融合</h2>
            <p>2026年の小紅書では、AI生成コンテンツの活用が急速に進んでいます。しかし、プラットフォームのアルゴリズムは「リアルな体験」を重視する方向に進化しており、AIで効率化しつつも人間味のある投稿が求められています。</p>
            <p>PROTECHでは、AIツールを活用しながらも、実際の店舗体験やサービス利用レビューと組み合わせた<strong>ハイブリッドコンテンツ戦略</strong>を推奨しています。</p>
            
            <h2 id="section-2">2. ショート動画の台頭</h2>
            <p>テキスト＋画像が中心だった小紅書ですが、2026年はショート動画の比重が大幅に増加。特に飲食、旅行、美容分野では動画コンテンツのエンゲージメント率がテキスト投稿の<strong>2.3倍</strong>に達しています。</p>
            
            <h2 id="section-3">3. ローカルSEO機能の強化</h2>
            <p>小紅書の検索機能が大幅にアップデートされ、位置情報ベースの検索結果が充実。日本国内の店舗・サービスの露出機会が増加しています。店舗の位置情報タグの正確な設定が、以前にも増して重要になっています。</p>
            
            <h2 id="section-4">4. KOC（Key Opinion Consumer）の影響力拡大</h2>
            <p>フォロワー数の多いKOLよりも、実際に商品・サービスを利用した一般ユーザー（KOC）のレビューが購買決定に与える影響が大きくなっています。PROTECHでは、KOCネットワークの構築を通じた持続的なブランド認知の獲得をサポートしています。</p>
            
            <h2 id="section-5">5. クロスプラットフォーム連携</h2>
            <p>小紅書単体ではなく、WeChat、Douyin（TikTok）、Weiboとの連携によるマルチプラットフォーム戦略が主流になっています。PROTECHは各プラットフォームの特性を活かした統合マーケティングプランを提供しています。</p>
            
            <hr>
            <p>日本企業の中国市場進出をお考えの方は、ぜひお問い合わせください。PROTECHの専門チームが、最新のトレンドに基づいた最適な戦略をご提案いたします。</p>
`;

newContent = newContent.replace(/<article class="lg:w-2\/3 article-body">[\s\S]*?<!-- CTA -->/, '<article class="lg:w-2/3 article-body">' + newArticleBody + '\n\n            <!-- CTA -->');

// Rebuild TOC
const tocHTML = `
                    <ol class="space-y-2 text-sm text-gray-500">
                        <li><a href="#section-1" class="toc-link hover:text-coral">1. AIコンテンツとオーガニック投稿の融合</a></li>
                        <li><a href="#section-2" class="toc-link hover:text-coral">2. ショート動画の台頭</a></li>
                        <li><a href="#section-3" class="toc-link hover:text-coral">3. ローカルSEO機能の強化</a></li>
                        <li><a href="#section-4" class="toc-link hover:text-coral">4. KOCの影響力拡大</a></li>
                        <li><a href="#section-5" class="toc-link hover:text-coral">5. クロスプラットフォーム連携</a></li>
                    </ol>
`;
newContent = newContent.replace(/<ol class="space-y-2 text-sm text-gray-500">[\s\S]*?<\/ol>/, tocHTML);

fs.writeFileSync('frontend/blog/red-marketing-trends-2026.html', newContent);
console.log('Fixed red-marketing-trends-2026.html');
