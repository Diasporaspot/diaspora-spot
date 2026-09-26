import { getCliClient } from 'sanity/cli';
const client = getCliClient({ apiVersion: '2025-06-02' });
async function main() {
 const base={_type:'workshop',status:'staging',date:'2027-12-31',time:'18:00',timezone:'WAT',duration:'30 min',format:'Staging demo',host:'DiasporaSpot QA',spotsLabel:'Live availability shown at registration',bookingStatus:'booking-open',currency:'gbp',icon:'people',iconTone:'warm',ctaLabel:'Reserve a seat',featured:false,capacity:2};
 for(const [id,title,slug,paid] of [
  ['capacity-demo-free','Capacity Demo — Free','capacity-demo-free',false],
  ['capacity-demo-paid','Capacity Demo — Test Payment','capacity-demo-paid',true],
 ] as const) {
  await client.createIfNotExists({...base,_id:id,title,slug:{_type:'slug',current:slug},paymentType:paid?'paid':'free',price:paid?5:0,
   oneLiner:'Two seats. Book a place, fill the event, and try the waiting list.',
   description:'Staging-only capacity demo. The event has two seats. Once both are confirmed or reserved in checkout, registration becomes a waiting list. Increase capacity in Sanity to reopen booking. No real payments are taken. Test addresses are not emailed unless explicitly approved.'});
  await client.patch(id).set({ ctaLabel: 'Reserve a seat' }).commit();
 }
 console.log('Created staging-only free and paid capacity demo workshops.');
 const project=await client.projects.getById(client.config().projectId!);
 console.log(JSON.stringify({studioHost:project.studioHost,members:project.members.map(m=>({role:m.role,isCurrentUser:m.isCurrentUser}))}));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
