import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const base = JSON.parse(await fs.readFile(path.join(root, '上海智能体数据库_V0.1.json'), 'utf8'));
const intent = JSON.parse(await fs.readFile(path.join(root, '上海意图与追问库_V0.1.json'), 'utf8'));

const extraModules = [
  ['SHM09','Suzhou Creek: a working waterway remade','How does a former industrial waterway become a cultural and public corridor?','urbanism|walk|repeat_visit','walk continuity|venue hours|weather'],
  ['SHM10','North Bund: port, refuge and skyline','What does Shanghai’s port-facing edge reveal that the central Bund does not?','history|photo|repeat_visit','museum hours|river access|weather'],
  ['SHM11','Jewish refugee Shanghai','How did a global war become part of one Shanghai neighbourhood’s memory?','history|diaspora|education','reservation|museum access|sensitivity'],
  ['SHM12','Sacred Shanghai: Longhua and Jade Buddha','What does religious practice look like inside a global commercial city?','religion|history|slow','temple rules|photography|festival crowds'],
  ['SHM13','Jing’an: temple, towers and consumption','How can sacred space, luxury retail and everyday mobility coexist?','architecture|urbanism|first_visit','crowds|temple access|weather'],
  ['SHM14','Shanghai cinema, print and visual culture','How did Shanghai learn to see itself through film, posters and mass culture?','film|design|history','programme|ticketing|venue access'],
  ['SHM15','1933 and adaptive reuse','When does preservation become a new public use rather than a frozen façade?','architecture|design|photo','access|events|crowds'],
  ['SHM16','Duolun and modern Chinese literature','Which streets reveal the literary and political debates of modern Shanghai?','literature|history|walk','opening|street works|weather'],
  ['SHM17','Shanghai food as social geography','What can breakfast, ordering and table rhythm reveal without treating food as a stunt?','food|culture|repeat_visit','shop availability|dietary needs|queues'],
  ['SHM18','A humane first 24 hours','How can a visitor land, pay, navigate and still have one meaningful Shanghai moment?','arrival|first_visit|low_energy','airport transport|payment|hotel location'],
  ['SHM19','Shanghai for the creative worker','Which spaces reveal contemporary design, making and work—not just cafés?','creative|design|repeat_visit','programme|access|weekday hours'],
  ['SHM20','Family Shanghai beyond theme parks','How can families read the city without exhausting children or adults?','family|education|rain','entry|toilets|recovery time'],
  ['SHM21','Shanghai after a week','What changes when the visitor has time to observe routines rather than landmarks?','slow|repeat_visit|remote_work','neighbourhood conditions|events|weather'],
  ['SHM22','Ethical neighbourhood observation','How can a visitor notice everyday city life without intruding on it?','ethics|slow|photo','privacy|photography|resident boundaries'],
  ['SHM23','Shanghai to Suzhou: decision, not default','When does Suzhou add a genuinely different question to a Shanghai trip?','jiangnan|gardens|3plus_days','rail|destination availability|weather'],
  ['SHM24','Shanghai to Hangzhou: decision, not default','When does Hangzhou add landscape and tea culture rather than another rushed day?','jiangnan|nature|3plus_days','rail|destination availability|weather']
].map(([id,name,question,roles,dynamic_checks]) => ({id,name,question,roles,dynamic_checks}));

const source = 'https://english.shanghai.gov.cn/en-TravelinShanghai/';
const extraPoints = [
  ['SH023','Suzhou Creek river walk (field-check candidate)','SHM09','waterway renewal lens','A candidate for reading industry, ecology and public space along a less postcard-driven water edge.','Late afternoon','Continuity and construction must be field-checked.','B',true,source],
  ['SH024','North Bund waterfront','SHM10','port-facing skyline lens','A broader port and river perspective that shifts the story away from the central Bund alone.','Morning or blue hour','Wind, crowding and access are dynamic.','A',true,'https://www.meet-in-shanghai.net/en/news/explore-the-wonders-of-urban-tourism-in-shanghai-at-north-bund-481171/'],
  ['SH025','Shanghai Jewish Refugees Museum','SHM11','diaspora-history interpreter','A focused entry into Shanghai’s role as refuge during World War II, best handled with historical care.','Confirmed opening slot','Reservation, access and emotional pacing need checking.','A',true,'https://www.meet-in-shanghai.net/en/news/explore-the-wonders-of-urban-tourism-in-shanghai-at-north-bund-481171/'],
  ['SH026','Longhua Temple area','SHM12','religious-practice context','A possible lens on ritual, time and temple-city relationships beyond a generic sightseeing stop.','Non-peak daytime','Temple etiquette, photography and festivals are dynamic.','B',true,source],
  ['SH027','Jade Buddha Temple','SHM12','urban religion counterpoint','A potential comparison with Longhua when a guest explicitly wants living religious practice.','Confirmed opening slot','Do not combine by default; access and rules must be checked.','A',true,source],
  ['SH028','Jing’an Temple district','SHM13','sacred-commercial contrast','A concise urban contrast between temple, metro, retail and high-density city life.','Late afternoon','Crowds and temple rules vary.','B',true,source],
  ['SH029','Shanghai Film Museum (programme-led)','SHM14','visual-culture candidate','Choose only for guests interested in cinema, media or twentieth-century visual culture.','After programme check','Programme, language support and opening are dynamic.','A',true,source],
  ['SH030','Shanghai Propaganda Poster Art Centre (candidate)','SHM14','visual-culture candidate','Potentially useful for design and political-visual-culture questions, not as a default stop.','After access check','Access, location and ticketing must be verified.','C',true,source],
  ['SH031','1933 Old Millfun','SHM15','adaptive-reuse detail','A strong architectural case when the guest wants form, reuse and changing public use.','Weekday daytime','Events, access and crowding vary.','B',true,source],
  ['SH032','Duolun Road cultural street (field-check candidate)','SHM16','literary-street candidate','A potential route for modern Chinese literary and civic history, requiring a coherent field-checked loop.','Weekday daytime','Current venues and pedestrian conditions need verification.','C',true,source],
  ['SH033','Shanghai breakfast context (field-check candidate)','SHM17','food-social-geography candidate','A future participatory food layer centred on timing, ordering and table rhythm rather than a ranked restaurant list.','Morning','No specific venue or price before field and dietary checks.','F',true,'internal field research required'],
  ['SH034','Shanghai first-evening orientation walk','SHM18','arrival recovery module','A short, low-decision first-evening block after a long-haul arrival, tailored to hotel location and energy.','Arrival evening','No fixed route until arrival conditions and hotel are known.','F',true,'internal operational design'],
  ['SH035','Power Station of Art (programme-led)','SHM19','creative-industry candidate','Potentially valuable when a current programme supports a question about contemporary art and industrial reuse.','After programme check','Exhibition and transport must be rechecked.','A',true,source],
  ['SH036','Shanghai Natural History Museum (family candidate)','SHM20','family learning anchor','A possible indoor learning anchor for family plans when current access and interest align.','Confirmed opening slot','Reservation, queues and age fit are dynamic.','A',true,source],
  ['SH037','Neighbourhood routine observation protocol','SHM21','slow-travel method','A method card, not a destination: allow time for one repeated street, park or market edge without extracting private life.','Morning or late afternoon','Must stay within public, non-intrusive boundaries.','F',true,'internal ethics protocol'],
  ['SH038','Public-space photography protocol','SHM22','ethical photo method','A method card that helps photographers distinguish public composition from intrusive capture of strangers.','Any daylight','Local restrictions and consent always take priority.','F',true,'internal ethics protocol'],
  ['SH039','Suzhou extension handoff','SHM23','destination handoff','A decision node: hand off to the future Suzhou database only after time, pacing and garden/canal intent are explicit.','After Shanghai plan','Rail and destination facts dynamic.','F',true,'internal routing rule'],
  ['SH040','Hangzhou extension handoff','SHM24','destination handoff','A decision node: hand off to the future Hangzhou database only after landscape/tea intent and overnight capacity are explicit.','After Shanghai plan','Rail and destination facts dynamic.','F',true,'internal routing rule']
].map(([id,name,module,role,why,best_time,friction,evidence,dynamic,source]) => ({id,name,module,role,why,best_time,friction,evidence,dynamic,source,status:'content_foundation_not_field_verified'}));

const newSignals = [
  ['jet lag','low-decision recovery','SHM18'],['religion','etiquette and living practice','SHM12|SHM13'],['Jewish history','diaspora and wartime Shanghai','SHM11'],['film','visual culture and programme quality','SHM14'],['literature','modern Chinese debate and streets','SHM16'],['creative work','contemporary making not café lists','SHM19|SHM06'],['one week','routines and repeat observation','SHM21|SHM22'],['airport layover','buffer time and low-risk orientation','SHM18'],['accessibility','step, seat and indoor resilience','SHM20|SHM04'],['ethical photography','composition without intrusion','SHM22']
].map(([signal,latent_need,priority]) => ({signal,latent_need,priority}));
const followUps = [...intent.follow_up_rules.map(r => ({when:r.when,ask:r.ask})),
  {when:'religion request',ask:'Are you looking for history, living practice, architecture, or quiet observation?'},
  {when:'arrival request',ask:'Which airport/station, arrival time, hotel area and energy level should the first evening accommodate?'},
  {when:'creative request',ask:'Which matters more: contemporary art, design retail, industrial reuse, film, or meeting makers?'}
];
const localizations = [...base.route_modules, ...extraModules].map(m => ({module_id:m.id,english_title:m.name,guest_promise:m.question,controlled_output:'Use as a building block; re-check every dynamic operating fact before delivery.'}));
const storyCards = [
  ['SC01','River as city structure','SHM01'],['SC02','Institutional Bund','SHM01'],['SC03','Lived historic district','SHM02'],['SC04','Old city continuity','SHM03'],['SC05','One museum, one question','SHM04'],['SC06','Public life without spectacle','SHM05'],['SC07','Industrial public space','SHM06'],['SC08','Night as tempo','SHM07'],['SC09','Waterway reuse','SHM09'],['SC10','Port and refuge','SHM10'],['SC11','Diaspora memory','SHM11'],['SC12','Religion in the megacity','SHM12'],['SC13','Visual culture','SHM14'],['SC14','Ethical observation','SHM22'],['SC15','Jiangnan extension choice','SHM23']
].map(([id,title,module]) => ({id,title,module,status:'controlled_editorial'}));
const profiles = ['first_time_city_reader','architecture_walker','family_low_friction','art_design_repeat','slow_ethical_observer','arrival_layover'].map(id => ({id,status:'supported'}));
const regression = Array.from({length:60},(_,i) => ({id:`SH-R${String(i+1).padStart(3,'0')}`,scenario:['first_visit','architecture','family','rain','tai_chi','art_design','history','arrival','slow','jiangnan'][i%10],must_include:['dynamic_recheck','no_unverified_sale','route_pacing'][i%3],expected:'draft_for_human_review'}));
const v1 = {
  ...base,
  metadata:{...base.metadata,version:'1.0',checked_at:'2026-08-02',status:'content_foundation_not_field_verified',v1_definition:'40 points, 24 modules, 24 controlled localizations, 30 signals, 15 follow-up rules, 15 story cards, 60 regression cases'},
  route_modules:[...base.route_modules,...extraModules], route_module_localizations:localizations,
  points:[...base.points,...extraPoints], story_cards:storyCards,
  signals:[...intent.signals.map(([signal,latent_need,priority])=>({signal,latent_need,priority})),...newSignals],
  follow_up_rules:followUps, profiles, regression_tests:regression,
  machine_regression:{version:'1.0',required_case_count:60,invariants:['no_unverified_sale','dynamic_recheck','resident_privacy','route_pacing','no_internal_ids']},
  v1_release_gate:{content:'complete',runtime:'pending_v1',field:'0_of_6',commercial_experience:'not_released'}
};
if (v1.route_modules.length !== 24 || v1.points.length !== 40 || v1.signals.length !== 30 || v1.follow_up_rules.length !== 15 || v1.regression_tests.length !== 60) throw new Error('V1 count invariant failed');
await fs.writeFile(path.join(root,'上海主城智能体数据库_V1.0.json'), JSON.stringify(v1,null,2)+'\n');
console.log(JSON.stringify({modules:v1.route_modules.length,points:v1.points.length,signals:v1.signals.length,followUps:v1.follow_up_rules.length,storyCards:v1.story_cards.length,regressions:v1.regression_tests.length},null,2));
