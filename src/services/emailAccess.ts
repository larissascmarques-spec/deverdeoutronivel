import type {SupabaseClient} from '@supabase/supabase-js'
export async function sendAccessLink(client:Pick<SupabaseClient,'functions'>,email:string){
 if(email.length>254||!/^\S+@\S+\.\S+$/.test(email))throw Error('Confira o e-mail informado.')
 const {error}=await client.functions.invoke('don-access-link',{body:{email}})
 if(error)throw Error('Não foi possível enviar o link agora. Tente novamente em alguns minutos.')
}
