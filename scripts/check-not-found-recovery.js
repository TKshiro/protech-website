const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const fixtures=require('./not-found-examples.json');
const config=JSON.parse(fs.readFileSync(path.join(root,'vercel.json')));
const origin='https://pro-tech.jp';
function fileFor(url){const base=path.join(root,'frontend',url);return fs.existsSync(base+'.html')?base+'.html':path.join(base,'index.html');}
async function check(url, expected) {
 let current=url;let hops=0;
 while(hops<5) {
  const r=await fetch(current,{redirect:'manual',signal:AbortSignal.timeout(20000)});
  if([301,308].includes(r.status)) {const next=new URL(r.headers.get('location'),current).href;assert.notEqual(next,current);current=next;hops++;await r.body.cancel();continue;}
  assert.equal(r.status,200,url);assert.equal(new URL(current).origin+new URL(current).pathname,origin+expected,url);
  const html=await r.text();assert(html.includes('href="'+origin+expected+'"'),url+' canonical');
  assert(!/http-equiv=["']refresh/i.test(html),url);assert(!/name="robots"[^>]*content="[^"]*noindex/i.test(html),url);
  assert(!/noindex/i.test(r.headers.get('x-robots-tag')||''));return {url,final:current,hops,status:r.status};
 }throw Error('Redirect loop: '+url);
}
(async()=>{
 const sitemap=fs.readFileSync(path.join(root,'frontend/sitemap.xml'),'utf8');
 for(const [from,to] of Object.entries(fixtures.recover)) {
  const rule=config.redirects.find(r=>r.source===from);assert(rule&&rule.destination===to&&rule.permanent===true,from);
  const html=fs.readFileSync(fileFor(to),'utf8');assert(html.includes('rel="canonical" href="'+origin+to+'"'),to);
  assert(!sitemap.includes('<loc>'+origin+from+'</loc>'),from);
  assert(sitemap.includes('<loc>'+origin+to+'</loc>'),to);
 }
 if(process.argv.includes('--live')) {
  const rows=Object.entries(fixtures.recover).map(([from,to])=>[origin+from,to]);
  rows.push(['https://www.pro-tech.jp/blog/inbound-sns-strategy-2026.html','/blog/china-sns-inbound-guide']);
  for(let i=0;i<rows.length;i+=4)for(const result of await Promise.all(rows.slice(i,i+4).map(([url,to])=>check(url,to))))console.log(JSON.stringify(result));
  const query=await check(origin+'/en/download?source=legacy','/download');assert(new URL(query.final).searchParams.get('source')==='legacy');
  for(const p of [...fixtures.retain404,'/nonexistent-seo-regression-check-20261115']){
   const r=await fetch(origin+p);assert.equal(r.status,404,p);await r.body.cancel();
  }
 }
 console.log('PASS: 14 recoverable reported URLs; 2 intentional 404 paths; canonical and sitemap checks'+(process.argv.includes('--live')?'; live redirect and query preservation checks.':'.'));
})().catch(e=>{console.error(e);process.exitCode=1});
