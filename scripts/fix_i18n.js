const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FRONTEND = path.join(ROOT, 'frontend');

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

const cnFiles = walk(path.join(FRONTEND, 'cn'), f => f.endsWith('.html'));
const enFiles = walk(path.join(FRONTEND, 'en'), f => f.endsWith('.html'));
const allTargetFiles = [...cnFiles, ...enFiles];

console.log(`Found ${allTargetFiles.length} localized HTML files.`);

let updatedCount = 0;

for (const filePath of allTargetFiles) {
    let html = fs.readFileSync(filePath, 'utf8');
    const original = html;

    // 1. Fix invalid cn/en references (pointing back to Japanese counterparts)
    const cnReplacements = {
        'href="/cn/pricing"': 'href="/pricing"',
        'href="/cn/privacy"': 'href="/privacy"',
        'href="/cn/tokushoho"': 'href="/tokushoho"',
        'href="/cn/terms"': 'href="/terms"',
        'href="/cn/download"': 'href="/download"',
        'href="/cn/faq"': 'href="/faq"',
        'href="/cn/inbound-ai"': 'href="/inbound-ai"'
    };

    const enReplacements = {
        'href="/en/pricing"': 'href="/pricing"',
        'href="/en/privacy"': 'href="/privacy"',
        'href="/en/tokushoho"': 'href="/tokushoho"',
        'href="/en/terms"': 'href="/terms"',
        'href="/en/download"': 'href="/download"',
        'href="/en/faq"': 'href="/faq"',
        'href="/en/inbound-ai"': 'href="/inbound-ai"'
    };

    const replacements = filePath.includes('/cn/') ? cnReplacements : enReplacements;

    for (const [target, replacement] of Object.entries(replacements)) {
        html = html.split(target).join(replacement);
    }

    // 2. Fix Canonical & OG Mismatches (og:url should match canonical)
    const canonicalMatch = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
                           html.match(/<link\s+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
    
    if (canonicalMatch) {
        const canonicalUrl = canonicalMatch[1];
        
        // Match both property="og:url" and name="og:url" meta tags
        const ogUrlPatterns = [
            /(<meta\s+[^>]*property=["']og:url["'][^>]*content=["'])[^"']*(["'])/gi,
            /(<meta\s+[^>]*content=["'])[^"']*(["'][^>]*property=["']og:url["'])/gi,
            /(<meta\s+[^>]*name=["']og:url["'][^>]*content=["'])[^"']*(["'])/gi,
            /(<meta\s+[^>]*content=["'])[^"']*(["'][^>]*name=["']og:url["'])/gi
        ];

        for (const pattern of ogUrlPatterns) {
            if (pattern.test(html)) {
                html = html.replace(pattern, `$1${canonicalUrl}$2`);
            }
        }
    }

    if (html !== original) {
        fs.writeFileSync(filePath, html, 'utf8');
        console.log(`Updated: ${path.relative(ROOT, filePath)}`);
        updatedCount++;
    }
}

console.log(`Done. Updated ${updatedCount} files.`);
