import type {SupabaseClient} from '@supabase/supabase-js'
// Capture before the auth SDK consumes URL fragments. Share the promise across
// StrictMode mounts so the one-use ticket is never redeemed twice.
const ticket=new URLSearchParams(window.location.hash.slice(1)).get('access_ticket')
export const hasDirectAccess=Boolean(ticket)
let pending:Promise<void>|null=null
export function openDirectAccess(client:SupabaseClient):Promise<void>{
 if(!ticket)return Promise.resolve()
 if(pending)return pending
 window.history.replaceState(null,'',window.location.pathname+window.location.search)
 pending=(async()=>{
  const {data,error}=await client.functions.invoke('don-redeem-access',{body:{ticket}})
  if(error){
   let detail='Não foi possível abrir o acesso direto. Solicite outro link individual.'
   try{detail=(await error.context.json()).error||detail}catch{/* no credentials in errors */}
   throw Error(detail)
  }
  if(typeof data?.token_hash!=='string'||data.type!=='magiclink')throw Error('Resposta de acesso inválida.')
  const verified=await client.auth.verifyOtp({token_hash:data.token_hash,type:'magiclink'})
  if(verified.error||!verified.data.session)throw Error('Não foi possível confirmar este acesso. Solicite outro link individual.')
 })()
 return pending
}
