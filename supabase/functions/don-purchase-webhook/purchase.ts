export function purchaseEvent(body:any,productId:string){
 const states:Record<string,string>={PURCHASE_APPROVED:'active',PURCHASE_COMPLETE:'active',PURCHASE_REFUNDED:'revoked',PURCHASE_CHARGEBACK:'revoked'}
 const status=states[body?.event]
 if(!status||String(body?.data?.product?.id)!==productId)return null
 const rawEmail=body?.data?.buyer?.email
 const email=typeof rawEmail==='string'?rawEmail.trim().toLowerCase():''
 const transaction=body?.data?.purchase?.transaction,created=body?.creation_date
 if(!email||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||typeof transaction!=='string'||!transaction||transaction.length>160||typeof created!=='number'||!Number.isFinite(created)||created<946684800000||created>Date.now()+300000)throw Error('INVALID_EVENT')
 return {email,transaction,status,eventAt:new Date(created).toISOString(),productId}
}
export async function equalSecret(a:string,b:string){
 const enc=new TextEncoder(),x=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(a))),y=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(b)))
 let difference=0;for(let i=0;i<x.length;i++)difference|=x[i]^y[i]
 return difference===0
}
