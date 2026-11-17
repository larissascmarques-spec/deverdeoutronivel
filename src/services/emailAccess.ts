import type {SupabaseClient} from '@supabase/supabase-js'
export async function sendAccessLink(client:Pick<SupabaseClient,'functions'>,email:string){
 if(email.length>254||!/^\S+@\S+\.\S+$/.test(email))throw Error('Confira o e-mail informado.')
 const {error}=await client.functions.invoke('don-access-link',{body:{email}})
 if(!error)return
 let body:{code?:string}={}
 try{body=await error.context.json()}catch{/* response may be unavailable */}
 if(body.code==='email_rate_limit')throw Error('O serviço atingiu o limite de envio de e-mails. Nenhum novo link foi enviado. Aguarde a liberação do serviço; os links antigos continuam inválidos.')
 if(body.code==='cooldown')throw Error('Aguarde 60 segundos antes de pedir outro link. Nenhum novo e-mail foi enviado nesta tentativa.')
 throw Error('Não foi possível enviar o link agora. Nenhum novo e-mail foi confirmado. Tente novamente mais tarde.')
}
