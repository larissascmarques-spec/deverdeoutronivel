import assert from 'node:assert/strict'
import {build} from 'esbuild'
import {mkdtemp,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
const dir=await mkdtemp(join(tmpdir(),'purchase-test-'))
try{
 await build({entryPoints:['supabase/functions/don-purchase-webhook/purchase.ts'],bundle:true,platform:'node',format:'esm',outfile:join(dir,'purchase.mjs')})
 const {purchaseEvent,equalSecret}=await import(join(dir,'purchase.mjs'))
 const sample={event:'PURCHASE_APPROVED',creation_date:Date.now(),data:{product:{id:123},buyer:{email:' Buyer@example.invalid '},purchase:{transaction:'TEST1'}}}
 assert.equal(purchaseEvent(sample,'123').email,'buyer@example.invalid')
 assert.equal(purchaseEvent(sample,'999'),null)
 assert.equal(purchaseEvent({...sample,event:'PURCHASE_BILLET_PRINTED'},'123'),null)
 assert.equal(purchaseEvent({...sample,event:'PURCHASE_REFUNDED'},'123').status,'revoked')
 assert.equal(purchaseEvent({...sample,event:'PURCHASE_CHARGEBACK'},'123').status,'revoked')
 assert.throws(()=>purchaseEvent({...sample,creation_date:NaN},'123'))
 assert.throws(()=>purchaseEvent({...sample,data:{...sample.data,buyer:{email:44}}},'123'))
 assert.equal(await equalSecret('correct','correct'),true)
 assert.equal(await equalSecret('wrong','correct'),false)
 console.log('PASS: product filter, unpaid event rejection, refunds, invalid payloads and webhook authentication')
}finally{await rm(dir,{recursive:true,force:true})}
