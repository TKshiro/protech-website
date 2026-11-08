const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'frontend');
const siteUrl = 'https://pro-tech.jp';
const today = new Date().toISOString().slice(0, 10);

const exclude = new Set([
  '404.html',
  'blog-post.html',
  'thanks.html',
  'admin/index.html',
]);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return entry.name.endsWith('.html') ? [fullPath] : [];
  });
}

function urlFromFile(filePath) {
  const rel = path.relative(root, filePath).split(path.sep).join('/');
  if (exclude.has(rel) || rel.startsWith('admin/')) return null;
  if (rel === 'index.html') return `${siteUrl}/`;
  if (rel.endsWith('/index.html')) {
    return `${siteUrl}/${rel.replace(/\/index\.html$/, '/')}`;
  }
  return `${siteUrl}/${rel.replace(/\.html$/, '')}`;
}

function priorityFor(url) {
  if (url === `${siteUrl}/`) return '1.0';
  if (/\/(red|dianping|douyin|kol|miniprogram|creative)$/.test(url)) return '0.9';
  if (/\/(services|cases|blog)$/.test(url)) return '0.8';
  if (url.includes('/industries/') || url.endsWith('/xiaohongshu-agency-cost') || url.endsWith('/xiaohongshu-agency-comparison') || url.endsWith('/china-sns-marketing-agency') || url.endsWith('/china-sns-agency-comparison') || url.endsWith('/dianping-store-registration')) return '0.8';
  if (url.includes('/blog/') || url.includes('/cases/')) return '0.7';
  if (/\/(contact|download|faq|pricing|media-kit|editorial-policy)$/.test(url)) return '0.6';
  return '0.5';
}

const urls = walk(root)
  .map(urlFromFile)
  .filter(Boolean)
  .sort((a, b) => {
    if (a === `${siteUrl}/`) return -1;
    if (b === `${siteUrl}/`) return 1;
    return a.localeCompare(b);
  });

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${url.includes('/blog/') ? 'monthly' : 'weekly'}</changefreq>
    <priority>${priorityFor(url)}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(root, 'sitemap.xml'), xml);
console.log(`Generated sitemap.xml with ${urls.length} URLs`);
