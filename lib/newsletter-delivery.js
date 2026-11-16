const crypto=require('node:crypto');
const {SUBSCRIBERS,CAMPAIGNS}=require('./newsletter-store');
const RUNS='NewsletterRuns',DELIVERIES='NewsletterDeliveries',SUPPRESSIONS='NewsletterSuppressions';
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const failure=(message,status=400)=>Object.assign(new Error(message),{status});
function configuration(){
 const required=['RESEND_API_KEY','NEWSLETTER_FROM','NEWSLETTER_SIGNING_SECRET','NEWSLETTER_POSTAL_ADDRESS'];
 const missing=required.filter(k=>!process.env[k]);
 if(process.env.NEWSLETTER_SIGNING_SECRET&&process.env.NEWSLETTER_SIGNING_SECRET.length<32)missing.push('NEWSLETTER_SIGNING_SECRET (32+ characters)');
 return {enabled:missing.length===0,missing};
}
function signEmail(email,secret=process.env.NEWSLETTER_SIGNING_SECRET){
 if(!secret)throw failure('配信停止の設定が必要です。',503);
 const value=Buffer.from(email).toString('base64url');return value+'.'+crypto.createHmac('sha256',secret).update('unsubscribe:'+value).digest('base64url');
}
function verifyToken(token,secret=process.env.NEWSLETTER_SIGNING_SECRET){
 if(!secret||typeof token!=='string'||token.length>1000)return null;
 const [value,signature,...rest]=token.split('.');if(rest.length||!value||!signature)return null;
 const expected=crypto.createHmac('sha256',secret).update('unsubscribe:'+value).digest('base64url');
 if(signature.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(signature),Buffer.from(expected)))return null;
 return Buffer.from(value,'base64url').toString();
}
function eligible(subscriber,suppression){
 return subscriber?.status==='subscribed'&&!!subscriber.consent_at&&(!suppression||subscriber.consent_at>suppression.stopped_at);
}
async function prepare(store,id){
 if(!configuration().enabled)throw failure('送信サービス・送信元・配信停止設定を完了してください。',503);
 const draft=(await store.list(CAMPAIGNS)).find(d=>d.id===id);if(!draft)throw failure('下書きが見つかりません。',404);
 const runId=hash(draft.id+'|'+draft.updated_at+'|'+draft.subject+'|'+draft.text);
 const old=(await store.list(RUNS)).find(r=>r.id===runId);if(old)return old;
 const suppressed=new Map((await store.list(SUPPRESSIONS)).map(s=>[s.id,s]));
 const recipients=(await store.list(SUBSCRIBERS)).filter(s=>eligible(s,suppressed.get(s.id))).map(s=>s.email).sort();
 if(!recipients.length)throw failure('購読同意のある送信先がありません。');
 return store.put(RUNS,{id:runId,draft_id:id,subject:draft.subject,text:draft.text,from:process.env.NEWSLETTER_FROM,address:process.env.NEWSLETTER_POSTAL_ADDRESS,recipients,status:'prepared',created_at:new Date().toISOString()});
}
async function sendResend(payload,key){
 const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify(payload),signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw failure('送信サービスが受付を完了できませんでした（HTTP '+r.status+'）。',502);
 const data=await r.json();if(!data.id)throw failure('送信結果を確認できませんでした。',502);return data.id;
}
async function sendBatch(store,id,send=sendResend){
 if(!configuration().enabled)throw failure('送信設定が未完了です。',503);
 const run=(await store.list(RUNS)).find(r=>r.id===id);if(!run)throw failure('配信を準備してください。',404);
 const records=new Map((await store.list(DELIVERIES)).filter(d=>d.run_id===id).map(d=>[d.email,d]));
 let attempted=0;
 for(const email of run.recipients){
  let record=records.get(email);
  if(['accepted','skipped'].includes(record?.status))continue;
  if(record&&Date.now()-Date.parse(record.started_at)>23*60*60*1000)throw failure('受付結果が不明な送信があります。重複防止のため自動再送を停止しました。配信サービスで確認してください。',409);
  if(attempted>=2)break;
  const subscriber=(await store.list(SUBSCRIBERS)).find(s=>s.email===email);
  const suppression=(await store.list(SUPPRESSIONS)).find(s=>s.id===email);
  const base=record||{id:hash(id+'|'+email),run_id:id,email,started_at:new Date().toISOString()};
  if(!eligible(subscriber,suppression)){record=await store.put(DELIVERIES,{...base,status:'skipped',reason:'not_subscribed'});records.set(email,record);continue;}
  // Freeze the exact provider payload before the first attempt. Retries use identical bytes.
  const unsubscribe='https://pro-tech.jp/api/newsletter-unsubscribe?token='+encodeURIComponent(signEmail(email));
  const payload=record?.payload||{from:run.from,to:[email],subject:run.subject,text:run.text+'\n\n—\nPROTECH株式会社\n'+run.address+'\n配信停止: '+unsubscribe,headers:{'List-Unsubscribe':'<'+unsubscribe+'>','List-Unsubscribe-Post':'List-Unsubscribe=One-Click'}};
  record=await store.put(DELIVERIES,{...base,payload,status:'sending'});records.set(email,record);attempted++;
  try{
   const providerId=await send(payload,'protech/'+record.id);
   record=await store.put(DELIVERIES,{...record,status:'accepted',provider_id:providerId,accepted_at:new Date().toISOString()});records.set(email,record);
  }catch(err){await store.put(DELIVERIES,{...record,status:'uncertain',error:'Provider acceptance not confirmed'});throw err;}
 }
 const accepted=[...records.values()].filter(d=>d.status==='accepted').length;
 const skipped=[...records.values()].filter(d=>d.status==='skipped').length;
 const remaining=run.recipients.length-accepted-skipped;
 await store.put(RUNS,{...run,status:remaining?'sending':'complete',accepted,skipped});
 return {id,accepted,skipped,remaining,total:run.recipients.length};
}
async function unsubscribe(store,email){
 await store.put(SUPPRESSIONS,{id:email,stopped_at:new Date().toISOString()});
 const subscriber=(await store.list(SUBSCRIBERS)).find(s=>s.id===email);
 if(subscriber)await store.put(SUBSCRIBERS,{...subscriber,status:'unsubscribed'});
}
module.exports={RUNS,DELIVERIES,SUPPRESSIONS,configuration,prepare,sendBatch,signEmail,verifyToken,eligible,unsubscribe};
