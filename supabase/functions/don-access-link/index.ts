import {createClient} from 'npm:@supabase/supabase-js@2.80.0'
const origin='https://dever-outro-nivel-previa.larissa7288.chatgpt.site'
const baseHeaders={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'apikey,content-type,x-client-info,authorization','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'}
Deno.serve(async(req:Request)=>{
 const requestOrigin=req.headers.get('Origin')||'';
 const origin=['https://deverdeoutronivel.vercel.app','https://dever-outro-nivel-previa.larissa7288.chatgpt.site'].includes(requestOrigin)?requestOrigin:'https://deverdeoutronivel.vercel.app';
 const headers={...baseHeaders,'Access-Control-Allow-Origin':origin,'Vary':'Origin'};
 const reply=(status:number,data:unknown)=>new Response(JSON.stringify(data),{status,headers})
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers})
 if(req.method!=='POST')return reply(405,{error:'Método não permitido.'})
 try{
  const raw=await req.text();if(raw.length>1024)return reply(413,{error:'Pedido inválido.'})
  let body;try{body=JSON.parse(raw)}catch{return reply(400,{error:'Pedido inválido.'})}
  if(typeof body.email!=='string'||body.email.length>254||!/^\S+@\S+\.\S+$/.test(body.email.trim()))return reply(400,{error:'Confira o e-mail informado.'})
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}})
  const email=body.email.trim().toLowerCase()
  const {data:allowed,error}=await db.rpc('don_request_access',{p_email:email})
  if(error)return reply(503,{error:'Não foi possível consultar o acesso. Tente novamente.'})
  if(allowed){
   const {error:sendError}=await db.auth.signInWithOtp({email,options:{shouldCreateUser:true,emailRedirectTo:origin+'/'}})
   if(sendError)return reply(503,{error:'O envio de e-mail está indisponível. Tente novamente em alguns minutos.'})
  }
  return reply(200,{message:'Se este e-mail tem acesso liberado, você receberá o link. Use o mesmo e-mail da compra.'})
 }catch{return reply(503,{error:'Não foi possível enviar agora. Tente novamente.'})}
})
