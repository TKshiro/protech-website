#!/usr/bin/env node
'use strict';

/**
 * Stamp local CSS/JS references with a deterministic cache-busting query.
 *
 * Each file under frontend/assets/css and frontend/assets/js gets an 8-character
 * SHA-256 of its bytes. Every HTML page under frontend/ then receives
 * ?v=<hash> on local <link href> and <script src> URLs (root-absolute or
 * relative). Existing ?v= values are replaced. External CDN URLs, images,
 * canonicals, JSON-LD, and sitemap.xml are left alone.
 *
 * Usage:
 *   node scripts/stamp-asset-versions.js
 *   node scripts/stamp-asset-versions.js --check
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FRONTEND = path.join(ROOT, 'frontend');
const LOCAL_HOSTS = new Set(['pro-tech.jp', 'www.pro-tech.jp']);
const ASSET_EXT = new Set(['.css', '.js', '.mjs']);

const hashCache = new Map();

function hashContent(filePath) {
    const cached = hashCache.get(filePath);
    if (cached) return cached;
    const hash = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex').slice(0, 8);
    hashCache.set(filePath, hash);
    return hash;
}

function walkHtml(dir, files = []) {
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) walkHtml(full, files);
        else if (stat.isFile() && name.endsWith('.html')) files.push(full);
    }
    return files;
}

function knownAssetFiles() {
    const files = [];
    for (const folder of ['css', 'js']) {
        const dir = path.join(FRONTEND, 'assets', folder);
        if (!fs.existsSync(dir)) continue;
        for (const name of fs.readdirSync(dir)) {
            if (!ASSET_EXT.has(path.extname(name).toLowerCase())) continue;
            const full = path.join(dir, name);
            if (fs.statSync(full).isFile()) files.push(full);
        }
    }
    return files.sort();
}

function isInsideFrontend(filePath) {
    const relative = path.relative(FRONTEND, filePath);
    return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function applyVersion(rawUrl, hash) {
    if (!/^[0-9a-f]{8}$/.test(hash)) throw new Error(`Asset hash must be 8 hex characters, got ${hash}`);
    const encodedAmp = rawUrl.includes('&amp;');
    const normalized = rawUrl.replace(/&amp;/g, '&');
    const hashIndex = normalized.indexOf('#');
    const fragment = hashIndex === -1 ? '' : normalized.slice(hashIndex);
    const beforeHash = hashIndex === -1 ? normalized : normalized.slice(0, hashIndex);
    const queryIndex = beforeHash.indexOf('?');
    const pathname = queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex);
    const query = queryIndex === -1 ? '' : beforeHash.slice(queryIndex + 1);
    const kept = query.split('&').filter((part) => part && part.split('=')[0] !== 'v');
    let next = `${pathname}?v=${hash}`;
    if (kept.length) next += `&${kept.join('&')}`;
    next += fragment;
    return encodedAmp ? next.replace(/&/g, '&amp;') : next;
}

function pathnameOf(rawUrl) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(rawUrl) || rawUrl.startsWith('//')) {
        const parsed = new URL(rawUrl, 'https://pro-tech.jp');
        return parsed.pathname;
    }
    const queryIndex = rawUrl.indexOf('?');
    const hashIndex = rawUrl.indexOf('#');
    let cut = rawUrl.length;
    if (queryIndex !== -1) cut = Math.min(cut, queryIndex);
    if (hashIndex !== -1) cut = Math.min(cut, hashIndex);
    return rawUrl.slice(0, cut);
}

function classifyAssetUrl(rawUrl, htmlFile) {
    const trimmed = String(rawUrl || '').trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('data:')) return { action: 'skip' };
    if (/[\s<>]/.test(trimmed) || trimmed.includes('${') || trimmed.includes('{{')) return { action: 'skip' };

    let pathname;
    if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) || trimmed.startsWith('//')) {
        let parsed;
        try {
            parsed = new URL(trimmed, 'https://pro-tech.jp');
        } catch (_) {
            return { action: 'skip' };
        }
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return { action: 'skip' };
        if (!LOCAL_HOSTS.has(parsed.hostname.toLowerCase())) return { action: 'skip' };
        pathname = parsed.pathname;
    } else {
        pathname = pathnameOf(trimmed);
    }

    let decoded = pathname;
    try {
        decoded = decodeURI(pathname);
    } catch (_) {
        decoded = pathname;
    }

    const ext = path.posix.extname(decoded.split('/').pop() || '').toLowerCase();
    if (!ASSET_EXT.has(ext)) return { action: 'skip' };

    const filePath = decoded.startsWith('/')
        ? path.resolve(FRONTEND, decoded.replace(/^\/+/, ''))
        : path.resolve(path.dirname(htmlFile), decoded);

    if (!isInsideFrontend(filePath) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        return { action: 'missing', detail: trimmed };
    }
    return { action: 'stamp', filePath, ext };
}

function readAssetAttr(tag) {
    const kind = /^<link\b/i.test(tag) ? 'link' : (/^<script\b/i.test(tag) ? 'script' : '');
    if (!kind) return null;
    const attr = kind === 'link' ? 'href' : 'src';
    const quoted = tag.match(new RegExp(`\\b(${attr})\\s*=\\s*(["'])([^"']*)\\2`, 'i'));
    if (quoted) return { raw: quoted[0], name: quoted[1], quote: quoted[2], value: quoted[3] };
    const bare = tag.match(new RegExp(`\\b(${attr})\\s*=\\s*([^\\s"'=<>\\\`]+)`, 'i'));
    if (bare) return { raw: bare[0], name: bare[1], quote: '', value: bare[2] };
    return null;
}

function renderAttr(attr, nextValue) {
    if (!attr.quote) return `${attr.name}=${nextValue}`;
    const index = attr.raw.lastIndexOf(attr.value);
    if (index === -1) return attr.raw;
    return attr.raw.slice(0, index) + nextValue + attr.raw.slice(index + attr.value.length);
}

function protectRegions(html) {
    const chunks = [];
    const masked = html.replace(/<!--[\s\S]*?-->|<script\b(?![^>]*\bsrc\s*=)[^>]*>[\s\S]*?<\/script>/gi, (block) => {
        const token = `\u0000STAMP${chunks.length}\u0000`;
        chunks.push(block);
        return token;
    });
    return { masked, chunks };
}

function restoreRegions(html, chunks) {
    return html.replace(/\u0000STAMP(\d+)\u0000/g, (_, index) => chunks[Number(index)]);
}

function stampHtml(html, htmlFile, issues = []) {
    const { masked, chunks } = protectRegions(html);
    let references = 0;
    const next = masked.replace(/<(?:link|script)\b[^>]*>/gi, (tag) => {
        const attr = readAssetAttr(tag);
        if (!attr) return tag;
        const classified = classifyAssetUrl(attr.value, htmlFile);
        if (classified.action === 'skip') return tag;
        if (classified.action === 'missing') {
            issues.push(`${path.relative(ROOT, htmlFile)}: missing local asset ${attr.value}`);
            return tag;
        }
        references += 1;
        const stamped = applyVersion(attr.value, hashContent(classified.filePath));
        if (stamped === attr.value) return tag;
        const rendered = renderAttr(attr, stamped);
        const index = tag.indexOf(attr.raw);
        if (index === -1) return tag;
        return tag.slice(0, index) + rendered + tag.slice(index + attr.raw.length);
    });
    return { html: restoreRegions(next, chunks), references };
}

function withAssetVersion(assetUrl) {
    const classified = classifyAssetUrl(assetUrl, path.join(FRONTEND, 'index.html'));
    if (classified.action !== 'stamp') {
        throw new Error(`Cannot version asset URL: ${assetUrl}`);
    }
    return applyVersion(assetUrl, hashContent(classified.filePath));
}

function stampAssets({ write = true } = {}) {
    for (const filePath of knownAssetFiles()) hashContent(filePath);

    const issues = [];
    const planned = [];
    let references = 0;
    for (const filePath of walkHtml(FRONTEND).sort()) {
        const html = fs.readFileSync(filePath, 'utf8');
        const stamped = stampHtml(html, filePath, issues);
        references += stamped.references;
        planned.push({ filePath, html, next: stamped.html });
    }

    if (issues.length) {
        throw new Error(`Refusing to stamp asset versions:\n${issues.map((issue) => `- ${issue}`).join('\n')}`);
    }

    let updated = 0;
    for (const item of planned) {
        if (item.next === item.html) continue;
        updated += 1;
        if (write) fs.writeFileSync(item.filePath, item.next);
    }

    const hashes = [...hashCache.entries()]
        .map(([filePath, hash]) => ({
            hash,
            path: path.relative(ROOT, filePath).split(path.sep).join('/')
        }))
        .sort((a, b) => a.path.localeCompare(b.path));

    return {
        hashes,
        files: planned.length,
        references,
        updated,
        unchanged: planned.length - updated
    };
}

function printReport(report) {
    console.log('asset hashes');
    for (const row of report.hashes) {
        console.log(`  ${row.hash}  ${row.path}`);
    }
    console.log(`html files: ${report.files}`);
    console.log(`references: ${report.references}`);
    console.log(`updated: ${report.updated}`);
    console.log(`unchanged: ${report.unchanged}`);
}

if (require.main === module) {
    const checkOnly = process.argv.includes('--check');
    try {
        const report = stampAssets({ write: !checkOnly });
        printReport(report);
        if (checkOnly && report.updated > 0) {
            console.error('Asset versions are out of date.');
            process.exit(1);
        }
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

module.exports = {
    applyVersion,
    hashContent,
    printReport,
    stampAssets,
    stampHtml,
    withAssetVersion
};
