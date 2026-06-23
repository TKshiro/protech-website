const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'frontend/blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));

const checks = {
  nav: 'glass-nav',
  mobileMenu: 'id="mobile-menu"',
  desktopLinks: 'hidden md:flex',
  footer: '<footer',
  toc: '目次',
  sidebar: '<aside',
  cta: 'btn-coral',
  share: 'Share',
  backLink: 'blog.html',
  latestArticles: '最新の記事',
  relatedArticles: '関連記事',
  h1: '<h1',
  breadcrumb: 'トップ',
};

files.forEach(file => {
  const content = fs.readFileSync(path.join(blogDir, file), 'utf-8');
  const missing = [];
  for (const [key, pattern] of Object.entries(checks)) {
    if (key === 'backLink') {
      if (!content.includes('blog.html') && !content.includes('/blog') && !content.includes('/blog/')) {
        missing.push(key);
      }
    } else {
      if (!content.includes(pattern)) missing.push(key);
    }
  }
  if (missing.length > 0) {
    console.log(`❌ ${file}: MISSING [${missing.join(', ')}]`);
  } else {
    console.log(`✅ ${file}: OK`);
  }
});
