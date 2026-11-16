const {connect}=require('../lib/newsletter-store');
const {verifyToken,unsubscribe}=require('../lib/newsletter-delivery');
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Robots-Tag','noindex');res.setHeader('Referrer-Policy','no-referrer');
 const token=req.query?.token;const email=verifyToken(token);
 if(!email)return res.status(400).send('無効な配信停止リンクです。');
 if(req.method==='GET'){
  res.setHeader('Content-Type','text/html; charset=utf-8');
  return res.status(200).send('<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>配信停止 | PROTECH</title><body style="font-family:sans-serif;max-width:560px;margin:80px auto;padding:24px"><h1>メールマガジンの配信停止</h1><p>下のボタンで今後の配信を停止できます。</p><form method="post"><button style="padding:14px 24px">配信を停止する</button></form></body></html>');
 }
 if(req.method!=='POST')return res.status(405).send('Method not allowed');
 try{await unsubscribe(await connect(),email);res.setHeader('Content-Type','text/html; charset=utf-8');return res.status(200).send('<!doctype html><html lang="ja"><meta charset="utf-8"><title>配信停止完了</title><p>配信を停止しました。</p></html>');}
 catch(err){console.error('Unsubscribe failed:',err.message);return res.status(503).send('処理できませんでした。時間をおいて再度お試しください。');}
};
