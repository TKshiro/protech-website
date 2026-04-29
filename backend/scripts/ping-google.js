#!/usr/bin/env node

/**
 * PROTECH Google Indexing API Ping
 * 
 * Notifies Google about new/updated URLs for faster indexing.
 * 
 * Setup:
 * 1. Create a Google Cloud project
 * 2. Enable "Web Search Indexing API"
 * 3. Create a service account and download JSON key
 * 4. Add the service account email as Owner in Google Search Console
 * 5. Copy .env.example to .env and set GOOGLE_APPLICATION_CREDENTIALS path
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://pro-tech.jp';

// Load .env
try {
    require('dotenv').config({ path: path.join(ROOT, '.env') });
} catch (e) {
    // dotenv not required
}

// ─── Read URLs from sitemap ──────────────────────────────

function getUrlsFromSitemap() {
    const sitemapPath = path.join(ROOT, 'sitemap.xml');
    if (!fs.existsSync(sitemapPath)) {
        console.log('❌ sitemap.xml not found. Run "npm run build" first.');
        process.exit(1);
    }

    const sitemap = fs.readFileSync(sitemapPath, 'utf-8');
    const urls = [];
    const regex = /<loc>(.*?)<\/loc>/g;
    let match;
    while ((match = regex.exec(sitemap)) !== null) {
        urls.push(match[1]);
    }
    return urls;
}

// ─── Google Indexing API ─────────────────────────────────

async function pingWithAPI(urls) {
    try {
        const { google } = require('googleapis');

        const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        if (!credPath || !fs.existsSync(path.resolve(ROOT, credPath))) {
            return false;
        }

        console.log('🔑 Found Google credentials. Using Indexing API...\n');

        const auth = new google.auth.GoogleAuth({
            keyFile: path.resolve(ROOT, credPath),
            scopes: ['https://www.googleapis.com/auth/indexing'],
        });

        const indexing = google.indexing({ version: 'v3', auth });

        for (const url of urls) {
            try {
                const response = await indexing.urlNotifications.publish({
                    requestBody: {
                        url: url,
                        type: 'URL_UPDATED',
                    },
                });
                console.log(`  ✅ ${url}`);
                console.log(`     → Notified: ${response.data.urlNotificationMetadata?.latestUpdate?.type || 'OK'}`);
            } catch (err) {
                console.log(`  ❌ ${url}`);
                console.log(`     → Error: ${err.message}`);
            }

            // Rate limit: max 200 requests/min, but let's be conservative
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        return true;
    } catch (e) {
        console.log(`⚠ Could not use Indexing API: ${e.message}`);
        return false;
    }
}

// ─── Fallback: Sitemap Ping ──────────────────────────────

async function pingViaSitemap() {
    console.log('📡 Using sitemap ping method (no API credentials)...\n');

    const sitemapUrl = encodeURIComponent(`${SITE_URL}/sitemap.xml`);
    const pingUrls = [
        `https://www.google.com/ping?sitemap=${sitemapUrl}`,
        `https://www.bing.com/ping?sitemap=${sitemapUrl}`,
    ];

    for (const pingUrl of pingUrls) {
        try {
            const res = await fetch(pingUrl);
            const engine = pingUrl.includes('google') ? 'Google' : 'Bing';
            if (res.ok) {
                console.log(`  ✅ ${engine}: Sitemap ping successful`);
            } else {
                console.log(`  ⚠ ${engine}: HTTP ${res.status}`);
            }
        } catch (err) {
            const engine = pingUrl.includes('google') ? 'Google' : 'Bing';
            console.log(`  ❌ ${engine}: ${err.message}`);
        }
    }
}

// ─── Main ────────────────────────────────────────────────

async function main() {
    console.log('\n🔔 PROTECH Google Indexing Ping\n');

    const urls = getUrlsFromSitemap();
    console.log(`📋 Found ${urls.length} URLs in sitemap.xml\n`);

    // Try API first, fall back to sitemap ping
    const usedAPI = await pingWithAPI(urls);

    if (!usedAPI) {
        await pingViaSitemap();
    }

    console.log('\n📌 Tips for better Google indexing:');
    console.log('   1. Submit your sitemap in Google Search Console');
    console.log(`      URL: ${SITE_URL}/sitemap.xml`);
    console.log('   2. Add your site to Google Search Console if not already done');
    console.log('   3. For Indexing API, set up credentials per .env.example');
    console.log('');
}

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
