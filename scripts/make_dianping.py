import os

file_path = 'frontend/dianping.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace texts
content = content.replace('小紅書(RED)', '大衆点評(Dianping)')
content = content.replace('小紅書', '大衆点評')
content = content.replace('RED', 'Dianping')
content = content.replace('レッド', '大衆点評')
content = content.replace('中国版Instagram', '中国最大の口コミアプリ')

# Replace colors
content = content.replace('#FF2442', '#FF6600') # Red brand to Dianping Orange
content = content.replace('#FF6B81', '#FFA07A') # Secondary red to secondary orange
content = content.replace('red-brand', '[#FF6600]') # For tailwind classes if they exist
content = content.replace('red-50/30', 'orange-50/30')
content = content.replace('bg-red-light/5', 'bg-orange-500/5')

# Make the nav updates for dianping.html
nav_search = '''            <div
                class="hidden md:flex items-center space-x-10 text-sm font-bold tracking-widest uppercase text-slate-600">
                <a href="/" class="nav-link">トップ</a>
                <a href="/red" class="nav-link text-[#FF6600]">大衆点評</a>
                <a href="/services" class="nav-link">サービス</a>'''

nav_replace = '''            <div
                class="hidden md:flex items-center space-x-10 text-sm font-bold tracking-widest uppercase text-slate-600">
                <a href="/" class="nav-link">トップ</a>
                
                <div class="relative group">
                    <a href="/services" class="nav-link flex items-center gap-1">サービス 
                        <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </a>
                    <div class="absolute top-full left-0 mt-4 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div class="p-2 flex flex-col space-y-1">
                            <a href="/services" class="px-4 py-2 hover:bg-gray-50 rounded-lg text-slate-600 hover:text-tech-blue transition-colors text-xs font-bold">すべてのサービス</a>
                            <a href="/dianping.html" class="px-4 py-2 hover:bg-gray-50 rounded-lg text-slate-600 hover:text-[#FF6600] transition-colors text-xs font-bold">大衆点評</a>
                            <a href="/red.html" class="px-4 py-2 hover:bg-gray-50 rounded-lg text-slate-600 hover:text-[#FF2442] transition-colors text-xs font-bold">小紅書</a>
                        </div>
                    </div>
                </div>'''
content = content.replace(nav_search, nav_replace)

mobile_nav_search = '''            <a href="/" class="text-lg font-bold text-slate-700">トップ</a>
            <a href="/red" class="text-lg font-bold text-[#FF6600]">大衆点評</a>
            <a href="/services" class="text-lg font-bold text-slate-700">サービス</a>'''

mobile_nav_replace = '''            <a href="/" class="text-lg font-bold text-slate-700">トップ</a>
            <div class="flex flex-col items-center space-y-4">
                <a href="/services" class="text-lg font-bold text-slate-700">サービス</a>
                <a href="/dianping.html" class="text-sm font-bold text-slate-500 hover:text-[#FF6600]">大衆点評</a>
                <a href="/red.html" class="text-sm font-bold text-slate-500 hover:text-[#FF2442]">小紅書</a>
            </div>'''
content = content.replace(mobile_nav_search, mobile_nav_replace)

# Also fix the links in dianping to point back to red.html correctly
content = content.replace('href="/red"', 'href="/red.html"')
content = content.replace('href="/dianping"', 'href="/dianping.html"')

# We will also change the active link color in the hero/other places to orange
content = content.replace('btn-red', 'btn-orange')
# in style block
content = content.replace('.btn-orange {\n            background: var(--[#FF6600]);', '.btn-orange {\n            background: #FF6600;')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("dianping.html created and updated successfully.")
