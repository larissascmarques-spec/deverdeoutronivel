export {}

const origin="https://dever-outro-nivel-previa.larissa7288.chatgpt.site";
const baseHeaders={"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"authorization,apikey,content-type,x-client-info","Access-Control-Allow-Methods":"GET,POST,DELETE,OPTIONS","Cache-Control":"no-store","Content-Type":"application/json"};
Deno.serve(async(req:Request)=>{
 const requestOrigin=req.headers.get('Origin')||'';
 const origin=['https://deverdeoutronivel.vercel.app','https://dever-outro-nivel-previa.larissa7288.chatgpt.site'].includes(requestOrigin)?requestOrigin:'https://deverdeoutronivel.vercel.app';
 const headers={...baseHeaders,'Access-Control-Allow-Origin':origin,'Vary':'Origin'};
 const reply=(status:number,data:unknown)=>new Response(JSON.stringify(data),{status,headers});
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(!["GET","POST","DELETE"].includes(req.method))return reply(405,{error:"Método não permitido."});
 const url=Deno.env.get("SUPABASE_URL")!;
 const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
 const auth=req.headers.get("Authorization");
 if(!auth?.startsWith("Bearer "))return reply(401,{error:"Entre na sua conta para conectar a IA."});
 try{
 const who=await fetch(url+"/auth/v1/user",{headers:{Authorization:auth,apikey:service},signal:AbortSignal.timeout(10000)});
 if(!who.ok)return reply(401,{error:"Sua sessão expirou. Entre novamente."});
 const user=await who.json();if(!user.id)return reply(401,{error:"Entre novamente."});
 const access=await fetch(url+"/rest/v1/rpc/don_user_has_access",{method:"POST",headers:{apikey:service,Authorization:"Bearer "+service,"Content-Type":"application/json"},body:JSON.stringify({p_user_id:user.id}),signal:AbortSignal.timeout(10000)});
 if(!access.ok)throw new Error("access");
 if(!await access.json()&&req.method!=="DELETE")return reply(403,{error:"Seu acesso não está liberado. Use o e-mail da compra."});
 const rpc=async(action:string,key?:string)=>{
  const r=await fetch(url+"/rest/v1/rpc/don_manage_ai_connection",{method:"POST",headers:{apikey:service,Authorization:"Bearer "+service,"Content-Type":"application/json"},body:JSON.stringify({p_user_id:user.id,p_action:action,p_key:key??null}),signal:AbortSignal.timeout(10000)});
  if(!r.ok)throw new Error("storage");return await r.json();
 };
 if(req.method==="GET")return reply(200,await rpc("status"));
 if(req.method==="DELETE")return reply(200,await rpc("delete"));
 const raw=await req.text();if(raw.length>2048)return reply(413,{error:"Solicitação muito grande."});
 let body;try{body=JSON.parse(raw)}catch{return reply(400,{error:"Solicitação inválida."})}
 if(!["connect","test"].includes(body.action))return reply(400,{error:"Ação inválida."});
 let key=body.action==="test"?(await rpc("read")).key:body.key;
 if(typeof key!=="string"||!/^sk-[A-Za-z0-9_-]{17,509}$/.test(key))return reply(400,{error:"Cole uma chave de API válida da OpenAI."});
 for(const model of ['gpt-5.4-mini-2026-03-17','gpt-image-2.5-sunburst-2026-09-08']){
 const check=await fetch("https://api.openai.com/v1/models/"+model,{headers:{Authorization:"Bearer "+key},signal:AbortSignal.timeout(15000)});
 await check.body?.cancel();
 if(!check.ok)return reply(check.status===429?429:400,{error:check.status===401?"Chave inválida ou revogada. Crie outra na OpenAI.":check.status===429?"A OpenAI limitou as tentativas. Aguarde e tente novamente.":"Não foi possível validar o acesso aos modelos de texto e imagem. Confira permissões e verificação da organização na OpenAI."});
 }
 const result=await rpc(body.action==="test"?"tested":"save",body.action==="test"?undefined:key);
 key=null;
 return reply(200,{...result,message:"Conexão testada. Nenhuma atividade foi gerada nem cobrada neste teste."});
 }catch{return reply(503,{error:"Não foi possível conectar agora. Tente novamente."})}
});
