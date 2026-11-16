const crypto=require('node:crypto');
const delivery=require('../lib/newsletter-delivery');
const {authorize,email,connect,importContacts,SUBSCRIBERS,CAMPAIGNS}=require('../lib/newsletter-store');
const createHandler=(getStore=connect)=>async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 try{
  authorize(req);const store=await getStore();
  if(req.method==='GET')return res.status(200).json({subscribers:await store.list(SUBSCRIBERS),campaigns:await store.list(CAMPAIGNS),runs:await store.list(delivery.RUNS),deliveries:(await store.list(delivery.DELIVERIES)).map(({payload,...record})=>record),sending_enabled:delivery.configuration().enabled,missing_configuration:delivery.configuration().missing});
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const body=req.body||{};
  if(body.action==='prepare')return res.status(200).json(await delivery.prepare(store,body.id));
  if(body.action==='send'){if(body.confirm!==true)return res.status(400).json({error:'送信確認が必要です。'});return res.status(200).json(await delivery.sendBatch(store,body.id));}
  if(body.action==='import')return res.status(200).json(await importContacts(store));
  if(body.action==='subscriber'){
   const id=email(body.email);if(!id)return res.status(400).json({error:'有効なメールアドレスを入力してください。'});
   const old=(await store.list(SUBSCRIBERS)).find(s=>s.id===id);
   const status=body.status||old?.status||'not_subscribed';
   if(!['not_subscribed','subscribed','unsubscribed'].includes(status))return res.status(400).json({error:'Invalid status'});
   const note=String(body.consent_note||'').trim().slice(0,1000);
   if(status==='subscribed'&&old?.status!=='subscribed'&&!note)return res.status(400).json({error:'購読同意の取得日・取得方法を記録してください。'});
   const value={...old,id,email:id,name:String(body.name??old?.name??'').slice(0,150),company:String(body.company??old?.company??'').slice(0,200),source:old?.source||'manual',status,consent_note:note||old?.consent_note||'',consent_at:status==='subscribed'?(old?.status==='subscribed'?old.consent_at:new Date().toISOString()):old?.consent_at||'',created_at:old?.created_at||new Date().toISOString()};
   if(status==='unsubscribed')await delivery.unsubscribe(store,id);
   return res.status(200).json(await store.put(SUBSCRIBERS,value));
  }
  if(body.action==='draft'){
   const subject=String(body.subject||'').trim(),text=String(body.text||'').trim();
   if(!subject||subject.length>200||!text||text.length>30000)return res.status(400).json({error:'件名（200文字以内）と本文（30000文字以内）を入力してください。'});
   const old=body.id?(await store.list(CAMPAIGNS)).find(d=>d.id===body.id):null;
   if(body.id&&!old)return res.status(404).json({error:'Draft not found'});
   return res.status(200).json(await store.put(CAMPAIGNS,{id:old?.id||crypto.randomUUID(),subject,text,status:'draft',created_at:old?.created_at||new Date().toISOString()}));
  }
  return res.status(400).json({error:'Unknown action'});
 }catch(err){console.error('Newsletter API:',err.message);return res.status(err.status||500).json({error:err.status?err.message:'保存できませんでした。時間をおいて再試行してください。'});}
};

module.exports=createHandler();
module.exports.createHandler=createHandler;
