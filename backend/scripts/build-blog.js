#!/usr/bin/env node

/**
 * PROTECH Blog Build System (Multi-Language Enabled)
 * 
 * Reads Markdown posts from:
 * - JA: frontend/blog/posts/
 * - EN: frontend/en/blog/posts/
 * - CN: frontend/cn/blog/posts/
 * 
 * Generates:
 * 1. Static HTML pages in blog/ (JA, EN, CN)
 * 2. blog.html listing pages
 * 3. Unified sitemap.xml with xhtml:link alternates
 * 4. Localized RSS feeds (rss.xml, en/rss.xml, cn/rss.xml)
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const ROOT = path.resolve(__dirname, '../../frontend');
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

const BLOG_I18N = {
    ja: {
        nav: {
            top: 'トップ',
            services: 'サービス',
            company: '会社概要',
            news: 'お知らせ',
            blog: 'ブログ',
            contact: 'お問い合わせ'
        },
        categories: {
            news: 'ニュース',
            service: 'サービス',
            case: '事例'
        },
        listing: {
            title: 'ブログ - PROTECH株式会社',
            description: 'PROTECHのブログ。小紅書マーケティング、Web開発、デジタル戦略に関する最新情報と知見をお届けします。',
            heading: 'ブログ',
            kicker: 'ブログ',
            subheading: '小紅書マーケティング・訪日集客・Web開発の最新情報',
            all: 'すべて',
            readMore: '続きを読む'
        },
        backToBlog: 'ブログ一覧へ戻る',
        share: '共有',
        footer: {
            services: 'サービス',
            company: '会社概要',
            news: 'お知らせ',
            blog: 'ブログ'
        },
        toc: '目次',
        editor: '編集者',
        editorName: 'PROTECH 編集部',
        editorTeam: 'インバウンド・DX専門チーム',
        editorDesc: '中国をはじめとするアジア市場や、欧米市場向けのインバウンドマーケティングをワンストップで支援。テクノロジーと独自のデータを活用し、数多くの企業の海外進出を成功に導いています。',
        related: '関連記事',
        latest: '最新の記事',
        ctaTitle: '無料相談受付中',
        ctaDesc: '小紅書運用のお悩みをプロに相談してみませんか？',
        ctaButton: '相談する'
    },
    en: {
        nav: {
            top: 'Home',
            services: 'Services',
            company: 'Company',
            news: 'News',
            blog: 'Blog',
            contact: 'Contact'
        },
        categories: {
            news: 'News',
            service: 'Service',
            case: 'Case Study'
        },
        listing: {
            title: 'Blog - PROTECH Inc.',
            description: 'PROTECH Blog. We deliver the latest information and insights on Xiaohongshu marketing, web development, and digital strategy.',
            heading: 'Insights & Knowledge',
            kicker: 'BLOG',
            subheading: 'Marketing & Development Insights',
            all: 'All',
            readMore: 'Read More'
        },
        backToBlog: 'Back to Blog',
        share: 'Share',
        footer: {
            services: 'Services',
            company: 'Company',
            news: 'News',
            blog: 'Blog'
        },
        toc: 'Table of Contents',
        editor: 'Editor',
        editorName: 'PROTECH Editor',
        editorTeam: 'Inbound & DX Team',
        editorDesc: 'One-stop support for inbound marketing targeting Asian (including China) and Western markets. Leveraging technology and unique data to guide enterprises to successful global expansion.',
        related: 'Related Articles',
        latest: 'Latest Articles',
        ctaTitle: 'Free Consultation',
        ctaDesc: 'Have questions about marketing in Japan? Ask our experts.',
        ctaButton: 'Inquire'
    },
    cn: {
        nav: {
            top: '首页',
            services: '服务',
            company: '公司介绍',
            news: '最新动态',
            blog: '博客',
            contact: '联系我们'
        },
        categories: {
            news: '新闻',
            service: '服务',
            case: '案例'
        },
        listing: {
            title: '博客 - PROTECH 株式会社',
            description: 'PROTECH 博客。为您带来关于小红书营销、网页开发和数字化战略的最新资讯与行业见解。',
            heading: '博客',
            kicker: '博客',
            subheading: '小红书营销、访日集客与技术开发的专业内容',
            all: '全部',
            readMore: '阅读全文'
        },
        backToBlog: '返回博客列表',
        share: '分享',
        footer: {
            services: '服务',
            company: '公司介绍',
            news: '最新动态',
            blog: '博客'
        },
        toc: '目录',
        editor: '编辑',
        editorName: 'PROTECH 编辑部',
        editorTeam: '入境与数字化团队',
        editorDesc: '一站式支持面向中国等亚洲市场及欧美市场的入境营销。利用先进技术与独特数据，助力众多企业成功走向海外。',
        related: '相关文章',
        latest: '最新文章',
        ctaTitle: '免费咨询进行中',
        ctaDesc: '有关于小红书运营的烦恼？欢迎咨询专业团队。',
        ctaButton: '立即咨询'
    }
};

function categoryLabel(cat, lang = 'en') {
    const map = BLOG_I18N[lang]?.categories || BLOG_I18N.en.categories;
    return map[cat] || cat;
}

function categoryClasses(cat) {
    if (cat === 'case') return 'bg-blue-50 text-blue-600';
    if (cat === 'service') return 'bg-emerald-50 text-emerald-600';
    return 'bg-slate-100 text-slate-500';
}

// ─── Read All Posts ────────────────────────────────────────

function readPosts(postsDir, lang) {
    if (!fs.existsSync(postsDir)) {
        console.log(`⚠ Directory not found: ${postsDir}. Creating it...`);
        fs.mkdirSync(postsDir, { recursive: true });
        return [];
    }

    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    const posts = files.map(file => {
        const raw = fs.readFileSync(path.join(postsDir, file), 'utf-8');
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
            lang: lang
        };
    });

    // Sort by date descending
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    return posts;
}

// ─── Generate Blog Post HTML ──────────────────────────────

function generatePostHTML(post, availableLangs, allPostsOfLang = []) {
    const langPrefix = post.lang === 'ja' ? '' : `/${post.lang}`;
    const i18n = BLOG_I18N[post.lang] || BLOG_I18N.en;
    
    // SEO Canonical / Alternate Tags
    const canonicalUrl = `${SITE_URL}${langPrefix}/blog/${post.slug}`;
    const hreflangs = { ja: 'ja', en: 'en', cn: 'zh-Hans' };
    const langPrefixes = { ja: '', en: '/en', cn: '/cn' };

    let hreflangTags = '';
    for (const l of ['ja', 'en', 'cn']) {
        if (availableLangs[l]) {
            hreflangTags += `<link rel="alternate" hreflang="${hreflangs[l]}" href="${SITE_URL}${langPrefixes[l]}/blog/${post.slug}" />\n    `;
        }
    }
    if (availableLangs.ja) {
        hreflangTags += `<link rel="alternate" hreflang="x-default" href="${SITE_URL}/blog/${post.slug}" />\n    `;
    }

    // Dynamic Title Suffix
    const titleSuffix = post.lang === 'en' ? 'PROTECH Inc.' : 'PROTECH株式会社';

    // Image logic (make local image absolute path relative to domain)
    const ogImgUrl = post.image ? (post.image.startsWith('http') ? post.image : `${SITE_URL}${post.image}`) : '';

    // Related & Latest posts calculation
    const relatedPosts = allPostsOfLang
        .filter(p => p.slug !== post.slug && p.category === post.category);
    let fallbackPosts = [];
    if (relatedPosts.length < 3) {
        fallbackPosts = allPostsOfLang.filter(p => p.slug !== post.slug && p.category !== post.category);
    }
    const finalRelated = [...relatedPosts, ...fallbackPosts].slice(0, 3);

    let relatedHtml = '';
    if (finalRelated.length > 0) {
        relatedHtml += `
                <!-- Related Articles Card -->
                <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 class="text-xs font-bold tracking-widest text-tech-blue uppercase mb-4 flex items-center gap-2">
                        <span class="w-1.5 h-3 bg-blue-600 rounded-full"></span>
                        ${i18n.related}
                    </h3>
                    <div class="space-y-4">`;

        for (const rp of finalRelated) {
            const rpUrl = `${langPrefix}/blog/${rp.slug}`;
            relatedHtml += `
                        <a href="${rpUrl}" class="flex gap-4 group">
                            ${rp.image ? `
                            <div class="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                                <img src="${rp.image}" alt="${rp.title.replace(/"/g, '&quot;')}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                            </div>
                            ` : `
                            <div class="w-16 h-12 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100">
                                <span class="text-[10px] font-bold text-slate-400">BLOG</span>
                            </div>
                            `}
                            <div class="flex-1 min-w-0">
                                <h4 class="font-bold text-xs text-tech-blue line-clamp-2 group-hover:text-blue-600 transition leading-snug mb-1">${rp.title}</h4>
                                <span class="text-[9px] font-bold ${categoryClasses(rp.category)} px-2 py-0.5 rounded uppercase tracking-widest">${categoryLabel(rp.category, post.lang)}</span>
                            </div>
                        </a>`;
        }
        relatedHtml += `
                    </div>
                </div>`;
    }

    const latestPosts = allPostsOfLang
        .filter(p => p.slug !== post.slug)
        .slice(0, 3);

    let latestHtml = '';
    if (latestPosts.length > 0) {
        latestHtml += `
    <!-- Latest Articles Section -->
    <section class="max-w-7xl mx-auto px-6 md:px-8 mt-24 pt-16 border-t border-gray-100" data-aos="fade-up">
        <h2 class="text-xl md:text-2xl font-bold serif text-tech-blue mb-8 tracking-wide">${i18n.latest}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">`;

        for (const lp of latestPosts) {
            const lpUrl = `${langPrefix}/blog/${lp.slug}`;
            latestHtml += `
            <a href="${lpUrl}" class="group block bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                ${lp.image ? `
                <div class="aspect-video overflow-hidden">
                    <img src="${lp.image}" alt="${lp.title.replace(/"/g, '&quot;')}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                </div>
                ` : `
                <div class="aspect-video bg-slate-50 flex items-center justify-center border-b border-slate-100">
                    <span class="text-xs font-bold text-slate-400">BLOG</span>
                </div>
                `}
                <div class="p-6">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="text-[10px] text-gray-400 font-mono tracking-tighter">${formatDate(lp.date)}</span>
                        <span class="text-[9px] font-bold ${categoryClasses(lp.category)} px-2 py-0.5 rounded uppercase tracking-widest">${categoryLabel(lp.category, post.lang)}</span>
                    </div>
                    <h3 class="font-bold text-sm text-tech-blue group-hover:text-blue-600 transition line-clamp-2 leading-snug">${lp.title}</h3>
                </div>
            </a>`;
        }

        latestHtml += `
        </div>
    </section>`;
    }

    return `<!DOCTYPE html>
<html lang="${post.lang === 'cn' ? 'zh-CN' : post.lang}" translate="no">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="google" content="notranslate">
    <link rel="icon" type="image/png" href="/assets/images/favicon.png">

    <title>${post.title} | ${titleSuffix}</title>
    <meta name="description" content="${post.description}">
    <link rel="canonical" href="${canonicalUrl}">
    ${hreflangTags}
    <meta property="og:title" content="${post.title} | ${titleSuffix}">
    <meta property="og:description" content="${post.description}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonicalUrl}">
    ${ogImgUrl ? `<meta property="og:image" content="${ogImgUrl}">` : ''}
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
        .blog-content img { border-radius: 0.75rem; margin: 1.5rem 0; max-width: 100%; height: auto; }
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

    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "${post.title.replace(/"/g, '\\"')}",
        "description": "${post.description.replace(/"/g, '\\"')}",
        "datePublished": "${isoDate(post.date)}",
        "dateModified": "${isoDate(post.date)}",
        ${ogImgUrl ? `"image": "${ogImgUrl}",` : ''}
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
            "@id": "${canonicalUrl}"
        }
    }
    </script>
</head>

<body class="bg-white">

    <nav class="fixed w-full z-50 glass-nav">
        <div class="max-w-7xl mx-auto px-6 h-16 md:h-20 flex justify-between items-center">
            <a href="${langPrefix}/"
                class="text-xl md:text-2xl font-bold tracking-tighter text-tech-blue z-50 relative">PROTECH</a>
            <div class="hidden md:flex space-x-10 text-sm font-bold tracking-widest items-center uppercase">
                <a href="${langPrefix}/" class="hover:text-blue-600 transition">${i18n.nav.top}</a>
                <a href="${langPrefix}/services" class="hover:text-blue-600 transition">${i18n.nav.services}</a>
                <a href="${langPrefix}/company" class="hover:text-blue-600 transition">${i18n.nav.company}</a>
                <a href="${langPrefix}/blog" class="hover:text-blue-600 transition">${i18n.nav.news}</a>
                <a href="${langPrefix}/blog" class="text-blue-600 font-bold">${i18n.nav.blog}</a>
                <a href="${langPrefix}/contact" class="hover:text-blue-600 transition">${i18n.nav.contact}</a>
                
                <!-- Premium Language Dropdown -->
                <div class="relative group ml-4">
                    <button class="flex items-center gap-1 hover:text-blue-600 font-bold transition text-tech-blue cursor-pointer">
                        🌐 ${post.lang.toUpperCase()}
                    </button>
                    <div class="absolute right-0 top-full mt-2 w-28 bg-white border border-gray-100 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 py-1">
                        <a href="${SITE_URL}/blog/${post.slug}" class="block px-4 py-2 text-xs text-gray-700 hover:bg-slate-50 transition">日本語</a>
                        ${availableLangs.en ? `<a href="${SITE_URL}/en/blog/${post.slug}" class="block px-4 py-2 text-xs text-gray-700 hover:bg-slate-50 transition">English</a>` : ''}
                        ${availableLangs.cn ? `<a href="${SITE_URL}/cn/blog/${post.slug}" class="block px-4 py-2 text-xs text-gray-700 hover:bg-slate-50 transition">简体中文</a>` : ''}
                    </div>
                </div>
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
            <a href="${langPrefix}/" class="text-lg font-bold text-slate-700">${i18n.nav.top}</a>
            <a href="${langPrefix}/services" class="text-lg font-bold text-slate-700">${i18n.nav.services}</a>
            <a href="${langPrefix}/company" class="text-lg font-bold text-slate-700">${i18n.nav.company}</a>
            <a href="${langPrefix}/blog" class="text-lg font-bold text-slate-700">${i18n.nav.news}</a>
            <a href="${langPrefix}/blog" class="text-lg font-bold text-blue-600">${i18n.nav.blog}</a>
            <a href="${langPrefix}/contact" class="text-lg font-bold text-slate-700">${i18n.nav.contact}</a>
            
            <!-- Language Selection Mobile -->
            <div class="flex gap-4 border-t border-gray-100 pt-6 mt-4 w-full justify-center text-xs">
                <a href="${SITE_URL}/blog/${post.slug}" class="text-slate-500 hover:text-blue-600 font-bold">JP</a>
                ${availableLangs.en ? `<a href="${SITE_URL}/en/blog/${post.slug}" class="text-slate-500 hover:text-blue-600 font-bold">EN</a>` : ''}
                ${availableLangs.cn ? `<a href="${SITE_URL}/cn/blog/${post.slug}" class="text-slate-500 hover:text-blue-600 font-bold">CN</a>` : ''}
            </div>
        </div>
    </div>

    <article class="pt-40 pb-32">
        <header class="max-w-4xl mx-auto px-8 mb-20 text-center">
            <div class="flex items-center justify-center gap-4 mb-8" data-aos="fade-up">
                <span class="text-sm text-slate-400 font-mono">${formatDate(post.date)}</span>
                <span
                    class="text-[10px] font-bold text-blue-600 border border-blue-600 px-3 py-1 rounded-full uppercase tracking-widest">${categoryLabel(post.category, post.lang)}</span>
            </div>
            <h1 class="text-3xl md:text-5xl font-bold serif text-tech-blue leading-tight mb-16" data-aos="fade-up"
                data-aos-delay="100">
                ${post.title}
            </h1>
            ${post.image ? `<div class="rounded-3xl overflow-hidden shadow-2xl aspect-video px-4 md:px-0 max-w-4xl mx-auto" data-aos="zoom-in" data-aos-duration="1200">
                <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover">
            </div>` : ''}
        </header>

        <div class="max-w-7xl mx-auto px-6 md:px-8 mt-12 flex flex-col lg:flex-row gap-12">
            <!-- Left Column: Content -->
            <div class="w-full lg:w-2/3">
                <main class="blog-content mb-16" data-aos="fade-up">
                    ${post.html}
                </main>
                
                <footer class="pt-12 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-8 mb-16">
                    <a href="${langPrefix}/blog"
                        class="group flex items-center gap-4 text-xs font-bold tracking-[0.2em] uppercase transition">
                        <span
                            class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-tech-blue group-hover:text-white transition">←</span>
                        ${i18n.backToBlog}
                    </a>
                    <div class="flex items-center gap-8">
                        <span class="text-[10px] font-bold tracking-[0.3em] text-slate-300 uppercase">${i18n.share}</span>
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
            </div>

            <!-- Right Column: Sidebar -->
            <aside class="w-full lg:w-1/3 space-y-10">
                <!-- Editor Info Card -->
                <div class="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h3 class="text-xs font-bold tracking-widest text-tech-blue uppercase mb-4 flex items-center gap-2">
                        <span class="w-1.5 h-3 bg-blue-600 rounded-full"></span>
                        ${i18n.editor}
                    </h3>
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-lg">
                            PT
                        </div>
                        <div>
                            <h4 class="font-bold text-sm text-tech-blue">${i18n.editorName}</h4>
                            <p class="text-[10px] text-gray-400 font-medium">${i18n.editorTeam}</p>
                        </div>
                    </div>
                    <p class="text-xs text-slate-500 leading-relaxed">${i18n.editorDesc}</p>
                </div>

                <!-- Table of Contents Card (Sticky) -->
                <div class="bg-white rounded-2xl p-6 border border-slate-100 sticky top-28 shadow-sm">
                    <h3 class="text-xs font-bold tracking-widest text-tech-blue uppercase mb-4 flex items-center gap-2">
                        <span class="w-1.5 h-3 bg-blue-600 rounded-full"></span>
                        ${i18n.toc}
                    </h3>
                    <ul id="auto-toc" class="space-y-3 text-xs text-slate-500">
                        <!-- Populated by JS -->
                    </ul>
                </div>

                ${relatedHtml}

                <!-- CTA Card -->
                <div class="bg-gradient-to-br from-tech-blue to-blue-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg group">
                    <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-600/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
                    <h3 class="font-bold text-lg mb-2 relative z-10">${i18n.ctaTitle}</h3>
                    <p class="text-xs text-blue-200/90 leading-relaxed mb-6 relative z-10">${i18n.ctaDesc}</p>
                    <a href="${langPrefix}/contact" class="btn-coral inline-flex items-center justify-center w-full py-3 bg-white text-tech-blue hover:bg-blue-50 text-xs font-bold tracking-widest uppercase rounded-xl transition duration-300 relative z-10 shadow-sm">
                        ${i18n.ctaButton} →
                    </a>
                </div>
            </aside>
        </div>

        ${latestHtml}
    </article>

    <!-- Footer -->
    <footer class="py-16 md:py-20 text-center bg-white border-t border-gray-100">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-tech-blue font-bold text-2xl md:text-3xl mb-8 tracking-tighter uppercase">PROTECH</div>
            <div
                class="flex justify-center flex-wrap gap-6 md:gap-8 mb-10 text-[10px] md:text-xs font-bold tracking-widest text-gray-400">
                <a href="${langPrefix}/services" class="hover:text-blue-600 transition">${i18n.footer.services}</a>
                <a href="${langPrefix}/company" class="hover:text-blue-600 transition">${i18n.footer.company}</a>
                <a href="${langPrefix}/blog" class="hover:text-blue-600 transition">${i18n.footer.news}</a>
                <a href="${langPrefix}/blog" class="hover:text-blue-600 transition">${i18n.footer.blog}</a>
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

            // Auto TOC Generation
            const tocContainer = document.getElementById('auto-toc');
            const headings = document.querySelectorAll('.blog-content h2, .blog-content h3');
            
            if (tocContainer && headings.length > 0) {
                let h2Counter = 0;
                headings.forEach((h, index) => {
                    if (!h.id) {
                        h.id = 'section-' + (++h2Counter) + '-' + index;
                    }
                    
                    const li = document.createElement('li');
                    li.className = 'toc-item';
                    
                    const a = document.createElement('a');
                    a.href = '#' + h.id;
                    a.textContent = h.textContent;
                    a.className = 'hover:text-blue-600 transition duration-200 block py-1';
                    
                    if (h.tagName.toLowerCase() === 'h3') {
                        a.className += ' pl-4 text-[11px] text-slate-400';
                    } else {
                        a.className += ' font-medium';
                    }
                    
                    li.appendChild(a);
                    tocContainer.appendChild(li);
                });

                // Highlight Active TOC Item on scroll
                const observerOptions = {
                    root: null,
                    rootMargin: '-10% 0px -70% 0px',
                    threshold: 0
                };

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const id = entry.target.id;
                            const activeLink = document.querySelector('#auto-toc a[href="#' + id + '"]');
                            if (activeLink) {
                                document.querySelectorAll('#auto-toc a').forEach(link => {
                                    link.classList.remove('text-blue-600', 'font-bold');
                                    link.classList.add('text-slate-500');
                                });
                                activeLink.classList.add('text-blue-600', 'font-bold');
                                activeLink.classList.remove('text-slate-500');
                            }
                        }
                    });
                }, observerOptions);

                headings.forEach(h => observer.observe(h));
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

function generateSitemap(postsJa, postsEn, postsCn) {
    const today = isoDate(new Date().toISOString());

    const staticPages = [
        { urls: { ja: '', en: '/en', cn: '/cn' }, priority: '1.0', changefreq: 'weekly' },
        { urls: { ja: '/services', en: '/en/services', cn: '/cn/services' }, priority: '0.8', changefreq: 'monthly' },
        { urls: { ja: '/contact', en: '/en/contact', cn: '/cn/contact' }, priority: '0.8', changefreq: 'monthly' },
        { urls: { ja: '/company', en: '/en/company', cn: '/cn/company' }, priority: '0.7', changefreq: 'monthly' },
        { urls: { ja: '/blog', en: '/en/blog', cn: '/cn/blog' }, priority: '0.7', changefreq: 'weekly' },
        { urls: { ja: '/cases', en: '/en/cases', cn: '/cn/cases' }, priority: '0.7', changefreq: 'monthly' },
        { urls: { ja: '/cases/local-tourism' }, priority: '0.6', changefreq: 'monthly' },
        { urls: { ja: '/cases/huadiao-zuiji-guo', en: '/en/cases/huadiao-zuiji-guo', cn: '/cn/cases/huadiao-zuiji-guo' }, priority: '0.6', changefreq: 'monthly' },
        { urls: { ja: '/cases/cosmetics-brand' }, priority: '0.6', changefreq: 'monthly' },
        { urls: { ja: '/red' }, priority: '0.7', changefreq: 'monthly' },
        { urls: { ja: '/dianping' }, priority: '0.7', changefreq: 'monthly' },
        { urls: { ja: '/douyin' }, priority: '0.7', changefreq: 'monthly' },
        { urls: { ja: '/miniprogram' }, priority: '0.7', changefreq: 'monthly' },
        { urls: { ja: '/creative' }, priority: '0.6', changefreq: 'monthly' },
        { urls: { ja: '/kol' }, priority: '0.6', changefreq: 'monthly' },
        { urls: { ja: '/pricing' }, priority: '0.6', changefreq: 'monthly' },
        { urls: { ja: '/download' }, priority: '0.5', changefreq: 'monthly' },
        { urls: { ja: '/faq' }, priority: '0.5', changefreq: 'monthly' },
        { urls: { ja: '/inbound-ai' }, priority: '0.6', changefreq: 'monthly' },
        { urls: { ja: '/inbound-ai/2026-04-report' }, priority: '0.5', changefreq: 'monthly' },
        { urls: { ja: '/privacy' }, priority: '0.4', changefreq: 'yearly' },
        { urls: { ja: '/terms' }, priority: '0.4', changefreq: 'yearly' },
        { urls: { ja: '/tokushoho' }, priority: '0.4', changefreq: 'yearly' }
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

    const langs = ['ja', 'en', 'cn'];
    const langPrefixes = { ja: '', en: '/en', cn: '/cn' };
    const hreflangs = { ja: 'ja', en: 'en', cn: 'zh-Hans' };

    // 1. Static pages alternates
    for (const page of staticPages) {
        for (const lang of langs) {
            const url = page.urls[lang];
            if (url === undefined) continue;
            xml += `  <url>\n`;
            xml += `    <loc>${SITE_URL}${url}</loc>\n`;
            xml += `    <lastmod>${today}</lastmod>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            
            for (const l of langs) {
                if (page.urls[l] !== undefined) {
                    xml += `    <xhtml:link rel="alternate" hreflang="${hreflangs[l]}" href="${SITE_URL}${page.urls[l]}" />\n`;
                }
            }
            xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${page.urls.ja || url}" />\n`;
            xml += `  </url>\n\n`;
        }
    }

    // 2. Blog posts alternates
    const allSlugs = new Set([
        ...postsJa.map(p => p.slug),
        ...postsEn.map(p => p.slug),
        ...postsCn.map(p => p.slug)
    ]);

    for (const slug of allSlugs) {
        const postJa = postsJa.find(p => p.slug === slug);
        const postEn = postsEn.find(p => p.slug === slug);
        const postCn = postsCn.find(p => p.slug === slug);

        const available = { ja: postJa, en: postEn, cn: postCn };

        for (const lang of langs) {
            const post = available[lang];
            if (!post) continue;

            const prefix = langPrefixes[lang];
            const url = `${prefix}/blog/${slug}`;

            xml += `  <url>\n`;
            xml += `    <loc>${SITE_URL}${url}</loc>\n`;
            xml += `    <lastmod>${isoDate(post.date)}</lastmod>\n`;
            xml += `    <changefreq>monthly</changefreq>\n`;
            xml += `    <priority>0.6</priority>\n`;

            for (const l of langs) {
                if (available[l]) {
                    const lp = langPrefixes[l];
                    xml += `    <xhtml:link rel="alternate" hreflang="${hreflangs[l]}" href="${SITE_URL}${lp}/blog/${slug}" />\n`;
                }
            }
            if (available.ja) {
                xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/blog/${slug}" />\n`;
            }
            xml += `  </url>\n\n`;
        }
    }

    xml += `</urlset>`;
    return xml;
}

// ─── Generate RSS Feed ────────────────────────────────────

function generateRSS(posts, lang) {
    const now = new Date().toUTCString();
    const langPrefix = lang === 'ja' ? '' : `/${lang}`;
    const rssFile = lang === 'ja' ? 'rss.xml' : `${lang}/rss.xml`;
    
    const title = lang === 'en' ? 'PROTECH Blog' : (lang === 'cn' ? 'PROTECH 博客' : 'PROTECH株式会社 ブログ');
    const desc = lang === 'en' ? 'Latest news, marketing, and strategy insights from PROTECH' : (lang === 'cn' ? 'PROTECH 的最新动态、市场营销和技术开发见解' : 'PROTECHの最新ニュース、マーケティング情報、事例紹介');

    let items = '';
    for (const post of posts) {
        items += `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}${langPrefix}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}${langPrefix}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category>${categoryLabel(post.category, lang)}</category>
    </item>
`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${title}</title>
    <link>${SITE_URL}${langPrefix}</link>
    <description>${desc}</description>
    <language>${lang === 'cn' ? 'zh-cn' : lang}</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/${rssFile}" rel="self" type="application/rss+xml"/>
${items}  </channel>
</rss>`;
}

function preserveMarkedSitemapBlocks(xml) {
    const sitemapPath = path.join(ROOT, 'sitemap.xml');
    if (!fs.existsSync(sitemapPath)) return xml;

    const current = fs.readFileSync(sitemapPath, 'utf-8');
    const markers = [
        ['  <!-- TRAVEL_GUIDES_I18N_START -->', '  <!-- TRAVEL_GUIDES_I18N_END -->']
    ];

    let merged = xml;
    for (const [start, end] of markers) {
        const currentBlock = current.match(new RegExp(`${start}[\\s\\S]*?${end}`));
        if (!currentBlock || merged.includes(start)) continue;
        merged = merged.replace('</urlset>', `${currentBlock[0]}\n</urlset>`);
    }
    return merged;
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
                    class="text-[9px] font-bold ${categoryClasses(post.category)} px-3 py-1 rounded w-fit uppercase tracking-widest">${categoryLabel(post.category, 'ja')}</span>
                <h3 class="flex-1 font-bold text-[15px] group-hover:text-blue-600 transition">${post.title}</h3>
                <span
                    class="hidden md:block text-slate-200 group-hover:text-blue-600 transition translate-x-0 group-hover:translate-x-2">→</span>
            </a>`;
    }

    const startMarker = '<!-- BLOG_POSTS_START -->';
    const endMarker = '<!-- BLOG_POSTS_END -->';

    if (html.includes(startMarker)) {
        const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, 'g');
        html = html.replace(regex, `${startMarker}\n${blogEntries}\n            ${endMarker}`);
    } else {
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

function generateBlogListingHTML(posts, lang) {
    const langPrefix = lang === 'ja' ? '' : `/${lang}`;
    const i18n = BLOG_I18N[lang] || BLOG_I18N.en;
    const translations = {
        ...i18n.listing,
        news: i18n.categories.news,
        service: i18n.categories.service,
        case: i18n.categories.case
    };

    let postItems = '';
    for (const post of posts) {
        const catLabel = { news: translations.news, service: translations.service, case: translations.case }[post.category] || post.category;
        postItems += `
            <a href="${langPrefix}/blog/${post.slug}"
                class="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                data-category="${post.category}" data-aos="fade-up">
                ${post.image ? `<div class="aspect-video overflow-hidden">
                    <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                </div>` : ''}
                <div class="p-6 md:p-8">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="text-xs text-gray-400 font-mono tracking-tighter">${formatDate(post.date)}</span>
                        <span class="text-[9px] font-bold ${categoryClasses(post.category)} px-3 py-1 rounded uppercase tracking-widest">${catLabel}</span>
                    </div>
                    <h3 class="font-bold text-lg text-tech-blue group-hover:text-blue-600 transition mb-3 leading-snug">${post.title}</h3>
                    <p class="text-sm text-gray-400 line-clamp-2 leading-relaxed">${post.description}</p>
                    <div class="mt-6 text-xs font-bold text-blue-600 tracking-widest uppercase flex items-center gap-2">
                        ${translations.readMore} <span class="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                </div>
            </a>`;
    }

    return `<!DOCTYPE html>
<html lang="${lang === 'cn' ? 'zh-CN' : lang}" translate="no">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${translations.title}</title>
    <link rel="icon" type="image/png" href="/assets/images/favicon.png">

    <meta name="description" content="${translations.description}">
    <link rel="canonical" href="${SITE_URL}${langPrefix}/blog">
    <link rel="alternate" type="application/rss+xml" title="PROTECH Blog RSS" href="${SITE_URL}${langPrefix === '' ? '' : langPrefix}/rss.xml">
    
    <!-- Hreflang Tags for Blog Listing -->
    <link rel="alternate" hreflang="ja" href="${SITE_URL}/blog" />
    <link rel="alternate" hreflang="en" href="${SITE_URL}/en/blog" />
    <link rel="alternate" hreflang="zh-Hans" href="${SITE_URL}/cn/blog" />
    <link rel="alternate" hreflang="x-default" href="${SITE_URL}/blog" />

    <meta property="og:title" content="${translations.title}">
    <meta property="og:description" content="${translations.description}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${SITE_URL}${langPrefix}/blog">
    <meta property="og:image" content="${SITE_URL}/assets/images/favicon.png">

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
            <a href="${langPrefix}/"
                class="text-xl md:text-2xl font-bold tracking-tighter text-tech-blue z-50 relative">PROTECH</a>
            <div class="hidden md:flex space-x-10 text-sm font-bold tracking-widest items-center uppercase">
                <a href="${langPrefix}/" class="hover:text-blue-600 transition">${i18n.nav.top}</a>
                <a href="${langPrefix}/services" class="hover:text-blue-600 transition">${i18n.nav.services}</a>
                <a href="${langPrefix}/company" class="hover:text-blue-600 transition">${i18n.nav.company}</a>
                <a href="${langPrefix}/blog" class="hover:text-blue-600 transition">${i18n.nav.news}</a>
                <a href="${langPrefix}/blog" class="text-blue-600 font-bold">${i18n.nav.blog}</a>
                <a href="${langPrefix}/contact" class="hover:text-blue-600 transition">${i18n.nav.contact}</a>
                
                <!-- Premium Language Dropdown -->
                <div class="relative group ml-4">
                    <button class="flex items-center gap-1 hover:text-blue-600 font-bold transition text-tech-blue cursor-pointer">
                        🌐 ${lang.toUpperCase()}
                    </button>
                    <div class="absolute right-0 top-full mt-2 w-28 bg-white border border-gray-100 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 py-1">
                        <a href="${SITE_URL}/blog" class="block px-4 py-2 text-xs text-gray-700 hover:bg-slate-50 transition">日本語</a>
                        <a href="${SITE_URL}/en/blog" class="block px-4 py-2 text-xs text-gray-700 hover:bg-slate-50 transition">English</a>
                        <a href="${SITE_URL}/cn/blog" class="block px-4 py-2 text-xs text-gray-700 hover:bg-slate-50 transition">简体中文</a>
                    </div>
                </div>
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
            <a href="${langPrefix}/" class="text-lg font-bold text-slate-700">${i18n.nav.top}</a>
            <a href="${langPrefix}/services" class="text-lg font-bold text-slate-700">${i18n.nav.services}</a>
            <a href="${langPrefix}/company" class="text-lg font-bold text-slate-700">${i18n.nav.company}</a>
            <a href="${langPrefix}/blog" class="text-lg font-bold text-slate-700">${i18n.nav.news}</a>
            <a href="${langPrefix}/blog" class="text-lg font-bold text-blue-600">${i18n.nav.blog}</a>
            <a href="${langPrefix}/contact" class="text-lg font-bold text-slate-700">${i18n.nav.contact}</a>
            
            <!-- Language Selection Mobile -->
            <div class="flex gap-4 border-t border-gray-100 pt-6 mt-4 w-full justify-center text-xs">
                <a href="${SITE_URL}/blog" class="text-slate-500 hover:text-blue-600 font-bold">JP</a>
                <a href="${SITE_URL}/en/blog" class="text-slate-500 hover:text-blue-600 font-bold">EN</a>
                <a href="${SITE_URL}/cn/blog" class="text-slate-500 hover:text-blue-600 font-bold">CN</a>
            </div>
        </div>
    </div>

    <main class="max-w-6xl mx-auto px-8 pt-40 md:pt-48 pb-20">
        <header class="mb-16 border-b border-gray-100 pb-16" data-aos="fade-up">
            <p class="text-tech-blue text-[10px] font-bold tracking-[0.3em] uppercase mb-4">${translations.kicker}</p>
            <h1 class="text-4xl md:text-5xl font-bold serif text-tech-blue mb-6 uppercase tracking-widest">${translations.heading}</h1>
            <p class="text-gray-400 text-xs tracking-[0.2em] font-light">${translations.subheading}</p>
        </header>

        <div id="filter-controls"
            class="flex gap-10 text-[10px] tracking-[0.2em] uppercase mb-12 border-b border-gray-100 pb-4"
            data-aos="fade-up">
            <button data-filter="all" class="filter-btn active">${translations.all}</button>
            <button data-filter="news" class="filter-btn">${translations.news}</button>
            <button data-filter="service" class="filter-btn">${translations.service}</button>
            <button data-filter="case" class="filter-btn">${translations.case}</button>
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
                <a href="${langPrefix}/services" class="hover:text-blue-600 transition">${i18n.footer.services}</a>
                <a href="${langPrefix}/company" class="hover:text-blue-600 transition">${i18n.footer.company}</a>
                <a href="${langPrefix}/blog" class="hover:text-blue-600 transition">${i18n.footer.news}</a>
                <a href="${langPrefix}/blog" class="hover:text-blue-600 transition">${i18n.footer.blog}</a>
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
    console.log('\n🔨 PROTECH Blog Build System (Multi-Language)\n');

    // 1. Resolve posts directories
    const postsDirJa = path.join(ROOT, 'blog', 'posts');
    const postsDirEn = path.join(ROOT, 'en', 'blog', 'posts');
    const postsDirCn = path.join(ROOT, 'cn', 'blog', 'posts');

    // 2. Read posts for all tracks
    const postsJa = readPosts(postsDirJa, 'ja');
    const postsEn = readPosts(postsDirEn, 'en');
    const postsCn = readPosts(postsDirCn, 'cn');

    console.log(`📄 Found blog posts: JA: ${postsJa.length}, EN: ${postsEn.length}, CN: ${postsCn.length}`);

    // Create target output directories
    const outputDirJa = path.join(ROOT, 'blog');
    const outputDirEn = path.join(ROOT, 'en', 'blog');
    const outputDirCn = path.join(ROOT, 'cn', 'blog');

    fs.mkdirSync(outputDirJa, { recursive: true });
    fs.mkdirSync(outputDirEn, { recursive: true });
    fs.mkdirSync(outputDirCn, { recursive: true });

    // 3. Generate HTML for all articles
    const allPosts = [...postsJa, ...postsEn, ...postsCn];

    for (const post of allPosts) {
        const hasJa = postsJa.some(p => p.slug === post.slug);
        const hasEn = postsEn.some(p => p.slug === post.slug);
        const hasCn = postsCn.some(p => p.slug === post.slug);
        const availableLangs = { ja: hasJa, en: hasEn, cn: hasCn };

        let targetDir = outputDirJa;
        let postsOfLang = postsJa;
        if (post.lang === 'en') {
            targetDir = outputDirEn;
            postsOfLang = postsEn;
        }
        if (post.lang === 'cn') {
            targetDir = outputDirCn;
            postsOfLang = postsCn;
        }

        const htmlFile = path.join(targetDir, `${post.slug}.html`);
        fs.writeFileSync(htmlFile, generatePostHTML(post, availableLangs, postsOfLang), 'utf-8');
        console.log(`  ✅ blog/${post.lang}/${post.slug}.html`);
    }

    // 4. Generate blog.html listing page for each language
    fs.writeFileSync(path.join(ROOT, 'blog.html'), generateBlogListingHTML(postsJa, 'ja'), 'utf-8');
    fs.writeFileSync(path.join(ROOT, 'en', 'blog.html'), generateBlogListingHTML(postsEn, 'en'), 'utf-8');
    fs.writeFileSync(path.join(ROOT, 'cn', 'blog.html'), generateBlogListingHTML(postsCn, 'cn'), 'utf-8');
    console.log(`  ✅ blog.html listing pages (JA, EN, CN)`);

    // 5. Generate dynamic sitemap.xml
    const sitemapContent = preserveMarkedSitemapBlocks(generateSitemap(postsJa, postsEn, postsCn));
    fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapContent, 'utf-8');
    console.log(`🗺  sitemap.xml updated`);

    // 6. Generate localized RSS feeds
    fs.writeFileSync(path.join(ROOT, 'rss.xml'), generateRSS(postsJa, 'ja'), 'utf-8');
    fs.writeFileSync(path.join(ROOT, 'en', 'rss.xml'), generateRSS(postsEn, 'en'), 'utf-8');
    fs.writeFileSync(path.join(ROOT, 'cn', 'rss.xml'), generateRSS(postsCn, 'cn'), 'utf-8');
    console.log(`📡 Localized rss.xml feeds generated`);

    // 7. Inject Japanese entries into news.html
    injectIntoNews(postsJa);

    console.log('\n✨ Build complete!\n');

    return allPosts.map(p => `${SITE_URL}${p.lang === 'ja' ? '' : '/' + p.lang}/blog/${p.slug}`);
}

const urls = build();
module.exports = { build, SITE_URL };
