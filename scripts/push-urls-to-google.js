const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const keyFile = path.join(__dirname, '../google-service-account.json');
const sitemapFile = path.join(__dirname, '../frontend/sitemap.xml');

// 1. Configure the API client
const auth = new google.auth.GoogleAuth({
  keyFile: keyFile,
  scopes: ['https://www.googleapis.com/auth/indexing'],
});

const indexing = google.indexing({
  version: 'v3',
  auth: auth,
});

async function run() {
  try {
    // 2. Read and parse sitemap.xml
    console.log(`Reading sitemap from: ${sitemapFile}`);
    const sitemapContent = fs.readFileSync(sitemapFile, 'utf8');
    
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(sitemapContent);
    
    if (!result.urlset || !result.urlset.url) {
      throw new Error("No URLs found in sitemap.");
    }

    const urls = result.urlset.url.map(entry => entry.loc[0]);
    console.log(`Found ${urls.length} URLs in sitemap.`);
    console.log(`Starting to push URLs to Google Indexing API...\n`);

    // 3. Push URLs to Google (we'll limit to 200 per day officially, but we only have ~30)
    let successCount = 0;
    let failCount = 0;

    for (const url of urls) {
      try {
        const response = await indexing.urlNotifications.publish({
          requestBody: {
            url: url,
            type: 'URL_UPDATED',
          },
        });
        console.log(`✅ SUCCESS: ${url}`);
        successCount++;
      } catch (err) {
        console.error(`❌ FAILED: ${url}`);
        console.error(`   Reason: ${err.message}`);
        failCount++;
      }
      
      // Small delay to prevent rate limit issues
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n🎉 Finished processing ${urls.length} URLs!`);
    console.log(`   ✅ Successful pushes: ${successCount}`);
    console.log(`   ❌ Failed pushes: ${failCount}`);
    
    if (failCount > 0) {
      console.log(`\nNote: If you got "Permission denied" errors, make sure you added the service account email as an "Owner" in Google Search Console!`);
    }

  } catch (error) {
    console.error("An error occurred:", error);
  }
}

run();
