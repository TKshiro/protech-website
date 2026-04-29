const fs = require('fs');
const path = require('path');

// 1. Fix date in blog.html
const blogHtmlPath = path.join(__dirname, '../frontend/blog.html');
let blogHtml = fs.readFileSync(blogHtmlPath, 'utf8');
blogHtml = blogHtml.replace('2026-04-29', '2026-04-28');
fs.writeFileSync(blogHtmlPath, blogHtml);
console.log('Fixed date in blog.html');

// 2. Fix images in inbound-data-ai-dx-2026.html
const articlePath = path.join(__dirname, '../frontend/blog/inbound-data-ai-dx-2026.html');
let articleHtml = fs.readFileSync(articlePath, 'utf8');

// Fix recommended article images
articleHtml = articleHtml.replace('red-2026-algorithm.jpg', 'blog-red-trends-2026.jpg');
articleHtml = articleHtml.replace('dazhong-dianping-guide.png', 'dazhong-dianping-inbound.jpg');
articleHtml = articleHtml.replace('kol-koc-meaning-fee-2026.png', 'blog-kol-koc-1.jpg');

// Also fix date in the article body to 2026-04-28
articleHtml = articleHtml.replace('2026.04.29', '2026.04.28');

fs.writeFileSync(articlePath, articleHtml);
console.log('Fixed images and date in inbound-data-ai-dx-2026.html');

