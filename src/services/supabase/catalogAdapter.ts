import {authenticatedClient} from './activityRepository'
import {SUBJECT_LABELS,type SchoolYear,type SubjectId} from '../../types/contracts'
import type {CatalogService} from '../interfaces'
import {IntegrationError} from '../errors'
const labels:Record<string,string>={EF15LP03:'Encontrar informações no texto',EF01MA08:'Adição e subtração',EF02MA06:'Adição e subtração',EF03MA06:'Adição e subtração',EF04MA03:'Problemas de adição e subtração',EF05MA07:'Adição e subtração com decimais',EF01CI01:'Os materiais dos objetos',EF02CI04:'Plantas e animais do cotidiano',EF03CI04:'Como vivem os animais',EF04CI04:'Cadeias alimentares',EF05CI01:'Propriedades dos materiais',EF01HI01:'Minhas lembranças e meu crescimento',EF02HI01:'Convivência na comunidade',EF03HI01:'A formação da cidade',EF04HI01:'Mudanças e permanências no tempo',EF05HI01:'A formação dos povos',EF01GE01:'Os lugares onde vivemos',EF02GE01:'Migrações na comunidade',EF03GE01:'Culturas da cidade e do campo',EF04GE01:'Diversidade cultural',EF05GE01:'População e migrações'}
function normalize(s:string){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
export const catalogAdapter:CatalogService={
 async listYears(){return [1,2,3,4,5]},
 async listSubjects(){return Object.entries(SUBJECT_LABELS).map(([id,name])=>({id:id as SubjectId,name}))},
 async searchTopics({year,subjectId,query}){
  const client=await authenticatedClient()
  const codes:Record<SubjectId,string>={'lingua-portuguesa':'LP',matematica:'MA',ciencias:'CI',historia:'HI',geografia:'GE'}
  const {data,error}=await client.from('don_bncc_skills').select('code,knowledge_object,description')
  if(error)throw new IntegrationError('Não foi possível abrir os assuntos. Tente novamente.','request_failed')
  const words=normalize(query).split(/\s+/).filter(Boolean)
  return data.filter(s=>s.code.slice(4,6)===codes[subjectId]&&(['0'+year,'15',year<=2?'12':'35'].includes(s.code.slice(2,4)))&&words.every(w=>normalize((labels[s.code]||'')+' '+s.knowledge_object+' '+s.description).includes(w))).map(s=>({id:s.code,year:year as SchoolYear,subjectId,label:labels[s.code]||s.knowledge_object.slice(0,120)}))
 }
}
