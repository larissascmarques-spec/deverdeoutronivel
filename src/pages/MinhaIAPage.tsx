
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { isDemoMode } from '../config/env'
import { getSupabaseClient } from '../lib/supabaseClient'

type Status = { connected: boolean; tested_at: string | null; generation_enabled: boolean }
export function MinhaIAPage() {
 const demo=isDemoMode()
 const [signed,setSigned]=useState(false)
 const [loading,setLoading]=useState(!demo)
 const [busy,setBusy]=useState(false)
 const [status,setStatus]=useState<Status|null>(null)
 const [email,setEmail]=useState('')
 const [password,setPassword]=useState('')
 const [key,setKey]=useState('')
 const [consent,setConsent]=useState(false)
 const [message,setMessage]=useState('')
 const [error,setError]=useState('')
 const lock=useRef(false)
 async function call(method:'GET'|'POST'|'DELETE',body?:object){
  const client=await getSupabaseClient()
  if(!client)throw new Error('A conexão do aplicativo ainda não está disponível.')
  const {data:{session}}=await client.auth.getSession()
  if(!session)throw new Error('Entre na sua conta para continuar.')
  const {data,error:failure}=await client.functions.invoke('don-ai-connection',{method,body,headers:{Authorization:'Bearer '+session.access_token}})
  if(failure){
   let detail=''
   try{detail=(await failure.context.json()).error}catch{/* response may be unavailable */}
   throw new Error(detail||'Não foi possível conectar agora. Tente novamente.')
  }
  return data as Status & {message?:string}
 }
 useEffect(()=>{
  if(demo)return
  let active=true
  let cleanup:undefined|(()=>void)
  getSupabaseClient().then(async client=>{
   if(!client)throw new Error('A conexão do aplicativo ainda não está disponível.')
   const {data}=client.auth.onAuthStateChange((_event,session)=>{
    if(!active)return
    setSigned(Boolean(session));setStatus(null);setKey('');setPassword('')
    setLoading(false)
   })
   cleanup=()=>data.subscription.unsubscribe()
   const {data:{session}}=await client.auth.getSession()
   if(active){setSigned(Boolean(session));setLoading(false)}
  }).catch(()=>{if(active){setError('Não foi possível abrir sua conta. Atualize a página.');setLoading(false)}})
  return()=>{active=false;cleanup?.()}
 },[demo])
 useEffect(()=>{
  if(!signed)return
  let active=true
  call('GET').then(data=>{if(active)setStatus(data)}).catch(e=>{if(active)setError(e.message)})
  return()=>{active=false}
 },[signed])
 async function run(task:()=>Promise<void>){
  if(lock.current)return
  lock.current=true;setBusy(true);setError('');setMessage('')
  try{await task()}catch(e){setError(e instanceof Error?e.message:'Tente novamente.')}
  finally{lock.current=false;setBusy(false)}
 }
 async function login(event:FormEvent){
  event.preventDefault()
  await run(async()=>{
   const client=await getSupabaseClient()
   if(!client)throw new Error('Conexão indisponível.')
   const {error:failure}=await client.auth.signInWithPassword({email:email.trim(),password})
   setPassword('')
   if(failure)throw new Error('Não foi possível entrar. Confira seu e-mail e senha de acesso ao aplicativo.')
  })
 }
 async function connect(event:FormEvent){
  event.preventDefault()
  if(demo||!consent||!signed)return
  const submitted=key.trim();setKey('')
  await run(async()=>{
   const data=await call('POST',{action:'connect',key:submitted})
   setStatus(data);setConsent(false);setMessage(data.message||'IA conectada.')
  })
 }
 return <section className="ai-settings stack">
  <div className="page-heading"><p className="eyebrow">SUA CONTA</p><h1 className="page-title">Minha IA</h1><p className="lede">Conecte sua chave da OpenAI uma vez para usar sua própria conta de IA.</p></div>
  <p className="alert">O uso da API é cobrado pela OpenAI na sua conta. A assinatura do ChatGPT não inclui esse uso.</p>
  <details className="details" open><summary>Como conectar em 3 passos</summary>
   <ol className="ai-steps">
    <li>Abra <a href="https://platform.openai.com/settings/organization/billing/overview" target="_blank" rel="noreferrer">a cobrança da OpenAI</a> e confira o saldo e as condições da API.</li>
    <li>Em <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">Chaves de API</a>, crie uma chave secreta para este aplicativo e copie. Ela costuma começar com <strong>sk-</strong>.</li>
    <li>Volte aqui, cole a chave e toque em <strong>Conectar minha IA</strong>. Aguarde a confirmação.</li>
   </ol>
   <p className="hint">Não envie sua chave por mensagem. O aplicativo não mostra a chave depois de salva. O teste de conexão não gera material.</p>
  </details>
  {demo?<p className="alert">Esta é uma prévia. Não cole sua chave aqui. A conexão estará disponível na versão publicada com acesso à sua conta.</p>:loading?<p role="status">Abrindo sua conta…</p>:!signed?
   <form className="stack" onSubmit={login}><h2>Entre na sua conta</h2><p>Use o acesso que você recebeu para o aplicativo.</p>
   <label htmlFor="ai-email">E-mail</label><input id="ai-email" className="input" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/>
   <label htmlFor="ai-password">Senha do aplicativo</label><input id="ai-password" className="input" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/>
   <button className="primary" disabled={busy}>{busy?'Entrando…':'Entrar'}</button></form>:
   <div className="stack">
    <p role="status"><strong>{status===null?'Consultando conexão…':status.connected?'Sua IA está conectada':'Sua IA ainda não está conectada'}</strong>{status?.tested_at?<><br/>Último teste: {new Date(status.tested_at).toLocaleString('pt-BR')}</>:null}</p>
    {status?.connected?<div className="ai-actions"><button className="choice" disabled={busy} onClick={()=>run(async()=>{const data=await call('POST',{action:'test'});setStatus(data);setMessage(data.message||'Conexão testada.')})}>Testar conexão</button><button className="choice" disabled={busy} onClick={()=>{if(window.confirm('Desconectar sua IA? Você poderá conectar outra chave depois.'))void run(async()=>{setStatus(await call('DELETE'));setMessage('IA desconectada. Revogue também a chave na OpenAI se não for usá-la mais.')})}}>Desconectar</button></div>:null}
    <form className="stack" onSubmit={connect}>
     <label htmlFor="ai-key">{status?.connected?'Trocar a chave':'Sua chave da OpenAI'}</label>
     <input id="ai-key" className="input" type="password" autoComplete="off" autoCapitalize="none" spellCheck={false} required minLength={20} maxLength={512} value={key} onChange={e=>setKey(e.target.value)} placeholder="sk-…" aria-describedby="ai-key-help" disabled={busy||status===null}/>
     <p id="ai-key-help" className="hint">Sua chave fica criptografada no servidor. Uma chave nova só substitui a anterior depois de validada.</p>
     <label className="ai-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>Entendo que a geração terá custos na minha conta da OpenAI.</label>
     <button className="primary" disabled={busy||!consent||!key.trim()||status===null}>{busy?'Aguarde…':status?.connected?'Salvar nova chave':'Conectar minha IA'}</button>
    </form>
    <p className="hint">A geração de atividades ainda está em preparação. Conectar sua chave agora não libera nem inicia uma geração.</p>
    <button className="choice" disabled={busy} onClick={()=>run(async()=>{const client=await getSupabaseClient();const result=await client?.auth.signOut();if(result?.error)throw new Error('Não foi possível sair. Tente novamente.');setStatus(null);setKey('')})}>Sair da minha conta</button>
   </div>}
  {error?<p className="alert" role="alert">{error}</p>:null}
  {message?<p role="status">{message}</p>:null}
 </section>
}
