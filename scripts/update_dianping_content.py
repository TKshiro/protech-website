import os

file_path = 'frontend/dianping.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Hero Section
old_hero = """                    <h1
                        class="text-4xl md:text-5xl lg:text-6xl font-black text-tech-blue mb-6 leading-[1.1] tracking-tight">
                        中国<span class="text-[#FF6600]">2.6億</span>ユーザーの心を掴む<span class="text-[#FF6600]">。</span>
                    </h1>

                    <p class="text-gray-500 text-sm md:text-base max-w-lg mb-10 leading-relaxed font-light">
                        中国最大の口コミアプリと呼ばれる「大衆点評(Dianping)」を活用し、<br class="hidden md:block">
                        日本企業の中国市場進出をアカウント開設から<br class="hidden md:block">
                        KOL施策までワンストップで支援します。
                    </p>"""
new_hero = """                    <h1
                        class="text-4xl md:text-5xl lg:text-6xl font-black text-tech-blue mb-6 leading-[1.1] tracking-tight">
                        訪日中国人の<span class="text-[#FF6600]">約8割</span>が利用。<br>インバウンド集客の要<span class="text-[#FF6600]">。</span>
                    </h1>

                    <p class="text-gray-500 text-sm md:text-base max-w-lg mb-10 leading-relaxed font-light">
                        中国最大の口コミ・ナビゲーションアプリ「大衆点評(Dianping)」。<br class="hidden md:block">
                        店舗の公式登録からクーポン配信、口コミ管理まで、<br class="hidden md:block">
                        訪日旅行者の確実な来店を強力に後押しします。
                    </p>"""
content = content.replace(old_hero, new_hero)

# 2. Stats Grid
old_stats = """                <div class="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-50">
                    <div class="counter-value text-4xl md:text-5xl font-black inter mb-2">2.6億+</div>
                    <p class="text-xs text-gray-400 tracking-wider">月間アクティブユーザー</p>
                </div>
                <div class="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-50">
                    <div class="counter-value text-4xl md:text-5xl font-black inter mb-2">70%</div>
                    <p class="text-xs text-gray-400 tracking-wider">訪日中国人の利用率</p>
                </div>
                <div class="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-50">
                    <div class="counter-value text-4xl md:text-5xl font-black inter mb-2">54万+</div>
                    <p class="text-xs text-gray-400 tracking-wider">月間「日本旅行」検索数</p>
                </div>
                <div class="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-50">
                    <div class="counter-value text-4xl md:text-5xl font-black inter mb-2">1兆円</div>
                    <p class="text-xs text-gray-400 tracking-wider">年間取引総額(GMV)</p>
                </div>"""
new_stats = """                <div class="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-50">
                    <div class="counter-value text-4xl md:text-5xl font-black inter mb-2">7億+</div>
                    <p class="text-xs text-gray-400 tracking-wider">累計登録ユーザー数</p>
                </div>
                <div class="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-50">
                    <div class="counter-value text-4xl md:text-5xl font-black inter mb-2">80%</div>
                    <p class="text-xs text-gray-400 tracking-wider">訪日中国人の利用率</p>
                </div>
                <div class="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-50">
                    <div class="counter-value text-3xl md:text-4xl font-black inter mb-2 mt-2">No.1</div>
                    <p class="text-xs text-gray-400 tracking-wider mt-3">中国最大の口コミアプリ</p>
                </div>
                <div class="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-50">
                    <div class="counter-value text-3xl md:text-4xl font-black inter mb-2 mt-2">直結</div>
                    <p class="text-xs text-gray-400 tracking-wider mt-3">実店舗への来店・売上</p>
                </div>"""
content = content.replace(old_stats, new_stats)

# 3. Merits
old_merits = """                    <h3 class="font-bold text-lg text-tech-blue mb-3">アプリ内で予約が完結</h3>
                    <p class="text-sm text-gray-400 leading-relaxed">
                        予約リンクを投稿に直接埋め込み可能。外部サイトへの離脱を防ぎ、「見つけた瞬間に予約」を実現します。
                    </p>
                </div>
                <div class="bg-white p-10 rounded-2xl shadow-sm border border-gray-50">
                    <div
                        class="w-12 h-12 bg-[#FF6600]/10 rounded-xl flex items-center justify-center text-[#FF6600] text-xl font-black mb-6">
                        02</div>
                    <h3 class="font-bold text-lg text-tech-blue mb-3">検索×共感の独自エコシステム</h3>
                    <p class="text-sm text-gray-400 leading-relaxed">
                        ユーザーの検索行動とUGC（口コミ）が融合。信頼性の高い情報が自然に拡散され、購買意欲を高めます。
                    </p>
                </div>
                <div class="bg-white p-10 rounded-2xl shadow-sm border border-gray-50">
                    <div
                        class="w-12 h-12 bg-[#FF6600]/10 rounded-xl flex items-center justify-center text-[#FF6600] text-xl font-black mb-6">
                        03</div>
                    <h3 class="font-bold text-lg text-tech-blue mb-3">グローバルに拡大中</h3>
                    <p class="text-sm text-gray-400 leading-relaxed">
                        中国本土だけでなく、台湾・香港・シンガポール・東南アジアの若年層にも急速に普及。今が参入の好機です。
                    </p>"""
new_merits = """                    <h3 class="font-bold text-lg text-tech-blue mb-3">旅マエから旅ナカまでカバー</h3>
                    <p class="text-sm text-gray-400 leading-relaxed">
                        訪日前の情報収集から、日本滞在中の現在地周辺検索・ナビゲーションまで、旅行者のすべての行動シーンに密着します。
                    </p>
                </div>
                <div class="bg-white p-10 rounded-2xl shadow-sm border border-gray-50">
                    <div
                        class="w-12 h-12 bg-[#FF6600]/10 rounded-xl flex items-center justify-center text-[#FF6600] text-xl font-black mb-6">
                        02</div>
                    <h3 class="font-bold text-lg text-tech-blue mb-3">強力なUGC（口コミ）とランキング</h3>
                    <p class="text-sm text-gray-400 leading-relaxed">
                        リアルな口コミ評価とエリア別の店舗ランキングが、新規顧客の来店決定を大きく左右する「中国版食べログ・Googleマップ」です。
                    </p>
                </div>
                <div class="bg-white p-10 rounded-2xl shadow-sm border border-gray-50">
                    <div
                        class="w-12 h-12 bg-[#FF6600]/10 rounded-xl flex items-center justify-center text-[#FF6600] text-xl font-black mb-6">
                        03</div>
                    <h3 class="font-bold text-lg text-tech-blue mb-3">予約と決済のシームレスな統合</h3>
                    <p class="text-sm text-gray-400 leading-relaxed">
                        割引クーポン（団購）の購入や店舗の予約がアプリ内で完結。外部サイトへの離脱を防ぎ、確実な来店に繋げます。
                    </p>"""
content = content.replace(old_merits, new_merits)

# 4. Pain points
old_pains = """                        <h4 class="text-tech-blue font-bold mb-2">中国市場に進出したいが方法がわからない</h4>
                        <p class="text-gray-400 text-sm leading-relaxed">言語の壁、文化の違い、プラットフォームの仕組み…何から始めればいいか見当がつかない。</p>
                    </div>
                </div>
                <div class="flex items-start gap-5 bg-warm-gray rounded-2xl p-8">
                    <div class="pain-icon w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span class="text-[#FF6600] text-xl">✕</span>
                    </div>
                    <div>
                        <h4 class="text-tech-blue font-bold mb-2">大衆点評のアカウント開設が複雑すぎる</h4>
                        <p class="text-gray-400 text-sm leading-relaxed">申請・審査プロセスが複雑で、自社だけでの対応が困難。正規ルートでの開設方法がわからない。
                        </p>
                    </div>
                </div>
                <div class="flex items-start gap-5 bg-warm-gray rounded-2xl p-8">
                    <div class="pain-icon w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span class="text-[#FF6600] text-xl">✕</span>
                    </div>
                    <div>
                        <h4 class="text-tech-blue font-bold mb-2">中国語でのコンテンツ制作ができない</h4>
                        <p class="text-gray-400 text-sm leading-relaxed">翻訳するだけでは現地ユーザーに響かない。中国のトレンドを押さえた発信が必要。</p>
                    </div>
                </div>
                <div class="flex items-start gap-5 bg-warm-gray rounded-2xl p-8">
                    <div class="pain-icon w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span class="text-[#FF6600] text-xl">✕</span>
                    </div>
                    <div>
                        <h4 class="text-tech-blue font-bold mb-2">限られた予算で成果を出したい</h4>
                        <p class="text-gray-400 text-sm leading-relaxed">認知拡大も集客もしたいが、広告費が限られている。効率的な運用戦略が見つからない。</p>"""
new_pains = """                        <h4 class="text-tech-blue font-bold mb-2">インバウンド客を取り込みたいが方法がわからない</h4>
                        <p class="text-gray-400 text-sm leading-relaxed">言語の壁やツールの違いがあり、中国人観光客向けに効果的なPRをする方法が見当がつかない。</p>
                    </div>
                </div>
                <div class="flex items-start gap-5 bg-warm-gray rounded-2xl p-8">
                    <div class="pain-icon w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span class="text-[#FF6600] text-xl">✕</span>
                    </div>
                    <div>
                        <h4 class="text-tech-blue font-bold mb-2">大衆点評の店舗登録・認証手続きが複雑で進まない</h4>
                        <p class="text-gray-400 text-sm leading-relaxed">日本の営業許可証の翻訳や中国の電話番号認証など、手続きのハードルが高く、自社だけでの対応が困難。
                        </p>
                    </div>
                </div>
                <div class="flex items-start gap-5 bg-warm-gray rounded-2xl p-8">
                    <div class="pain-icon w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span class="text-[#FF6600] text-xl">✕</span>
                    </div>
                    <div>
                        <h4 class="text-tech-blue font-bold mb-2">登録はしたが、口コミが集まらずランキングが上がらない</h4>
                        <p class="text-gray-400 text-sm leading-relaxed">ページは作ったものの、放置状態。ユーザーの目を引く魅力的なページ作りや口コミを増やす仕組みがわからない。</p>
                    </div>
                </div>
                <div class="flex items-start gap-5 bg-warm-gray rounded-2xl p-8">
                    <div class="pain-icon w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span class="text-[#FF6600] text-xl">✕</span>
                    </div>
                    <div>
                        <h4 class="text-tech-blue font-bold mb-2">中国語でのメニュー作成やクーポン設定に対応できない</h4>
                        <p class="text-gray-400 text-sm leading-relaxed">現地のトレンドに合わせた魅力的なセットメニューの企画や、効果的な割引クーポンの設定方法がわからない。</p>"""
content = content.replace(old_pains, new_pains)

# 5. Services
old_services = """                    <h3 class="text-tech-blue font-bold text-lg mb-3">アカウント開設<br>サポート</h3>
                    <p class="text-gray-400 text-sm leading-relaxed">
                        大衆点評公式の正規ルートを通じた企業アカウント開設。複雑な審査プロセスも完全代行します。
                    </p>
                </div>
                <div class="service-card rounded-2xl p-8 group" data-aos="fade-up" data-aos-delay="50">
                    <h3 class="text-tech-blue font-bold text-lg mb-3">戦略設計・<br>コンテンツ企画</h3>
                    <p class="text-gray-400 text-sm leading-relaxed">
                        中国トレンド分析に基づく戦略立案。ターゲットに刺さるコンテンツプランを設計します。
                    </p>
                </div>
                <div class="service-card rounded-2xl p-8 group" data-aos="fade-up" data-aos-delay="100">
                    <h3 class="text-tech-blue font-bold text-lg mb-3">投稿運用・<br>クリエイティブ制作</h3>
                    <p class="text-gray-400 text-sm leading-relaxed">
                        ネイティブスタッフが現地ユーザーに共感される投稿を作成。定期投稿で継続的な認知拡大。
                    </p>
                </div>
                <div class="service-card rounded-2xl p-8 group" data-aos="fade-up" data-aos-delay="150">
                    <h3 class="text-tech-blue font-bold text-lg mb-3">広告運用・<br>プロモーション</h3>
                    <p class="text-gray-400 text-sm leading-relaxed">
                        オーガニック投稿と有料広告を組み合わせ、集客効果を最大化。ROIを意識した運用を行います。
                    </p>
                </div>
                <div class="service-card rounded-2xl p-8 group" data-aos="fade-up" data-aos-delay="200">
                    <h3 class="text-tech-blue font-bold text-lg mb-3">KOL/KOC<br>インフルエンサー施策</h3>
                    <p class="text-gray-400 text-sm leading-relaxed">
                        影響力のあるインフルエンサーと連携し、ブランドの認知拡大とコンバージョン向上を実現。
                    </p>
                </div>
                <div class="service-card rounded-2xl p-8 group" data-aos="fade-up" data-aos-delay="250">
                    <h3 class="text-tech-blue font-bold text-lg mb-3">データ分析・<br>PDCA改善</h3>
                    <p class="text-gray-400 text-sm leading-relaxed">
                        エンゲージメント分析をもとにコンテンツを継続改善。データドリブンな運用で成果を最大化。
                    </p>"""
new_services = """                    <h3 class="text-tech-blue font-bold text-lg mb-3">公式店舗登録・<br>認証サポート</h3>
                    <p class="text-gray-400 text-sm leading-relaxed">
                        大衆点評の公式ルートを通じた店舗登録・V認証（公式認証）を完全代行。複雑な手続きをスムーズに完了させます。
                    </p>
                </div>
                <div class="service-card rounded-2xl p-8 group" data-aos="fade-up" data-aos-delay="50">
                    <h3 class="text-tech-blue font-bold text-lg mb-3">店舗ページ最適化・<br>翻訳</h3>
                    <p class="text-gray-400 text-sm leading-relaxed">
                        魅力的な店舗写真の選定、中国語でのメニュー翻訳・詳細情報の設定など、集客力のある公式ページを構築します。
                    </p>
                </div>
                <div class="service-card rounded-2xl p-8 group" data-aos="fade-up" data-aos-delay="100">
                    <h3 class="text-tech-blue font-bold text-lg mb-3">クーポン・<br>予約機能の運用</h3>
                    <p class="text-gray-400 text-sm leading-relaxed">
                        来店を促す魅力的なクーポン（団購）パッケージの企画・設定や、アプリ内予約機能の導入・管理をサポートします。
                    </p>
                </div>
                <div class="service-card rounded-2xl p-8 group" data-aos="fade-up" data-aos-delay="150">
                    <h3 class="text-tech-blue font-bold text-lg mb-3">口コミ（UGC）<br>促進・管理施策</h3>
                    <p class="text-gray-400 text-sm leading-relaxed">
                        来店客に口コミ投稿を促すPOPの作成や、投稿された口コミへの返信対応など、評価向上に向けた管理を行います。
                    </p>
                </div>
                <div class="service-card rounded-2xl p-8 group" data-aos="fade-up" data-aos-delay="200">
                    <h3 class="text-tech-blue font-bold text-lg mb-3">公式広告（CPC/CPM）<br>運用代行</h3>
                    <p class="text-gray-400 text-sm leading-relaxed">
                        商圏内のターゲットユーザーにピンポイントで広告を配信。露出を最大化し、効率的に店舗へ誘導します。
                    </p>
                </div>
                <div class="service-card rounded-2xl p-8 group" data-aos="fade-up" data-aos-delay="250">
                    <h3 class="text-tech-blue font-bold text-lg mb-3">データ分析・<br>競合調査</h3>
                    <p class="text-gray-400 text-sm leading-relaxed">
                        閲覧数やクーポン購入数などのデータを分析。周辺の競合店舗の動向も踏まえ、継続的な改善提案を行います。
                    </p>"""
content = content.replace(old_services, new_services)

# 6. Strengths
old_strengths = """                    <h3 class="font-bold text-xl text-tech-blue mb-4">中国ネイティブの<br>スペシャリストが在籍</h3>
                    <p class="text-sm text-gray-400 leading-relaxed">
                        日本語・中国語のバイリンガルスタッフが在籍。現地で共感・拡散される投稿を設計し、文化の壁を超えた最適な発信を実現します。
                    </p>
                </div>
                <div class="strength-card rounded-2xl p-10 border border-gray-100" data-aos="fade-up"
                    data-aos-delay="100">
                    <div class="strength-number text-6xl font-black inter mb-6">02</div>
                    <h3 class="font-bold text-xl text-tech-blue mb-4">テクノロジー × マーケティングの<br>融合アプローチ</h3>
                    <p class="text-sm text-gray-400 leading-relaxed">
                        PROTECHはIT企業でもあります。データ分析・自動化ツール・Web技術を駆使し、他社にはない精度の高いマーケティング運用を提供します。
                    </p>
                </div>
                <div class="strength-card rounded-2xl p-10 border border-gray-100" data-aos="fade-up"
                    data-aos-delay="200">
                    <div class="strength-number text-6xl font-black inter mb-6">03</div>
                    <h3 class="font-bold text-xl text-tech-blue mb-4">戦略立案から実行まで<br>ワンストップ対応</h3>
                    <p class="text-sm text-gray-400 leading-relaxed">
                        アカウント開設・コンテンツ制作・広告運用・KOL連携・データ分析まで。複数の外注先を使い分ける必要はありません。
                    </p>
                </div>
                <div class="strength-card rounded-2xl p-10 border border-gray-100" data-aos="fade-up"
                    data-aos-delay="300">
                    <div class="strength-number text-6xl font-black inter mb-6">04</div>
                    <h3 class="font-bold text-xl text-tech-blue mb-4">中国トレンドに基づく<br>戦略的コンテンツ設計</h3>
                    <p class="text-sm text-gray-400 leading-relaxed">
                        検索ボリューム分析・トレンドウォッチ・競合分析に基づき、データドリブンな戦略でコンテンツを設計。感覚ではなくファクトで勝負します。
                    </p>"""
new_strengths = """                    <h3 class="font-bold text-xl text-tech-blue mb-4">大衆点評のアルゴリズムを<br>熟知した専門チーム</h3>
                    <p class="text-sm text-gray-400 leading-relaxed">
                        ランキングの決定要因やユーザーの検索傾向など、大衆点評独自のロジックを深く理解したスタッフが運用を担当し、確実な上位表示を目指します。
                    </p>
                </div>
                <div class="strength-card rounded-2xl p-10 border border-gray-100" data-aos="fade-up"
                    data-aos-delay="100">
                    <div class="strength-number text-6xl font-black inter mb-6">02</div>
                    <h3 class="font-bold text-xl text-tech-blue mb-4">インバウンド・実店舗集客に<br>特化したノウハウ</h3>
                    <p class="text-sm text-gray-400 leading-relaxed">
                        飲食店、美容院、小売店、観光施設など、実店舗へのインバウンド送客実績が豊富。業界ごとの勝ちパターンを適用し、最短距離で成果を出します。
                    </p>
                </div>
                <div class="strength-card rounded-2xl p-10 border border-gray-100" data-aos="fade-up"
                    data-aos-delay="200">
                    <div class="strength-number text-6xl font-black inter mb-6">03</div>
                    <h3 class="font-bold text-xl text-tech-blue mb-4">登録から継続的な運用まで<br>ワンストップ対応</h3>
                    <p class="text-sm text-gray-400 leading-relaxed">
                        初期のページ作成・認証手続きだけでなく、日々の口コミ管理や季節に応じたクーポン企画など、長期的な運用パートナーとして伴走します。
                    </p>
                </div>
                <div class="strength-card rounded-2xl p-10 border border-gray-100" data-aos="fade-up"
                    data-aos-delay="300">
                    <div class="strength-number text-6xl font-black inter mb-6">04</div>
                    <h3 class="font-bold text-xl text-tech-blue mb-4">多プラットフォームとの<br>連携による相乗効果</h3>
                    <p class="text-sm text-gray-400 leading-relaxed">
                        大衆点評単体での運用にとどまらず、小紅書（RED）やWeChatなどを組み合わせた総合的なインバウンドマーケティング戦略の提案も可能です。
                    </p>"""
content = content.replace(old_strengths, new_strengths)

# 7. Images
# I will change the image names so they are specific to dianping.
content = content.replace('assets/images/red-marketing.jpg', 'assets/images/dianping-hero.jpg')
content = content.replace('assets/images/case-restaurant.jpg', 'assets/images/dianping-restaurant.jpg')
content = content.replace('assets/images/office.jpg', 'assets/images/dianping-mockup.jpg')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("dianping.html content rewritten for Dianping characteristics.")
