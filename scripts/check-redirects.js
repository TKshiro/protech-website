const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const examples = require('./redirect-examples.json');
const canonical = url => new URL(url).href;
async function inspect(example) {
 let url=example.url, hops=0;
 while(hops <= example.maxRedirects) {
  const response = await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(20000)});
  if ([301,308].includes(response.status)) {
   const location=response.headers.get('location');assert(location, url);
   const next=new URL(location,url).href;assert.notEqual(next,url,'Self redirect');
   await response.body.cancel();url=next;hops++;continue;
  }
  assert.equal(response.status,200,url);
  assert.equal(canonical(url),canonical(example.target),example.url);
  const html=await response.text();
  const tags=[...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/g)];
  assert.equal(tags.length,1,url);
  assert.equal(canonical(tags[0][1]),canonical(url),url);
  assert(!/http-equiv=["']refresh/i.test(html), 'Client redirect: '+url);
  assert(!/name="robots"[^>]*content="[^"]*noindex/i.test(html),url);
  return {url:example.url,target:url,redirects:hops,status:200};
 }
 throw Error('Too many redirects: '+example.url);
}
(async()=>{
 const config=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
 for (const rule of config.redirects) {
  assert.equal(rule.permanent,true);assert.notEqual(rule.source,rule.destination);
  assert(fs.existsSync(path.join(root,'frontend',rule.destination+'.html')) || fs.existsSync(path.join(root,'frontend',rule.destination,'index.html')));
 }
 const sitemap=fs.readFileSync(path.join(root,'frontend/sitemap.xml'),'utf8');
 for(const m of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)) {
  const u=new URL(m[1]);assert.equal(u.origin,'https://pro-tech.jp');
  assert(!u.pathname.endsWith('.html'));assert(u.pathname==='/'||!u.pathname.endsWith('/'));
  assert(!config.redirects.some(r=>r.source===u.pathname));
 }
 if(process.argv.includes('--live')) {
  const results=[];
  for(let i=0;i<examples.length;i+=5)results.push(...await Promise.all(examples.slice(i,i+5).map(inspect)));
  for(const rule of config.redirects)await inspect({url:'https://pro-tech.jp'+rule.source,target:'https://pro-tech.jp'+rule.destination,maxRedirects:1});
  console.log(JSON.stringify(results,null,2));
 }
 console.log('PASS: redirect rules and sitemap'+(process.argv.includes('--live')?'; 25 reported URLs and all configured redirects reach canonical HTTP 200 pages.':'.'));
})().catch(e=>{console.error(e);process.exitCode=1;});
