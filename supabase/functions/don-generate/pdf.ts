import {PDFDocument,StandardFonts,rgb} from 'npm:pdf-lib@1.17.1';
import type {Content} from './contracts.ts';
const navy=rgb(.035,.17,.31),orange=rgb(1,.43,.025),gray=rgb(.22,.24,.28);
function safe(s:string){return s.replace(/[\u0000-\u0009\u000b-\u001f]/g,' ').replace(/[→⇒]/g,' > ').replace(/[−–—]/g,'-').replace(/[✓✔]/g,'OK').replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/[^\x20-\x7e\xa0-\xff]/g,' ')}
export async function imagesPDF(images:Uint8Array[]){const doc=await PDFDocument.create();for(const bytes of images){const image=await doc.embedPng(bytes);const page=doc.addPage([595.28,841.89]);const scale=Math.min(595.28/image.width,841.89/image.height);const w=image.width*scale,h=image.height*scale;page.drawImage(image,{x:(595.28-w)/2,y:(841.89-h)/2,width:w,height:h})}return doc.save()}
export async function textPDF(title:string,sections:{title:string;text:string}[],subtitle:string){
 const doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
 let page=doc.addPage([595.28,841.89]),y=734,pageNo=0;
 function header(){pageNo++;page.drawRectangle({x:0,y:780,width:595.28,height:62,color:navy});page.drawText(safe(title),{x:35,y:803,size:21,font:bold,color:rgb(1,1,1)});page.drawRectangle({x:0,y:773,width:595.28,height:7,color:orange});page.drawText(safe(subtitle).slice(0,93),{x:35,y:751,size:10,font,color:gray});page.drawText('Dever de Outro Nivel | '+pageNo,{x:35,y:24,size:9,font,color:gray})}
 function next(){page=doc.addPage([595.28,841.89]);y=734;header()}
 function wrap(text:string,size:number){const lines:string[]=[];for(const paragraph of safe(text).split(/\n/)){let line='';for(const word of paragraph.split(/\s+/)){const proposed=line?line+' '+word:word;if(font.widthOfTextAtSize(proposed,size)>515&&line){lines.push(line);line=word}else line=proposed}lines.push(line)}return lines}
 header();for(const section of sections){if(y<125)next();page.drawRectangle({x:32,y:y-8,width:531,height:29,color:rgb(.96,.97,.99),borderColor:rgb(.75,.8,.87),borderWidth:.6});page.drawText(safe(section.title).slice(0,76),{x:42,y,size:12,font:bold,color:navy});y-=33;
 for(const line of wrap(section.text,11)){if(y<55)next();page.drawText(line,{x:40,y,size:11,font,color:gray});y-=16}y-=17}
 return doc.save();
}
export async function supportPDF(kind:string,contents:Content[],subtitle:string){
 const sections:{title:string;text:string}[]=[];
 for(const [i,c] of contents.entries()){
 if(kind==='answer_key'){for(const b of c.blocks)for(const q of b.questions){const a=q.answer;sections.push({title:`Folha ${i+1} | ${q.id} - ${b.title}`,text:`${q.text}\nResposta: ${a.answer}\n${a.explanation}\n${a.steps.join('\n')}\n${a.openEnded?'Aceitar: '+a.acceptanceCriteria:''}`})}const a=c.extraAnswer;sections.push({title:`Folha ${i+1} | Desafio extra`,text:`${c.extraChallenge}\nResposta: ${a.answer}\n${a.explanation}\n${a.steps.join('\n')}\n${a.acceptanceCriteria}`})}
 else if(kind==='mother_guide'){const g=c.motherGuide;sections.push({title:`Folha ${i+1} | ${c.title}`,text:`O que a criança aprende: ${g.objective}\nMateriais: ${g.materials}\nTempo estimado: ${g.duration}\nComo ajudar sem entregar a resposta: ${g.howToHelp}\nErros comuns: ${g.commonMistakes}\nQuando praticar mais: ${g.whenToPracticeMore}`})}
 else {sections.push({title:`Folha ${i+1} | Espaço para os cálculos`,text:'Nome: __________________________________________\nData: __________________\nRegistre a identificação da pergunta antes de cada cálculo.\n\n'+Array(21).fill('________________________________________________________________').join('\n')})}
 }
 return textPDF(kind==='answer_key'?'Gabarito comentado':kind==='mother_guide'?'Guia da mãe':'Folha de cálculo',sections,subtitle)
}
