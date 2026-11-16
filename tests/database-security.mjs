// Run with a locally installed @electric-sql/pglite using PGLITE_MODULE.
// Auth and Storage schemas below are test fixtures, not production migrations.
import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
const { PGlite } = await import(process.env.PGLITE_MODULE ?? '@electric-sql/pglite')
const db = new PGlite()
await db.exec(`
 create role anon; create role authenticated; create role service_role bypassrls;
 create schema auth; create schema storage;
 create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth,storage,public to authenticated,anon,service_role;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
 alter table storage.objects enable row level security;
 grant select on storage.objects to authenticated;
 insert into auth.users values('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');
`)
await db.exec(await readFile(new URL('../supabase/migrations/20261116192621_dever_activities_history_answers.sql',import.meta.url),'utf8'))
const owner='11111111-1111-4111-8111-111111111111', stranger='22222222-2222-4222-8222-222222222222'
const id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const request={year:1,subjectId:'matematica',topicLabel:'Contagem de objetos',difficulty:'essencial',pageCount:1,visualReferenceVersion:'layout-aprovado-v1',extraContext:null}
await db.query(`insert into public.don_activities(id,user_id,client_request_id,request) values($1,$2,gen_random_uuid(),$3)`,[id,owner,request])
await assert.rejects(db.query(`insert into public.don_activities(user_id,client_request_id,request) values($1,gen_random_uuid(),$2)`,[owner,{...request,year:null}]))
await assert.rejects(db.query(`insert into public.don_answer_keys values($1,'{}')`,[id]))
await assert.rejects(db.query(`update public.don_activities set status='completed' where id=$1`,[id]))
await db.query(`insert into public.don_answer_keys values($1,$2)`,[id,{entries:[{questionId:'q1',questionLabel:'1',answer:'3',explanation:'Contamos três objetos.',openEnded:false}]}])
for(const kind of ['child_activity','mother_guide','answer_key','calculation_sheet']) {
 const path=`${owner}/${id}/${kind}.pdf`
 await db.query(`insert into public.don_activity_files(activity_id,kind,object_path) values($1,$2,$3)`,[id,kind,path])
 await db.query(`insert into storage.objects(bucket_id,name) values('dever-activities',$1)`,[path])
}
await db.query(`insert into public.don_activity_pages(activity_id,page_number,object_path,width,height) values($1,1,$2,1240,1754)`,[id,`${owner}/${id}/page-1.png`])
const asUser=async(user)=>{await db.exec('reset role');await db.query(`select set_config('request.jwt.claim.sub',$1,false)`,[user]);await db.exec('set role authenticated')}
await asUser(owner)
assert.equal((await db.query('select * from public.don_activities')).rows.length,1)
assert.equal((await db.query('select * from public.don_answer_keys')).rows.length,0)
assert.equal((await db.query('select * from public.don_activity_files')).rows.length,0)
assert.equal((await db.query('select * from storage.objects')).rows.length,0)
await assert.rejects(db.exec(`update public.don_activities set status='completed'`))
await db.exec('reset role')
await db.exec(`insert into public.don_bncc_skills values('EF01MA01','Fixture de teste','Fixture','Fixture','https://example.test/fixture',now(),'test fixture')`)
const checks={bncc:true,calculations:true,spelling:true,clarity:true,grade:true,difficulty:true,curiosity:true,layout:true,originality:true,variety:true}
await assert.rejects(db.query(`update public.don_activities set status='completed',skill_code='EF01MA01',reviewed_revision=1,generation_pass_id=$2,review_pass_id=$2,quality_checks=$3 where id=$1`,[id,id,checks]))
await db.query(`update public.don_activities set status='completed',skill_code='EF01MA01',reviewed_revision=1,generation_pass_id=gen_random_uuid(),review_pass_id=gen_random_uuid(),quality_checks=$2 where id=$1`,[id,checks])
await assert.rejects(db.query(`update public.don_answer_keys set content=$2 where activity_id=$1`,[id,{entries:[{answer:'resposta alterada'}]}]))
await asUser(owner)
assert.equal((await db.query('select * from public.don_answer_keys')).rows.length,1)
const files=(await db.query('select * from public.don_activity_files')).rows
assert.equal(files.length,4)
assert.deepEqual((await db.query('select * from public.don_activity_files')).rows,files)
assert.equal((await db.query('select * from storage.objects')).rows.length,4)
await asUser(stranger)
for(const table of ['public.don_activities','public.don_answer_keys','public.don_activity_files','public.don_activity_pages','storage.objects']) assert.equal((await db.query(`select * from ${table}`)).rows.length,0)
await db.exec('reset role; set role anon')
await assert.rejects(db.query('select * from public.don_activities'))
await db.close()
console.log('PASS: request validation, incomplete release, second pass, owner-only history, unreleased answers/files, private downloads, stable files, cross-customer isolation and anonymous denial.')
