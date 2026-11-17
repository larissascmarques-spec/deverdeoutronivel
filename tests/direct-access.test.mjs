import assert from 'node:assert/strict'
import {build} from 'esbuild'
import {mkdtemp,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
const dir=await mkdtemp(join(tmpdir(),'direct-access-'))
try{
 const file=join(dir,'direct.mjs')
 await build({entryPoints:['src/services/directAccess.ts'],bundle:true,platform:'node',format:'esm',outfile:file})
 let cleaned=0,redeemed=0,verified=0
 globalThis.window={location:{hash:'#access_ticket='+('a'.repeat(43)),pathname:'/minha-ia',search:''},history:{replaceState(_s,_t,path){cleaned++;assert.equal(path,'/minha-ia')}}}
 const {openDirectAccess}=await import(file)
 const client={functions:{async invoke(name,{body}){assert.equal(name,'don-redeem-access');assert.equal(body.ticket,'a'.repeat(43));redeemed++;return {data:{token_hash:'fixture-hash',type:'magiclink'},error:null}}},auth:{async verifyOtp(value){verified++;assert.deepEqual(value,{token_hash:'fixture-hash',type:'magiclink'});return {data:{session:{user:{id:'fixture'}}},error:null}}}}
 await Promise.all([openDirectAccess(client),openDirectAccess(client)])
 assert.equal(cleaned,1);assert.equal(redeemed,1);assert.equal(verified,1)
 globalThis.window.location.hash=''
 const empty=await import(file+'?empty')
 await empty.openDirectAccess({})
 globalThis.window.location.hash='#access_ticket='+('b'.repeat(43))
 const failed=await import(file+'?failed')
 await assert.rejects(()=>failed.openDirectAccess({functions:{async invoke(){return {error:{context:{async json(){return {error:'Este acesso direto expirou ou já foi usado.'}}}}}}}}),/expirou/)
 console.log('PASS: one redemption across duplicate mounts, URL ticket removal, verified session, normal links and expired-ticket error')
}finally{delete globalThis.window;await rm(dir,{recursive:true,force:true})}
