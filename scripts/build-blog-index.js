#!/usr/bin/env node

/**
 * Build the Japanese /blog index, category hubs, and qualified tag hubs
 * from frontend/data/blog-index.json.
 *
 * Does not render individual articles, does not rewrite frontend/index.html,
 * and only adds or replaces /blog/category/* and /blog/tag/* sitemap URLs.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const FRONTEND = path.join(ROOT, 'frontend');
const INDEX_PATH = path.join(FRONTEND, 'data', 'blog-index.json');
const BLOG_HTML = path.join(FRONTEND, 'blog.html');
const SITEMAP_PATH = path.join(FRONTEND, 'sitemap.xml');
const HOME_HTML = path.join(FRONTEND, 'index.html');
const SITE = 'https://pro-tech.jp';
const REDIRECT_POSTS = new Set([
    'kol-koc-meaning-fee-2026.html',
    'what-is-inbound-demand.html'
]);

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function esc(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function jsonLd(value) {
    return JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
}

function hashFile(filePath) {
    return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function loadModel() {
    const data = readJson(INDEX_PATH);
    const categories = data.categories || [];
    const categoryById = Object.fromEntries(categories.map((category) => [category.id, category]));
    const tags = [];
    for (const group of data.tagGroups || []) {
        for (const tag of group.tags || []) {
            tags.push({ ...tag, groupId: group.id, groupLabel: group.label });
        }
    }
    const tagBySlug = Object.fromEntries(tags.map((tag) => [tag.slug, tag]));
    const items = data.items || [];

    if (!Number.isInteger(data.hubThreshold) || data.hubThreshold < 1) {
        throw new Error('hubThreshold must be a positive integer');
    }
    if (new Set(categories.map((category) => category.id)).size !== categories.length) {
        throw new Error('Duplicate category id');
    }
    if (categories.length !== 5) {
        throw new Error('Expected the 5 fixed primary categories');
    }
    if (new Set(tags.map((tag) => tag.slug)).size !== tags.length) {
        throw new Error('Duplicate tag slug');
    }
    if ((data.tagGroups || []).length !== 5) {
        throw new Error('Expected 5 controlled tag groups');
    }

    const slugs = new Set();
    for (const item of items) {
        if (!item.slug || slugs.has(item.slug)) throw new Error(`Duplicate or missing slug: ${item.slug}`);
        slugs.add(item.slug);
        if (!categoryById[item.category]) throw new Error(`${item.slug}: unknown category ${item.category}`);
        if (!Array.isArray(item.tags) || item.tags.length < 2 || item.tags.length > 5) {
            throw new Error(`${item.slug}: expected 2–5 tags`);
        }
        for (const slug of item.tags) {
            if (!tagBySlug[slug]) throw new Error(`${item.slug}: unknown tag ${slug}`);
        }
        if (item.kind === 'post') {
            if (!item.url.startsWith('/blog/')) throw new Error(`${item.slug}: post URL must stay on /blog`);
            if (item.category === 'cases') throw new Error(`${item.slug}: posts cannot use the cases category`);
        } else if (item.kind === 'case') {
            if (!item.url.startsWith('/cases/')) throw new Error(`${item.slug}: case cards must link to canonical /cases URLs`);
            if (item.category !== 'cases') throw new Error(`${item.slug}: case cards must use the cases category`);
        } else {
            throw new Error(`${item.slug}: kind must be post or case`);
        }
        if (!item.title || !item.excerpt || !item.image) throw new Error(`${item.slug}: title, excerpt, and image are required`);
        if (REDIRECT_POSTS.has(`${item.slug}.html`)) throw new Error(`${item.slug}: redirect stub must not be indexed`);
    }

    const posts = items.filter((item) => item.kind === 'post');
    const cases = items.filter((item) => item.kind === 'case');
    const livePosts = fs.readdirSync(path.join(FRONTEND, 'blog'))
        .filter((name) => name.endsWith('.html') && !REDIRECT_POSTS.has(name));
    const indexedPosts = new Set(posts.map((item) => `${item.slug}.html`));
    for (const name of livePosts) {
        if (!indexedPosts.has(name)) throw new Error(`Live post is missing from blog-index.json: ${name}`);
    }
    for (const name of indexedPosts) {
        if (!fs.existsSync(path.join(FRONTEND, 'blog', name))) throw new Error(`Indexed post has no HTML file: ${name}`);
    }
    if (cases.length !== 3) throw new Error(`Expected 3 case cards, found ${cases.length}`);

    const spotlightSlugs = (data.spotlight && data.spotlight.slugs) || [];
    if (spotlightSlugs.length < 1) throw new Error('Seasonal spotlight needs at least one slug');
    for (const slug of spotlightSlugs) {
        const item = items.find((entry) => entry.slug === slug);
        if (!item || item.category !== 'seasonal') throw new Error(`Spotlight slug must be a seasonal post: ${slug}`);
    }

    for (const item of items) {
        if (/^https?:/i.test(item.image)) continue;
        const imagePath = path.join(FRONTEND, item.image.replace(/^\//, ''));
        if (!fs.existsSync(imagePath)) throw new Error(`${item.slug}: missing image ${item.image}`);
    }

    return { data, categories, categoryById, tags, tagBySlug, items, posts, cases };
}

function countsFor(items) {
    const categories = {};
    const tags = {};
    for (const item of items) {
        categories[item.category] = (categories[item.category] || 0) + 1;
        for (const tag of item.tags) tags[tag] = (tags[tag] || 0) + 1;
    }
    return { categories, tags };
}

function sortItems(items) {
    return items.slice().sort((a, b) => {
        if (a.sortDate && b.sortDate && a.sortDate !== b.sortDate) return a.sortDate < b.sortDate ? 1 : -1;
        if (a.sortDate && !b.sortDate) return -1;
        if (!a.sortDate && b.sortDate) return 1;
        return 0;
    });
}

function picture(item, eager) {
    const alt = esc(item.title);
    const loading = eager ? 'eager' : 'lazy';
    const imgClass = 'w-full h-full object-cover';
    if (/^https?:/i.test(item.image)) {
        return `<img src="${esc(item.image)}" alt="${alt}" class="${imgClass}" loading="${loading}" decoding="async">`;
    }
    const webp = item.image.replace(/\.(jpe?g|png)$/i, '.webp');
    const webpExists = webp !== item.image && fs.existsSync(path.join(FRONTEND, webp.replace(/^\//, '')));
    if (!webpExists) {
        return `<img src="${esc(item.image)}" alt="${alt}" class="${imgClass}" loading="${loading}" decoding="async">`;
    }
    return `<picture class="block h-full w-full"><source srcset="${esc(webp)}" type="image/webp"><img src="${esc(item.image)}" alt="${alt}" class="${imgClass}" loading="${loading}" decoding="async"></picture>`;
}

function searchText(item, tagBySlug) {
    const labels = item.tags.map((slug) => tagBySlug[slug].label);
    return [item.title, item.excerpt, labels.join(' ')].join(' ').toLowerCase();
}

function tagHref(tag, qualified) {
    return qualified ? `/blog/tag/${tag.slug}` : `/blog?tag=${encodeURIComponent(tag.slug)}`;
}

function cardHtml(item, context, extra) {
    const category = context.categoryById[item.category];
    const tags = item.tags.map((slug) => {
        const tag = context.tagBySlug[slug];
        const qualified = context.tagCounts[slug] >= context.data.hubThreshold;
        return `<a href="${esc(tagHref(tag, qualified))}" class="inline-flex max-w-full items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:border-tech-blue hover:text-tech-blue">${esc(tag.label)}</a>`;
    }).join('');
    const date = item.dateLabel
        ? `<span class="font-mono text-[11px] text-slate-400">${esc(item.dateLabel)}</span>${item.publishedLabel ? `<span class="text-[11px] text-slate-400">${esc(item.publishedLabel)}</span>` : ''}`
        : '<span class="text-[11px] font-bold text-slate-400">導入事例ページ</span>';
    const cta = item.kind === 'case' ? '事例ページを見る' : '続きを読む';
    return `<article class="blog-card min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm${extra ? ' is-extra' : ''}" data-slug="${esc(item.slug)}" data-category="${esc(item.category)}" data-tags="${esc(item.tags.join(' '))}" data-search="${esc(searchText(item, context.tagBySlug))}"${context.hubCard ? ' data-hub-card' : ''}>
        <a href="${esc(item.url)}" class="block aspect-video overflow-hidden bg-slate-100">${picture(item, false)}</a>
        <div class="p-5 sm:p-6">
            <div class="mb-3 flex flex-wrap items-center gap-2">
                ${date}
                <a href="${esc(category.path)}" class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-tech-blue">${esc(category.label)}</a>
            </div>
            <h3 class="mb-3 text-base font-bold leading-snug text-tech-blue"><a href="${esc(item.url)}" class="hover:text-coral">${esc(item.title)}</a></h3>
            <p class="line-clamp-3 text-sm leading-relaxed text-slate-500">${esc(item.excerpt)}</p>
            <div class="mt-4 flex flex-wrap gap-2">${tags}</div>
            <a href="${esc(item.url)}" class="mt-4 inline-flex text-xs font-bold tracking-wide text-blue-700">${cta} →</a>
        </div>
    </article>`;
}

function itemList(items) {
    return {
        '@type': 'ItemList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE}${item.url}`,
            name: item.title
        }))
    };
}

function breadcrumb(crumbs) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: crumb.item
        }))
    };
}

function collectionPage(name, description, url, items) {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name,
        description,
        url,
        inLanguage: 'ja',
        isPartOf: { '@type': 'WebSite', name: 'PROTECH', url: SITE },
        publisher: {
            '@type': 'Organization',
            name: 'PROTECH株式会社',
            url: SITE,
            logo: {
                '@type': 'ImageObject',
                url: `${SITE}/assets/images/favicon.png`,
                width: 974,
                height: 594
            }
        },
        mainEntity: itemList(items)
    };
}

function pageShell({ title, description, canonical, extraHead, nav, footer, body }) {
    return `<!DOCTYPE html>
<html lang="ja" translate="no">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)}</title>
    <link rel="icon" type="image/png" href="/assets/images/favicon.png">
    <meta name="description" content="${esc(description)}">
    <link rel="canonical" href="${esc(canonical)}">
    ${extraHead || ''}
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${esc(canonical)}">
    <meta property="og:image" content="${SITE}/assets/images/favicon.png">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Noto+Serif+JP:wght@600&display=swap" rel="stylesheet">
    <style>
        :root { --tech-blue: #001A33; --coral: #E86B7A; }
        html, body { max-width: 100%; overflow-x: hidden; }
        body { font-family: 'Noto Sans JP', sans-serif; -webkit-font-smoothing: antialiased; }
        .serif { font-family: 'Noto Serif JP', serif; }
        .glass-nav { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); }
        .btn-coral { background-color: #E86B7A !important; color: white !important; }
        .nav-link { transition: color 0.2s; }
        .nav-link:hover { color: #E86B7A !important; }
        .hamburger line { transition: all 0.3s ease; transform-origin: center; }
        .hamburger.active #line1 { transform: translateY(7px) rotate(45deg); }
        .hamburger.active #line2 { opacity: 0; }
        .hamburger.active #line3 { transform: translateY(-7px) rotate(-45deg); }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .blog-card.is-extra { display: none !important; }
        #category-tabs { scrollbar-width: none; }
        #category-tabs::-webkit-scrollbar { display: none; }
        .category-tab.is-active, .tag-pill.is-active { background: #001A33; color: #fff; border-color: #001A33; }
    </style>
    <script>
        tailwind.config = { theme: { extend: { colors: { 'tech-blue': '#001A33', coral: '#E86B7A' } } } };
    </script>
</head>
<body class="bg-white text-slate-900">
${nav}
${body}
${footer}
<script defer src="/assets/js/blog-taxonomy.js"></script>
<script defer src="/assets/js/consult-popup.js"></script>
</body>
</html>
`;
}

function extractChrome(html) {
    const navStart = html.indexOf('<!-- NAV -->');
    const mainStart = html.indexOf('<main');
    const footerStart = html.indexOf('<!-- FOOTER -->');
    const footerEnd = html.indexOf('</footer>', footerStart);
    if (navStart < 0 || mainStart < navStart || footerStart < 0 || footerEnd < 0) {
        throw new Error('blog.html is missing NAV, main, or FOOTER markers');
    }
    return {
        nav: html.slice(navStart, mainStart).trim(),
        footer: html.slice(footerStart, footerEnd + '</footer>'.length).trim()
    };
}

function renderBlog(context, chrome) {
    const { data, categories, items, tagBySlug, tagCounts } = context;
    const sorted = sortItems(items);
    const pageSize = data.pageSize || 12;
    const description = 'PROTECHのブログ。プラットフォーム運用、季節・旅行ガイド、集客ノウハウ・費用、市場データ、導入事例から記事を探せます。';
    const title = 'ブログ - PROTECH株式会社';
    const spotlightItems = data.spotlight.slugs.map((slug) => items.find((item) => item.slug === slug));
    const hotTags = context.tags
        .map((tag) => ({ ...tag, count: tagCounts[tag.slug] || 0 }))
        .filter((tag) => tag.count > 0)
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'ja'))
        .slice(0, 10);

    const tabs = [`<a href="/blog" data-category="all" class="category-tab shrink-0 whitespace-nowrap rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">すべて <span class="ml-1 text-[10px] opacity-70">${items.length}</span></a>`]
        .concat(categories.map((category) => {
            const count = context.categoryCounts[category.id] || 0;
            return `<a href="/blog?category=${esc(category.id)}" data-category="${esc(category.id)}" class="category-tab shrink-0 whitespace-nowrap rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">${esc(category.label)} <span class="ml-1 text-[10px] opacity-70">${count}</span></a>`;
        })).join('');

    const pills = hotTags.map((tag) => `<a href="/blog?tag=${esc(encodeURIComponent(tag.slug))}" data-filter-tag="${esc(tag.slug)}" class="tag-pill inline-flex max-w-full items-center rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600">${esc(tag.label)} <span class="ml-1 text-[10px] opacity-70">${tag.count}</span></a>`).join('');

    const drawer = data.tagGroups.map((group) => {
        const links = group.tags
            .map((tag) => ({ ...tag, count: tagCounts[tag.slug] || 0 }))
            .filter((tag) => tag.count > 0)
            .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'ja'))
            .map((tag) => {
                const qualified = tag.count >= data.hubThreshold;
                const hub = qualified ? `<a href="/blog/tag/${esc(tag.slug)}" class="text-[11px] font-bold text-blue-700 underline">一覧ページ</a>` : '';
                return `<li class="flex min-w-0 flex-wrap items-center gap-2"><a href="/blog?tag=${esc(encodeURIComponent(tag.slug))}" data-filter-tag="${esc(tag.slug)}" class="tag-pill inline-flex rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">${esc(tag.label)} <span class="ml-1 text-[10px] opacity-70">${tag.count}</span></a>${hub}</li>`;
            }).join('');
        return `<section class="min-w-0"><h3 class="mb-3 text-xs font-bold tracking-wide text-slate-400">${esc(group.label)}</h3><ul class="flex flex-col gap-2">${links}</ul></section>`;
    }).join('');

    const spotlight = spotlightItems.map((item, index) => `<a href="${esc(item.url)}" class="block w-[85%] shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm md:w-auto md:min-w-0">
        <div class="aspect-video overflow-hidden bg-slate-100">${picture(item, index === 0)}</div>
        <div class="p-4">
            ${item.spotlightLabel ? `<p class="mb-2 text-[10px] font-bold tracking-wide text-coral">${esc(item.spotlightLabel)}</p>` : ''}
            <h3 class="text-sm font-bold leading-snug text-tech-blue">${esc(item.title)}</h3>
        </div>
    </a>`).join('');

    const cards = sorted.map((item, index) => cardHtml(item, { ...context, hubCard: false }, index >= pageSize)).join('\n');
    const blogSchema = collectionPage(title, description, `${SITE}/blog`, sorted);
    blogSchema['@type'] = ['CollectionPage', 'Blog'];

    const extraHead = `<link rel="alternate" type="application/rss+xml" title="PROTECH Blog RSS" href="${SITE}/rss.xml">
    <link rel="alternate" hreflang="ja" href="${SITE}/blog">
    <link rel="alternate" hreflang="en" href="${SITE}/en/blog">
    <link rel="alternate" hreflang="zh-Hans" href="${SITE}/cn/blog">
    <link rel="alternate" hreflang="x-default" href="${SITE}/blog">
    <script type="application/ld+json">
${jsonLd(blogSchema)}
    </script>
    <script type="application/ld+json">
${jsonLd(breadcrumb([
        { name: 'ホーム', item: `${SITE}/` },
        { name: 'ブログ', item: `${SITE}/blog` }
    ]))}
    </script>`;

    const body = `<main class="mx-auto min-w-0 max-w-6xl px-4 pb-20 pt-28 sm:px-6 md:pt-36">
        <header class="mb-8 border-b border-slate-100 pb-8">
            <p class="mb-3 text-[10px] font-bold tracking-[0.2em] text-tech-blue">BLOG</p>
            <h1 class="serif mb-4 text-3xl font-bold text-tech-blue md:text-5xl">ブログ</h1>
            <p class="max-w-3xl text-sm leading-relaxed text-slate-500">プラットフォーム運用、季節の旅行ガイド、集客ノウハウと費用、市場データ、導入事例から探せます。キーワード検索とタグは、このページの中で記事を絞り込みます。</p>
        </header>
        <section class="mb-8 min-w-0" aria-labelledby="spotlight-heading">
            <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div class="min-w-0">
                    <h2 id="spotlight-heading" class="text-lg font-bold text-tech-blue">${esc(data.spotlight.title)}</h2>
                    <p class="mt-1 max-w-3xl text-sm leading-relaxed text-slate-500">${esc(data.spotlight.intro)}</p>
                </div>
                <a href="/blog/category/seasonal" class="text-xs font-bold text-blue-700">季節・旅行ガイドをすべて見る</a>
            </div>
            <div class="flex min-w-0 gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">${spotlight}</div>
        </section>
        <div class="sticky top-16 z-30 -mx-4 mb-6 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur md:top-20">
            <div id="category-tabs" class="flex max-w-full gap-2 overflow-x-auto" role="navigation" aria-label="カテゴリ">${tabs}</div>
        </div>
        <form class="mb-5 min-w-0" role="search" onsubmit="return false">
            <label for="blog-search" class="mb-2 block text-xs font-bold text-slate-500">キーワード検索</label>
            <input id="blog-search" type="search" enterkeyhint="search" placeholder="タイトル、抜粋、タグから探す" class="w-full min-w-0 rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-800 outline-none focus:border-tech-blue">
        </form>
        <div class="mb-4 flex min-w-0 flex-wrap gap-2" aria-label="人気のタグ">${pills}</div>
        <button id="tag-drawer-toggle" type="button" class="mb-4 text-sm font-bold text-tech-blue underline" aria-expanded="false" aria-controls="tag-drawer">すべてのタグを見る</button>
        <div id="tag-drawer" hidden class="mb-8 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-6">
            <div class="grid min-w-0 gap-6 md:grid-cols-2">${drawer}</div>
        </div>
        <p id="blog-summary" class="mb-4 text-xs font-bold text-slate-400"></p>
        <p id="blog-empty" hidden class="mb-6 rounded-xl bg-slate-50 px-4 py-6 text-sm text-slate-500">該当する記事がありません。カテゴリかタグの条件を変えて探してください。</p>
        <div id="blog-grid" class="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">${cards}</div>
        <div class="mt-8 text-center"><button id="blog-more" type="button" class="btn-coral rounded-full px-6 py-3 text-sm font-bold">もっと見る</button></div>
    </main>`;

    return pageShell({
        title,
        description,
        canonical: `${SITE}/blog`,
        extraHead,
        nav: chrome.nav,
        footer: chrome.footer,
        body
    });
}

function renderHub(page, items, context, chrome) {
    const sorted = sortItems(items);
    const pageSize = context.data.pageSize || 12;
    const cards = sorted.map((item, index) => cardHtml(item, { ...context, hubCard: true }, index >= pageSize)).join('\n');
    const more = sorted.length > pageSize ? '<div class="mt-8 text-center"><button id="hub-more" type="button" class="btn-coral rounded-full px-6 py-3 text-sm font-bold">もっと見る</button></div>' : '';
    const categoryLinks = context.categories.map((category) => {
        const current = page.kind === 'category' && category.id === page.id;
        return current
            ? `<span class="font-bold text-tech-blue" aria-current="page">${esc(category.label)}</span>`
            : `<a href="${esc(category.path)}" class="text-slate-500 hover:text-coral">${esc(category.label)}</a>`;
    }).join('<span class="text-slate-300" aria-hidden="true"> / </span>');
    const crumbs = [
        { name: 'ホーム', item: `${SITE}/` },
        { name: 'ブログ', item: `${SITE}/blog` },
        { name: page.h1, item: `${SITE}${page.path}` }
    ];
    const visibleCrumbs = crumbs.map((crumb, index) => index === crumbs.length - 1
        ? `<span class="text-slate-700" aria-current="page">${esc(crumb.name)}</span>`
        : `<a href="${esc(crumb.item.replace(SITE, '') || '/')}" class="text-blue-700">${esc(crumb.name)}</a>`).join('<span class="px-1 text-slate-300" aria-hidden="true">/</span>');
    const extraHead = `<script type="application/ld+json">
${jsonLd(collectionPage(page.title, page.description, `${SITE}${page.path}`, sorted))}
    </script>
    <script type="application/ld+json">
${jsonLd(breadcrumb(crumbs))}
    </script>`;
    const body = `<main class="mx-auto min-w-0 max-w-6xl px-4 pb-20 pt-28 sm:px-6 md:pt-36">
        <nav class="mb-6 flex flex-wrap gap-1 text-xs" aria-label="パンくず">${visibleCrumbs}</nav>
        <header class="mb-8 border-b border-slate-100 pb-8">
            <p class="mb-3 text-[10px] font-bold tracking-[0.2em] text-tech-blue">${esc(page.kicker)}</p>
            <h1 class="serif mb-4 text-3xl font-bold leading-tight text-tech-blue md:text-4xl">${esc(page.h1)}</h1>
            <p class="max-w-3xl text-sm leading-relaxed text-slate-500">${esc(page.intro)}</p>
            <p class="mt-4 text-xs font-bold text-slate-400">${sorted.length}件</p>
        </header>
        <div class="mb-8 flex min-w-0 flex-wrap gap-x-3 gap-y-2 text-xs">${categoryLinks}</div>
        <div class="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">${cards}</div>
        ${more}
        <p class="mt-10 text-sm"><a href="/blog" class="font-bold text-blue-700">ブログ一覧へ戻る</a></p>
    </main>`;
    return pageShell({
        title: page.title,
        description: page.description,
        canonical: `${SITE}${page.path}`,
        extraHead,
        nav: chrome.nav,
        footer: chrome.footer,
        body
    });
}

function hubPages(context) {
    const pages = [];
    for (const category of context.categories) {
        pages.push({
            kind: 'category',
            id: category.id,
            path: category.path,
            filePath: path.join(FRONTEND, 'blog', 'category', `${category.id}.html`),
            title: category.title,
            h1: category.h1,
            description: category.description,
            intro: category.intro,
            kicker: 'カテゴリ',
            items: context.items.filter((item) => item.category === category.id)
        });
    }
    for (const tag of context.tags) {
        const count = context.tagCounts[tag.slug] || 0;
        if (count < context.data.hubThreshold) continue;
        if (!tag.seo || !tag.seo.title || !tag.seo.h1 || !tag.seo.description || !tag.seo.intro) {
            throw new Error(`Tag ${tag.slug} has ${count} items and needs unique hub copy`);
        }
        pages.push({
            kind: 'tag',
            id: tag.slug,
            path: `/blog/tag/${tag.slug}`,
            filePath: path.join(FRONTEND, 'blog', 'tag', `${tag.slug}.html`),
            title: tag.seo.title,
            h1: tag.seo.h1,
            description: tag.seo.description,
            intro: tag.seo.intro,
            kicker: tag.groupLabel,
            items: context.items.filter((item) => item.tags.includes(tag.slug))
        });
    }
    return pages;
}

function writeHubs(pages, context, chrome) {
    const dirs = ['category', 'tag'].map((name) => path.join(FRONTEND, 'blog', name));
    for (const dir of dirs) fs.mkdirSync(dir, { recursive: true });
    const expected = new Set(pages.map((page) => page.filePath));
    for (const dir of dirs) {
        for (const name of fs.readdirSync(dir)) {
            const full = path.join(dir, name);
            if (name.endsWith('.html') && !expected.has(full)) fs.unlinkSync(full);
        }
    }
    for (const page of pages) {
        const html = renderHub(page, page.items, context, chrome);
        assertPage(html, `${SITE}${page.path}`);
        fs.writeFileSync(page.filePath, html);
    }
}

function assertPage(html, canonical) {
    if ((html.match(/rel="canonical"/g) || []).length !== 1) throw new Error(`Expected one canonical on ${canonical}`);
    if (!html.includes(`href="${canonical}"`)) throw new Error(`Missing canonical ${canonical}`);
    if (canonical.endsWith('/')) throw new Error(`Trailing slash canonical ${canonical}`);
    for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
        JSON.parse(match[1]);
    }
    if (!html.includes('consult-popup.js')) throw new Error(`Missing consult popup on ${canonical}`);
}

function syncSitemap(urls) {
    const original = fs.readFileSync(SITEMAP_PATH, 'utf8');
    const home = original.match(/<url>\s*<loc>https:\/\/pro-tech\.jp<\/loc>[\s\S]*?<\/url>/);
    if (!home) throw new Error('Homepage sitemap entry is missing');
    const withoutHubs = original.replace(/\n?  <url>\n    <loc>https:\/\/pro-tech\.jp\/blog\/(?:category|tag)\/[^<\s]+<\/loc>[\s\S]*?<\/url>/g, '');
    const blocks = urls.map((loc) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>2026-11-26</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>`).join('\n');
    if (!withoutHubs.includes('</urlset>')) throw new Error('sitemap is missing </urlset>');
    const next = withoutHubs.replace('</urlset>', `${blocks}\n</urlset>`);
    if (!next.includes(home[0])) throw new Error('Homepage sitemap entry changed');
    const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    const kept = locs(original).filter((loc) => !/\/blog\/(?:category|tag)\//.test(loc));
    const written = locs(next);
    for (const loc of kept) {
        if (!written.includes(loc)) throw new Error(`Refusing to delete sitemap URL: ${loc}`);
    }
    for (const loc of urls) {
        if ((written.filter((entry) => entry === loc).length) !== 1) throw new Error(`Sitemap URL was not added once: ${loc}`);
    }
    if (next.includes('<loc>https://pro-tech.jp/blog?</loc>') || next.includes('<loc>https://pro-tech.jp/blog?')) {
        throw new Error('Refusing to add a query-string URL to the sitemap');
    }
    fs.writeFileSync(SITEMAP_PATH, next);
}

function main() {
    const homeHash = hashFile(HOME_HTML);
    const model = loadModel();
    const counted = countsFor(model.items);
    model.categoryCounts = counted.categories;
    model.tagCounts = counted.tags;
    const chrome = extractChrome(fs.readFileSync(BLOG_HTML, 'utf8'));
    const blogHtml = renderBlog(model, chrome);
    assertPage(blogHtml, `${SITE}/blog`);
    if (!blogHtml.includes('rel="canonical" href="https://pro-tech.jp/blog"')) {
        throw new Error('/blog canonical changed');
    }
    fs.writeFileSync(BLOG_HTML, blogHtml);
    const pages = hubPages(model);
    writeHubs(pages, model, chrome);
    syncSitemap(pages.map((page) => `${SITE}${page.path}`));
    if (hashFile(HOME_HTML) !== homeHash) throw new Error('frontend/index.html was modified');

    const qualified = model.tags
        .map((tag) => ({ slug: tag.slug, label: tag.label, count: model.tagCounts[tag.slug] || 0 }))
        .filter((tag) => tag.count >= model.data.hubThreshold)
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'ja'));
    const thin = model.tags
        .map((tag) => ({ slug: tag.slug, label: tag.label, count: model.tagCounts[tag.slug] || 0 }))
        .filter((tag) => tag.count > 0 && tag.count < model.data.hubThreshold)
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'ja'));

    console.log(JSON.stringify({
        posts: model.posts.length,
        cases: model.cases.length,
        categories: model.categoryCounts,
        qualifiedTags: qualified,
        queryOnlyTags: thin,
        hubs: pages.map((page) => page.path)
    }, null, 2));
}

main();
