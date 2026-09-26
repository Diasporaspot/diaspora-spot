// Run with: node --env-file=.env --env-file=.env.local --import tsx scripts/event-capacity-staging-test.ts
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
const db = createClient(process.env.EVENT_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.EVENT_SUPABASE_SERVICE_ROLE_KEY!);
const prefix = `capacity-test-${randomUUID()}`;
const ids: string[] = [];
const event = (id: string, capacity = 1) => ({ id: `${prefix}-${id}`, capacity, closed: false, waitlist: false });
async function reserve(email: string, events = [event('one')], paid = true) {
 const {data,error} = await db.rpc('reserve_event_seats', { p_environment:'staging', p_product_id:events[0].id, p_product_type:events.length>1?'series':'workshop',p_email:email,p_name:'Capacity QA',p_phone:'',p_events:events,p_paid:paid,p_data:{} });
 assert.ifError(error); if(data.id) ids.push(data.id); return data;
}
async function main() {
 try {
  const results = await Promise.allSettled(Array.from({length:20},(_,i)=>reserve(`${i}@example.invalid`)));
  for (const result of results) if (result.status === 'rejected') throw result.reason;
  const concurrent = results.map(result => (result as PromiseFulfilledResult<Record<string, string>>).value);
  assert.equal(concurrent.filter(r=>r.id).length,1,'Exactly one concurrent buyer must reserve the final seat');
  assert.equal(concurrent.filter(r=>r.error==='full').length,19);
  const winner=concurrent.find(r=>r.id);
  assert.ok(winner);
  assert.equal((await reserve(winner.email)).error,'existing_booking');
  const failedSeries = await reserve('series@example.invalid',[event('series',10),event('two',10),event('one')]);
  assert.equal(failedSeries.error,'full');
  const partial = await db.from('event_seats').select('*').eq('event_id',event('two').id);
  assert.equal(partial.data?.length,0,'Failed series purchase must reserve no partial seats');
  const waiting = await Promise.all(Array.from({length:5},()=>db.rpc('join_event_waitlist',{p_environment:'staging',p_product_id:event('one').id,p_product_type:'workshop',p_email:'wait@example.invalid',p_name:'Waitlist QA',p_phone:'',p_events:[event('one')]})));
  waiting.forEach(r=>assert.ifError(r.error)); assert.equal(new Set(waiting.map(r=>r.data.id)).size,1,'Waitlist joins are idempotent');
  const confirmation = await db.rpc('transition_event_booking',{p_environment:'staging',p_id:winner.id,p_state:'confirmed',p_session_id:'cs_test_'+prefix});
  assert.ifError(confirmation.error);
  const replay = await db.rpc('transition_event_booking',{p_environment:'staging',p_id:winner.id,p_state:'released',p_session_id:'cs_test_'+prefix});
  assert.equal(replay.data.state,'confirmed','Late expiry cannot release a confirmed seat');
  const wrongEnvironment = await db.rpc('transition_event_booking',{p_environment:'production',p_id:winner.id,p_state:'confirmed',p_session_id:'cs_test_'+prefix});
  assert.ok(wrongEnvironment.error,'A production webhook cannot update a staging booking');
  const counts = await db.rpc('event_capacity_counts',{p_environment:'staging',p_event_ids:[event('one').id]});
  assert.deepEqual(counts.data,[{event_id:event('one').id,confirmed:1,held:0,waiting:1}]);
  const otherCounts = await db.rpc('event_capacity_counts',{p_environment:'production',p_event_ids:[event('one').id]});
  assert.equal(otherCounts.data[0].confirmed,0);
  const anonymous=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  const blocked=await anonymous.from('event_bookings').select('email').eq('id',winner.id);
  assert.ok(blocked.error || blocked.data?.length===0,'Public clients cannot read attendee PII');
  const denied=await anonymous.rpc('event_capacity_counts',{p_environment:'staging',p_event_ids:[event('one').id]});
  assert.ok(denied.error,'Public clients cannot invoke privileged RPCs');
  console.log('PASS: last-seat concurrency, duplicate bookings, atomic series, duplicate waitlist, webhook replay, environment isolation, exact counts, private data and RPCs.');
 } finally {
  if(ids.length) { const r=await db.from('event_bookings').delete().eq('environment','staging').in('id',ids);assert.ifError(r.error); }
  const r=await db.from('event_waitlist').delete().eq('environment','staging').eq('product_id',event('one').id);assert.ifError(r.error);
 }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
