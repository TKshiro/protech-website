import os

file_path = 'frontend/services.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Navigation
nav_search = '''            <div
                class="hidden md:flex items-center space-x-10 text-sm font-bold tracking-widest uppercase text-slate-600">
                <a href="/" class="nav-link">トップ</a>
                <a href="/red" class="nav-link">小紅書</a>
                <a href="/services" class="nav-link text-coral">サービス</a>'''

nav_replace = '''            <div
                class="hidden md:flex items-center space-x-10 text-sm font-bold tracking-widest uppercase text-slate-600">
                <a href="/" class="nav-link">トップ</a>
                
                <div class="relative group">
                    <a href="/services" class="nav-link text-coral flex items-center gap-1">サービス 
                        <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </a>
                    <div class="absolute top-full left-0 mt-4 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div class="p-2 flex flex-col space-y-1">
                            <a href="/services" class="px-4 py-2 hover:bg-gray-50 rounded-lg text-coral hover:text-coral transition-colors text-xs font-bold">すべてのサービス</a>
                            <a href="/dianping.html" class="px-4 py-2 hover:bg-gray-50 rounded-lg text-slate-600 hover:text-[#FF6600] transition-colors text-xs font-bold">大衆点評</a>
                            <a href="/red.html" class="px-4 py-2 hover:bg-gray-50 rounded-lg text-slate-600 hover:text-[#FF2442] transition-colors text-xs font-bold">小紅書</a>
                        </div>
                    </div>
                </div>'''
content = content.replace(nav_search, nav_replace)

mobile_nav_search = '''            <a href="/" class="text-lg font-bold text-slate-700">トップ</a>
            <a href="/red" class="text-lg font-bold text-slate-700">小紅書</a>
            <a href="/services" class="text-lg font-bold text-coral">サービス</a>'''

mobile_nav_replace = '''            <a href="/" class="text-lg font-bold text-slate-700">トップ</a>
            <div class="flex flex-col items-center space-y-4">
                <a href="/services" class="text-lg font-bold text-coral">サービス</a>
                <a href="/dianping.html" class="text-sm font-bold text-slate-500 hover:text-[#FF6600]">大衆点評</a>
                <a href="/red.html" class="text-sm font-bold text-slate-500 hover:text-[#FF2442]">小紅書</a>
            </div>'''
content = content.replace(mobile_nav_search, mobile_nav_replace)

# 2. Insert Dianping Section and Shift others
dianping_section = '''    <!-- SERVICE 02: Dianping Marketing -->
    <section class="py-20 md:py-28 px-8 bg-warm-gray relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 seigaiha-pattern opacity-10"></div>
        <div class="max-w-7xl mx-auto">
            <div class="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                <div class="md:w-1/2" data-aos="fade-left">
                    <div class="mb-8">
                        <span class="text-coral font-bold tracking-[0.2em] text-xs uppercase inter">SERVICE 02</span>
                        <div class="w-10 h-0.5 bg-coral mt-2"></div>
                    </div>
                    <h2 class="text-3xl md:text-4xl font-bold text-tech-blue leading-tight mb-6 serif">
                        大衆点評(Dianping)<br>店舗集客・運用代行
                    </h2>
                    <p class="text-gray-500 text-sm leading-loose mb-6 font-light">
                        中国最大の口コミ・ナビゲーションアプリ「大衆点評」を活用し、訪日中国人の実店舗への集客を支援します。公式店舗の登録・認証から、クーポンの設定、口コミの促進・管理まで、インバウンド集客に必要な施策をトータルでサポートします。
                    </p>

                    <div class="grid grid-cols-2 gap-4 mb-8">
                        <div class="p-5 bg-white rounded-xl shadow-sm border border-gray-50">
                            <h4 class="font-bold text-sm mb-1 text-tech-blue">公式店舗登録</h4>
                            <p class="text-[11px] text-gray-400">複雑な審査手続きを代行し、公式V認証を取得します。</p>
                        </div>
                        <div class="p-5 bg-white rounded-xl shadow-sm border border-gray-50">
                            <h4 class="font-bold text-sm mb-1 text-tech-blue">クーポン・予約設定</h4>
                            <p class="text-[11px] text-gray-400">アプリ内で完結する団購（クーポン）や予約機能を構築します。</p>
                        </div>
                        <div class="p-5 bg-white rounded-xl shadow-sm border border-gray-50">
                            <h4 class="font-bold text-sm mb-1 text-tech-blue">口コミ（UGC）管理</h4>
                            <p class="text-[11px] text-gray-400">来店者の口コミ投稿を促进し、店舗の高評価ランキング入りを目指します。</p>
                        </div>
                        <div class="p-5 bg-white rounded-xl shadow-sm border border-gray-50">
                            <h4 class="font-bold text-sm mb-1 text-tech-blue">公式広告運用</h4>
                            <p class="text-[11px] text-gray-400">商圏内のターゲットユーザーに広告を配信し、露出を最大化します。</p>
                        </div>
                    </div>
                    
                    <a href="/dianping.html"
                        class="px-8 py-3 border border-coral text-coral text-xs font-bold tracking-widest rounded-full inline-flex items-center gap-2 hover:bg-coral hover:text-white transition-all">
                        大衆点評マーケティング詳細
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
                <div class="md:w-1/2" data-aos="fade-right">
                    <div class="rounded-2xl overflow-hidden shadow-2xl relative">
                        <div class="absolute inset-0 bg-gradient-to-t from-tech-blue/80 to-transparent z-10 flex items-end p-8">
                            <div>
                                <span class="bg-[#FF6600] text-white text-[10px] font-bold px-2 py-1 rounded mb-2 inline-block">Dianping</span>
                                <h3 class="text-white font-bold text-lg">インバウンド実店舗集客</h3>
                            </div>
                        </div>
                        <img src="assets/images/service-dianping.jpg" class="service-img w-full h-[400px] object-cover" alt="大衆点評(Dianping) 店舗集客・運用代行">
                    </div>
                </div>
            </div>
        </div>
    </section>

'''

# We need to insert Dianping before SERVICE 02: LP & Video Production
split_marker = '    <!-- SERVICE 02: LP & Video Production -->'
parts = content.split(split_marker)

if len(parts) == 2:
    # Modify the old SERVICE 02 to SERVICE 03
    rest_of_content = split_marker + parts[1]
    
    # Change SERVICE 02 -> SERVICE 03 for LP & Video
    rest_of_content = rest_of_content.replace('SERVICE 02', 'SERVICE 03')
    # Change bg-warm-gray to bg-white
    rest_of_content = rest_of_content.replace('bg-warm-gray relative overflow-hidden', 'bg-white relative overflow-hidden', 1)
    # Change flex-row-reverse to flex-row
    rest_of_content = rest_of_content.replace('md:flex-row-reverse', 'md:flex-row', 1)
    # Switch fade directions
    rest_of_content = rest_of_content.replace('data-aos="fade-left"', 'data-aos="TEMP"', 1)
    rest_of_content = rest_of_content.replace('data-aos="fade-right"', 'data-aos="fade-left"', 1)
    rest_of_content = rest_of_content.replace('data-aos="TEMP"', 'data-aos="fade-right"', 1)
    
    # Change SERVICE 03 -> SERVICE 04 for Mini Program
    rest_of_content = rest_of_content.replace('SERVICE 03', 'SERVICE 04')
    # Change bg-white to bg-warm-gray for Mini Program
    # We find the section for Mini Program
    mini_prog_marker = '    <!-- SERVICE 04: Mini Program -->'
    rest_of_content = rest_of_content.replace('    <!-- SERVICE 03: Mini Program -->', mini_prog_marker)
    
    parts2 = rest_of_content.split(mini_prog_marker)
    if len(parts2) == 2:
        mini_content = mini_prog_marker + parts2[1]
        mini_content = mini_content.replace('bg-white relative overflow-hidden', 'bg-warm-gray relative overflow-hidden', 1)
        mini_content = mini_content.replace('md:flex-row', 'md:flex-row-reverse', 1)
        # Switch fade directions
        mini_content = mini_content.replace('data-aos="fade-right"', 'data-aos="TEMP"', 1)
        mini_content = mini_content.replace('data-aos="fade-left"', 'data-aos="fade-right"', 1)
        mini_content = mini_content.replace('data-aos="TEMP"', 'data-aos="fade-left"', 1)
        
        rest_of_content = parts2[0] + mini_content

    # Reassemble
    final_content = parts[0] + dianping_section + rest_of_content
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(final_content)
    print("services.html updated successfully")
else:
    print("Could not find the insertion point.")
