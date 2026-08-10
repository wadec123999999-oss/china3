#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const question = (id, priority, triggers, ask, decision_effect) => ({ id, priority, triggers, ask, decision_effect });
const latent = (id, signals, confirmation_question, effect) => ({ id, signals, confirmation_question, effect });

const productUnits = [
  {
    id: 'shanghai', label: 'Shanghai', aliases: ['shanghai', '上海'], min_protected_nights: 2,
    city_database_ids: ['shanghai'],
    database_refs: ['../shanghai-agent-database-20260802/上海主城智能体数据库_V1.0.json'],
    status: 'human_check_pilot',
    identity: { what_it_is: 'A readable city-scale contrast between river, historic fabric, migration and contemporary urban life.', not_for: 'A tower-and-shopping checklist or an unverified Tai Chi/creative-studio promise.' },
    selection_rules: {
      include_when: ['architecture or urban history is a priority', 'the traveller wants a gentle first China city', 'the traveller needs a strong public-transport base'],
      protect: ['one coherent neighbourhood question per half day', 'arrival and recovery time'],
      exclude_or_split_when: ['one-night stop with no full day', 'the request depends on private homes, teachers or studios without a current partner record']
    },
    latent_need_rules: [
      latent('architecture_depth_vs_photo', ['architecture', 'facades', 'photos', 'art deco'], 'Do you want to photograph façades, understand their history, or see how old buildings are reused today?', 'Chooses the reading layer and prevents an overfilled landmark loop.'),
      latent('arrival_friction', ['first visit', 'late arrival', 'airport', 'payment'], 'What time can you actually leave your hotel on the first full day, and are mobile data and payment already working?', 'Protects the first day from a false full-day assumption.'),
      latent('slow_city_vs_extension', ['hangzhou', 'suzhou', 'jiangnan', 'extra night'], 'Would one more Shanghai neighbourhood be better than adding Hangzhou or Suzhou with another transfer?', 'Decides whether to keep Shanghai deep or extend to Jiangnan.'),
      latent('participatory_access', ['tai chi', 'teacher', 'maker', 'local'], 'Would a public, consent-based observation route still meet your aim if a private introduction is unavailable?', 'Converts private-access expectations into a safe public alternative.')
    ],
    follow_up_questions: [
      question('SHI01', 1, ['days_missing', 'dates_missing'], 'How many protected full days do you have after arrival and before departure?', 'Sets the route depth and whether a Jiangnan extension is realistic.'),
      question('SHI02', 1, ['architecture', 'design', 'photo'], 'Do you want façades and photographs, historical context, or contemporary urban reuse?', 'Selects the primary architecture module.'),
      question('SHI03', 2, ['first_visit', 'mobility_unknown', 'family'], 'Any mobility needs, children, older relatives, or limits on stairs and long walks?', 'Changes the walking loop, seating and transfer plan.'),
      question('SHI04', 2, ['hangzhou', 'suzhou', 'extension'], 'Do you have an extra night for Jiangnan, or would another Shanghai day be more valuable?', 'Prevents a rushed same-day add-on.'),
      question('SHI05', 2, ['tai_chi', 'teacher', 'private_access'], 'Is your priority observation, a beginner session, or serious training—and what English instruction and physical limits matter?', 'Routes to human review before any teacher is mentioned.')
    ],
    human_review_triggers: ['dynamic opening/reservation/transport facts', 'Tai Chi or teacher request', 'private home/studio or community access', 'mobility, medical, severe allergy or child-safety constraints'],
    output_emphasis: ['explain one urban relationship', 'give a calm main route and a rain/low-energy branch', 'name what to delete rather than add']
  },
  {
    id: 'hangzhou_suzhou', label: 'Hangzhou–Suzhou', aliases: ['hangzhou', 'suzhou', '杭州', '苏州', 'jiangnan'], min_protected_nights: 3,
    city_database_ids: ['hangzhou', 'suzhou'],
    database_refs: ['../hangzhou-agent-database-20260802/杭州智能体数据库_V0.1.json', '../suzhou-agent-database-20260802/苏州智能体数据库_V0.1.json'],
    status: 'content_foundation',
    identity: { what_it_is: 'A Jiangnan choice: lake/tea/temple rhythm or gardens/canals/craft, with transfer cost made explicit.', not_for: 'Shanghai plus two water-town day trips squeezed into one day.' },
    selection_rules: {
      include_when: ['the traveller has at least three protected nights', 'landscape, tea, gardens or canals are the actual question', 'a slower regional contrast is more valuable than another megacity'],
      protect: ['choose Hangzhou or Suzhou as the primary question before combining them', 'one overnight when the traveller wants depth'],
      exclude_or_split_when: ['same-day return is mandatory and the traveller wants both cities', 'the trip has less than three protected nights']
    },
    latent_need_rules: [
      latent('day_trip_vs_overnight', ['same day', 'day trip', 'overnight', 'from Shanghai'], 'Must this be a same-day return from Shanghai, or can you protect one overnight?', 'Determines whether a coherent route is possible.'),
      latent('lake_vs_garden', ['west lake', 'tea', 'garden', 'canal'], 'Would you rather read lake/tea/temple landscapes or gardens/canals/craft in detail?', 'Chooses one Jiangnan identity instead of stacking similar scenery.'),
      latent('weather_and_surface', ['rain', 'heat', 'stairs', 'mobility'], 'What weather, walking or stair threshold requires a shorter or indoor alternative?', 'Controls the outdoor/heritage fallback.'),
      latent('buying_vs_learning', ['tea purchase', 'craft', 'silk', 'workshop'], 'Are you learning about the material culture, buying something, or seeking a verified participatory activity?', 'Prevents unverified purchase/workshop promises.')
    ],
    follow_up_questions: [
      question('JQI01', 1, ['extension', 'same_day', 'overnight'], 'Are you willing to stay overnight, or must this be a same-day return from Shanghai?', 'Determines route continuity.'),
      question('JQI02', 1, ['lake', 'tea', 'west_lake', 'garden', 'canal'], 'Do you want lake/tea/temple pace or gardens/canals/craft density—and how many days can you truly protect?', 'Chooses Hangzhou versus Suzhou and the night split.'),
      question('JQI03', 2, ['tea', 'tea_purchase', 'craft', 'performance'], 'Are you mainly learning, buying, watching a current programme, or seeking a verified hands-on activity?', 'Sets the research-only or human-check boundary.'),
      question('JQI04', 2, ['religion', 'mobility', 'rain', 'heat'], 'What terrain and weather can your group comfortably handle?', 'Selects a lower-exposure route.'),
      question('JQI05', 2, ['multi_city'], 'Which city comes before and after Jiangnan, and where is your recovery buffer?', 'Avoids hidden transfer fatigue.')
    ],
    human_review_triggers: ['garden/temple/cultural venue opening and reservation', 'tea or craft purchase/participation', 'weather and water-town transport', 'mobility or family constraints'],
    output_emphasis: ['state the one Jiangnan question', 'show transfer time as part of the product', 'offer one city first and the other as a deliberate extension']
  },
  {
    id: 'beijing', label: 'Beijing', aliases: ['beijing', '北京'], min_protected_nights: 3,
    city_database_ids: ['beijing'], database_refs: ['../beijing-agent-database-20260802/北京智能体数据库_V0.1.json'], status: 'content_foundation',
    identity: { what_it_is: 'A first-China historical grammar: imperial scale, civic ritual, neighbourhood life and one deliberate Great Wall choice.', not_for: 'Every palace, park, hutong and Wall section in a short stay.' },
    selection_rules: {
      include_when: ['first visit and history/architecture matter', 'the traveller can protect three full nights', 'the Great Wall is treated as a separate logistics decision'],
      protect: ['one imperial site deeply', 'a full Wall day only when transport, weather and body cost fit'],
      exclude_or_split_when: ['less than three nights with both Palace Museum and Wall as musts', 'mobility or heat limits are unknown for a long exposed day']
    },
    latent_need_rules: [
      latent('wall_priority_type', ['great wall', 'mutianyu', 'badaling'], 'For the Wall, what matters most: iconic first visit, mountain scenery, fewer crowds, or minimising transfers?', 'Chooses the Wall branch instead of a generic recommendation.'),
      latent('imperial_overload', ['palace', 'forbidden city', 'history'], 'Do you want one major imperial site done deeply, or a comparison across two different sites?', 'Controls cognitive and queue load.'),
      latent('weather_body_cost', ['stairs', 'family', 'heat', 'rain'], 'How comfortable are you with stairs, uneven ground and a long day outside the city?', 'Sets the physical route and stop rule.'),
      latent('neighbourhood_style', ['hutong', 'local', 'quiet', 'not touristy'], 'Would you rather see a lively famous lane or a quieter street with less to “do”?', 'Matches the desired public-life texture.')
    ],
    follow_up_questions: [
      question('BJI01', 1, ['first_visit', 'days_missing'], 'What date and time do you land, and do you already have your first full day free?', 'Calculates real usable time.'),
      question('BJI02', 1, ['great_wall'], 'Is the Great Wall an absolute priority, and are you choosing iconic access, scenery, fewer crowds or minimal transfer?', 'Selects Wall decision branch.'),
      question('BJI03', 2, ['history', 'palace'], 'Do you prefer one imperial site deeply or a comparison across two sites?', 'Prevents palace overload.'),
      question('BJI04', 2, ['hutong', 'local'], 'Do you want lively famous lanes or quieter neighbourhood fabric?', 'Selects hutong route tone.'),
      question('BJI05', 2, ['family', 'mobility', 'weather'], 'What are the walking, stair, meal and rest limits for your group?', 'Changes route length and Wall feasibility.')
    ],
    human_review_triggers: ['identity-linked reservations and current opening hours', 'Great Wall transport/weather/entry', 'family, mobility or heat constraints', 'commercial photography or private access'],
    output_emphasis: ['teach one spatial/history idea', 'make the Wall an explicit yes/no decision', 'protect a recovery half-day']
  },
  {
    id: 'chengdu_chongqing', label: 'Chengdu–Chongqing', aliases: ['chengdu', 'chongqing', '成都', '重庆'], min_protected_nights: 4,
    city_database_ids: ['chengdu', 'chongqing'],
    database_refs: ['../chengdu-agent-database-20260802/成都智能体数据库_V0.1.json', '../chongqing-agent-database-20260729/重庆主城智能体数据库_V1.0.json'], status: 'content_foundation',
    identity: { what_it_is: 'A contrast pair: Chengdu protects pace, food and public life; Chongqing creates vertical movement, river-port history and night intensity.', not_for: 'A checklist that gives each city one rushed night.' },
    selection_rules: {
      include_when: ['the traveller has at least four protected nights', 'they want two genuinely different urban rhythms', 'a high-speed rail transfer is acceptable'],
      protect: ['at least two nights per city for a first visit', 'one full transfer/recovery buffer when arrival times are awkward'],
      exclude_or_split_when: ['less than four nights', 'the traveller wants slow time but also many remote day trips', 'Dazu/Wulong is being treated as a casual Chongqing add-on']
    },
    latent_need_rules: [
      latent('pace_vs_intensity', ['slow', 'food', 'night', 'cyberpunk'], 'Do you want a slower public-life and food rhythm, a vertical high-intensity city experience, or both?', 'Decides city split and deletion.'),
      latent('panda_cost', ['panda', 'pandas'], 'Are pandas a must, and are you open to an early start or longer transfer for them?', 'Prevents pandas from consuming Chengdu by default.'),
      latent('transfer_tolerance', ['both', 'two cities', 'high speed rail'], 'How many protected nights can each city receive after the train transfer?', 'Blocks an unrealistic pair.'),
      latent('body_and_night_safety', ['stairs', 'parents', 'family', 'photography'], 'What walking, stair, late-night and rest limits should control the Chongqing route?', 'Filters high-cost vertical/night modules.')
    ],
    follow_up_questions: [
      question('CDQ01', 1, ['chengdu', 'chongqing', 'both', 'two_cities'], 'How many protected nights can you give each city after the high-speed rail transfer?', 'The primary pair decision.'),
      question('CDQ02', 1, ['food', 'slow', 'cyberpunk', 'night'], 'Would you rather protect Chengdu’s slower food/public-life rhythm or Chongqing’s vertical/night intensity?', 'Clarifies what the two cities must each do.'),
      question('CDQ03', 2, ['panda'], 'Are pandas a must, or would a city-based Chengdu day be more valuable?', 'Controls early start and remote transfer.'),
      question('CDQ04', 2, ['stairs', 'family', 'parents', 'mobility'], 'How long can your group walk, climb stairs and stay out after dark?', 'Changes Chongqing route and night photography.'),
      question('CDQ05', 2, ['wulong', 'dazu', 'day_trip'], 'Is the priority a city experience or a separate full-day heritage/landscape excursion?', 'Prevents remote excursions being hidden add-ons.')
    ],
    human_review_triggers: ['current rail/metro/venue and night access', 'stairs, heat, family or late-night constraints', 'Dazu/Wulong day-trip logistics', 'private community/creator/photography access'],
    output_emphasis: ['state what each city answers', 'recommend deleting one city when nights are insufficient', 'treat cyberpunk as a physical city experiment, not a slogan']
  },
  {
    id: 'guangzhou_shenzhen', label: 'Guangzhou–Shenzhen', aliases: ['guangzhou', 'shenzhen', '广州', '深圳'], min_protected_nights: 4,
    city_database_ids: ['guangzhou', 'shenzhen'],
    database_refs: ['../guangzhou-agent-database-20260802/广州智能体数据库_V0.1.json', '../shenzhen-agent-database-20260802/深圳智能体数据库_V0.1.json'], status: 'content_foundation',
    identity: { what_it_is: 'South China through Cantonese food/trade history and Shenzhen’s public-facing technology and urban systems.', not_for: 'A promised factory, private company, supplier or R&D visit.' },
    selection_rules: {
      include_when: ['the traveller wants food/trade plus technology/design', 'there are at least four protected nights', 'public observation is acceptable'],
      protect: ['one food/social question in Guangzhou', 'one public technology question in Shenzhen'],
      exclude_or_split_when: ['the request depends on private company access', 'less than four nights and both cities are treated as equal musts', 'a border crossing is assumed without current official confirmation']
    },
    latent_need_rules: [
      latent('food_vs_tech', ['cantonese', 'yum cha', 'tech', 'hardware'], 'Is the trip primarily about Cantonese food/trade, public technology, or the contrast between them?', 'Chooses the city or pair.'),
      latent('public_vs_private_tech', ['factory', 'huawei', 'tencent', 'sourcing'], 'Are you seeking public learning and observation, or private company/supplier access?', 'Enforces access boundary.'),
      latent('shopping_vs_system', ['shopping', 'market', 'huaqiangbei'], 'Are you buying a personal item, sourcing commercially, or understanding the supply-chain ecosystem?', 'Prevents shopping folklore and legal/IP overreach.'),
      latent('heat_and_transfer', ['rain', 'heat', 'business', 'hong kong'], 'What transfer, heat and luggage constraints apply to your final day?', 'Changes route order and border decisions.')
    ],
    follow_up_questions: [
      question('GSI01', 1, ['food', 'tech', 'both'], 'Is your main question Cantonese food/trade, Shenzhen technology, or the contrast between them?', 'Sets the city split.'),
      question('GSI02', 1, ['factory', 'company', 'sourcing', 'tech'], 'Are you seeking public observation or private company/supplier access?', 'Determines whether the request can be handled.'),
      question('GSI03', 2, ['food', 'dim_sum', 'allergy'], 'What food format and dietary limits should the route respect?', 'Controls meal selection and safety review.'),
      question('GSI04', 2, ['hardware', 'shopping', 'huaqiangbei'], 'Are you observing, buying a personal item, sourcing, or photographing the ecosystem?', 'Selects a bounded market route.'),
      question('GSI05', 2, ['hong_kong', 'border'], 'What passport/visa status and official current basis apply to any border crossing?', 'Stops unsupported border assumptions.')
    ],
    human_review_triggers: ['food allergies and dietary safety', 'public access, photography and IP at markets', 'private company/factory/supplier requests', 'border, payment, weather and departure logistics'],
    output_emphasis: ['make public/private access explicit', 'explain Guangzhou and Shenzhen as different questions', 'never use company-name tourism as a promise']
  },
  {
    id: 'guilin_yangshuo', label: 'Guilin–Yangshuo', aliases: ['guilin', 'yangshuo', '桂林', '阳朔'], min_protected_nights: 3,
    city_database_ids: ['guilin_yangshuo'], database_refs: ['../guilin-yangshuo-agent-database-20260802/桂林阳朔智能体数据库_V0.1.json'], status: 'content_foundation',
    identity: { what_it_is: 'A weather-aware karst landscape route where river, land, settlement and rest are chosen deliberately.', not_for: 'A scenic checklist that assumes perfect visibility, cycling ability or water conditions.' },
    selection_rules: {
      include_when: ['the traveller has three protected nights', 'landscape is the central question', 'they accept weather and water-dependent alternatives'],
      protect: ['one primary landscape mode', 'a weather fallback and a non-riding option'],
      exclude_or_split_when: ['Longji is added without a separate full day', 'the traveller needs guaranteed sunrise/fog/water conditions', 'cycling/boat safety limits are unknown']
    },
    latent_need_rules: [
      latent('landscape_mode', ['karst', 'river', 'photo', 'cycling', 'family'], 'Is the priority river, walking/cycling, photography, family slow travel, adventure or rest?', 'Chooses the landscape mode.'),
      latent('activity_tolerance', ['bike', 'cycling', 'yulong', 'boat'], 'Will you walk, cycle, use an e-bike, use vehicle support, or avoid road riding?', 'Controls physical and safety assumptions.'),
      latent('weather_reversibility', ['rain', 'fog', 'visibility'], 'What weather, water, stairs or walking threshold requires a route change?', 'Ensures the route can survive poor conditions.'),
      latent('longji_tradeoff', ['longji', 'rice terraces'], 'Do you have a separate full day for Longji, or should the karst route remain focused?', 'Prevents overextension.')
    ],
    follow_up_questions: [
      question('GYI01', 1, ['karst', 'landscape'], 'What is the main landscape experience: river, walking/cycling, photography, family slow travel, adventure or rest?', 'Chooses the route mode.'),
      question('GYI02', 1, ['river', 'li_river', 'boat'], 'Are you comfortable with a long boat day, motion, weather uncertainty and luggage handling?', 'Checks the boat branch.'),
      question('GYI03', 2, ['cycling', 'bike', 'yulong'], 'Will you ride, walk, use vehicle support, or avoid road riding altogether?', 'Avoids assuming cycling.'),
      question('GYI04', 2, ['longji'], 'Do you have a separate full day and weather/terrain tolerance for rice terraces?', 'Makes Longji an explicit add-on decision.'),
      question('GYI05', 2, ['rain', 'fog', 'mobility'], 'What conditions would make you switch to a seated or lower-exposure landscape day?', 'Creates a usable fallback.')
    ],
    human_review_triggers: ['weather, water level, visibility and outdoor access', 'cycling, e-bike, boat or terrain safety', 'Longji transfer and full-day feasibility', 'family or mobility constraints'],
    output_emphasis: ['describe a landscape relationship, not a view-point list', 'show the fallback before the guest needs it', 'never guarantee weather or visibility']
  },
  {
    id: 'quanzhou_dehua', label: 'Quanzhou–Dehua', aliases: ['quanzhou', 'dehua', '泉州', '德化'], min_protected_nights: 3,
    city_database_ids: ['quanzhou_dehua'], database_refs: ['../quanzhou-dehua-agent-database-20260802/泉州德化智能体数据库_V0.1.json'], status: 'human_check_pilot',
    identity: { what_it_is: 'A world-port system of trade, religious exchange, everyday streets and a separate ceramics extension.', not_for: 'A temple checklist, guaranteed private religious access or a ceramic workshop promise.' },
    selection_rules: {
      include_when: ['the traveller wants maritime history, religious plurality, food or ceramics', 'there are three protected nights for city plus optional Dehua', 'the traveller accepts etiquette and consent boundaries'],
      protect: ['two city days before considering Dehua', 'one coherent maritime/faith question rather than many temples'],
      exclude_or_split_when: ['only two days and Dehua is a must', 'the request requires private homes, religious ritual or maker access', 'weather/transfer conditions are not current']
    },
    latent_need_rules: [
      latent('maritime_system_vs_sightseeing', ['maritime', 'port', 'trade', 'history'], 'Do you want to understand trade systems, port infrastructure, religious exchange, ceramics, or the links between them?', 'Sets the narrative frame.'),
      latent('public_faith_vs_private_ritual', ['religion', 'mosque', 'temple', 'ritual'], 'Are you looking for historical context, sacred architecture or living practice—and are you comfortable with strict etiquette and access limits?', 'Protects communities and access boundaries.'),
      latent('quanzhou_vs_dehua', ['dehua', 'ceramic', 'porcelain'], 'Do you have a separate third day for Dehua, or should the city route stay focused on Quanzhou?', 'Controls the extension.'),
      latent('craft_learning_vs_buying', ['maker', 'workshop', 'buy'], 'Are you learning production context, buying ceramics, or seeking a verified making encounter?', 'Prevents unverified craft promises.')
    ],
    follow_up_questions: [
      question('QZI01', 1, ['maritime', 'port', 'history'], 'Are you most interested in trade systems, religious exchange, everyday city life, ceramics, or the connections between them?', 'Selects the main story.'),
      question('QZI02', 1, ['religion', 'temple', 'mosque'], 'Do you want historical context, sacred architecture or living practice—and what etiquette/access limits are you comfortable with?', 'Sets the faith route boundary.'),
      question('QZI03', 1, ['dehua', 'ceramics'], 'Do you have a separate day for Dehua, or would another Quanzhou day be more valuable?', 'Makes the extension explicit.'),
      question('QZI04', 2, ['craft', 'workshop', 'buying'], 'Are you learning, buying, or seeking a verified participatory craft encounter?', 'Routes to research-only or human review.'),
      question('QZI05', 2, ['rain', 'heat', 'mobility'], 'What weather, walking, stairs or transfer threshold requires a shorter alternative?', 'Controls route continuity.')
    ],
    human_review_triggers: ['religious access, photography and etiquette', 'Dehua transport and maker/workshop release', 'food allergies and local-language friction', 'any private home, ritual or community request'],
    output_emphasis: ['use the maritime system as the organizing frame', 'make Quanzhou versus Dehua a real choice', 'respect living religious and craft communities']
  },
  {
    id: 'jingdezhen', label: 'Jingdezhen', aliases: ['jingdezhen', '景德镇'], min_protected_nights: 2,
    city_database_ids: ['jingdezhen'], database_refs: ['../jingdezhen-agent-database-20260802/景德镇智能体数据库_V0.1.json'], status: 'content_foundation',
    identity: { what_it_is: 'A living porcelain system: material, kiln, labour, standards, trade and contemporary making.', not_for: 'An art-market guarantee, private studio access, authentication or shipping service.' },
    selection_rules: {
      include_when: ['ceramics, material culture, design or craft is a real priority', 'the traveller has at least two nights', 'the visitor can distinguish public learning from professional training'],
      protect: ['one process/history question and one contemporary making layer', 'delivery and firing uncertainty when a workshop is considered'],
      exclude_or_split_when: ['the request is only “buy the best porcelain”', 'a private studio, residency or apprenticeship is assumed', 'departure is too soon for firing/delivery']
    },
    latent_need_rules: [
      latent('learning_vs_purchase', ['ceramics', 'porcelain', 'buy', 'collect'], 'Are you interested in material/process, history, contemporary art, buying, a short workshop, or professional learning?', 'Chooses the product mode.'),
      latent('time_to_make', ['workshop', 'firing', 'delivery'], 'Do you want a one-off public experience or genuine skills learning, and when do you depart relative to firing or delivery?', 'Sets feasible scope.'),
      latent('professional_scope', ['residency', 'apprenticeship', 'portfolio'], 'Are you exploring a professional programme rather than tourism? If so, what duration, language and portfolio constraints apply?', 'Escalates to a separate research scope.'),
      latent('provenance_boundary', ['collecting', 'authentic', 'shipping'], 'Are you browsing or buying for personal use? The roadbook cannot authenticate, value or ship objects.', 'Makes commercial limits explicit.')
    ],
    follow_up_questions: [
      question('JDI01', 1, ['ceramics', 'porcelain'], 'Are you here for material/process, imperial history, contemporary art, buying, a short workshop, or professional learning?', 'Selects the route mode.'),
      question('JDI02', 2, ['workshop', 'making'], 'Do you want a one-off public experience or genuine skills learning, and when do you depart?', 'Checks whether making can fit.'),
      question('JDI03', 2, ['buying', 'collecting', 'shipping'], 'Are you browsing, buying for personal use, collecting, or arranging delivery?', 'Enforces provenance and shipping boundary.'),
      question('JDI04', 2, ['residency', 'apprenticeship'], 'Is this professional research or tourism, and how much time can you actually spend?', 'Routes out of the travel product.'),
      question('JDI05', 2, ['dehua', 'fujian'], 'Would you rather deepen Jingdezhen’s porcelain system or add a separate Fujian production chapter?', 'Prevents incompatible extensions.')
    ],
    human_review_triggers: ['workshop/studio access and current programme', 'purchase, provenance, pricing, firing or shipping questions', 'professional residency/apprenticeship requests', 'language and payment friction'],
    output_emphasis: ['teach the production system', 'separate public observation from private making', 'never imply authenticity or investment advice']
  },
  {
    id: 'wudang', label: 'Wudang Mountains', aliases: ['wudang', 'wudang mountains', '武当山'], min_protected_nights: 3,
    city_database_ids: ['wudang'], database_refs: ['../wudang-agent-database-20260802/武当山智能体数据库_V0.1.json'], status: 'research_led',
    identity: { what_it_is: 'Mountain-based Taoist architectural heritage approached through public space, weather, body cost and etiquette.', not_for: 'A mystical, healing, master-access or guaranteed Tai Chi training product.' },
    selection_rules: {
      include_when: ['heritage architecture, Taoist history or mountain walking is the actual question', 'the traveller can protect three nights and a weather buffer', 'public heritage routes are acceptable'],
      protect: ['arrival/departure buffer', 'stairs, cable-car and weather decision before naming a route'],
      exclude_or_split_when: ['the traveller wants a guaranteed master, ritual or healing outcome', 'a day trip leaves no usable mountain day', 'fitness/medical constraints are undisclosed']
    },
    latent_need_rules: [
      latent('heritage_vs_training', ['taoism', 'architecture', 'tai chi', 'martial arts'], 'Are you here for public heritage/architecture, mountain walking, a beginner session, or serious training?', 'Separates a travel route from training/health claims.'),
      latent('mountain_feasibility', ['two nights', 'day trip', 'stairs', 'cable car'], 'Where do you arrive from, how many complete mountain days remain, and can one day move for weather?', 'Tests feasibility.'),
      latent('private_access_boundary', ['master', 'ritual', 'temple access'], 'Would a respectful public heritage route meet your aim if private religious access is unavailable?', 'Protects religious/community boundaries.'),
      latent('physical_risk', ['fitness', 'injury', 'heart', 'family'], 'What mobility, stair, altitude, injury or child-safety limits need human review?', 'Blocks unsafe assumptions.')
    ],
    follow_up_questions: [
      question('WDI01', 1, ['heritage', 'taoism', 'architecture', 'tai_chi'], 'Are you primarily here for public heritage/architecture, mountain walking, an introductory Tai Chi session, or serious training?', 'Chooses safe scope.'),
      question('WDI02', 1, ['nights', 'day_trip', 'arrival'], 'Where do you arrive from, how many actual nights are protected, and can one day change for weather?', 'Tests route feasibility.'),
      question('WDI03', 1, ['mobility', 'fitness', 'family'], 'Are there stairs, altitude, injury, heart, or child-safety limits that require human review?', 'Blocks high-risk route output.'),
      question('WDI04', 2, ['master', 'ritual', 'private_access'], 'Would a respectful public heritage route meet your interest? Private religious access and ritual participation cannot be promised.', 'Sets the boundary.'),
      question('WDI05', 2, ['sunrise', 'cable_car', 'weather'], 'Can you accept a weather-dependent fallback and verify same-day operating information?', 'Protects against false certainty.')
    ],
    human_review_triggers: ['stairs, cable car, weather and mountain transport', 'Tai Chi, martial arts, healing or training requests', 'private religious access or ritual participation', 'medical, injury, family or safety constraints'],
    output_emphasis: ['lead with architecture and public heritage', 'show body cost and weather reversibility', 'refuse mystical or healing claims clearly']
  },
  {
    id: 'jingmai', label: 'Jingmai Mountain', aliases: ['jingmai', 'jingmai mountain', '景迈', '景迈茶山'], min_protected_nights: 3,
    city_database_ids: ['jingmai'], database_refs: ['../jingmai-agent-database-20260802/景迈茶山智能体数据库_V0.1.json'], status: 'research_led',
    identity: { what_it_is: 'A living tea-forest cultural landscape of villages, roads, ecology and slow observation.', not_for: 'Tea authentication, investment, health claims, private farmer visits or guaranteed mist/sunrise.' },
    selection_rules: {
      include_when: ['the traveller has three or more mountain nights', 'they accept road/weather variability and community etiquette', 'learning is more important than buying or private access'],
      protect: ['arrival/departure and road buffer', 'an approved public/consented observation route'],
      exclude_or_split_when: ['two nights leave no complete mountain day', 'the trip depends on private homes or ceremonies', 'the traveller expects guaranteed tea quality, weather or transport']
    },
    latent_need_rules: [
      latent('tea_learning_vs_purchase', ['tea culture', 'old tree', 'tea purchase'], 'Are you trying to understand tea landscape and processing, taste comparatively, buy for personal use, or collect?', 'Sets the learning/buying boundary.'),
      latent('public_vs_private_village', ['farmer', 'home visit', 'ceremony'], 'Would a respectful public or approved observation meet your aim if private homes, gardens or ceremonies are unavailable?', 'Protects community consent.'),
      latent('road_and_weather', ['rainy season', 'sunrise', 'scooter', 'self drive'], 'Where do you arrive and leave, and can you accept a weather-dependent road and trail fallback?', 'Tests operational feasibility.'),
      latent('health_claim_boundary', ['tea health', 'investment'], 'Are you seeking medical advice or an investment recommendation? Neither can be supplied through a travel roadbook.', 'Prevents unsafe or financial claims.')
    ],
    follow_up_questions: [
      question('JMI01', 1, ['tea', 'old_tree', 'purchase'], 'Are you learning about tea landscape and processing, tasting comparatively, buying for personal use, or collecting?', 'Chooses the route mode.'),
      question('JMI02', 1, ['farmer', 'home_visit', 'ceremony'], 'Would a respectful public/approved observation meet your aim? Private homes, tea gardens and ceremonies cannot be promised.', 'Sets the access boundary.'),
      question('JMI03', 1, ['nights', 'arrival', 'departure'], 'Where do you arrive from and leave for, and how many complete mountain days remain after transfers?', 'Tests minimum viable stay.'),
      question('JMI04', 2, ['walking', 'mobility', 'family'], 'What walking, mud, stairs, child-safety, injury or health constraints need human review?', 'Controls terrain and safety.'),
      question('JMI05', 2, ['rain', 'sunrise', 'scooter'], 'Can you accept a weather-dependent fallback and independently verify same-day road/trail conditions?', 'Protects against false certainty.')
    ],
    human_review_triggers: ['roads, weather, trails and local transport', 'tea purchase/authentication/health/investment questions', 'private farmer, home, ceremony or village requests', 'mobility, child-safety or self-drive constraints'],
    output_emphasis: ['treat tea as landscape and labour, not a product catalogue', 'put logistics before romantic language', 'use research-only status until local consent and road checks exist']
  }
];

const sourceDatabases = [
  ['shanghai', 'Shanghai', '../shanghai-agent-database-20260802/上海主城智能体数据库_V1.0.json'],
  ['chongqing', 'Chongqing', '../chongqing-agent-database-20260729/重庆主城智能体数据库_V1.0.json'],
  ['beijing', 'Beijing', '../beijing-agent-database-20260802/北京智能体数据库_V0.1.json'],
  ['chengdu', 'Chengdu', '../chengdu-agent-database-20260802/成都智能体数据库_V0.1.json'],
  ['guangzhou', 'Guangzhou', '../guangzhou-agent-database-20260802/广州智能体数据库_V0.1.json'],
  ['shenzhen', 'Shenzhen', '../shenzhen-agent-database-20260802/深圳智能体数据库_V0.1.json'],
  ['hangzhou', 'Hangzhou', '../hangzhou-agent-database-20260802/杭州智能体数据库_V0.1.json'],
  ['suzhou', 'Suzhou', '../suzhou-agent-database-20260802/苏州智能体数据库_V0.1.json'],
  ['guilin_yangshuo', 'Guilin–Yangshuo', '../guilin-yangshuo-agent-database-20260802/桂林阳朔智能体数据库_V0.1.json'],
  ['quanzhou_dehua', 'Quanzhou–Dehua', '../quanzhou-dehua-agent-database-20260802/泉州德化智能体数据库_V0.1.json'],
  ['jingdezhen', 'Jingdezhen', '../jingdezhen-agent-database-20260802/景德镇智能体数据库_V0.1.json'],
  ['wudang', 'Wudang Mountains', '../wudang-agent-database-20260802/武当山智能体数据库_V0.1.json'],
  ['jingmai', 'Jingmai Mountain', '../jingmai-agent-database-20260802/景迈茶山智能体数据库_V0.1.json']
].map(([id, label, path]) => ({ id, label, path }));

const data = {
  schema_version: '1.0',
  updated_at: '2026-08-09',
  scope: { city_database_count: sourceDatabases.length, product_unit_count: productUnits.length },
  organizing_principle: 'task_first',
  thesis: 'Organize every city around the traveller decision it resolves, not around a catalogue of attractions. The agent asks only the smallest set of questions that can change the city, route, pace or safety boundary.',
  release_policy: {
    current_status: 'content_ready_human_review_required',
    field_verified_count: 0,
    publishable_label: 'research-based draft; human review required for dated delivery',
    forbidden_claims: ['human-checked', 'verified', 'vetted', 'guaranteed', 'private access', 'partner-ready'],
    escalation_triggers: ['dynamic opening/reservation/transport', 'mobility/medical/severe allergy/child safety', 'private access or booking', 'weather-dependent outdoor activity', 'religious, craft, farm or teacher access']
  },
  source_databases: sourceDatabases,
  product_units: productUnits
};

const output = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'city-interactions-v1.json');
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log(`wrote ${output}`);
