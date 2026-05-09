import os
import re
import glob

# The generic header and footer templates
nav_template = '''    <!-- NAV -->
    <nav class="fixed w-full z-50 glass-nav">
        <div class="max-w-7xl mx-auto px-6 h-16 md:h-20 flex justify-between items-center">
            <a href="/" class="text-xl md:text-2xl font-bold tracking-tighter text-tech-blue z-50 relative">PROTECH</a>
            <div class="hidden md:flex items-center space-x-10 text-sm font-bold tracking-widest uppercase text-slate-600">
                <a href="/" class="nav-link {nav_top}">トップ</a>

                <div class="relative group">
                    <a href="/services" class="nav-link {nav_services} flex items-center gap-1">サービス
                        <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </a>
                    <div class="absolute top-full left-0 mt-4 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div class="p-2 flex flex-col space-y-1">
                            <a href="/services" class="px-4 py-2 hover:bg-gray-50 rounded-lg text-slate-600 hover:text-coral transition-colors text-xs font-bold">すべてのサービス</a>
                            <a href="/dianping.html" class="px-4 py-2 hover:bg-gray-50 rounded-lg text-slate-600 hover:text-[#FF6600] transition-colors text-xs font-bold">大衆点評</a>
                            <a href="/red.html" class="px-4 py-2 hover:bg-gray-50 rounded-lg text-slate-600 hover:text-[#FF2442] transition-colors text-xs font-bold">小紅書</a>
                        </div>
                    </div>
                </div>

                <a href="/company" class="nav-link {nav_company}">会社概要</a>
                <a href="/cases" class="nav-link {nav_cases}">導入事例</a>
                <a href="/blog" class="nav-link {nav_blog}">ブログ</a>
                <a href="/contact" class="btn-coral px-6 py-2.5 text-xs tracking-widest rounded-full font-bold">お問合せ</a>
            </div>
            <button id="menu-btn" class="md:hidden p-2 text-tech-blue z-50 relative focus:outline-none hamburger">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <line id="line1" x1="4" y1="6" x2="20" y2="6"></line>
                    <line id="line2" x1="4" y1="12" x2="20" y2="12"></line>
                    <line id="line3" x1="4" y1="18" x2="20" y2="18"></line>
                </svg>
            </button>
        </div>
    </nav>

    <div id="mobile-menu" class="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-40 transform translate-x-full md:hidden overflow-y-auto">
        <div class="flex flex-col items-center justify-center min-h-full space-y-8 py-20">
            <a href="/" class="text-lg font-bold {mobile_top}">トップ</a>
            <div class="flex flex-col items-center space-y-4">
                <a href="/services" class="text-lg font-bold {mobile_services}">サービス</a>
                <a href="/dianping.html" class="text-sm font-bold text-slate-500 hover:text-[#FF6600]">大衆点評</a>
                <a href="/red.html" class="text-sm font-bold text-slate-500 hover:text-[#FF2442]">小紅書</a>
            </div>
            <a href="/company" class="text-lg font-bold {mobile_company}">会社概要</a>
            <a href="/cases" class="text-lg font-bold {mobile_cases}">導入事例</a>
            <a href="/blog" class="text-lg font-bold {mobile_blog}">ブログ</a>
            <a href="/contact" class="text-lg font-bold text-slate-700">お問合せ</a>
        </div>
    </div>'''

footer_template = '''    <!-- FOOTER -->
    <footer class="bg-[#0a1628] text-white pt-16 md:pt-20 pb-8 px-6">
        <div class="max-w-7xl mx-auto">
            <div class="grid md:grid-cols-4 gap-12 md:gap-8 mb-16">
                <div class="md:col-span-1">
                    <div class="text-2xl font-bold tracking-tighter mb-4">PROTECH</div>
                    <p class="text-white/30 text-xs leading-relaxed">テクノロジーとマーケティングで、<br>ビジネスの境界を越える。</p>
                </div>
                <div>
                    <h4 class="text-white/60 text-xs font-bold tracking-[0.2em] uppercase mb-6">サービス</h4>
                    <ul class="space-y-3 text-sm text-white/40">
                        <li><a href="/dianping.html" class="hover:text-coral transition">大衆点評(Dianping)集客</a></li>
                        <li><a href="/red.html" class="hover:text-coral transition">小紅書(RED)マーケティング</a></li>
                        <li><a href="/services" class="hover:text-coral transition">すべてのサービス</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-white/60 text-xs font-bold tracking-[0.2em] uppercase mb-6">会社情報</h4>
                    <ul class="space-y-3 text-sm text-white/40">
                        <li><a href="/company" class="hover:text-coral transition">会社概要</a></li>
                        <li><a href="/cases" class="hover:text-coral transition">導入事例</a></li>
                        <li><a href="/blog" class="hover:text-coral transition">ブログ</a></li>
                        <li><a href="/privacy" class="hover:text-coral transition">プライバシーポリシー</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-white/60 text-xs font-bold tracking-[0.2em] uppercase mb-6">INBOUND AI</h4>
                    <ul class="space-y-3 text-sm text-white/40">
                        <li><a href="/inbound-ai" class="hover:text-coral transition">インバウンドAI</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="border-t border-white/10 pt-8 text-center">
            <p class="text-[10px] text-white/30">© 2026 PROTECH Inc. All Rights Reserved.</p>
        </div>
    </footer>'''

def get_active_classes(filename):
    classes = {
        'nav_top': '',
        'nav_services': '',
        'nav_company': '',
        'nav_cases': '',
        'nav_blog': '',
        'mobile_top': 'text-slate-700',
        'mobile_services': 'text-slate-700',
        'mobile_company': 'text-slate-700',
        'mobile_cases': 'text-slate-700',
        'mobile_blog': 'text-slate-700',
    }
    
    if 'index.html' in filename and 'admin' not in filename:
        pass # none active or top active? Let's leave text-coral off for top.
    elif 'services.html' in filename or 'red.html' in filename or 'dianping.html' in filename:
        classes['nav_services'] = 'text-coral'
        classes['mobile_services'] = 'text-coral'
    elif 'company.html' in filename:
        classes['nav_company'] = 'text-coral'
        classes['mobile_company'] = 'text-coral'
    elif 'cases' in filename:
        classes['nav_cases'] = 'text-coral'
        classes['mobile_cases'] = 'text-coral'
    elif 'blog' in filename:
        classes['nav_blog'] = 'text-coral'
        classes['mobile_blog'] = 'text-coral'
        
    return classes

# Regex patterns to match existing nav and footer
# We use re.DOTALL to match across newlines.
nav_pattern = re.compile(r'(<!-- NAV -->\s*)?<nav class="fixed w-full z-50 glass-nav">.*?</nav>\s*<div id="mobile-menu".*?</div>\s*</div>', re.DOTALL)
# some mobile-menu divs don't have an extra closing div? Let's be careful.
# Usually: <div id="mobile-menu" ...> ... </div>
nav_pattern_alt = re.compile(r'(<!-- NAV -->\s*)?<nav.*?id="mobile-menu".*?</div>\s*</div>', re.DOTALL)

# Let's write a safer manual parser for the NAV block replacement
def replace_nav(html_content, filename):
    classes = get_active_classes(filename)
    formatted_nav = nav_template.format(**classes)
    
    # Find start of nav
    start_idx = html_content.find('<nav class="fixed w-full z-50 glass-nav">')
    if start_idx == -1:
        # maybe it's slightly different
        start_idx = html_content.find('<nav')
        if start_idx == -1: return html_content
    
    # Also find if there is a <!-- NAV --> comment before it
    comment_idx = html_content.rfind('<!-- NAV -->', max(0, start_idx - 50), start_idx)
    if comment_idx != -1:
        start_idx = comment_idx

    # Find end of mobile-menu
    mobile_menu_start = html_content.find('id="mobile-menu"', start_idx)
    if mobile_menu_start == -1:
        mobile_menu_start = html_content.find('class="fixed top-0 right-0 h-full w-64', start_idx)
        
    if mobile_menu_start != -1:
        # Find the closing div of mobile-menu
        # It has 1 nested div
        # <div id="mobile-menu"> <div> ... </div> </div>
        end_idx = html_content.find('</div>', mobile_menu_start)
        end_idx = html_content.find('</div>', end_idx + 1)
        if end_idx != -1:
            end_idx += 6 # include '</div>'
            
            # replace
            return html_content[:start_idx] + formatted_nav + html_content[end_idx:]
            
    return html_content

def replace_footer(html_content):
    start_idx = html_content.find('<!-- FOOTER -->')
    if start_idx == -1:
        start_idx = html_content.find('<footer')
        if start_idx == -1: return html_content
        
    end_idx = html_content.find('</footer>', start_idx)
    if end_idx != -1:
        end_idx += 9 # include '</footer>'
        
        # sometimes there is an extra </div> in some footers due to formatting errors
        # if the next line is </div>, maybe don't include it or check
        return html_content[:start_idx] + footer_template + html_content[end_idx:]
    return html_content

frontend_dir = 'frontend'
html_files = glob.glob(f'{frontend_dir}/**/*.html', recursive=True)

success_count = 0
for file_path in html_files:
    if 'admin' in file_path:
        continue # skip admin dashboard
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    content = replace_nav(content, file_path)
    content = replace_footer(content)
    
    # Also fix the absolute css link while we're at it
    content = content.replace('<link href="/assets/css/tailwind.css"', '<link href="assets/css/tailwind.css"')
    content = content.replace('<link href="/assets/css/tailwind.css"', '<link href="../assets/css/tailwind.css"') # Wait, this is wrong logic.
    
    # Better CSS link fixing based on directory depth
    depth = file_path.count('/') - 1 # 'frontend/' is 1
    if depth == 0:
        css_path = 'assets/css/tailwind.css'
    elif depth == 1:
        css_path = '../assets/css/tailwind.css'
    elif depth == 2:
        css_path = '../../assets/css/tailwind.css'
        
    content = content.replace('<link href="/assets/css/tailwind.css"', f'<link href="{css_path}"')
    
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        success_count += 1

print(f"Successfully synced header and footer in {success_count} HTML files.")
