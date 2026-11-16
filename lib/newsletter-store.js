const {google}=require('googleapis');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
function authorize(req){
 const password=process.env.ADMIN_PASSWORD;
 if(!password)throw Object.assign(new Error('管理者認証が設定されていません。'),{status:503});
 const token=(req.headers.authorization||'').replace(/^Bearer /i,'');
 const expected=crypto.createHash('sha256').update(password).digest('hex');
 if(!/^[a-f0-9]{64}$/.test(token)||!crypto.timingSafeEqual(Buffer.from(token),Buffer.from(expected)))throw Object.assign(new Error('Unauthorized'),{status:401});
}
function email(value){const v=String(value||'').trim().toLowerCase();return v.length<=254&&/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v)?v:null;}
function quoted(title){return "'"+title.replace(/'/g,"''")+"'";}
async function connect(){
 const spreadsheetId=process.env.SPREADSHEET_ID;
 if(!spreadsheetId)throw new Error('SPREADSHEET_ID is not configured');
 let credentials;
 if(process.env.GOOGLE_SERVICE_ACCOUNT)credentials=JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
 else {const p=path.resolve('google-service-account.json');if(fs.existsSync(p))credentials=JSON.parse(fs.readFileSync(p,'utf8'));}
 if(!credentials)throw new Error('Google credentials are not configured');
 const auth=new google.auth.GoogleAuth({credentials,scopes:['https://www.googleapis.com/auth/spreadsheets']});
 const sheets=google.sheets({version:'v4',auth});
 return createStore(sheets,spreadsheetId);
}
function createStore(sheets,spreadsheetId){
 const initialized=new Set();
 async function ensure(name){
  if(initialized.has(name))return;
  let meta=await sheets.spreadsheets.get({spreadsheetId});
  if(!meta.data.sheets.some(s=>s.properties.title===name)){
   try{await sheets.spreadsheets.batchUpdate({spreadsheetId,requestBody:{requests:[{addSheet:{properties:{title:name}}}]}});}catch(err){
    meta=await sheets.spreadsheets.get({spreadsheetId});if(!meta.data.sheets.some(s=>s.properties.title===name))throw err;
   }
  }
  const existing=await sheets.spreadsheets.values.get({spreadsheetId,range:quoted(name)+'!A1:C1'});
  if(!existing.data.values?.length)await sheets.spreadsheets.values.update({spreadsheetId,range:quoted(name)+'!A1:C1',valueInputOption:'RAW',requestBody:{values:[['id','data','updated_at']]}});
  initialized.add(name);
 }
 async function rows(name){await ensure(name);const r=await sheets.spreadsheets.values.get({spreadsheetId,range:quoted(name)+'!A:C'});return r.data.values||[];}
 async function list(name){const result=new Map();for(const row of (await rows(name)).slice(1)){if(!row[0])continue;try{const value=JSON.parse(row[1]);const old=result.get(row[0]);if(!old||String(value.updated_at)>=String(old.updated_at))result.set(row[0],value);}catch{throw new Error('Invalid stored newsletter data');}}return [...result.values()];}
 async function put(name,item){const data=await rows(name);const indices=data.map((r,i)=>r[0]===item.id?i:-1).filter(i=>i>0);const value={...item,updated_at:new Date().toISOString()};
 const row=[item.id,JSON.stringify(value),value.updated_at];
 if(indices.length){await sheets.spreadsheets.values.batchUpdate({spreadsheetId,requestBody:{valueInputOption:'RAW',data:indices.map(i=>({range:quoted(name)+`!A${i+1}:C${i+1}`,values:[row]}))}});}
 else await sheets.spreadsheets.values.append({spreadsheetId,range:quoted(name)+'!A:C',valueInputOption:'RAW',requestBody:{values:[row]}});
 return value;
 }
 async function inquiries(){const meta=await sheets.spreadsheets.get({spreadsheetId});const first=meta.data.sheets[0].properties;const r=await sheets.spreadsheets.values.get({spreadsheetId,range:quoted(first.title)+'!A:L'});const values=r.data.values||[];return {sheet:first,values,items:values.slice(1).filter(row=>row[0]).map(row=>Object.fromEntries((values[0]||[]).map((key,i)=>[key,row[i]||''])))};}
 return {list,put,inquiries,sheets,spreadsheetId};
}
const SUBSCRIBERS='NewsletterContacts',CAMPAIGNS='NewsletterDrafts';
async function importContacts(store, includeDeleted=false){
 const {items}=await store.inquiries();const existing=new Map((await store.list(SUBSCRIBERS)).map(s=>[s.id,s]));let imported=0,invalid=0;
 for(const c of items){if(c.status==='削除済み'&&!includeDeleted)continue;const id=email(c.email);if(!id){invalid++;continue;}if(existing.has(id))continue;
 const item={id,email:id,name:c.name||'',company:c.company||'',source:'inquiry',status:'not_subscribed',consent_note:'',created_at:new Date().toISOString()};
 await store.put(SUBSCRIBERS,item);existing.set(id,item);imported++;
 }return {imported,invalid};
}
module.exports={authorize,email,connect,createStore,quoted,importContacts,SUBSCRIBERS,CAMPAIGNS};
