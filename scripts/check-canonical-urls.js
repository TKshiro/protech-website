const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const examples = [
'/contact?service=kol','/contact?plan=light','/blog?q={search_term_string}',
'/travel/ja?source=onsen-ryokan-booking','/travel/zh-tw?source=japan-family-custom-trip',
'/travel?source=japan-attraction-restaurant-reservation','/travel/ja?source=japan-senior-friendly-itinerary',
'/travel/en?source=japan-family-custom-trip','/travel?source=tokyo-fuji-private-car',
'/travel/zh-tw?source=japan-senior-friendly-itinerary',
'/contact?service=dianping-store-registration&source_path=/blog/dazhong-dianping-guide',
'/contact?service=inbound-strategy&source_path=/blog/inbound-meaning-guide',
'/contact?service=red-account&source_path=/blog/red-account-basics',
'/contact?service=dianping&source_path=/blog/dazhong-dianping-guide'];
function inspect(html, pathname) {
 const expected = 'https://pro-tech.jp' + pathname;
 const canonicals = [...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(canonicals, [expected], pathname + ': canonical');
 assert(!/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html), pathname + ': noindex');
}
async function run() {
 for (const example of examples) {
  const pathname = example.split('?')[0];
  if (process.argv.includes('--live')) {
   const response = await fetch('https://pro-tech.jp' + example);
   assert.equal(response.status, 200, example);
   inspect(await response.text(), pathname);
  } else {
   const base = path.join(root, 'frontend', pathname);
   inspect(fs.readFileSync(fs.existsSync(base+'.html') ? base+'.html' : path.join(base,'index.html'), 'utf8'), pathname);
  }
 }
 if (!process.argv.includes('--live')) {
  const helper = fs.readFileSync(path.join(root,'frontend/assets/js/main.js'),'utf8').split('/*\n * PROTECH shared scripts')[0];
  for (const [search,hash,want] of [
   ['?source=legacy','#inquiry?source=new','new'],['?source=legacy','','legacy'],
   ['','#inquiry?source=japan-family-custom-trip','japan-family-custom-trip'],['','#inquiry','']]) {
   let scrolled = false;
   const window = {location:{search,hash},addEventListener:()=>{}};
   vm.runInNewContext(helper, {window, URLSearchParams, document:{getElementById:()=>({scrollIntoView:()=>{scrolled=true;}})}});
   assert.equal(window.protechInquiryContext().get('source') || '', want);
   assert.equal(scrolled, hash.startsWith('#inquiry?'));
  }
  for (const name of ['index.html','cn/index.html','en/index.html']) {
   const html=fs.readFileSync(path.join(root,'frontend',name),'utf8');
   assert(!html.includes('SearchAction'));
   for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
  }
  const sitemap=fs.readFileSync(path.join(root,'frontend/sitemap.xml'),'utf8');
  for(const m of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)) assert(!/[?#]/.test(m[1]));
 }
 console.log('PASS: 14 URL variants canonicalize to clean pages' + (process.argv.includes('--live') ? ' (live HTTP 200).' : '; fragment context, legacy compatibility, JSON-LD and sitemap checks passed.'));
}
run().catch(e=>{console.error(e);process.exitCode=1;});
