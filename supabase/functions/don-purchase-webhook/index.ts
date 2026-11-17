import {createClient} from 'npm:@supabase/supabase-js@2.80.0'
import {equalSecret,purchaseEvent} from './purchase.ts'
const origin='https://deverdeoutronivel.vercel.app'
Deno.serve(async(req:Request)=>{
 const reply=(status:number,data:unknown)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}})
 if(req.method!=='POST')return reply(405,{error:'Method not allowed'})
 const token=Deno.env.get('HOTMART_HOTTOK'),product=Deno.env.get('HOTMART_PRODUCT_ID')
 if(!token||!product)return reply(503,{error:'Purchase integration is not configured'})
 if(!(await equalSecret(req.headers.get('X-HOTMART-HOTTOK')??'',token)))return reply(401,{error:'Unauthorized'})
 try{
  const raw=await req.text();if(raw.length>65536)return reply(413,{error:'Payload too large'})
  let body;try{body=JSON.parse(raw)}catch{return reply(400,{error:'Invalid payload'})}
  let event;try{event=purchaseEvent(body,product)}catch{return reply(400,{error:'Invalid event'})}
  if(!event)return reply(200,{ignored:true})
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}})
  const {data,error}=await db.rpc('don_apply_purchase',{p_transaction:event.transaction,p_email:event.email,p_product:event.productId,p_status:event.status,p_event_at:event.eventAt})
  if(error)return reply(503,{error:'Purchase could not be recorded'})
  if(data.send_link){
   const {error:mailError}=await db.auth.signInWithOtp({email:event.email,options:{shouldCreateUser:true,emailRedirectTo:origin+'/'}})
   if(mailError)return reply(503,{error:'Access recorded; email delivery must be retried'})
   const marked=await db.rpc('don_mark_access_sent',{p_transaction:event.transaction})
   if(marked.error)return reply(503,{error:'Email delivery status could not be recorded'})
  }
  return reply(200,{received:true})
 }catch{return reply(503,{error:'Please retry later'})}
})
