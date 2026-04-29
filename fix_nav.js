const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'frontend/blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));

const desktopNav = `            <div class="hidden md:flex items-center space-x-10 text-sm font-bold tracking-widest uppercase text-slate-600">
                <a href="/" class="nav-link">トップ</a>
                <a href="/services" class="nav-link">サービス</a>
                <a href="/company" class="nav-link">会社概要</a>
                <a href="/blog" class="nav-link">ニュース</a>
                <a href="/blog" class="nav-link text-coral">ブログ</a>
                <a href="/contact" class="btn-coral px-6 py-2.5 text-xs tracking-widest rounded-full font-bold">お問合せ</a>
            </div>`;

const mobileMenu = `
    <!-- Mobile Menu -->
    <div id="mobile-menu" class="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-40 transform translate-x-full md:hidden transition-transform duration-300 ease-in-out">
        <div class="flex flex-col items-center justify-center h-full space-y-8 pt-20">
            <a href="/" class="text-lg font-bold text-slate-700">トップ</a>
            <a href="/services" class="text-lg font-bold text-slate-700">サービス</a>
            <a href="/company" class="text-lg font-bold text-slate-700">会社概要</a>
            <a href="/blog" class="text-lg font-bold text-slate-700">ニュース</a>
            <a href="/blog" class="text-lg font-bold text-coral">ブログ</a>
            <a href="/contact" class="text-lg font-bold text-slate-700">お問合せ</a>
        </div>
    </div>
`;

files.forEach(file => {
    let content = fs.readFileSync(path.join(blogDir, file), 'utf-8');
    let changed = false;

    if (content.includes('<!-- Links omitted for brevity but they are standard -->')) {
        content = content.replace('<!-- Links omitted for brevity but they are standard -->', desktopNav);
        changed = true;
    }
    
    // Check if mobile menu is missing
    if (!content.includes('id="mobile-menu"')) {
        content = content.replace('</nav>', '</nav>\n' + mobileMenu);
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(path.join(blogDir, file), content, 'utf-8');
        console.log(`Fixed NAV in ${file}`);
    }
});
