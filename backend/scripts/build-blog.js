#!/usr/bin/env node

/**
 * PROTECH Blog Build System
 * 
 * Reads Markdown posts from blog/posts/, generates:
 * 1. Static HTML pages in blog/
 * 2. blog.html listing page
 * 3. Updated sitemap.xml
 * 4. RSS feed (rss.xml)
 * 5. Injects blog entries into news.html
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const ROOT = path.resolve(__dirname, '../../frontend');
const POSTS_DIR = path.join(ROOT, 'blog', 'posts');
const OUTPUT_DIR = path.join(ROOT, 'blog');
const SITE_URL = 'https://pro-tech.jp';

// ─── Helpers ───────────────────────────────────────────────

function slugFromFilename(filename) {
    return filename.replace(/\.md$/, '');
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function isoDate(dateStr) {
    return new Date(dateStr).toISOString().split('T')[0];
}

function categoryLabel(cat) {
    const map = { news: 'News', service: 'Service', case: 'Case Study' };
    return map[cat] || cat;
}

function categoryClasses(cat) {
    if (cat === 'case') return 'bg-blue-50 text-blue-600';
    if (cat === 'service') return 'bg-emerald-50 text-emerald-600';
    return 'bg-slate-100 text-slate-500';
}

// ─── Read All Posts ────────────────────────────────────────

function readPosts() {
    if (!fs.existsSync(POSTS_DIR)) {
        console.log('⚠ No blog/posts/ directory found. Creating it...');
        fs.mkdirSync(POSTS_DIR, { recursive: true });
        return [];
    }

    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
    const posts = files.map(file => {
        const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
        const { data, content } = matter(raw);
        return {
            slug: slugFromFilename(file),
            title: data.title || 'Untitled',
            date: data.date || '2026-01-01',
            category: data.category || 'news',
            description: data.description || '',
            image: data.image || '',
            content: content,
            html: marked(content),
        };
    });

    // Sort by date descending
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    return posts;
}

// ─── Generate Blog Post HTML ──────────────────────────────

function generatePostHTML(post) {
    return `<!DOCTYPE html>
<html lang="ja" translate="no">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="google" content="notranslate">
    <link rel="icon" type="image/x-icon" href="../img/favicon.ico">

    <title>${post.title} | PROTECH株式会社</title>
    <meta name="description" content="${post.description}">
    <link rel="canonical" href="${SITE_URL}/blog/${post.slug}">
    <meta property="og:title" content="${post.title} | PROTECH株式会社">
    <meta property="og:description" content="${post.description}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${SITE_URL}/blog/${post.slug}">
    ${post.image ? `<meta property="og:image" content="${post.image}">` : ''}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${post.title}">
    <meta name="twitter:description" content="${post.description}">

    <script src="https://cdn.tailwindcss.com"></script>
    <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;700&family=Noto+Serif+JP:wght@600&display=swap"
        rel="stylesheet">
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">

    <style>
        :root { --tech-blue: #001A33; }
        body { font-family: 'Noto Sans JP', sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        .serif { font-family: 'Noto Serif JP', serif; }
        .glass-nav { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255, 255, 255, 0.3); }
        #mobile-menu { transition: transform 0.3s ease-in-out; }
        .hamburger line { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); transform-origin: center; }
        .hamburger.active #line1 { transform: translateY(7px) rotate(45deg); }
        .hamburger.active #line2 { opacity: 0; transform: translateX(-10px); }
        .hamburger.active #line3 { transform: translateY(-7px) rotate(-45deg); }

        .blog-content h2 { font-size: 1.5rem; font-weight: 700; color: #001A33; margin-top: 2.5rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb; }
        .blog-content h3 { font-size: 1.25rem; font-weight: 700; color: #001A33; margin-top: 2rem; margin-bottom: 0.75rem; }
        .blog-content p { color: #475569; line-height: 2; margin-bottom: 1.5rem; }
        .blog-content ul, .blog-content ol { color: #475569; line-height: 2; margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .blog-content ul { list-style-type: disc; }
        .blog-content ol { list-style-type: decimal; }
        .blog-content li { margin-bottom: 0.5rem; }
        .blog-content strong { color: #001A33; }
        .blog-content a { color: #2563eb; text-decoration: underline; }
        .blog-content a:hover { color: #1d4ed8; }
        .blog-content blockquote { border-left: 4px solid #001A33; padding-left: 1rem; color: #64748b; font-style: italic; margin: 1.5rem 0; }
        .blog-content hr { border-top: 1px solid #e5e7eb; margin: 2.5rem 0; }
        .blog-content code { background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-size: 0.875rem; }
        .blog-content pre { background: #0f172a; color: #e2e8f0; padding: 1.5rem; border-radius: 0.75rem; overflow-x: auto; margin-bottom: 1.5rem; }
        .blog-content pre code { background: transparent; padding: 0; }
        .blog-content img { border-radius: 0.75rem; margin: 1.5rem 0; }
    </style>

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: { 'tech-blue': '#001A33' }
                }
            }
        }
    </script>

    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "${post.title.replace(/"/g, '\\"')}",
        "description": "${post.description.replace(/"/g, '\\"')}",
        "datePublished": "${isoDate(post.date)}",
        "dateModified": "${isoDate(post.date)}",
        ${post.image ? `"image": "${post.image}",` : ''}
        "author": {
            "@type": "Organization",
            "name": "PROTECH株式会社",
            "url": "${SITE_URL}"
        },
        "publisher": {
            "@type": "Organization",
            "name": "PROTECH株式会社",
            "url": "${SITE_URL}"
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "${SITE_URL}/blog/${post.slug}"
        }
    }
    </script>
</head>

<body class="bg-white">

    <nav class="fixed w-full z-50 glass-nav">
        <div class="max-w-7xl mx-auto px-6 h-16 md:h-20 flex justify-between items-center">
            <a href="/"
                class="text-xl md:text-2xl font-bold tracking-tighter text-tech-blue z-50 relative">PROTECH</a>
            <div class="hidden md:flex space-x-10 text-sm font-bold tracking-widest uppercase">
                <a href="/" class="hover:text-blue-600 transition">TOP</a>
                <a href="/services" class="hover:text-blue-600 transition">SERVICES</a>
                <a href="/company" class="hover:text-blue-600 transition">COMPANY</a>
                <a href="/blog" class="hover:text-blue-600 transition">NEWS</a>
                <a href="/blog" class="text-blue-600 font-bold">BLOG</a>
                <a href="/contact" class="hover:text-blue-600 transition">CONTACT</a>
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

    <div id="mobile-menu"
        class="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-40 transform translate-x-full transition-transform duration-300 ease-in-out md:hidden">
        <div class="flex flex-col items-center justify-center h-full space-y-8 pt-20">
            <a href="/" class="text-lg font-bold text-slate-700">TOP</a>
            <a href="/services" class="text-lg font-bold text-slate-700">SERVICES</a>
            <a href="/company" class="text-lg font-bold text-slate-700">COMPANY</a>
            <a href="/blog" class="text-lg font-bold text-slate-700">NEWS</a>
            <a href="/blog" class="text-lg font-bold text-blue-600">BLOG</a>
            <a href="/contact" class="text-lg font-bold text-slate-700">CONTACT</a>
        </div>
    </div>

    <article class="pt-40 pb-32">
        <header class="max-w-4xl mx-auto px-8 mb-20 text-center">
            <div class="flex items-center justify-center gap-4 mb-8" data-aos="fade-up">
                <span class="text-sm text-slate-400 font-mono">${formatDate(post.date)}</span>
                <span
                    class="text-[10px] font-bold text-blue-600 border border-blue-600 px-3 py-1 rounded-full uppercase tracking-widest">${categoryLabel(post.category)}</span>
            </div>
            <h1 class="text-3xl md:text-5xl font-bold serif text-tech-blue leading-tight mb-16" data-aos="fade-up"
                data-aos-delay="100">
                ${post.title}
            </h1>
            ${post.image ? `<div class="rounded-3xl overflow-hidden shadow-2xl aspect-video" data-aos="zoom-in" data-aos-duration="1200">
                <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover">
            </div>` : ''}
        </header>

        <main class="max-w-3xl mx-auto px-8 blog-content" data-aos="fade-up">
            ${post.html}
        </main>

        <footer
            class="max-w-4xl mx-auto px-8 mt-32 pt-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-12">
            <a href="/blog"
                class="group flex items-center gap-4 text-xs font-bold tracking-[0.2em] uppercase transition">
                <span
                    class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-tech-blue group-hover:text-white transition">←</span>
                Back to Blog
            </a>
            <div class="flex items-center gap-8">
                <span class="text-[10px] font-bold tracking-[0.3em] text-slate-300 uppercase">Share</span>
                <div class="flex items-center gap-6">
                    <a id="line-share" href="#" target="_blank"><svg class="w-6 h-6 fill-[#06C755]" viewBox="0 0 24 24">
                            <path
                                d="M12 2C6.48 2 2 5.51 2 9.83c0 2.45 1.45 4.62 3.73 6.02-.19.68-.69 2.46-.79 2.83-.16.58.19.57.4.43.16-.11 2.58-1.75 3.63-2.47.33.05.67.07 1.03.07 5.52 0 10-3.51 10-7.83S17.52 2 12 2z" />
                        </svg></a>
                    <a id="x-share" href="#" target="_blank"><svg class="w-5 h-5 fill-slate-800" viewBox="0 0 24 24">
                            <path
                                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg></a>
                    <a id="fb-share" href="#" target="_blank"><svg class="w-6 h-6 fill-slate-800" viewBox="0 0 24 24">
                            <path
                                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg></a>
                </div>
            </div>
        </footer>
    </article>

    <!-- Footer -->
    <footer class="py-16 md:py-20 text-center bg-white border-t border-gray-100">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-tech-blue font-bold text-2xl md:text-3xl mb-8 tracking-tighter uppercase">PROTECH</div>
            <div
                class="flex justify-center flex-wrap gap-6 md:gap-8 mb-10 text-[10px] md:text-xs font-bold tracking-widest text-gray-400">
                <a href="/services" class="hover:text-blue-600 transition">SERVICES</a>
                <a href="/company" class="hover:text-blue-600 transition">COMPANY</a>
                <a href="/blog" class="hover:text-blue-600 transition">NEWS</a>
                <a href="/blog" class="hover:text-blue-600 transition">BLOG</a>
            </div>
            <p class="text-[10px] text-gray-400 tracking-widest">© 2026 PROTECH Inc. All Rights Reserved.</p>
        </div>
    </footer>

    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            AOS.init({ duration: 1000, once: true });

            const menuBtn = document.getElementById('menu-btn');
            const mobileMenu = document.getElementById('mobile-menu');
            if (menuBtn && mobileMenu) {
                menuBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    menuBtn.classList.toggle('active');
                    mobileMenu.classList.toggle('translate-x-full');
                });
                document.addEventListener('click', (e) => {
                    if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                        menuBtn.classList.remove('active');
                        mobileMenu.classList.add('translate-x-full');
                    }
                });
                window.addEventListener('resize', () => {
                    if (window.innerWidth >= 768) {
                        menuBtn.classList.remove('active');
                        mobileMenu.classList.add('translate-x-full');
                    }
                });
            }

            // Social share
            const currentUrl = encodeURIComponent(window.location.href);
            const pageTitle = encodeURIComponent(document.title);
            const lineShare = document.getElementById('line-share');
            if (lineShare) lineShare.href = \`https://social-plugins.line.me/lineit/share?url=\${currentUrl}\`;
            const xShare = document.getElementById('x-share');
            if (xShare) xShare.href = \`https://twitter.com/intent/tweet?url=\${currentUrl}&text=\${pageTitle}\`;
            const fbShare = document.getElementById('fb-share');
            if (fbShare) fbShare.href = \`https://www.facebook.com/sharer/sharer.php?u=\${currentUrl}\`;
        });
    </script>

</body>

</html>`;
}

// ─── Generate Sitemap ─────────────────────────────────────

function generateSitemap(posts) {
    const today = isoDate(new Date().toISOString());

    const staticPages = [
        { url: '/', priority: '1.0', changefreq: 'weekly' },
        { url: '/services', priority: '0.8', changefreq: 'monthly' },
        { url: '/contact', priority: '0.8', changefreq: 'monthly' },
        { url: '/company', priority: '0.7', changefreq: 'monthly' },
        { url: '/blog', priority: '0.7', changefreq: 'weekly' },
        { url: '/cases', priority: '0.7', changefreq: 'monthly' },
        { url: '/red', priority: '0.7', changefreq: 'monthly' },
        { url: '/privacy', priority: '0.4', changefreq: 'yearly' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    for (const page of staticPages) {
        xml += `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>

`;
    }

    for (const post of posts) {
        xml += `  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${isoDate(post.date)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

`;
    }

    xml += `</urlset>`;
    return xml;
}

// ─── Generate RSS Feed ────────────────────────────────────

function generateRSS(posts) {
    const now = new Date().toUTCString();

    let items = '';
    for (const post of posts) {
        items += `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category>${categoryLabel(post.category)}</category>
    </item>
`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PROTECH株式会社 ブログ</title>
    <link>${SITE_URL}</link>
    <description>PROTECHの最新ニュース、マーケティング情報、事例紹介</description>
    <language>ja</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}  </channel>
</rss>`;
}

// ─── Inject Blog Posts into news.html ─────────────────────

function injectIntoNews(posts) {
    const newsFile = path.join(ROOT, 'news.html');
    if (!fs.existsSync(newsFile)) {
        console.log('⏭  news.html not found, skipping news injection');
        return;
    }
    let html = fs.readFileSync(newsFile, 'utf-8');

    // Generate blog entry HTML
    let blogEntries = '';
    for (const post of posts) {
        blogEntries += `
            <a href="/blog/${post.slug}"
                class="news-item flex flex-col md:flex-row md:items-center py-10 gap-6 group hover:bg-slate-50/50 transition-colors px-4 -mx-4"
                data-category="${post.category}" data-aos="fade-up">
                <span class="text-xs text-gray-400 font-mono w-32 tracking-tighter flex-shrink-0">${formatDate(post.date)}</span>
                <span
                    class="text-[9px] font-bold ${categoryClasses(post.category)} px-3 py-1 rounded w-fit uppercase tracking-widest">${categoryLabel(post.category)}</span>
                <h3 class="flex-1 font-bold text-[15px] group-hover:text-blue-600 transition">${post.title}</h3>
                <span
                    class="hidden md:block text-slate-200 group-hover:text-blue-600 transition translate-x-0 group-hover:translate-x-2">→</span>
            </a>`;
    }

    const startMarker = '<!-- BLOG_POSTS_START -->';
    const endMarker = '<!-- BLOG_POSTS_END -->';

    if (html.includes(startMarker)) {
        // Replace existing blog section
        const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, 'g');
        html = html.replace(regex, `${startMarker}\n${blogEntries}\n            ${endMarker}`);
    } else {
        // Insert markers before closing </div> of news-container
        const insertPoint = html.indexOf('</div>', html.indexOf('id="news-container"'));
        if (insertPoint !== -1) {
            html = html.slice(0, insertPoint) +
                `\n            ${startMarker}\n${blogEntries}\n            ${endMarker}\n        ` +
                html.slice(insertPoint);
        }
    }

    fs.writeFileSync(newsFile, html, 'utf-8');
}

// ─── Generate Blog Listing Page ───────────────────────────

function generateBlogListingHTML(posts) {
    let postItems = '';
    for (const post of posts) {
        postItems += `
            <a href="/blog/${post.slug}"
                class="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                data-category="${post.category}" data-aos="fade-up">
                ${post.image ? `<div class="aspect-video overflow-hidden">
                    <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                </div>` : ''}
                <div class="p-6 md:p-8">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="text-xs text-gray-400 font-mono tracking-tighter">${formatDate(post.date)}</span>
                        <span class="text-[9px] font-bold ${categoryClasses(post.category)} px-3 py-1 rounded uppercase tracking-widest">${categoryLabel(post.category)}</span>
                    </div>
                    <h3 class="font-bold text-lg text-tech-blue group-hover:text-blue-600 transition mb-3 leading-snug">${post.title}</h3>
                    <p class="text-sm text-gray-400 line-clamp-2 leading-relaxed">${post.description}</p>
                    <div class="mt-6 text-xs font-bold text-blue-600 tracking-widest uppercase flex items-center gap-2">
                        READ MORE <span class="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                </div>
            </a>`;
    }

    return `<!DOCTYPE html>
<html lang="ja" translate="no">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ブログ - PROTECH株式会社</title>
    <link rel="icon" type="image/x-icon" href="img/favicon.ico">

    <meta name="description" content="PROTECHのブログ。小紅書マーケティング、Web開発、デジタル戦略に関する最新情報と知見をお届けします。">
    <meta name="keywords" content="ブログ, マーケティング, 小紅書, RED, Web開発, PROTECH">
    <link rel="canonical" href="${SITE_URL}/blog">
    <link rel="alternate" type="application/rss+xml" title="PROTECH Blog RSS" href="${SITE_URL}/rss.xml">

    <meta property="og:title" content="ブログ - PROTECH">
    <meta property="og:description" content="PROTECHのブログ。マーケティング戦略・Web開発に関する最新情報。">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${SITE_URL}/blog">
    <meta property="og:image" content="${SITE_URL}/img/og-image.jpg">

    <script src="https://cdn.tailwindcss.com"></script>
    <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Noto+Serif+JP:wght@600&display=swap"
        rel="stylesheet">
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">

    <style>
        :root { --tech-blue: #001A33; }
        body { font-family: 'Noto Sans JP', sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        .serif { font-family: 'Noto Serif JP', serif; }
        .glass-nav { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); }
        .filter-btn { position: relative; cursor: pointer; transition: all 0.3s; color: #94a3b8; }
        .filter-btn.active { color: var(--tech-blue); font-weight: 700; }
        .filter-btn.active::after { content: ''; position: absolute; bottom: -17px; left: 0; width: 100%; height: 2px; background: var(--tech-blue); }
        .hamburger line { transition: all 0.3s ease; transform-origin: center; }
        .hamburger.active #line1 { transform: translateY(7px) rotate(45deg); }
        .hamburger.active #line2 { opacity: 0; }
        .hamburger.active #line3 { transform: translateY(-7px) rotate(-45deg); }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    </style>

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: { 'tech-blue': '#001A33' }
                }
            }
        }
    </script>
</head>

<body class="bg-white text-slate-900">

    <nav class="fixed w-full z-50 glass-nav border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-6 h-16 md:h-20 flex justify-between items-center">
            <a href="/"
                class="text-xl md:text-2xl font-bold tracking-tighter text-tech-blue z-50 relative">PROTECH</a>
            <div class="hidden md:flex space-x-10 text-sm font-bold tracking-widest uppercase">
                <a href="/" class="hover:text-blue-600 transition">TOP</a>
                <a href="/services" class="hover:text-blue-600 transition">SERVICES</a>
                <a href="/company" class="hover:text-blue-600 transition">COMPANY</a>
                <a href="/blog" class="hover:text-blue-600 transition">NEWS</a>
                <a href="/blog" class="text-blue-600 font-bold">BLOG</a>
                <a href="/contact" class="hover:text-blue-600 transition">CONTACT</a>
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

    <div id="mobile-menu"
        class="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-40 transform translate-x-full transition-transform duration-300 ease-in-out md:hidden">
        <div class="flex flex-col items-center justify-center h-full space-y-8 pt-20">
            <a href="/" class="text-lg font-bold text-slate-700">TOP</a>
            <a href="/services" class="text-lg font-bold text-slate-700">SERVICES</a>
            <a href="/company" class="text-lg font-bold text-slate-700">COMPANY</a>
            <a href="/blog" class="text-lg font-bold text-slate-700">NEWS</a>
            <a href="/blog" class="text-lg font-bold text-blue-600">BLOG</a>
            <a href="/contact" class="text-lg font-bold text-slate-700">CONTACT</a>
        </div>
    </div>

    <main class="max-w-6xl mx-auto px-8 pt-40 md:pt-48 pb-20">
        <header class="mb-16 border-b border-gray-100 pb-16" data-aos="fade-up">
            <p class="text-tech-blue text-[10px] font-bold tracking-[0.3em] uppercase mb-4">Blog</p>
            <h1 class="text-4xl md:text-5xl font-bold serif text-tech-blue mb-6 uppercase tracking-widest">Insights &
                Knowledge</h1>
            <p class="text-gray-400 text-xs tracking-[0.2em] font-light">マーケティング・開発に関する知見</p>
        </header>

        <div id="filter-controls"
            class="flex gap-10 text-[10px] tracking-[0.2em] uppercase mb-12 border-b border-gray-100 pb-4"
            data-aos="fade-up">
            <button data-filter="all" class="filter-btn active">All</button>
            <button data-filter="news" class="filter-btn">News</button>
            <button data-filter="service" class="filter-btn">Service</button>
            <button data-filter="case" class="filter-btn">Case Study</button>
        </div>

        <div id="blog-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
${postItems}
        </div>
    </main>

    <footer class="py-16 md:py-20 text-center bg-white border-t border-gray-100">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-tech-blue font-bold text-2xl md:text-3xl mb-8 tracking-tighter uppercase">PROTECH</div>
            <div
                class="flex justify-center flex-wrap gap-6 md:gap-8 mb-10 text-[10px] md:text-xs font-bold tracking-widest text-gray-400">
                <a href="/services" class="hover:text-blue-600 transition">SERVICES</a>
                <a href="/company" class="hover:text-blue-600 transition">COMPANY</a>
                <a href="/blog" class="hover:text-blue-600 transition">NEWS</a>
                <a href="/blog" class="hover:text-blue-600 transition">BLOG</a>
            </div>
            <p class="text-[10px] text-gray-400 tracking-widest">© 2026 PROTECH Inc. All Rights Reserved.</p>
        </div>
    </footer>

    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            AOS.init({ duration: 1000, once: true });

            const menuBtn = document.getElementById('menu-btn');
            const mobileMenu = document.getElementById('mobile-menu');
            if (menuBtn && mobileMenu) {
                menuBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    menuBtn.classList.toggle('active');
                    mobileMenu.classList.toggle('translate-x-full');
                });
                document.addEventListener('click', (e) => {
                    if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                        menuBtn.classList.remove('active');
                        mobileMenu.classList.add('translate-x-full');
                    }
                });
                window.addEventListener('resize', () => {
                    if (window.innerWidth >= 768) {
                        menuBtn.classList.remove('active');
                        mobileMenu.classList.add('translate-x-full');
                    }
                });
            }

            const filterButtons = document.querySelectorAll('#filter-controls .filter-btn');
            const blogItems = document.querySelectorAll('#blog-container > a');

            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    const filterValue = button.getAttribute('data-filter');
                    blogItems.forEach(item => {
                        const itemCategory = item.getAttribute('data-category');
                        if (filterValue === 'all' || filterValue === itemCategory) {
                            item.classList.remove('hidden');
                        } else {
                            item.classList.add('hidden');
                        }
                    });
                    AOS.refresh();
                });
            });
        });
    </script>

</body>

</html>`;
}

// ─── Main Build ───────────────────────────────────────────

function build() {
    console.log('\n🔨 PROTECH Blog Build System\n');

    // 1. Read posts
    const posts = readPosts();
    console.log(`📄 Found ${posts.length} blog post(s)`);

    if (posts.length === 0) {
        console.log('⚠ No posts to build. Add .md files to blog/posts/');
        return;
    }

    // 2. Generate HTML for each post
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    for (const post of posts) {
        const htmlFile = path.join(OUTPUT_DIR, `${post.slug}.html`);
        fs.writeFileSync(htmlFile, generatePostHTML(post), 'utf-8');
        console.log(`  ✅ blog/${post.slug}.html`);
    }

    // 3. Generate blog.html listing page
    const blogListingContent = generateBlogListingHTML(posts);
    fs.writeFileSync(path.join(ROOT, 'blog.html'), blogListingContent, 'utf-8');
    console.log(`  ✅ blog.html (listing page)`);

    // 4. Generate sitemap.xml
    const sitemapContent = generateSitemap(posts);
    fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapContent, 'utf-8');
    console.log(`\n🗺  sitemap.xml updated (${7 + posts.length} URLs)`);

    // 5. Generate rss.xml
    const rssContent = generateRSS(posts);
    fs.writeFileSync(path.join(ROOT, 'rss.xml'), rssContent, 'utf-8');
    console.log(`📡 rss.xml generated (${posts.length} items)`);

    // 6. Inject into news.html
    injectIntoNews(posts);
    console.log(`📰 news.html updated with blog entries`);

    console.log('\n✨ Build complete!\n');

    // Return post URLs for Google ping
    return posts.map(p => `${SITE_URL}/blog/${p.slug}`);
}

// Run
const urls = build();

// Export for ping-google.js
module.exports = { build, SITE_URL };
