const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '../frontend');

// Recursive function to get all HTML files in a directory and its subdirectories
function getHtmlFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            // Recurse into subdirectories
            results = results.concat(getHtmlFiles(filePath));
        } else if (file.endsWith('.html') && file !== 'pricing.html') {
            results.push(filePath);
        }
    });
    return results;
}

const htmlFiles = getHtmlFiles(frontendDir);
console.log(`Found ${htmlFiles.length} HTML files to check and update recursively.`);

let updatedCount = 0;

htmlFiles.forEach(filePath => {
    const relativePath = path.relative(frontendDir, filePath);
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    // 1. Update Desktop Header Dropdown
    const oldDropdown = `<a href="/services" class="px-4 py-2 hover:bg-gray-50 rounded-lg text-slate-600 hover:text-coral transition-colors text-xs font-bold">すべてのサービス</a>
                            <a href="/dianping.html" class="px-4 py-2 hover:bg-gray-50 rounded-lg text-slate-600 hover:text-[#FF6600] transition-colors text-xs font-bold">大衆点評</a>
                            <a href="/red.html" class="px-4 py-2 hover:bg-gray-50 rounded-lg text-slate-600 hover:text-[#FF2442] transition-colors text-xs font-bold">小紅書</a>`;
    
    const newDropdown = `<a href="/services" class="px-4 py-2 hover:bg-gray-50 rounded-lg text-slate-600 hover:text-coral transition-colors text-xs font-bold">すべてのサービス</a>
                            <a href="/dianping.html" class="px-4 py-2 hover:bg-gray-50 rounded-lg text-slate-600 hover:text-[#FF6600] transition-colors text-xs font-bold">大衆点評</a>
                            <a href="/red.html" class="px-4 py-2 hover:bg-gray-50 rounded-lg text-slate-600 hover:text-[#FF2442] transition-colors text-xs font-bold">小紅書</a>
                            <a href="/pricing" class="px-4 py-2 hover:bg-gray-50 rounded-lg text-slate-600 hover:text-coral transition-colors text-xs font-bold">料金プラン</a>`;

    if (content.includes(oldDropdown)) {
        content = content.replace(oldDropdown, newDropdown);
        changed = true;
    } else {
        const regexDropdown = /<a\s+href="\/services"\s+class="px-4\s+py-2\s+hover:bg-gray-50\s+rounded-lg\s+text-slate-600\s+hover:text-coral\s+transition-colors\s+text-xs\s+font-bold">すべてのサービス<\/a>\s*<a\s+href="\/dianping\.html"\s+class="px-4\s+py-2\s+hover:bg-gray-50\s+rounded-lg\s+text-slate-600\s+hover:text-\[#FF6600\]\s+transition-colors\s+text-xs\s+font-bold">大衆点評<\/a>\s*<a\s+href="\/red\.html"\s+class="px-4\s+py-2\s+hover:bg-gray-50\s+rounded-lg\s+text-slate-600\s+hover:text-\[#FF2442\]\s+transition-colors\s+text-xs\s+font-bold">小紅書<\/a>/g;
        if (regexDropdown.test(content)) {
            content = content.replace(regexDropdown, (match) => {
                return match + `\n                            <a href="/pricing" class="px-4 py-2 hover:bg-gray-50 rounded-lg text-slate-600 hover:text-coral transition-colors text-xs font-bold">料金プラン</a>`;
            });
            changed = true;
        }
    }

    // 2. Update Mobile Menu Dropdown
    const oldMobile = `<a href="/services" class="text-lg font-bold text-slate-700">サービス</a>
                <a href="/dianping.html" class="text-sm font-bold text-slate-500 hover:text-[#FF6600]">大衆点評</a>
                <a href="/red.html" class="text-sm font-bold text-slate-500 hover:text-[#FF2442]">小紅書</a>`;
    
    const newMobile = `<a href="/services" class="text-lg font-bold text-slate-700">サービス</a>
                <a href="/dianping.html" class="text-sm font-bold text-slate-500 hover:text-[#FF6600]">大衆点評</a>
                <a href="/red.html" class="text-sm font-bold text-slate-500 hover:text-[#FF2442]">小紅書</a>
                <a href="/pricing" class="text-sm font-bold text-slate-500 hover:text-coral">料金プラン</a>`;

    const oldMobileCoral = `<a href="/services" class="text-lg font-bold text-coral">サービス</a>
                <a href="/dianping.html" class="text-sm font-bold text-slate-500 hover:text-[#FF6600]">大衆点評</a>
                <a href="/red.html" class="text-sm font-bold text-slate-500 hover:text-[#FF2442]">小紅書</a>`;
    
    const newMobileCoral = `<a href="/services" class="text-lg font-bold text-coral">サービス</a>
                <a href="/dianping.html" class="text-sm font-bold text-slate-500 hover:text-[#FF6600]">大衆点評</a>
                <a href="/red.html" class="text-sm font-bold text-slate-500 hover:text-[#FF2442]">小紅書</a>
                <a href="/pricing" class="text-sm font-bold text-slate-500 hover:text-coral">料金プラン</a>`;

    if (content.includes(oldMobile)) {
        content = content.replace(oldMobile, newMobile);
        changed = true;
    } else if (content.includes(oldMobileCoral)) {
        content = content.replace(oldMobileCoral, newMobileCoral);
        changed = true;
    } else {
        const regexMobile = /<a\s+href="\/services"\s+class="text-lg\s+font-bold\s+text-(?:slate-700|coral)">サービス<\/a>\s*<a\s+href="\/dianping\.html"\s+class="text-sm\s+font-bold\s+text-slate-500\s+hover:text-\[#FF6600\]">大衆点評<\/a>\s*<a\s+href="\/red\.html"\s+class="text-sm\s+font-bold\s+text-slate-500\s+hover:text-\[#FF2442\]">小紅書<\/a>/g;
        if (regexMobile.test(content)) {
            content = content.replace(regexMobile, (match) => {
                return match + `\n                <a href="/pricing" class="text-sm font-bold text-slate-500 hover:text-coral">料金プラン</a>`;
            });
            changed = true;
        }
    }

    // 3. Update Footer Links
    const oldFooter = `<li><a href="/dianping.html" class="hover:text-coral transition">大衆点評(Dianping)集客</a></li>
                        <li><a href="/red.html" class="hover:text-coral transition">小紅書(RED)マーケティング</a></li>
                        <li><a href="/services" class="hover:text-coral transition">すべてのサービス</a></li>`;
    
    const newFooter = `<li><a href="/dianping.html" class="hover:text-coral transition">大衆点評(Dianping)集客</a></li>
                        <li><a href="/red.html" class="hover:text-coral transition">小紅書(RED)マーケティング</a></li>
                        <li><a href="/pricing" class="hover:text-coral transition">料金プラン</a></li>
                        <li><a href="/services" class="hover:text-coral transition">すべてのサービス</a></li>`;

    if (content.includes(oldFooter)) {
        content = content.replace(oldFooter, newFooter);
        changed = true;
    } else {
        const regexFooter = /<li><a\s+href="\/dianping\.html"\s+class="hover:text-coral\s+transition">大衆点評\(Dianping\)集客<\/a><\/li>\s*<li><a\s+href="\/red\.html"\s+class="hover:text-coral\s+transition">小紅書\(RED\)マーケティング<\/a><\/li>\s*<li><a\s+href="\/services"\s+class="hover:text-coral\s+transition">すべてのサービス<\/a><\/li>/g;
        if (regexFooter.test(content)) {
            content = content.replace(regexFooter, `<li><a href="/dianping.html" class="hover:text-coral transition">大衆点評(Dianping)集客</a></li>\n                        <li><a href="/red.html" class="hover:text-coral transition">小紅書(RED)マーケティング</a></li>\n                        <li><a href="/pricing" class="hover:text-coral transition">料金プラン</a></li>\n                        <li><a href="/services" class="hover:text-coral transition">すべてのサービス</a></li>`);
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Successfully updated: ${relativePath}`);
        updatedCount++;
    }
});

console.log(`Navigation update complete. Updated ${updatedCount} files recursively.`);
