import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import { AnswerKeyPanel } from '../src/components/ui/AnswerKeyPanel'
import { parseAnswerKey } from '../src/services/supabase/parseAnswerKey'

const entry={questionId:'1a',questionLabel:'Questão 1 — a',answer:'14',explanation:'8 + 6 = 14.',openEnded:false,steps:['Some 8 e 2 para completar 10.','Acrescente os 4 restantes: 14.']}
const key=parseAnswerKey({entries:[entry]})
assert.equal(key?.entries[0].answer,'14')
const html=renderToStaticMarkup(<AnswerKeyPanel answerKey={key} simulated={false} />)
assert.match(html,/Ver gabarito/)
assert.match(html,/8 \+ 6 = 14/)
assert.match(html,/4 restantes/)
assert.throws(()=>parseAnswerKey({entries:[entry,entry]}))
assert.throws(()=>parseAnswerKey({entries:[{...entry,explanation:''}]}))
assert.throws(()=>parseAnswerKey({entries:[{...entry,openEnded:true}]}))
assert.throws(()=>parseAnswerKey({entries:[{...entry,steps:[null]}]}))
assert.equal(parseAnswerKey(null),null)
const demo=renderToStaticMarkup(<AnswerKeyPanel simulated />)
assert.match(demo,/não há respostas geradas/)
assert.doesNotMatch(demo,/8 \+ 6/)
const escaped=renderToStaticMarkup(<AnswerKeyPanel answerKey={{entries:[{...entry,answer:'<script>alert(1)</script>'}]}} simulated={false} />)
assert.doesNotMatch(escaped,/<script>/)
assert.match(escaped,/&lt;script&gt;/)
console.log('PASS: answers, explanations, steps, duplicate IDs, invalid data, open-answer criteria, honest demo and escaped output.')
