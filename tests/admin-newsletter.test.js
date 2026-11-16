const test=require('node:test');
const assert=require('node:assert/strict');
const {createStore,importContacts,email,SUBSCRIBERS}=require('../lib/newsletter-store');
function fixture(){
 const tabs=new Map([['Inquiries',[['id','date','inquiry_type','name','company','email','phone','budget','referral_source','message','status','travel'],['1','','','Alice','A','=bad','','','','','未対応'],['2','','','B','B','Person@EXAMPLE.com','','','','','未対応'],['3','','','B2','B','person@example.com','','','','','未対応'],['4','','','Deleted','','deleted@example.com','','','','','削除済み']]]]);
 const parse=range=>{const m=range.match(/^'([^']+)'!([A-Z]+)(\d*)/);return {name:m[1],row:Number(m[3]||1)-1};};
 const raw=[];
 const values={
  get:async({range})=>{const {name}=parse(range);const all=tabs.get(name)||[];return {data:{values:range.endsWith('1:C1')?all.slice(0,1):all}};},
  update:async({range,valueInputOption,requestBody})=>{raw.push(valueInputOption);const {name,row}=parse(range);const rows=tabs.get(name)||[];rows[row]=requestBody.values[0];tabs.set(name,rows);},
  append:async({range,valueInputOption,requestBody})=>{raw.push(valueInputOption);tabs.get(parse(range).name).push(...requestBody.values);},
  batchUpdate:async({requestBody})=>{raw.push(requestBody.valueInputOption);for(const x of requestBody.data){const {name,row}=parse(x.range);tabs.get(name)[row]=x.values[0];}}
 };
 const sheets={spreadsheets:{values,get:async()=>({data:{sheets:[...tabs.keys()].map((title,i)=>({properties:{title,sheetId:i}}))}}),batchUpdate:async({requestBody})=>{for(const r of requestBody.requests)tabs.set(r.addSheet.properties.title,[]);}}};
 return {store:createStore(sheets,'test'),tabs,raw};
}
test('normalizes real emails and excludes travel handles / spreadsheet formulas',()=>{
 assert.equal(email(' USER@Example.com '),'user@example.com');for(const v of ['LINE:abc','12345678','=IMPORTXML(x)','x@y','<x@y.com>'])assert.equal(email(v),null);
});
test('imports unique active contacts as non-subscribed and persists them independently',async()=>{
 const {store,tabs,raw}=fixture();const first=await importContacts(store);assert.equal(first.imported,1);assert.equal(first.invalid,1);
 const subscribers=await store.list(SUBSCRIBERS);assert.equal(subscribers[0].status,'not_subscribed');assert.equal(subscribers[0].email,'person@example.com');
 tabs.get('Inquiries').splice(1);assert.equal((await store.list(SUBSCRIBERS)).length,1);assert(raw.every(x=>x==='RAW'));
});
test('re-import preserves opt-out and archived contacts can be recorded before purge',async()=>{
 const {store}=fixture();await importContacts(store);let [item]=await store.list(SUBSCRIBERS);await store.put(SUBSCRIBERS,{...item,status:'unsubscribed'});
 assert.equal((await importContacts(store)).imported,0);assert.equal((await store.list(SUBSCRIBERS))[0].status,'unsubscribed');
 assert.equal((await importContacts(store,true)).imported,1);assert.equal((await store.list(SUBSCRIBERS)).length,2);
});
test('writes same normalized subscriber without duplicate rows',async()=>{
 const {store,tabs}=fixture();await importContacts(store);const [item]=await store.list(SUBSCRIBERS);await store.put(SUBSCRIBERS,{...item,name:'Updated'});
 assert.equal(tabs.get(SUBSCRIBERS).length,2);assert.equal((await store.list(SUBSCRIBERS))[0].name,'Updated');
});
test('API rejects unauthenticated access before reading spreadsheet credentials',async()=>{
 const handler=require('../api/newsletter');const old=process.env.ADMIN_PASSWORD;process.env.ADMIN_PASSWORD='test-only-not-a-real-password';
 let status;let payload;const res={setHeader(){},status(n){status=n;return this;},json(value){payload=value;return this;}};
 await handler({method:'GET',headers:{}},res);assert.equal(status,401);assert.equal(payload.error,'Unauthorized');
 if(old===undefined)delete process.env.ADMIN_PASSWORD;else process.env.ADMIN_PASSWORD=old;
});
test('subscriber API requires consent evidence, rejects unknown statuses and saves drafts',async()=>{
 const {store}=fixture();const handler=require('../api/newsletter').createHandler(async()=>store);
 const previous=process.env.ADMIN_PASSWORD;process.env.ADMIN_PASSWORD='newsletter-test-password';
 const token=require('node:crypto').createHash('sha256').update(process.env.ADMIN_PASSWORD).digest('hex');
 async function post(body){let status,payload;await handler({method:'POST',headers:{authorization:'Bearer '+token},body},{setHeader(){},status(n){status=n;return this;},json(x){payload=x;return this;}});return {status,payload};}
 try{
  assert.equal((await post({action:'subscriber',email:'reader@example.com',status:'subscribed'})).status,400);
  assert.equal((await post({action:'subscriber',email:'reader@example.com',status:'bad'})).status,400);
  const saved=await post({action:'subscriber',email:' Reader@Example.com ',status:'subscribed',consent_note:'2026-11-16 explicit opt-in email'});
  assert.equal(saved.status,200);assert.equal(saved.payload.email,'reader@example.com');assert(saved.payload.consent_at);
  assert.equal((await post({action:'subscriber',email:'reader@example.com',status:'unsubscribed'})).payload.status,'unsubscribed');
  assert.equal((await post({action:'subscriber',email:'reader@example.com',status:'subscribed'})).status,400);
  assert.equal((await post({action:'draft',subject:'',text:'x'})).status,400);
  const draft=await post({action:'draft',subject:'A real draft',text:'<script>alert(1)</script>'});assert.equal(draft.status,200);assert.equal(draft.payload.status,'draft');
  const updated=await post({action:'draft',id:draft.payload.id,subject:'Updated',text:'plain text'});assert.equal(updated.payload.id,draft.payload.id);
  assert.equal((await post({action:'draft',id:'unknown',subject:'No',text:'No'})).status,404);
 }finally{if(previous===undefined)delete process.env.ADMIN_PASSWORD;else process.env.ADMIN_PASSWORD=previous;}
});
