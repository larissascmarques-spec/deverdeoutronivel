import {useEffect,useRef,useState,type ReactNode,type FormEvent} from 'react'
import {isDemoMode} from '../../config/env'
import {getSupabaseClient} from '../../lib/supabaseClient'
import {sendAccessLink} from '../../services/emailAccess'
import {openDirectAccess,hasDirectAccess} from '../../services/directAccess'

export function AuthGate({children}:{children:ReactNode}){
 const demo=isDemoMode()
 const [userId,setUserId]=useState<string|null>(null)
 const [loading,setLoading]=useState(!demo)
 const [access,setAccess]=useState<'checking'|'allowed'|'denied'|'error'>('checking')
 const [retry,setRetry]=useState(0)
 const [email,setEmail]=useState('')
 const [sentTo,setSentTo]=useState('')
 const [busy,setBusy]=useState(false)
 const [callbackError]=useState(()=>{
  const fragment=new URLSearchParams(window.location.hash.slice(1))
  const query=new URLSearchParams(window.location.search)
  return fragment.has('error')||fragment.has('error_code')||query.has('error')||query.has('error_code')
 })
 const [error,setError]=useState(()=>{
  const fragment=new URLSearchParams(window.location.hash.slice(1))
  const query=new URLSearchParams(window.location.search)
  return fragment.has('error')||fragment.has('error_code')||query.has('error')||query.has('error_code')?'Este link expirou ou já foi usado. Ele não pode abrir uma nova sessão. Solicite um novo link abaixo.':''
 })
 const [seconds,setSeconds]=useState(0)
 const inFlight=useRef(false)
 useEffect(()=>{
  if(demo)return
  let active=true
  let stop:undefined|(()=>void)
  getSupabaseClient().then(async client=>{
   if(!client)throw Error('Conexão indisponível.')
   const {data}=client.auth.onAuthStateChange((_event,session)=>{
    if(!active)return
    setUserId(previous=>{
     const next=session?.user.id??null
     if(previous!==next){setAccess('checking');try{sessionStorage.removeItem('dever-outro-nivel:draft')}catch{/* optional cache */}}
     return next
    })
    if(session||!hasDirectAccess)setLoading(false)
   })
   stop=()=>data.subscription.unsubscribe()
   await openDirectAccess(client)
   const {data:{session},error:failure}=await client.auth.getSession()
   if(!active)return
   setUserId(session?.user.id??null)
   setLoading(false)
   if(failure||callbackError){setError('Este link expirou ou já foi usado. Peça outro abaixo.');window.history.replaceState(null,'',window.location.pathname)}
  }).catch((failure:unknown)=>{if(active){setError(failure instanceof Error?failure.message:'Não foi possível conectar. Atualize a página.');setLoading(false)}})
  return()=>{active=false;stop?.()}
 },[demo,callbackError])
 useEffect(()=>{
  if(demo||!userId)return
  let active=true
  setAccess('checking')
  getSupabaseClient().then(async client=>{
   if(!client)throw Error('connection')
   const {data,error}=await client.rpc('don_has_access')
   if(error)throw error
   if(active)setAccess(data===true?'allowed':'denied')
  }).catch(()=>{if(active)setAccess('error')})
  return()=>{active=false}
 },[demo,userId,retry])
 useEffect(()=>{
  if(seconds<=0)return
  const timer=window.setTimeout(()=>setSeconds(v=>Math.max(0,v-1)),1000)
  return()=>window.clearTimeout(timer)
 },[seconds])
 async function submit(event:FormEvent){
  event.preventDefault()
  if(inFlight.current||seconds>0)return
  inFlight.current=true;setBusy(true);setError('')
  try{
   const normalized=email.trim().toLowerCase()
   const client=await getSupabaseClient()
   if(!client)throw Error('Conexão indisponível. Tente novamente.')
   await sendAccessLink(client,normalized)
   setSentTo(normalized);setSeconds(60)
  }catch(e){setError(e instanceof Error?e.message:'Não foi possível enviar agora. Tente novamente.')}
  finally{inFlight.current=false;setBusy(false)}
 }
 if(demo)return children
 if(loading)return <main className="page"><p role="status">Abrindo seu acesso…</p></main>
 if(userId&&access==='checking')return <main className="page"><p role="status">Conferindo seu acesso…</p></main>
 if(userId&&access==='allowed')return <div key={userId}>{children}</div>
 if(userId)return <main className="page ai-settings stack">
  <p className="eyebrow">DEVER DE OUTRO NÍVEL</p>
  <h1 className="page-title">{access==='error'?'Não foi possível conferir seu acesso':'Seu acesso ainda não está liberado'}</h1>
  <p className="lede">{access==='error'?'Tente novamente em alguns instantes.':'Entre com o mesmo e-mail usado na compra. A liberação acontece após a confirmação do pagamento.'}</p>
  <button className="primary" onClick={()=>setRetry(v=>v+1)}>Conferir novamente</button>
  <button className="choice" onClick={async()=>{const client=await getSupabaseClient();const result=await client?.auth.signOut();if(result?.error)setError('Não foi possível sair. Tente novamente.')}}>Entrar com outro e-mail</button>
  {error?<p className="alert" role="alert">{error}</p>:null}
 </main>
 return <main className="page ai-settings stack">
  <p className="eyebrow">DEVER DE OUTRO NÍVEL</p>
  <h1 className="page-title">{sentTo?'Confira seu e-mail':'Seu próximo dever começa aqui'}</h1>
  <p className="lede">{sentTo?<>Se <strong>{sentTo}</strong> tem acesso liberado, você receberá um link. Abra o e-mail e toque em <strong>Abrir meu app</strong>.</>:'Informe o e-mail usado na compra para receber seu link de acesso. Sem criar senha.'}</p>
  {!sentTo?<form className="stack" onSubmit={submit}>
   <label htmlFor="account-email">Seu e-mail</label>
   <input id="account-email" className="input" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={254} required value={email} onChange={e=>setEmail(e.target.value)} disabled={busy}/>
   <button className="primary" disabled={busy||seconds>0}>{busy?'Enviando…':seconds>0?`Aguarde ${seconds}s`:'Receber meu link de acesso'}</button>
  </form>:<div className="stack">
   <p className="hint" role="status">O link abre seu acesso diretamente. Se não encontrar a mensagem, confira o spam. Use o link mais recente.</p>
   <button className="primary" disabled={busy||seconds>0} onClick={e=>void submit(e)}>{busy?'Reenviando…':seconds>0?`Reenviar em ${seconds}s`:'Reenviar meu link'}</button>
   <button className="choice" disabled={busy} onClick={()=>{setSentTo('');setError('')}}>Corrigir meu e-mail</button>
  </div>}
  {error?<p className="alert" role="alert">{error}</p>:null}
  <p className="hint">Suas atividades ficam na sua conta. Não compartilhe o link de acesso.</p>
 </main>
}
