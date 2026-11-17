import {createClient} from 'npm:@supabase/supabase-js@2.80.0'
const allowed=['https://deverdeoutronivel.vercel.app','https://dever-outro-nivel-previa.larissa7288.chatgpt.site']
Deno.serve(async(req:Request)=>{
 const requested=req.headers.get('Origin')||''
 const headers={'Content-Type':'application/json','Cache-Control':'no-store','Pragma':'no-cache','Vary':'Origin','Access-Control-Allow-Origin':allowed.includes(requested)?requested:allowed[0],'Access-Control-Allow-Headers':'apikey,authorization,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS'}
 const reply=(status:number,data:unknown)=>new Response(JSON.stringify(data),{status,headers})
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers})
 if(req.method!=='POST')return reply(405,{error:'Método não permitido.'})
 if(requested&&!allowed.includes(requested))return reply(403,{error:'Origem inválida.'})
 try{
  const raw=await req.text();if(raw.length>256)return reply(413,{error:'Link inválido.'})
  let body;try{body=JSON.parse(raw)}catch{return reply(400,{error:'Link inválido.'})}
  if(typeof body.ticket!=='string'||!/^[-_A-Za-z0-9]{43}$/.test(body.ticket))return reply(400,{error:'Link inválido.'})
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(body.ticket)))).map(x=>x.toString(16).padStart(2,'0')).join('')
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}})
  const {data:email,error}=await db.rpc('don_redeem_access_ticket',{p_hash:hash})
  if(error)return reply(503,{error:'Não foi possível abrir seu acesso agora.'})
  if(!email)return reply(410,{error:'Este acesso direto expirou ou já foi usado.'})
  const generated=await db.auth.admin.generateLink({type:'magiclink',email})
  const token=generated.data?.properties?.hashed_token
  if(generated.error||!token)return reply(503,{error:'Não foi possível concluir este acesso. Solicite outro link individual.'})
  return reply(200,{token_hash:token,type:'magiclink'})
 }catch{return reply(503,{error:'Não foi possível abrir seu acesso agora.'})}
})
