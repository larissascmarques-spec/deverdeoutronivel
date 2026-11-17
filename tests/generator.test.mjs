import assert from 'node:assert/strict'
import {readFile,mkdtemp,rm,writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createRequire} from 'node:module'
import {build} from 'esbuild'
import {PDFDocument} from 'pdf-lib'
const dir=await mkdtemp(join(tmpdir(),'dever-test-'))
try{
 const bundle=join(dir,'core.mjs')
 await build({entryPoints:['supabase/functions/don-generate/contracts.ts'],bundle:true,platform:'node',format:'esm',outfile:bundle})
 const {calculate,validateContent,reviewApproved,CHECKS,imagePrompt}=await import(bundle)
 for(const [expression,result] of [['76+58',134],['180-(76+58)',46],['12/6',2],['15/8',1.875],['(2+3)*4',20],['0,1+0,2',.3],['-2+3',1]])assert.ok(Math.abs(calculate(expression)-result)<1e-9)
 for(const e of ['1/0','process.exit()','1;alert(1)','2**3','(1+2','1+','NaN'])assert.throws(()=>calculate(e))
 const answer=(id)=>({questionId:id,questionLabel:id,answer:'46',explanation:'180 menos 134 são 46.',openEnded:false,steps:['76 + 58 = 134','180 - 134 = 46'],acceptanceCriteria:''})
 const content={title:'A feira de livros',introduction:'Ajude a organizar os livros.',blocks:Array.from({length:3},(_,i)=>({title:'Etapa '+(i+1),context:'Um contexto completo.',illustration:'Livros em uma prateleira.',questions:[{id:'q'+i,text:'Quantos livros restam?',answer:answer('q'+i)}]})),extraChallenge:'Crie outro problema.',extraAnswer:{...answer('extra'),openEnded:true,acceptanceCriteria:'Dados suficientes e resultado coerente.'},motherGuide:{objective:'Resolver problemas.',materials:'Lápis e papel.',duration:'20 minutos',howToHelp:'Pergunte o que mudou.',commonMistakes:'Confundir juntar e retirar.',whenToPracticeMore:'Se não identificar a operação.'},arithmetic:[{expression:'180-(76+58)',result:46}]}
 validateContent(content,true)
 assert.throws(()=>validateContent({...content,arithmetic:[{expression:'180-134',result:45}]},true))
 assert.throws(()=>validateContent({...content,blocks:[content.blocks[0],content.blocks[0],content.blocks[2]]},true))
 const checks=Object.fromEntries(CHECKS.map(k=>[k,true]))
 assert.equal(reviewApproved({approved:true,checks,issues:[]}),true)
 assert.equal(reviewApproved({approved:true,checks:{...checks,layout:false},issues:[]}),false)
 assert.equal(reviewApproved({approved:true,checks,issues:['Erro de contagem']}),false)
 assert.ok(!imagePrompt(content,{year:3,subjectId:'matematica'},{code:'EF03MA06',description:'Resolver problemas.'}).includes('180 - 134 = 46'))
 const pdfBundle=join(dir,'pdf.mjs')
 await build({entryPoints:['supabase/functions/don-generate/pdf.ts'],bundle:true,platform:'node',format:'esm',outfile:pdfBundle,alias:{'npm:pdf-lib@1.17.1':'pdf-lib'}})
 const {imagesPDF,supportPDF}=await import(pdfBundle)
 const ref=await readFile('public/references/layout-aprovado.png')
 const child=await imagesPDF([ref]);const childDoc=await PDFDocument.load(child)
 assert.equal(childDoc.getPageCount(),1)
 assert.equal(childDoc.getPage(0).getWidth(),595.28)
 assert.equal(childDoc.getPage(0).getHeight(),841.89)
 for(const kind of ['answer_key','mother_guide','calculation_sheet']){
  const bytes=await supportPDF(kind,[content],'3º ano | EF03MA06 | Teste técnico')
  const d=await PDFDocument.load(bytes);assert.ok(d.getPageCount()>0);await writeFile(join(dir,kind+'.pdf'),bytes)
 }
 let handler
 globalThis.Deno={env:{get(name){return name==='SUPABASE_URL'?'https://example.supabase.co':'test-service-token'}},serve(fn){handler=fn}}
 globalThis.EdgeRuntime={waitUntil(){throw new Error('Unexpected background task')}}
 const savedFetch=globalThis.fetch
 globalThis.fetch=async()=>{throw new Error('Network is forbidden in this test')}
 try{
  for(const source of ['don-generate','don-ai-connection']){
   const target=join(dir,source+'.cjs')
   await build({entryPoints:['supabase/functions/'+source+'/index.ts'],bundle:true,platform:'node',format:'cjs',outfile:target,alias:{'npm:pdf-lib@1.17.1':'pdf-lib','npm:@supabase/supabase-js@2.80.0':'@supabase/supabase-js'}})
   createRequire(import.meta.url)(target)
   assert.equal((await handler(new Request('https://example.test',{method:'OPTIONS'}))).status,204)
   assert.equal((await handler(new Request('https://example.test',{method:'POST',body:'{}'}))).status,401)
  }
 }finally{globalThis.fetch=savedFetch;delete globalThis.Deno;delete globalThis.EdgeRuntime}
 const emailBundle=join(dir,'email.mjs')
 await build({entryPoints:['src/services/emailAccess.ts'],bundle:true,platform:'node',format:'esm',outfile:emailBundle})
 const {sendAccessLink}=await import(emailBundle)
 let sent
 await sendAccessLink({auth:{async signInWithOtp(request){sent=request;return {error:null}}}},'cliente@example.com','https://app.example.com')
 assert.deepEqual(sent,{email:'cliente@example.com',options:{shouldCreateUser:true,emailRedirectTo:'https://app.example.com/'}})
 assert.equal('password' in sent,false)
 await assert.rejects(()=>sendAccessLink({auth:{}},'invalid','https://app.example.com'))
 await assert.rejects(()=>sendAccessLink({auth:{async signInWithOtp(){return {error:{status:429}}}}},'cliente@example.com','https://app.example.com'),/Aguarde/)
 console.log('PASS: arithmetic, invalid inputs, answer IDs, review gates, child prompt, A4 PDF three support exports and unauthenticated endpoint rejection. No OpenAI API calls were made.')
}finally{await rm(dir,{recursive:true,force:true})}
