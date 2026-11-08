#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FRONTEND = path.join(ROOT, 'frontend');
const SITE_ORIGIN = 'https://pro-tech.jp';

function walk(dir, predicate, files = []) {
    for (const name of fs.readdirSync(dir)) {
        const filePath = path.join(dir, name);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath, predicate, files);
        } else if (predicate(filePath)) {
            files.push(filePath);
        }
    }
    return files;
}

function relative(filePath) {
    return path.relative(ROOT, filePath);
}

function stripScriptContent(html) {
    return html.replace(/<script\b[\s\S]*?<\/script>/gi, '');
}

function getAttr(tag, attrName) {
    const match = tag.match(new RegExp(`\\b${attrName}\\s*=\\s*"([^"]*)"`, 'i')) ||
                  tag.match(new RegExp(`\\b${attrName}\\s*=\\s*'([^']*)'`, 'i'));
    return match ? match[1] : '';
}

function tags(html, tagName) {
    return [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, 'gi'))].map(match => match[0]);
}

function stripLocalUrl(raw) {
    if (!raw) return null;

    const url = raw.trim().replace(/&amp;/g, '&');
    if (!url || url.startsWith('#') || url.includes('${')) return null;
    if (/^(mailto:|tel:|data:|javascript:|sms:|weixin:|\/\/)/i.test(url)) return null;
    if (/^https?:/i.test(url)) {
        try {
            const parsed = new URL(url);
            if (parsed.origin !== SITE_ORIGIN) return null;
            return parsed.pathname === '/' ? '/' : parsed.pathname;
        } catch (_) {
            return null;
        }
    }

    const withoutHash = url.split('#')[0];
    return withoutHash.split('?')[0];
}

function targetCandidates(fromFile, rawUrl) {
    const url = stripLocalUrl(rawUrl);
    if (!url) return [];

    let decoded;
    try {
        decoded = decodeURI(url);
    } catch (_) {
        decoded = url;
    }

    const basePath = decoded.startsWith('/')
        ? path.join(FRONTEND, decoded)
        : path.resolve(path.dirname(fromFile), decoded);

    const candidates = [basePath];
    if (url.endsWith('/')) candidates.push(path.join(basePath, 'index.html'));
    if (!path.extname(basePath)) {
        candidates.push(`${basePath}.html`);
        candidates.push(path.join(basePath, 'index.html'));
    }
    return candidates;
}

function localReferenceExists(fromFile, rawUrl) {
    const candidates = targetCandidates(fromFile, rawUrl);
    return candidates.length === 0 || candidates.some(candidate => fs.existsSync(candidate));
}

function siteUrlExists(rawUrl) {
    let url;
    try {
        url = new URL(rawUrl);
    } catch (_) {
        return true;
    }
    if (url.origin !== SITE_ORIGIN) return true;

    let pathname;
    try {
        pathname = decodeURI(url.pathname);
    } catch (_) {
        pathname = url.pathname;
    }

    const candidates = pathname === '/'
        ? [path.join(FRONTEND, 'index.html')]
        : [
            path.join(FRONTEND, pathname),
            path.join(FRONTEND, `${pathname}.html`),
            path.join(FRONTEND, pathname, 'index.html')
        ];
    return candidates.some(candidate => fs.existsSync(candidate));
}

function findMalformedMetaTags(filePath, html, issues) {
    for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
        const tag = match[0];
        if (!/\bcontent\s*=\s*"/i.test(tag)) continue;

        const parsedSpans = [];
        for (const attr of tag.matchAll(/\s[^\s=]+\s*=\s*"[^"]*"/g)) {
            parsedSpans.push([attr.index, attr.index + attr[0].length]);
        }

        let remainder = tag;
        for (const [start, end] of parsedSpans.slice().reverse()) {
            remainder = `${remainder.slice(0, start)} ${remainder.slice(end)}`;
        }
        remainder = remainder
            .replace(/^<meta\b/i, '')
            .replace(/\/?>$/i, '')
            .trim();

        if (remainder) {
            issues.push({
                file: relative(filePath),
                type: 'malformed-meta',
                detail: tag.slice(0, 160)
            });
        }
    }
}

function checkPageBasics(filePath, html, issues) {
    const relPath = relative(filePath);
    const isAdmin = relPath.startsWith('frontend/admin/');

    // Skip basic page validation for redirect pages
    if (html.includes('http-equiv="refresh"') || html.includes('http-equiv=\'refresh\'') || html.includes('http-equiv=refresh')) {
        return;
    }

    if (!isAdmin && !/<title\b[^>]*>[^<]{5,}<\/title>/i.test(html)) {
        issues.push({
            file: relPath,
            type: 'missing-title',
            detail: 'Page should have a descriptive title.'
        });
    }

    const hasDescription = tags(html, 'meta').some(tag => {
        const name = getAttr(tag, 'name').toLowerCase();
        const content = getAttr(tag, 'content').trim();
        return name === 'description' && content.length >= 20;
    });
    if (!isAdmin && !hasDescription) {
        issues.push({
            file: relPath,
            type: 'missing-description',
            detail: 'Page should have a meta description of at least 20 characters.'
        });
    }

    const canonical = tags(html, 'link')
        .filter(tag => getAttr(tag, 'rel').split(/\s+/).includes('canonical'))
        .map(tag => getAttr(tag, 'href'))[0];
    const ogUrl = tags(html, 'meta')
        .filter(tag => getAttr(tag, 'property') === 'og:url' || getAttr(tag, 'name') === 'og:url')
        .map(tag => getAttr(tag, 'content'))[0];

    if (canonical && canonical.startsWith(SITE_ORIGIN) && canonical.length > SITE_ORIGIN.length && canonical.endsWith('/')) {
        issues.push({
            file: relPath,
            type: 'canonical-trailing-slash',
            detail: canonical
        });
    }

    if (canonical && ogUrl && canonical !== ogUrl) {
        issues.push({
            file: relPath,
            type: 'canonical-og-mismatch',
            detail: `${canonical} != ${ogUrl}`
        });
    }

    for (const tag of tags(html, 'img')) {
        if (!/\balt\s*=\s*["'][^"']*["']/i.test(tag)) {
            issues.push({
                file: relPath,
                type: 'missing-image-alt',
                detail: tag.slice(0, 160)
            });
        }
    }

    const publicPlaceholderPattern = /Content Assets Needed|placeholder image|真实评价展示位|Verified review slot|実績レビュー枠|This page has moved|页面已迁移|ページが移動しました/i;
    if (publicPlaceholderPattern.test(html)) {
        issues.push({
            file: relPath,
            type: 'public-placeholder-copy',
            detail: 'Remove internal placeholder or migration copy from public pages.'
        });
    }
}

function checkHtmlFiles(issues) {
    const htmlFiles = walk(FRONTEND, filePath => filePath.endsWith('.html'));

    for (const filePath of htmlFiles) {
        const html = stripScriptContent(fs.readFileSync(filePath, 'utf8'));
        findMalformedMetaTags(filePath, html, issues);
        checkPageBasics(filePath, html, issues);

        for (const match of html.matchAll(/\b(href|src|action|poster)\s*=\s*["']([^"']+)["']/gi)) {
            if (!localReferenceExists(filePath, match[2])) {
                issues.push({
                    file: relative(filePath),
                    type: 'missing-local-reference',
                    detail: `${match[1]}="${match[2]}"`
                });
            }
        }

        for (const match of html.matchAll(/\bsrcset\s*=\s*["']([^"']+)["']/gi)) {
            for (const item of match[1].split(',')) {
                const rawUrl = item.trim().split(/\s+/)[0];
                if (!localReferenceExists(filePath, rawUrl)) {
                    issues.push({
                        file: relative(filePath),
                        type: 'missing-local-reference',
                        detail: `srcset="${rawUrl}"`
                    });
                }
            }
        }

        const headUrlPatterns = [
            /<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/gi,
            /<link\b[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*>/gi,
            /<meta\b[^>]*(?:property|name)=["']og:url["'][^>]*content=["']([^"']+)["'][^>]*>/gi
        ];

        for (const pattern of headUrlPatterns) {
            for (const match of html.matchAll(pattern)) {
                if (!siteUrlExists(match[1])) {
                    issues.push({
                        file: relative(filePath),
                        type: 'broken-head-url',
                        detail: match[1]
                    });
                }
            }
        }
    }
}

function checkCssFiles(issues) {
    const cssFiles = walk(FRONTEND, filePath => filePath.endsWith('.css'));

    for (const filePath of cssFiles) {
        const css = fs.readFileSync(filePath, 'utf8');
        for (const match of css.matchAll(/url\((['"]?)([^)'"]+)\1\)/gi)) {
            if (!localReferenceExists(filePath, match[2])) {
                issues.push({
                    file: relative(filePath),
                    type: 'missing-css-reference',
                    detail: `url(${match[2]})`
                });
            }
        }
    }
}

function checkSitemap(issues) {
    const sitemapPath = path.join(FRONTEND, 'sitemap.xml');
    if (!fs.existsSync(sitemapPath)) return;

    const sitemap = fs.readFileSync(sitemapPath, 'utf8');
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
    const duplicateLocs = [...new Set(locs.filter((loc, index) => locs.indexOf(loc) !== index))];

    for (const loc of duplicateLocs) {
        issues.push({
            file: relative(sitemapPath),
            type: 'duplicate-sitemap-url',
            detail: loc
        });
    }

    for (const loc of locs) {
        if (loc.startsWith(SITE_ORIGIN) && loc.length > SITE_ORIGIN.length && loc.endsWith('/')) {
            issues.push({
                file: relative(sitemapPath),
                type: 'sitemap-trailing-slash',
                detail: loc
            });
        }
    }

    const patterns = [
        /<loc>([^<]+)<\/loc>/g,
        /href="(https:\/\/pro-tech\.jp[^"]+)"/g
    ];

    for (const pattern of patterns) {
        for (const match of sitemap.matchAll(pattern)) {
            if (!siteUrlExists(match[1])) {
                issues.push({
                    file: relative(sitemapPath),
                    type: 'broken-sitemap-url',
                    detail: match[1]
                });
            }
        }
    }
}

function main() {
    const issues = [];
    checkHtmlFiles(issues);
    checkCssFiles(issues);
    checkSitemap(issues);

    if (issues.length === 0) {
        console.log('Site check passed.');
        return;
    }

    console.error(`Site check found ${issues.length} issue(s):`);
    for (const issue of issues) {
        console.error(`- ${issue.type}: ${issue.file} :: ${issue.detail}`);
    }
    process.exitCode = 1;
}

main();
