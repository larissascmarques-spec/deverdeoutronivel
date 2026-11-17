import type {SupabaseClient} from '@supabase/supabase-js'
export async function sendAccessLink(client:Pick<SupabaseClient,'auth'>,email:string,origin:string){
 if(email.length>254||!/^\S+@\S+\.\S+$/.test(email))throw Error('Confira o e-mail informado.')
 const {error}=await client.auth.signInWithOtp({email,options:{shouldCreateUser:true,emailRedirectTo:origin+'/'}})
 if(!error)return
 if(error.status===429)throw Error('Aguarde um pouco antes de pedir outro link.')
 throw Error('Não foi possível enviar o link agora. Tente novamente em alguns minutos.')
}
