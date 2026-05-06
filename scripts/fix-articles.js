/**
 * fix-articles.js
 * 1. Fix hero image in each article to match blog.html card image
 * 2. Replace hardcoded TOC <ol> with auto-generated TOC via JS (h2 + h3)
 */

const fs = require('fs');
const path = require('path');

// ── Image map: blog card image → article hero src ──────────────────────────
// Key = slug, Value = image path used in blog.html card
const BLOG_CARD_IMAGES = {
  'inbound-march-2026-report': 'assets/images/inbound-march-hero.png',
  'taiwan-inbound-strategy': 'assets/images/taiwan_inbound_hero.png',
  'inbound-calendar-2026': 'assets/images/inbound_calendar_2026_hero.png',
  'xiaohongshu-algorithm-ec-2026': 'assets/images/red-2026-algorithm.jpg',
  'inbound-data-ai-dx-2026': 'assets/images/inbound-data-ai-hero.jpeg',
  'dazhong-dianping-guide': 'assets/images/dazhong-dianping-inbound.jpg',
  'douyin-restaurant-inbound': 'assets/images/blog-douyin-restaurant.jpg',
  'inbound-meaning-guide': 'assets/images/inbound-tourist-image.jpg',
  'miniprogram-cost-period': 'assets/images/blog-miniprogram-cost.jpg',
  'inbound-sns-strategy-2026': 'assets/images/blog-sns-strategy-2026.jpg',
  'xiaohongshu-guide-2026': 'assets/images/blog-xiaohongshu-guide.jpg',
  'agency-checklist': 'assets/images/office.jpg',
  'cross-border-ec-success-cases': 'assets/images/blog-cross-border-7.jpg',
  'cross-border-ec-market-size-2026': 'assets/images/blog-cross-border-4.jpg',
  'kol-koc-meaning-fee-2026': 'assets/images/blog-kol-koc-1.jpg',
  'cross-border-ec-guide': 'assets/images/blog-cross-border-1.jpg',
  'content-operation-flow': 'assets/images/blog-content-operation.jpg',
  'kol-koc-guide': 'assets/images/hero-cityscape.jpg',
  'inbound-xiaohongshu-2026': 'assets/images/xiaohongshu-restaurant-inbound.png',
  'inbound-funnel-design': 'assets/images/blog-inbound-funnel.jpg',
  'red-marketing-trends-2026': 'assets/images/blog-red-trends-2026.jpg',
  'red-account-basics': 'assets/images/red-marketing.jpg',
};

// TOC auto-generation JS snippet to inject
const TOC_JS = `
            // ── Auto-generate TOC from article h2 / h3 ──────────────────────
            const tocList = document.getElementById('auto-toc');
            if (tocList) {
                const article = document.querySelector('.article-body');
                if (article) {
                    let h3Counter = 0;
                    article.querySelectorAll('h2[id], h3').forEach(h => {
                        if (h.tagName === 'H2') {
                            const li = document.createElement('li');
                            li.innerHTML = \`<a href="#\${h.id}" class="toc-link hover:text-coral font-medium block py-0.5">\${h.textContent}</a>\`;
                            tocList.appendChild(li);
                        } else if (h.tagName === 'H3') {
                            if (!h.id) { h.id = 'h3-' + (++h3Counter); }
                            let lastH2Li = tocList.querySelector('li:last-child');
                            if (!lastH2Li) return;
                            let sub = lastH2Li.querySelector('ol');
                            if (!sub) {
                                sub = document.createElement('ol');
                                sub.className = 'mt-1 ml-3 space-y-0.5 text-xs text-gray-400';
                                lastH2Li.appendChild(sub);
                            }
                            const subLi = document.createElement('li');
                            subLi.innerHTML = \`<a href="#\${h.id}" class="toc-link hover:text-coral block py-0.5 pl-1 border-l border-gray-200">\${h.textContent}</a>\`;
                            sub.appendChild(subLi);
                        }
                    });
                }
            }
`;

const blogDir = path.join(__dirname, '../frontend/blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));

let fixedCount = 0;

files.forEach(file => {
  const slug = file.replace('.html', '');
  const filePath = path.join(blogDir, file);
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // ── 1. Fix hero image ───────────────────────────────────────────────────
  const cardImg = BLOG_CARD_IMAGES[slug];
  if (cardImg) {
    const articleSrc = '../' + cardImg;
    // Match the hero img tag (h-64 md:h-96)
    const heroImgRegex = /(<img[^>]+class="[^"]*h-64 md:h-96[^"]*"[^>]*src=")[^"]+("[^>]*>)/;
    const altSrcRegex = /(<img[^>]+src=")[^"]+("[^>]+class="[^"]*h-64 md:h-96[^"]*"[^>]*>)/;
    if (heroImgRegex.test(html)) {
      const newHtml = html.replace(heroImgRegex, `$1${articleSrc}$2`);
      if (newHtml !== html) { html = newHtml; changed = true; }
    } else if (altSrcRegex.test(html)) {
      const newHtml = html.replace(altSrcRegex, `$1${articleSrc}$2`);
      if (newHtml !== html) { html = newHtml; changed = true; }
    }
  }

  // ── 2. Replace hardcoded TOC ol with auto-generated ─────────────────────
  // Replace the ol inside the TOC block with an empty one with id="auto-toc"
  const tocOlRegex = /(目次[\s\S]{0,200}?)<ol class="space-y-2[^"]*">([\s\S]*?)<\/ol>/;
  if (tocOlRegex.test(html) && !html.includes('auto-toc')) {
    html = html.replace(tocOlRegex, `$1<ol id="auto-toc" class="space-y-2 text-sm text-gray-500"></ol>`);
    changed = true;
  }

  // ── 3. Inject TOC JS before closing DOMContentLoaded ───────────────────
  if (!html.includes('auto-toc') === false && !html.includes('Auto-generate TOC')) {
    // Inject before the scroll/toc section or before closing });
    html = html.replace(
      /\/\/ TOC active state on scroll/,
      TOC_JS + '\n            // TOC active state on scroll'
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('✅ Fixed: ' + file);
    fixedCount++;
  } else {
    console.log('⏭  Skipped: ' + file);
  }
});

console.log(`\nDone. ${fixedCount}/${files.length} files updated.`);
