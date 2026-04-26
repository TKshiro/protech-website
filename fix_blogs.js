const fs = require('fs');

const templateContent = fs.readFileSync('frontend/blog/inbound-meaning-guide.html', 'utf-8');

// Extract the share block
const shareMatch = templateContent.match(/<!-- Share -->[\s\S]*?<\/div>\s*<\/article>/);
const shareBlock = shareMatch ? shareMatch[0].replace('</article>', '') : '';

// Extract the Back to blog, Footer, and Scripts
const footerMatch = templateContent.match(/<!-- Back to blog -->[\s\S]*?<\/body>\s*<\/html>/);
const footerBlock = footerMatch ? footerMatch[0] : '';

const filesToFix = [
    'xiaohongshu-guide-2026.html',
    'douyin-restaurant-inbound.html',
    'miniprogram-cost-period.html',
    'inbound-sns-strategy-2026.html',
    'content-operation-flow.html',
    'inbound-funnel-design.html'
];

filesToFix.forEach(file => {
    let content = fs.readFileSync('frontend/blog/' + file, 'utf-8');
    
    // 1. Fix the article closing
    // Some files have missing share block. If it doesn't have <!-- Share -->, add it.
    if (!content.includes('<!-- Share -->')) {
        content = content.replace(/<\/article>/, shareBlock + '</article>');
    }
    
    // 2. Fix the Sidebar
    if (!content.includes('<!-- Sidebar -->')) {
        // Construct a sidebar using the existing h2s
        const h2s = [...content.matchAll(/<h2 id="([^"]+)">([^<]+)<\/h2>/g)];
        let tocLinks = h2s.map(h => `<li><a href="#${h[1]}" class="toc-link hover:text-coral">${h[2]}</a></li>`).join('\n                        ');
        
        const sidebarHTML = `
        <!-- Sidebar -->
        <aside class="lg:w-1/3">
            <div class="sticky top-28 space-y-6">
                <div class="bg-slate-50 rounded-2xl p-6">
                    <h3 class="font-bold text-tech-blue text-sm mb-4 tracking-wider">目次</h3>
                    <ol class="space-y-2 text-sm text-gray-500">
                        ${tocLinks}
                    </ol>
                </div>
                <div class="bg-tech-blue rounded-2xl p-6 text-white text-center">
                    <p class="font-bold text-sm mb-2">無料相談受付中</p>
                    <p class="text-xs text-white/60 mb-4 leading-relaxed">運用や集客について<br>お気軽にご相談ください</p>
                    <a href="../contact.html" class="btn-coral px-6 py-2.5 rounded-full text-xs font-bold tracking-widest inline-block">相談する</a>
                </div>
            </div>
        </aside>
    </div>`;
        content = content.replace(/<\/article>\s*<\/div>/, '</article>\n' + sidebarHTML);
        if (!content.includes('<!-- Sidebar -->')) {
             content = content.replace(/<\/article>\s*<\/body>/, '</article>\n' + sidebarHTML + '\n</body>');
        }
    }
    
    // 3. Fix Footer and Scripts
    // Replace everything after `</div>` (the main layout closing div) with the footerBlock
    content = content.replace(/<!-- Back to blog -->[\s\S]*?<\/html>|<!-- Footer omitted[\s\S]*?<\/html>|<!-- FOOTER -->[\s\S]*?<\/html>|<\/body>\s*<\/html>/, footerBlock);

    // Minor fix for files that might have an extra </div> or missing something
    // Let's just do a clean replace from the end of the layout </div>
    // Actually, `content = content.replace(/(<\/aside>\s*<\/div>\s*)([\s\S]*)$/, '$1\n' + footerBlock);` is safer.
    content = content.replace(/(<\/aside>\s*<\/div>)[\s\S]*?$/, '$1\n\n    ' + footerBlock);
    
    fs.writeFileSync('frontend/blog/' + file, content);
    console.log(`Fixed ${file}`);
});
