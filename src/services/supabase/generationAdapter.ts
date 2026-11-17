import {authenticatedClient,readActivity} from './activityRepository'
import {IntegrationError} from '../errors'
import type {GenerationService} from '../interfaces'
let pending:{signature:string;id:string}|null=null
export async function generationCall(body:object){
 const client=await authenticatedClient()
 const {data,error}=await client.functions.invoke('don-generate',{body})
 if(error){let message='Não foi possível enviar o pedido. Tente novamente.';try{message=(await error.context.json()).error||message}catch{/* no readable response */}throw new IntegrationError(message,'request_failed')}
 return data as {id:string}
}
const advancing=new Set<string>()
export const generationAdapter:GenerationService={
 async createRequest(request){
  const signature=JSON.stringify(request)
  if(pending?.signature!==signature)pending={signature,id:crypto.randomUUID()}
  const result=await generationCall({action:'create',request,clientRequestId:pending.id})
  pending=null
  const job=await readActivity(result.id)
  if(!job)throw new IntegrationError('O pedido foi recebido. Consulte Minhas atividades.','request_failed')
  return job
 },
 async getJob(id){
  const job=await readActivity(id)
  if(job&&['awaiting','processing'].includes(job.status)&&!advancing.has(id)){
   advancing.add(id)
   void generationCall({action:'advance',id}).finally(()=>advancing.delete(id)).catch(()=>{/* the next poll can resume; status stays visible */})
  }
  return job
 },
 async retry(id){
  await generationCall({action:'retry',id,confirmCharges:true})
  const job=await readActivity(id)
  if(!job)throw new IntegrationError('Pedido não encontrado.','request_failed')
  return job
 }
}
