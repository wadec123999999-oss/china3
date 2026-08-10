const CITY_FRAMES = {
  shanghai: {
    thesis: 'Read Shanghai through river finance, one cultural frame and lived twentieth-century streets—not a checklist of famous façades.',
    tradeoff: 'The first visit needs a coherent city frame; adding another district is less valuable than protecting time to observe and recover.',
    fallback: 'If heat, rain or crowding rises, keep the same urban question and shorten the outdoor segment before adding another transfer.'
  },
  chongqing: {
    thesis: 'Read Chongqing through vertical geography, movement, food and public life—not a sequence of skyline viewpoints.',
    tradeoff: 'A visual route, a food route and a history route use different energy budgets; combining all three needs deliberate pacing.',
    fallback: 'If stairs, heat or construction make a route fragile, keep one terrain experiment and one lower-friction city layer.'
  },
  beijing: {
    thesis: 'Read Beijing through imperial order, hutong life, one Wall decision and a contemporary layer—not a monument checklist.',
    tradeoff: 'A Wall visit is a route decision with real transfer and weather costs; it should not be added automatically.',
    fallback: 'If the Wall or long outdoor sections become impractical, keep the city frame with a hutong and one indoor cultural layer.'
  },
  chengdu: {
    thesis: 'Use tea-house pace, food and public life to make Chengdu legible before adding one regional or historical layer.',
    tradeoff: 'Pandas, food and a regional extension compete for time; choosing all three usually destroys the slow rhythm.',
    fallback: 'If energy drops, keep one tea/public-life loop and one food context instead of adding another transfer.'
  },
  guangzhou: {
    thesis: 'Read Guangzhou as a port city through food, trade, old-city texture and one contemporary contrast.',
    tradeoff: 'A restaurant list is not a cultural route; the day should protect time for ingredients, ordering and urban history.',
    fallback: 'In heat or rain, shorten the old-city walk and retain one food or port-city question indoors.'
  },
  shenzhen: {
    thesis: 'Use public evidence—hardware, interfaces, design and urban systems—to understand Shenzhen without promising private company access.',
    tradeoff: 'A technology route must distinguish what a visitor can observe publicly from what would require permission.',
    fallback: 'If a programme or venue is unavailable, use a public hardware/design/urban-systems route rather than inventing a factory visit.'
  },
  'guilin-yangshuo': {
    thesis: 'Choose one water decision, one land-based landscape layer and enough recovery time; this is not a scenery conveyor belt.',
    tradeoff: 'River, terraces and cycling are different physical products. A short stay should not promise all of them.',
    fallback: 'If rain or conditions change, keep a land-based landscape route and remove the water segment rather than forcing it.'
  },
  hangzhou: {
    thesis: 'Use water, hills, tea and sacred landscape to create a genuine change of pace from Shanghai.',
    tradeoff: 'West Lake, tea and temples need different time budgets; adding every famous edge makes the day less readable.',
    fallback: 'Keep one water or tea loop and one quiet cultural layer when heat, crowds or transfers rise.'
  },
  suzhou: {
    thesis: 'Read Suzhou through one garden, one water layer and one meaningful contrast—not a garden checklist.',
    tradeoff: 'A second garden is not automatically better; the route needs time to observe proportion, thresholds and water movement.',
    fallback: 'If queues or rain interfere, keep one confirmed garden and use a canal or craft layer as the contrast.'
  },
  'quanzhou-dehua': {
    thesis: 'Read Quanzhou–Dehua as a maritime system connecting public heritage, sacred etiquette, infrastructure and production.',
    tradeoff: 'Religious sites and craft production require different kinds of attention; do not compress them into a temple-and-shopping day.',
    fallback: 'If a production visit is not released, keep the public maritime and sacred-history route without implying private access.'
  },
  jingdezhen: {
    thesis: 'Read Jingdezhen as a living system of material, process, kiln, labour and contemporary making—not a ceramic-shopping stop.',
    tradeoff: 'Studio access, workshops and purchases are separate decisions; none should be promised from city reputation alone.',
    fallback: 'If a studio is unavailable, keep the public material/process story and remove the access claim.'
  },
  wudang: {
    thesis: 'Read Wudang through mountain architecture, Taoist rhythm, movement and etiquette—not a guaranteed martial-arts encounter.',
    tradeoff: 'Heritage, physical practice and private instruction have different release gates and should not be bundled by default.',
    fallback: 'If practice access is not confirmed, keep the public mountain and architectural route.'
  },
  jingmai: {
    thesis: 'Read Jingmai as a living tea-forest cultural landscape of forest, villages and mountain practice—not an old-tree-tea shopping trip.',
    tradeoff: 'Tea purchase, private homes, ceremonies and village observation are distinct consent and safety questions.',
    fallback: 'If community access is not confirmed, keep public landscape, tea ecology and walking without inventing an encounter.'
  }
};

const CITY_MODULE_GUIDANCE = {
  shanghai: {
    SHM01: {
      anchor: 'Read the river from one bank before crossing it; the contrast is the point, not the number of viewpoints.',
      notice: 'Institutional scale, river movement and the old/new skyline relationship.',
      stop: 'Stop once the two riverbanks make sense; do not add an observation deck merely to collect a higher view.',
      friction: 'Crowds, heat and cross-river transfers can consume the day faster than expected.'
    },
    SHM02: {
      anchor: 'Walk one continuous historic-street sequence slowly enough to see how grand façades meet ordinary life.',
      notice: 'Setbacks, trees, entrances, reused buildings and the boundary between public street and private home.',
      stop: 'End the walk when the street pattern is legible; do not turn residential life into a photo hunt.',
      friction: 'Shade, pavement, traffic crossings and resident privacy need active management.'
    },
    SHM04: {
      anchor: 'Choose one museum and give it one question; a second museum usually dilutes the first.',
      notice: 'Which objects or displays answer the guest’s China question, rather than which museum is most famous.',
      stop: 'Leave with a usable mental frame, not after exhausting every gallery.',
      friction: 'Timed entry, bag rules, temporary exhibitions and English interpretation must be checked for the date.'
    },
    SHM06: {
      anchor: 'Use the waterfront as evidence of work becoming public space, not as another skyline promenade.',
      notice: 'Industrial traces, path continuity, bridges, shade and who uses the river edge now.',
      stop: 'Keep the segment only while the regeneration question is visible; cut the far end before adding a forced transfer.',
      friction: 'Long distances, uneven shade and incomplete continuity can make the route look easier on a map than it feels.'
    }
  },
  chongqing: {
    RM04: {
      anchor: 'Use the night skyline as an orientation frame, then leave the commercial complex instead of touring it end to end.',
      notice: 'How lighting, river bends and stacked transport levels produce the city image.',
      stop: 'Stop once the visual geography is clear; do not spend the whole evening inside a shopping complex.',
      friction: 'Crowding, heat, stairs and confusing exits can erase the intended slow pace.'
    },
    RM02: {
      anchor: 'Follow one vertical transition on foot and treat each level as a different public street.',
      notice: 'How lifts, stairs, roads, homes and commerce overlap at different elevations.',
      stop: 'End after one complete terrain experiment; do not stack several viewpoints just because they are nearby on a map.',
      friction: 'Step intensity, construction, rain and map distance need live checking.'
    },
    RM03: {
      anchor: 'Read the river gate through movement and infrastructure before looking for a skyline photograph.',
      notice: 'Ferries, bridges, road flows and the meeting of the two rivers.',
      stop: 'Leave when the transport geography is understood; preserve energy for the next district.',
      friction: 'Traffic, heat, crowd load and river-edge access can change the usable route.'
    },
    RM12: {
      anchor: 'Make one meal a social observation: ordering, spice, sharing and pace matter more than restaurant quantity.',
      notice: 'Table rules, noodle/hotpot choices, allergies and how locals move through the meal.',
      stop: 'One well-understood meal is enough; do not turn food into a venue-hopping checklist.',
      friction: 'Spice, waiting, shared tables and language need confirmation for the actual group.'
    },
    RM16: {
      anchor: 'Ride first and use the viewpoint only to explain the transport relationship.',
      notice: 'How rail, road, tower blocks and terrain coexist in one short movement.',
      stop: 'Leave after the ride-and-viewpoint relationship is legible; do not promise a particular train or photo moment.',
      friction: 'Service timing, crowding, platform movement and viewing conditions are dynamic.'
    }
  },
  beijing: {
    BJM01: {
      anchor: 'Read the imperial axis as a system of thresholds, labour and power, not as a race through courtyards.',
      notice: 'Scale, alignment, gates, empty space and how visitors are managed through the sequence.',
      stop: 'Stop when the system becomes clear; one complete reading is better than exhausting every hall.',
      friction: 'Timed entry, security, heat and long exposed walks can dominate the day.'
    },
    BJM04: {
      anchor: 'Choose the Wall section by transfer, body and weather before choosing it for reputation.',
      notice: 'Terrain, crowd density, restoration, transport and what the Wall looks like away from the iconic angle.',
      stop: 'Set a turnaround point before arrival; do not treat reaching the highest point as the only success condition.',
      friction: 'Travel time, stairs, weather, queues and return transport need dated confirmation.'
    },
    BJM03: {
      anchor: 'Use one hutong sequence as a neighbourhood, not a themed photo set.',
      notice: 'Entrances, shade, small commerce, courtyards from the public street and everyday movement.',
      stop: 'Leave when the neighbourhood logic is understood; do not enter private compounds or stage encounters.',
      friction: 'Residential privacy, traffic, heat and route continuity need active care.'
    },
    BJM06: {
      anchor: 'Choose one contemporary production question before selecting a gallery or creative district.',
      notice: 'Who is making, exhibiting and using the space now—not only its former industrial image.',
      stop: 'One coherent cultural layer is enough; do not add venues just to fill a half-day.',
      friction: 'Programme, opening, transport and language support are date-sensitive.'
    },
    BJM02: {
      anchor: 'Use a park or ritual space to observe how the capital is lived beyond palace architecture.',
      notice: 'Body practice, shade, social rhythm and the relationship between sacred and civic space.',
      stop: 'Observe without photographing people as performers; leave room for the city to remain ordinary.',
      friction: 'Crowd etiquette, weather, access and respectful photography need confirmation.'
    }
  },
  chengdu: {
    CDM02: {
      anchor: 'Treat pandas as a morning operations decision, not the emotional centre of every Chengdu day.',
      notice: 'Opening window, visitor flow, animal welfare boundaries and the cost of crossing the city.',
      stop: 'Leave after the planned animal/conservation question is answered; do not add a second far-side attraction by default.',
      friction: 'Timed entry, heat, crowds, transport and language support are dynamic.'
    },
    CDM03: {
      anchor: 'Spend time in one tea-and-park loop long enough to see how public life is paced.',
      notice: 'Seating, conversation, games, care, shade and how people share public space.',
      stop: 'Protect the unstructured time; do not turn the slow-city idea into a rapid café crawl.',
      friction: 'Weather, seating, etiquette and accessibility need current checking.'
    },
    CDM01: {
      anchor: 'Build the day around one neighbourhood rhythm instead of moving between iconic names.',
      notice: 'How breakfast, tea, errands and evening streets create a local tempo.',
      stop: 'When the rhythm is legible, stop adding sights; use the remaining time for rest or food.',
      friction: 'Heat, meal timing, traffic and transfer distance can quietly break the pace.'
    },
    CDM04: {
      anchor: 'Use one meal to understand ordering, flavour and social geography rather than collecting restaurants.',
      notice: 'Chilli/savoury balance, shared dishes, table timing and who the meal is designed for.',
      stop: 'One well-matched meal beats a generic list; do not overpromise a “must-eat” venue.',
      friction: 'Spice, allergies, queues and payment rules need confirmation.'
    },
    CDM05: {
      anchor: 'Add one memory, poetry or religious layer only if it deepens the city frame.',
      notice: 'How memory and belief remain part of an ordinary modern city.',
      stop: 'Keep the extension compact; do not sacrifice Chengdu’s pace to complete a theme.',
      friction: 'Opening, programme and respectful behaviour are date-sensitive.'
    }
  },
  guangzhou: {
    GZM01: {
      anchor: 'Make one meal the entry point to Cantonese social rules, ingredients and timing.',
      notice: 'Ordering language, dim sum rhythm, tea, sharing and neighbourhood context.',
      stop: 'Leave after the food system is understood; do not replace interpretation with a restaurant ranking.',
      friction: 'Queues, allergies, peak hours and English ordering support need current checks.'
    },
    GZM02: {
      anchor: 'Connect one old-city walk to water and trade instead of treating Liwan as a photo backdrop.',
      notice: 'Canals, arcades, thresholds, commerce and how old fabric is still used.',
      stop: 'Stop before heat and transfers flatten the walk; one readable district is enough.',
      friction: 'Humidity, road crossings, crowding and route continuity matter.'
    },
    GZM03: {
      anchor: 'Use craft and clan architecture to ask how a visual language was produced and maintained.',
      notice: 'Materials, ornament, family/community function and what is publicly accessible.',
      stop: 'Keep public interpretation separate from private access or workshop promises.',
      friction: 'Opening, permissions, language and etiquette need verification.'
    },
    GZM05: {
      anchor: 'Use the Pearl River skyline as a contemporary contrast after the old-city layer, not as the whole city story.',
      notice: 'New public space, towers, transport and who uses the waterfront after work.',
      stop: 'Leave when the old/new contrast is clear; do not add towers just for altitude.',
      friction: 'Heat, lighting, crowding and venue access are dynamic.'
    }
  },
  shenzhen: {
    SZM01: {
      anchor: 'Define the technology question before choosing a place: hardware, interfaces, manufacturing, AI, EVs or city systems.',
      notice: 'What is publicly observable, what is inferred, and what would require private permission.',
      stop: 'A clear public evidence chain is enough; do not invent a company visit to make the route sound exciting.',
      friction: 'Corporate access, programme availability, translation and transport need human confirmation.'
    },
    SZM02: {
      anchor: 'Read Huaqiangbei as a supply-chain environment, not a bargain-hunting mission.',
      notice: 'Component layers, signage, repair, sourcing language and the limits of casual purchasing.',
      stop: 'Leave once the market logic is clear; do not imply quality, price or sourcing guarantees.',
      friction: 'Crowding, language, payment, authenticity and commercial pressure are real.'
    },
    SZM03: {
      anchor: 'Look for technology embedded in public life rather than expecting a corporate campus tour.',
      notice: 'Interfaces, mobility, public services, design and who benefits from the system.',
      stop: 'Keep the route public and observable; private access is a separate review path.',
      friction: 'Opening, language, data/privacy and access rules need checking.'
    },
    SZM05: {
      anchor: 'Use Nanshan to read growth through streets, housing, parks and work—not just a skyline.',
      notice: 'How innovation is spatially organised and how ordinary users experience it.',
      stop: 'One urban-system contrast is enough; do not turn the route into a campus checklist.',
      friction: 'Scale, heat, transfers and public access can make a short route fragile.'
    }
  },
  'guilin-yangshuo': {
    GYM02: {
      anchor: 'Make the water choice first: cruise, shorter river section or land-based views.',
      notice: 'Scale, weather, boat rhythm and how the landscape changes from water level.',
      stop: 'Once the chosen water experience answers the landscape question, stop adding another river product.',
      friction: 'Water conditions, weather, boarding, crowds and transfers require dated checks.'
    },
    GYM01: {
      anchor: 'Choose one land-based relationship to karst—walk, village edge, viewpoint or quiet observation.',
      notice: 'Distance, cultivation, rock forms and human use rather than only panoramic beauty.',
      stop: 'One landscape layer is enough for a short stay; do not chase every famous angle.',
      friction: 'Heat, rain, uneven ground and transport can change the usable route.'
    },
    GYM03: {
      anchor: 'Use Yulong River for slower countryside movement without assuming cycling or rafting.',
      notice: 'Pace, water edge, farms, bridges and the difference between public scenery and private life.',
      stop: 'Keep the activity within the group’s actual physical comfort; do not force a signature activity.',
      friction: 'Weather, water, equipment, consent and road safety need human checks.'
    },
    GYM08: {
      anchor: 'Treat weather, water and transfer conditions as route decisions, not footnotes.',
      notice: 'What can be safely kept, shortened or removed on the actual date.',
      stop: 'If the landscape cannot be enjoyed safely, switch to the land-based fallback rather than forcing the plan.',
      friction: 'Live conditions can invalidate a scenic sequence quickly.'
    }
  },
  hangzhou: {
    HZM01: {
      anchor: 'Choose one West Lake segment and stay long enough for water, hill and shade to change.',
      notice: 'Edges, bridges, changing sightlines and how visitors share the landscape.',
      stop: 'Do not complete a symbolic lap; stop when the lake’s rhythm is understood.',
      friction: 'Crowds, heat, weather, boat access and walking distance need checking.'
    },
    HZM07: {
      anchor: 'Decide whether Hangzhou deserves an overnight before adding sites to a day trip.',
      notice: 'What is lost to transfers and what only becomes visible with protected time.',
      stop: 'If the transfer cost dominates, keep the Jiangnan choice explicit instead of pretending it is a relaxed day trip.',
      friction: 'Rail timing, hotel location and onward travel are decisive.'
    },
    HZM02: {
      anchor: 'Use tea as landscape, labour and taste; do not reduce it to a purchase or staged ceremony.',
      notice: 'Slope, cultivation, work, processing and how taste is explained.',
      stop: 'Leave once the tea system is legible; private farmer access is not implied.',
      friction: 'Weather, season, transport, language and commercial claims need checks.'
    },
    HZM03: {
      anchor: 'Approach the sacred mountain through etiquette and spatial rhythm, not temple collecting.',
      notice: 'Thresholds, worship, quietness and the coexistence of tourism and practice.',
      stop: 'One respectful sacred layer is enough; do not stage ritual or promise private instruction.',
      friction: 'Crowds, dress/behaviour expectations, access and weather are dynamic.'
    }
  },
  suzhou: {
    SZUM01: {
      anchor: 'Choose one garden as an instrument of attention, matched to how the guest wants to look and rest.',
      notice: 'Framing, thresholds, borrowed views, water and controlled movement.',
      stop: 'Leave while the garden still feels readable; a second garden is not automatically better.',
      friction: 'Reservations, queues, weather, crowd density and body comfort need checks.'
    },
    SZUM02: {
      anchor: 'Connect one garden to the canal streets so water becomes an urban system, not a backdrop.',
      notice: 'Bridges, loading, homes, commerce and ordinary movement beside heritage fabric.',
      stop: 'Keep the canal layer compact; do not force a water-town detour into a short stay.',
      friction: 'Transfers, rain, crowding and route continuity can change the pace.'
    },
    SZUM07: {
      anchor: 'Use the available nights to decide whether Suzhou adds a distinct question to Shanghai/Hangzhou.',
      notice: 'What is genuinely different: gardens, canals, craft or pace—not just another famous place.',
      stop: 'If the city choice is not adding a new layer, keep the time in the stronger base city.',
      friction: 'Rail timing, hotel location and transfer fatigue are central.'
    },
    SZUM08: {
      anchor: 'Make reservation, weather and body comfort part of the route design from the beginning.',
      notice: 'Which elements are fixed and which can flex without breaking the experience.',
      stop: 'Protect one confirmed garden and one canal layer; drop extras first.',
      friction: 'Date-specific opening, queues and rain can invalidate a dense plan.'
    }
  },
  'quanzhou-dehua': {
    QZM01: {
      anchor: 'Read Quanzhou as a maritime system connecting production, transport, belief and trade.',
      notice: 'Ports, streets, inscriptions, food, worship and the movement of goods and people.',
      stop: 'Leave after the system is legible; do not compress it into a monument checklist.',
      friction: 'Heat, transport, language and current opening conditions need checks.'
    },
    QZM02: {
      anchor: 'Visit sacred sites as living places with etiquette, not as visual backdrops.',
      notice: 'What visitors may observe, where they should pause and what should remain private.',
      stop: 'One or two public sacred layers are enough; no private ritual or access promise.',
      friction: 'Dress, photography, worship schedules and local guidance require confirmation.'
    },
    QZM03: {
      anchor: 'Use port, gate, bridge and river-sea movement to make infrastructure visible.',
      notice: 'How goods and people moved, and which traces remain publicly readable.',
      stop: 'Keep infrastructure connected to the city story; do not add disconnected photo stops.',
      friction: 'Heat, distances, tides/river conditions and access may alter the route.'
    },
    QZM08: {
      anchor: 'Treat arrival, payment, transport and sacred/craft access as part of the product, not admin afterthoughts.',
      notice: 'Where a foreign visitor will face friction and what needs human help.',
      stop: 'If access is not released, keep the public route and remove the implied encounter.',
      friction: 'Language, payment, transport, opening and consent are all live checks.'
    }
  },
  jingdezhen: {
    JZM01: {
      anchor: 'Follow porcelain from material and labour through kiln, design and trade.',
      notice: 'Clay, tools, heat, standards, labour and where value is added.',
      stop: 'Leave when the production system is understood; do not replace it with shopping.',
      friction: 'Opening, transport, translation and commercial claims need checking.'
    },
    JZM02: {
      anchor: 'Use imperial kiln history to ask how standards, management and technique shaped objects.',
      notice: 'Scale, process, fragments and the difference between historical evidence and brand storytelling.',
      stop: 'One technical history layer is enough before contemporary making.',
      friction: 'Programme, opening, interpretation and walking conditions are dynamic.'
    },
    JZM03: {
      anchor: 'Choose public art/design observation or a private artist encounter; they are different products.',
      notice: 'How contemporary makers respond to material, place, labour and markets.',
      stop: 'Do not imply a studio visit, workshop or purchase guarantee without written release.',
      friction: 'Access, language, consent, price and shipping/provenance need human review.'
    },
    JZM08: {
      anchor: 'Design the route around whether the client can navigate, pay, communicate and receive work safely.',
      notice: 'Where a seemingly simple craft route creates real foreign-visitor friction.',
      stop: 'Keep uncertain suppliers out of the guest-facing plan until checked.',
      friction: 'Transport, payment, translation, packaging and delivery conditions are live.'
    }
  },
  wudang: {
    WDM04: {
      anchor: 'Build a public architectural route around one heritage layer and a realistic body budget.',
      notice: 'Mountain placement, thresholds, movement and what is genuinely public.',
      stop: 'Do not add martial-arts or private instruction claims to fill the day.',
      friction: 'Steps, cable-car, weather, crowding and opening conditions need checks.'
    },
    WDM03: {
      anchor: 'Choose walking, stairs, cable-car and weather contingencies before choosing a scenic sequence.',
      notice: 'How terrain changes the meaning and feasibility of the route.',
      stop: 'Turn back before fatigue turns heritage into a safety problem.',
      friction: 'Mountain weather, step intensity, transport and recovery are decisive.'
    },
    WDM01: {
      anchor: 'Connect mountain, architecture, Taoism and state building without inventing a mystical encounter.',
      notice: 'Spatial order, ritual boundaries and the difference between public history and belief practice.',
      stop: 'Keep private ritual, healing and master access outside the route unless separately released.',
      friction: 'Etiquette, access, weather and interpretation need human review.'
    },
    WDM02: {
      anchor: 'Use nights and transfer days to protect a mountain pace before adding another site.',
      notice: 'What the body can actually do after arrival and before departure.',
      stop: 'If the protected pace is not possible, do not sell a deep mountain product.',
      friction: 'Arrival time, accommodation, transport and step load are operational gates.'
    },
    WDM08: {
      anchor: 'Make the agent stop and escalate when the route depends on human access or safety judgement.',
      notice: 'Which claims are research-only and which have dated evidence.',
      stop: 'No release until the required human checks are complete.',
      friction: 'The entire product is sensitive to live conditions and access.'
    }
  },
  jingmai: {
    JMM01: {
      anchor: 'Read tea as a forest, livelihood and settlement system rather than an old-tree-tea purchase.',
      notice: 'Canopy, cultivation, labour, villages and what is publicly observable.',
      stop: 'Leave once the tea-forest relationship is clear; do not imply authenticity or private access.',
      friction: 'Roads, weather, season, language and community rules need checks.'
    },
    JMM02: {
      anchor: 'Protect nights and transfer time before promising a deep mountain stay.',
      notice: 'Whether the actual itinerary leaves recovery time for a remote landscape.',
      stop: 'If the timing is too short, recommend a shallower public landscape product instead.',
      friction: 'Road conditions, accommodation, connectivity and arrival/departure are decisive.'
    },
    JMM03: {
      anchor: 'Observe village life through consent and public space, never as an arranged “authentic” encounter.',
      notice: 'What can be seen respectfully and what belongs to residents alone.',
      stop: 'Remove private homes, ceremonies and farmer access unless explicitly released.',
      friction: 'Consent, photography, translation and local rules require human checks.'
    },
    JMM06: {
      anchor: 'Treat accommodation, food and connectivity as part of the mountain experience.',
      notice: 'Where recovery, safety and communication may fail for a foreign visitor.',
      stop: 'Do not sell a route before these practical conditions are known.',
      friction: 'Power, network, transport, food, payment and medical fallback are live.'
    },
    JMM05: {
      anchor: 'Use walking and ecology to explain the tea forest while keeping the physical route low-impact.',
      notice: 'Weather, ground, water, wildlife and how visitors affect the landscape.',
      stop: 'Turn back early when conditions or body capacity change; the landscape is not a test.',
      friction: 'Rain, heat, footing, guides and emergency access need current confirmation.'
    }
  }
};

// Operational guidance is kept separate from editorial story cards. The
// website can use it to show why a route is feasible without exposing module
// IDs, internal scores or raw source records.
const CITY_OPERATION_GUIDANCE = {
  shanghai: {
    SHM01: {
      route_shape: 'One riverbank reading, one deliberate crossing, then stop once the old/new city contrast is clear.',
      body_budget: 'Moderate walking with one exposed river segment; protect shade and a seated break.',
      low_energy_version: 'Keep the Bund-side reading and skip the cross-river segment.',
      rain_version: 'Shorten the waterfront and use one confirmed indoor cultural stop.'
    },
    SHM02: {
      route_shape: 'One continuous Hengfu street loop, not a hunt for isolated famous façades.',
      body_budget: 'Low-to-moderate walking; crossings, heat and uneven shade matter more than map distance.',
      low_energy_version: 'Use one short street section around Wukang Building and finish with a seated stop.',
      rain_version: 'Keep the street reading brief and move the main interpretation indoors.'
    },
    SHM03: {
      route_shape: 'One old-city question linking form, commerce and ritual; avoid a shopping circuit.',
      body_budget: 'Crowd and sensory load can be higher than walking distance suggests; schedule a quiet reset.',
      low_energy_version: 'Keep one public street and one contextual stop; omit the most congested edge.',
      rain_version: 'Retain the interpretive core and remove outdoor retail wandering.'
    },
    SHM04: {
      route_shape: 'One museum, one question, one exit—not a museum marathon.',
      body_budget: 'Lower physical friction, but attention fatigue is real; leave time to process.',
      low_energy_version: 'Choose the shorter gallery route; do not compensate with another museum.',
      rain_version: 'Use as the primary weather branch after dated opening and reservation checks.'
    },
    SHM05: {
      route_shape: 'One park/public-life loop observed respectfully; Tai Chi remains conditional.',
      body_budget: 'Low transfer cost, but weather and etiquette determine whether it works.',
      low_energy_version: 'Stay within one park and protect unstructured time.',
      rain_version: 'Use an indoor public-life or cultural layer; never promise a class without release.'
    },
    SHM06: {
      route_shape: 'One readable waterfront segment showing work becoming public space; cut the far end early.',
      body_budget: 'Potentially long and exposed; distance, shade and toilets are design inputs.',
      low_energy_version: 'Use the nearest coherent section and leave before continuity breaks.',
      rain_version: 'Replace it with an indoor design or making layer only if current access is confirmed.'
    },
    SHM07: {
      route_shape: 'One after-dark public-space sequence, not a nightlife venue crawl.',
      body_budget: 'Shorter walking distance but higher crowd, lighting and return-transport sensitivity.',
      low_energy_version: 'Keep one well-connected public edge and return early.',
      rain_version: 'Use a confirmed indoor evening programme or end the day earlier.'
    },
    SHM08: {
      route_shape: 'A decision handoff: compare another Shanghai day with a Jiangnan extension before transferring.',
      body_budget: 'Transfer fatigue is the main cost; the extension is not automatically an upgrade.',
      low_energy_version: 'Keep the night in Shanghai unless onward movement is simple and worthwhile.',
      rain_version: 'Use the destination-specific indoor offer and current rail conditions, not scenery alone.'
    }
  },
  chongqing: {
    RM01: {
      route_shape: 'One central-city orientation loop linking public religion, commerce and vertical movement.',
      body_budget: 'Lower walking load, but dense crossings and sensory load require a deliberate pause.',
      low_energy_version: 'Keep the shortest public-street loop and remove the extra temple or shopping detour.',
      rain_version: 'Use the indoor/religious layer and shorten the exposed street section after current access is checked.'
    },
    RM02: {
      route_shape: 'One complete high/low transition; stop after the terrain experiment is understood.',
      body_budget: 'Short on the map but stair and elevation intensity can be high.',
      low_energy_version: 'Use one confirmed platform and stop; do not stack viewpoints.',
      rain_version: 'Remove the exposed transition unless same-day surface and construction conditions are acceptable.'
    },
    RM03: {
      route_shape: 'One river-gate reading from movement and infrastructure, not a sequence of skyline photographs.',
      body_budget: 'Moderate walking with heat, traffic and crowd exposure near the river edge.',
      low_energy_version: 'Keep one accessible river-facing section and leave when the transport geography is legible.',
      rain_version: 'Shorten the river edge and preserve the question with an indoor historical layer.'
    },
    RM04: {
      route_shape: 'A night orientation arc outside the commercial core, using one skyline contrast and an early exit.',
      body_budget: 'Longer evening window with crowd, stairs, heat and return-transport friction.',
      low_energy_version: 'Keep one clear external viewpoint and return before navigation becomes the main task.',
      rain_version: 'Use the most reliable public edge only if lighting, access and weather conditions support it.'
    },
    RM05: {
      route_shape: 'Choose one low-friction river movement—ropeway or cruise—only after conditions and queue cost are known.',
      body_budget: 'Lower walking load, but waiting, boarding and weather can dominate the experience.',
      low_energy_version: 'Use the option with the clearest return path; do not add a second transport attraction.',
      rain_version: 'Keep only if the selected operator and weather conditions are confirmed.'
    },
    RM07: {
      route_shape: 'One migration-and-waterway story linking a public heritage site to the river gate.',
      body_budget: 'Moderate walking with uneven surfaces and a meaningful amount of historical attention.',
      low_energy_version: 'Keep the heritage anchor and remove the longer river connection.',
      rain_version: 'Protect the indoor historical core and drop exposed movement if surfaces or access are poor.'
    },
    RM10: {
      route_shape: 'One mountain-city walking experiment with a pre-set turnaround, not a test of endurance.',
      body_budget: 'High step and elevation load; this is a body decision before it is a sightseeing decision.',
      low_energy_version: 'Replace it with a lower-load public-space or museum layer.',
      rain_version: 'Remove it unless current route-surface and safety checks explicitly support continuation.'
    },
    RM12: {
      route_shape: 'One meal as social observation—ordering, spice, sharing and pace—not a restaurant crawl.',
      body_budget: 'Low walking load but high waiting, dietary and communication sensitivity.',
      low_energy_version: 'Keep one confirmed meal and remove any second food stop.',
      rain_version: 'Food can remain the anchor, subject to written dietary and venue checks where required.'
    },
    RM13: {
      route_shape: 'One indoor city-framework session before adding another district.',
      body_budget: 'Low physical load but high attention load; leave time to process the city model.',
      low_energy_version: 'Use a shorter gallery route and stop before adding another museum.',
      rain_version: 'A strong weather branch after dated opening and admission checks.'
    },
    RM16: {
      route_shape: 'Ride first, then use the viewpoint to explain the transport relationship; do not chase a train moment.',
      body_budget: 'Low walking load, but service timing, platforms and crowding are dynamic.',
      low_energy_version: 'Keep the ride-and-viewpoint pair and end immediately after the relationship is clear.',
      rain_version: 'Keep only after same-day line, construction and exit conditions are checked.'
    },
    RM19: {
      route_shape: 'One south-bank regeneration sequence linking port history, neighbourhood texture and public space.',
      body_budget: 'Longer walking and transfer exposure; route continuity must be checked on the ground.',
      low_energy_version: 'Keep the most coherent public segment and cut the far end before fatigue hides the story.',
      rain_version: 'Shorten to the confirmed indoor/covered history layer; do not force the full waterfront.'
    },
    RM23: {
      route_shape: 'One tea-house social-space observation, with participation optional and respectful.',
      body_budget: 'Low walking load; etiquette, seating and language matter more than distance.',
      low_energy_version: 'Stay in one tea-house context and protect unstructured time.',
      rain_version: 'A useful weather branch if current opening and public access are confirmed.'
    }
  },
  beijing: {
    BJM01: {
      route_shape: 'One imperial-axis reading with a clear entry, one contrast and a planned exit—not every hall.',
      body_budget: 'Moderate walking and high attention load; heat, screening and queues can dominate the day.',
      low_energy_version: 'Keep one palace/civic sequence and use a short elevation reset.',
      rain_version: 'Protect the confirmed indoor core and cut exposed park movement.'
    },
    BJM02: {
      route_shape: 'One ritual-and-public-life contrast linking a civic or sacred space to how Beijing is used now.',
      body_budget: 'Low-to-moderate walking with large open areas and weather exposure.',
      low_energy_version: 'Choose one park or ritual anchor and preserve time for sitting.',
      rain_version: 'Keep the indoor/covered interpretation and remove the long park segment.'
    },
    BJM03: {
      route_shape: 'One hutong neighbourhood sequence, not a commercial street checklist or private-home tour.',
      body_budget: 'Moderate walking with crossings, shade changes, crowds and resident-privacy friction.',
      low_energy_version: 'Use the shortest public lane sequence and finish at a calm public stop.',
      rain_version: 'Keep one covered/indoor neighbourhood layer and avoid forcing a long lane walk.'
    },
    BJM04: {
      route_shape: 'A Wall decision based on transfer, terrain, weather and turnaround—not reputation alone.',
      body_budget: 'High transfer and variable step load; the return plan matters as much as the ascent.',
      low_energy_version: 'Choose the lower-load section or remove the Wall rather than making it an endurance test.',
      rain_version: 'Do not release the Wall route without a current weather, surface and transport check.'
    },
    BJM05: {
      route_shape: 'One water-and-garden contrast to the compact imperial axis, only when it adds a new question.',
      body_budget: 'Large-site walking and weather exposure can create hidden fatigue.',
      low_energy_version: 'Use the smaller central option or shorten the garden route.',
      rain_version: 'Keep only the confirmed indoor/covered layer and remove long lakeside movement.'
    },
    BJM06: {
      route_shape: 'One contemporary-production question in one district, not a gallery or creative-venue crawl.',
      body_budget: 'Lower physical intensity but high programme and transfer uncertainty.',
      low_energy_version: 'Choose one confirmed exhibition or public-facing district and stop there.',
      rain_version: 'Useful weather branch after programme, opening and ticket checks.'
    },
    BJM07: {
      route_shape: 'A first-24-hours reliability layer: payment, identity, reservations, data and realistic energy.',
      body_budget: 'Low sightseeing load; it prevents operational friction from ruining the first day.',
      low_energy_version: 'Keep the arrival plan simple and reserve the first full cultural anchor for the next day.',
      rain_version: 'Default arrival-day branch when outdoor plans are fragile.'
    },
    BJM08: {
      route_shape: 'A stay-length decision: compare another Beijing day with the cost of adding a new city.',
      body_budget: 'Transfer fatigue and reservation order are the main costs.',
      low_energy_version: 'Keep the stronger Beijing question rather than adding a thin extension.',
      rain_version: 'Use the strongest indoor contrast and current transport conditions before changing cities.'
    }
  },
  chengdu: {
    CDM01: {
      route_shape: 'One neighbourhood rhythm—tea, public space, food and ordinary movement—not a rush between landmarks.',
      body_budget: 'Low-to-moderate walking, but heat, humidity and unstructured time determine whether the day works.',
      low_energy_version: 'Keep one public-life loop and protect a long seated break.',
      rain_version: 'Use indoor cultural or food layers and let the slower pace remain the point.'
    },
    CDM02: {
      route_shape: 'A panda operations decision: early access, animal activity, transfer cost and the rest of the day.',
      body_budget: 'Low-to-moderate walking but high early-start, crowd and reservation friction.',
      low_energy_version: 'Leave after the planned conservation question; do not add a distant attraction.',
      rain_version: 'Keep only after current admission, weather and animal-activity conditions are checked.'
    },
    CDM03: {
      route_shape: 'One tea-and-park loop long enough to observe how Chengdu shares public time.',
      body_budget: 'Low transfer cost; heat, rain, seating and etiquette matter more than distance.',
      low_energy_version: 'Stay within one park and let unstructured time do the work.',
      rain_version: 'Use a covered tea or cultural layer after current opening is confirmed.'
    },
    CDM04: {
      route_shape: 'One meal or snack progression that explains ordering, spice and sharing—not a restaurant ranking.',
      body_budget: 'Low walking load but high dietary, spice, waiting and language sensitivity.',
      low_energy_version: 'Keep one confirmed food context and remove any second meal stop.',
      rain_version: 'Food is a strong weather branch, subject to written dietary and venue checks.'
    },
    CDM05: {
      route_shape: 'One memory/poetry/religion question in a calm cultural area, not a historic-site checklist.',
      body_budget: 'Low-to-moderate walking with attention and etiquette requirements.',
      low_energy_version: 'Choose one cultural anchor and finish before adding another temple or memorial.',
      rain_version: 'Protect the confirmed indoor/covered core and cut the garden extension.'
    },
    CDM06: {
      route_shape: 'One contemporary-city question—night, design or performance—in one district.',
      body_budget: 'Moderate evening load with programme, crowd and return-transport uncertainty.',
      low_energy_version: 'Keep one confirmed evening layer and return early.',
      rain_version: 'Use a confirmed indoor programme; do not fill the evening with venue-hopping.'
    },
    CDM07: {
      route_shape: 'A day-trip decision based on engineering, landscape, religion and transfer cost—not simply leaving the city.',
      body_budget: 'High transfer and day-length cost; it should earn a full day.',
      low_energy_version: 'Stay in Chengdu and keep the city rhythm rather than forcing a thin excursion.',
      rain_version: 'Release only after current transport, weather and site conditions are checked.'
    },
    CDM08: {
      route_shape: 'A contrast handoff between Chengdu dwelling and Chongqing vertical movement, not an automatic two-city bundle.',
      body_budget: 'Transfer fatigue and hotel/rail timing are the main costs.',
      low_energy_version: 'Keep the stronger base city unless the transfer clearly adds a new question.',
      rain_version: 'Use current rail and indoor programme conditions before changing cities.'
    }
  },
  guangzhou: {
    GZM01: {
      route_shape: 'One food-and-city sequence explaining ordering, ingredients, timing and social geography—not a restaurant list.',
      body_budget: 'Low-to-moderate walking, but heat, queues, language and dietary details carry the real cost.',
      low_energy_version: 'Keep one confirmed meal and one short public-life layer.',
      rain_version: 'Food remains a strong indoor branch after current venue and dietary checks.'
    },
    GZM02: {
      route_shape: 'One old-city water/trade sequence linking Liwan, Xiguan or Shamian without trying to cover every historic edge.',
      body_budget: 'Moderate walking with humidity, shade gaps and commercial noise.',
      low_energy_version: 'Choose the most coherent public loop and remove the farthest district.',
      rain_version: 'Keep covered arcades, museums or food context and shorten exposed lanes.'
    },
    GZM03: {
      route_shape: 'One craft/clan/architectural question with a public-facing material layer.',
      body_budget: 'Low-to-moderate walking; programme and access matter more than distance.',
      low_energy_version: 'Use one confirmed craft or architectural anchor.',
      rain_version: 'Prefer an indoor making or heritage layer after current opening checks.'
    },
    GZM04: {
      route_shape: 'One ordinary-density street sequence using arcades and religious space as evidence of lived Guangzhou.',
      body_budget: 'Moderate heat and crossing load; resident privacy remains a boundary.',
      low_energy_version: 'Keep one public street segment and one quiet reset.',
      rain_version: 'Use covered arcades and confirmed indoor sites instead of forcing a full walk.'
    },
    GZM05: {
      route_shape: 'One Pearl River/contemporary contrast, not an observation-deck checklist.',
      body_budget: 'Lower walking load but high heat, skyline-weather and return-transport sensitivity.',
      low_energy_version: 'Keep one public riverfront section and end before the route becomes a transfer.',
      rain_version: 'Use a confirmed indoor contemporary layer and remove the exposed promenade.'
    },
    GZM06: {
      route_shape: 'One trading-city question through a market or wholesale district, with a clear ethical and purchase boundary.',
      body_budget: 'Moderate sensory and crowd load; commercial noise can exceed walking distance.',
      low_energy_version: 'Choose one market logic and avoid venue-hopping.',
      rain_version: 'Retain only the covered public market layer after current access checks.'
    },
    GZM07: {
      route_shape: 'A reliability layer for heat, rain and arrival timing before adding cultural ambition.',
      body_budget: 'Low sightseeing load; it protects energy and payment/transport setup.',
      low_energy_version: 'Keep the first day short and move the main cultural anchor to the next day.',
      rain_version: 'Default arrival-day branch when outdoor plans are fragile.'
    },
    GZM08: {
      route_shape: 'A regional choice between staying with Guangzhou, adding Shenzhen or continuing toward Guangxi.',
      body_budget: 'Transfer fatigue and hotel/rail timing are the main costs.',
      low_energy_version: 'Keep the stronger base city unless the next destination adds a genuinely new question.',
      rain_version: 'Use current transport and indoor programme conditions before changing cities.'
    }
  },
  shenzhen: {
    SZM01: {
      route_shape: 'Define one technology question—hardware, supply chain, interfaces, EVs or city systems—before choosing districts.',
      body_budget: 'Moderate transfers and cognitive load; a campus or company checklist is inefficient.',
      low_energy_version: 'Choose one public technology layer and stop before adding another district.',
      rain_version: 'Use confirmed indoor markets, museums or design spaces.'
    },
    SZM02: {
      route_shape: 'One Huaqiangbei supply-chain observation, not a bargain hunt or sourcing promise.',
      body_budget: 'Moderate crowd and sensory load with language, pricing and quality friction.',
      low_energy_version: 'Observe one product/supply-chain question and leave before fatigue turns into impulse buying.',
      rain_version: 'Useful indoor branch, subject to current access and payment checks.'
    },
    SZM03: {
      route_shape: 'One public-facing technology sequence showing interfaces in everyday life, not private corporate access.',
      body_budget: 'Moderate transfer cost; public evidence matters more than the number of buildings.',
      low_energy_version: 'Keep one observable city-system layer.',
      rain_version: 'Use a confirmed indoor public venue or exhibition.'
    },
    SZM04: {
      route_shape: 'One design/making contrast to the hardware story, in a single creative district.',
      body_budget: 'Lower walking load but high programme turnover and access uncertainty.',
      low_energy_version: 'Choose one confirmed studio, exhibition or public design layer.',
      rain_version: 'Strong weather branch after programme and opening checks.'
    },
    SZM05: {
      route_shape: 'One innovation-city landscape question, not a campus tour.',
      body_budget: 'Long transfers can overwhelm a short stay; public access must lead the design.',
      low_energy_version: 'Keep one public urban-system contrast and cut the far edge.',
      rain_version: 'Use confirmed indoor technology or design spaces.'
    },
    SZM06: {
      route_shape: 'One layered urban-change sequence where older settlement and future-city pressure meet.',
      body_budget: 'Moderate walking and heat exposure; privacy and commercialization need active care.',
      low_energy_version: 'Keep one public street layer and one recovery stop.',
      rain_version: 'Shorten outdoor movement and preserve the historical question indoors.'
    },
    SZM07: {
      route_shape: 'A connector decision: Shenzhen as destination, Greater Bay Area bridge or final technology chapter.',
      body_budget: 'Transfer and border/airport timing are the main costs.',
      low_energy_version: 'Stay in Shenzhen unless the onward move adds a clear new question.',
      rain_version: 'Use current transport and entry conditions before changing the endpoint.'
    },
    SZM08: {
      route_shape: 'An ethics and operations checkpoint distinguishing public evidence from private access or corporate theatre.',
      body_budget: 'Low sightseeing load; permission, filming and payment boundaries are the work.',
      low_energy_version: 'Keep the public route and remove any access-dependent claim.',
      rain_version: 'Use confirmed public indoor evidence rather than inventing a company visit.'
    }
  },
  hangzhou: {
    HZM01: {
      route_shape: 'One West Lake landscape loop with a clear reading question, not a full postcard lap.',
      body_budget: 'Moderate walking with heat, shade gaps, crowds and water-edge fatigue.',
      low_energy_version: 'Choose one shoreline section and protect a long rest.',
      rain_version: 'Shorten the lake edge and use a confirmed indoor cultural layer.'
    },
    HZM02: {
      route_shape: 'One tea landscape/labour/taste sequence, not a buying stop or staged ceremony.',
      body_budget: 'Moderate transfer and hill exposure; local access and consent matter.',
      low_energy_version: 'Keep one public tea landscape and remove the second village or hill.',
      rain_version: 'Use a confirmed indoor tea or cultural layer; do not promise a private encounter.'
    },
    HZM03: {
      route_shape: 'One sacred-landscape visit approached through etiquette, terrain and actual interest.',
      body_budget: 'Moderate walking, crowds and hill/stair sensitivity.',
      low_energy_version: 'Keep the public architectural core and skip additional hillside movement.',
      rain_version: 'Retain only confirmed covered/public areas and adjust for surface conditions.'
    },
    HZM04: {
      route_shape: 'One water-town/urban-history contrast showing Hangzhou beyond the scenic lake.',
      body_budget: 'Moderate transfers and walking; commercial noise can alter the experience.',
      low_energy_version: 'Choose one old-city/water layer and stop before adding another town.',
      rain_version: 'Use covered streets, museum or confirmed indoor cultural programme.'
    },
    HZM05: {
      route_shape: 'A quiet-weather alternative built around wetland, public landscape or a lower-crowd loop.',
      body_budget: 'Lower crowd load but weather, footing and transport remain decisive.',
      low_energy_version: 'Keep the shortest accessible loop and preserve recovery time.',
      rain_version: 'Use only after same-day surface and access checks.'
    },
    HZM06: {
      route_shape: 'One contemporary Hangzhou/digital-life question, not a company-tour promise.',
      body_budget: 'Moderate transfers with programme and public-access uncertainty.',
      low_energy_version: 'Choose one public-facing urban or design layer.',
      rain_version: 'Prefer a confirmed indoor exhibition or public venue.'
    },
    HZM07: {
      route_shape: 'A pacing decision: day trip, overnight or destination—based on the question Hangzhou adds.',
      body_budget: 'Rail timing and transfer fatigue are the main costs.',
      low_energy_version: 'Keep the night in Shanghai if Hangzhou does not add a distinct layer.',
      rain_version: 'Use current rail and indoor programme conditions before changing the stay pattern.'
    },
    HZM08: {
      route_shape: 'A weather, mobility and seasonal checkpoint before releasing a scenic route.',
      body_budget: 'Low sightseeing load; it protects the body and avoids false certainty.',
      low_energy_version: 'Shorten the route before removing the core question.',
      rain_version: 'Default branch when heat, rain, crowds or footing make the original plan fragile.'
    }
  },
  suzhou: {
    SZUM01: {
      route_shape: 'One garden as an instrument of attention, not a garden checklist.',
      body_budget: 'Moderate walking and high visual attention; queues and crowding change the experience.',
      low_energy_version: 'Leave when proportion, thresholds and water movement become legible.',
      rain_version: 'Keep one confirmed garden and use a covered craft/cultural contrast.'
    },
    SZUM02: {
      route_shape: 'One canal-city sequence linking water, streets and ordinary movement.',
      body_budget: 'Moderate walking with weather, bridges and commercial noise.',
      low_energy_version: 'Keep one public water/street section and remove the far end.',
      rain_version: 'Shorten the canal walk and preserve the question indoors.'
    },
    SZUM03: {
      route_shape: 'One craft/music/labour question with a confirmed public-facing cultural layer.',
      body_budget: 'Low-to-moderate walking; programme and language support are dynamic.',
      low_energy_version: 'Choose one confirmed craft or performance context.',
      rain_version: 'Strong indoor branch after current programme checks.'
    },
    SZUM04: {
      route_shape: 'One museum/contemporary interpretation paired with a garden or canal question, not two attention-heavy interiors.',
      body_budget: 'Lower physical load but high attention fatigue.',
      low_energy_version: 'Choose one museum question and leave time for the city outside.',
      rain_version: 'Use after dated opening, reservation and exhibition checks.'
    },
    SZUM05: {
      route_shape: 'A water-town decision: only add Tongli or Zhouzhuang if it adds a different question from Suzhou itself.',
      body_budget: 'High transfer and commercial-noise cost for a short stay.',
      low_energy_version: 'Stay in Suzhou and protect the stronger garden/canal route.',
      rain_version: 'Use current transport and indoor alternatives before adding a water town.'
    },
    SZUM06: {
      route_shape: 'One hill/pagoda/landscape contrast to a garden interior, not another monument stop.',
      body_budget: 'Moderate walking with stairs and weather exposure.',
      low_energy_version: 'Choose the lower-load view or garden, not both by default.',
      rain_version: 'Remove exposed hill movement unless current footing is acceptable.'
    },
    SZUM07: {
      route_shape: 'A Jiangnan choice comparing Suzhou’s distinct question with Shanghai or Hangzhou.',
      body_budget: 'Rail timing, hotel location and transfer fatigue are central.',
      low_energy_version: 'Keep the stronger base city when the contrast is not meaningful.',
      rain_version: 'Use current rail and indoor programme conditions before changing cities.'
    },
    SZUM08: {
      route_shape: 'A reservation, weather and body checkpoint before releasing a garden/canal route.',
      body_budget: 'Low sightseeing load; it prevents fragile plans from being sold as fixed.',
      low_energy_version: 'Shorten the route while preserving one garden or water question.',
      rain_version: 'Default branch when queues, rain or footing make the original plan fragile.'
    }
  },
  'guilin-yangshuo': {
    GYM01: {
      route_shape: 'Choose one relationship to the karst landscape—water, walking, farming or quiet observation—before choosing sites.',
      body_budget: 'Moderate outdoor exposure with heat, footing and weather sensitivity.',
      low_energy_version: 'Keep one land-based landscape frame and protect recovery time.',
      rain_version: 'Remove exposed movement and keep a confirmed indoor or low-risk landscape interpretation.'
    },
    GYM02: {
      route_shape: 'A water decision between cruise, shorter river section and land-based views—not all three.',
      body_budget: 'Lower walking load but high weather, boarding and water-condition dependence.',
      low_energy_version: 'Choose the simplest public water/land option with the clearest return.',
      rain_version: 'Do not release water movement without same-day weather and operating checks.'
    },
    GYM03: {
      route_shape: 'One slow countryside movement pattern without assuming cycling, rafting or private access.',
      body_budget: 'Low-to-moderate movement, with heat, road surface and transport friction.',
      low_energy_version: 'Use a short public countryside section and remove the second activity.',
      rain_version: 'Keep the land-based public route only if footing and access are acceptable.'
    },
    GYM04: {
      route_shape: 'A nights-and-energy decision between Yangshuo town and quieter countryside.',
      body_budget: 'Transfer and accommodation location can matter more than attraction count.',
      low_energy_version: 'Keep one base and avoid daily hotel changes.',
      rain_version: 'Use the base with the strongest indoor and transport fallback.'
    },
    GYM05: {
      route_shape: 'One karst walking/photography route matched to exertion and exposure tolerance.',
      body_budget: 'Potentially high heat, uneven ground and exposure; safety beats the photograph.',
      low_energy_version: 'Use the lowest-load public viewpoint and set a turnaround.',
      rain_version: 'Remove the route until same-day surface and visibility checks support it.'
    },
    GYM06: {
      route_shape: 'A Guilin arrival/recovery chapter only when it adds rest, context or logistics value.',
      body_budget: 'Low sightseeing load; it protects the first and last travel windows.',
      low_energy_version: 'Keep Guilin as a recovery node rather than adding another transfer.',
      rain_version: 'Use indoor city context and transport fallback.'
    },
    GYM07: {
      route_shape: 'A Longji/wider-Guangxi decision based on nights, weather and transfer cost.',
      body_budget: 'High transfer and terrain cost; it deserves separate time or should be left out.',
      low_energy_version: 'Stay with the core Guilin/Yangshuo question.',
      rain_version: 'Do not release terraces or mountain movement without current conditions.'
    },
    GYM08: {
      route_shape: 'A release checkpoint for rain, fog, water changes and intercity handoffs.',
      body_budget: 'Low sightseeing load; it prevents fragile nature plans from becoming promises.',
      low_energy_version: 'Shorten the route before removing the core landscape question.',
      rain_version: 'Default branch when visibility, water or transfers become uncertain.'
    }
  },
  'quanzhou-dehua': {
    QZM01: {
      route_shape: 'One maritime-system explanation linking production, transport, belief and trade.',
      body_budget: 'Moderate walking and attention load; separate city and Dehua transfers matter.',
      low_energy_version: 'Keep one public port/heritage layer and remove the farthest extension.',
      rain_version: 'Use confirmed indoor heritage or museum layers.'
    },
    QZM02: {
      route_shape: 'One sacred-site sequence with etiquette and plurality explained before photography.',
      body_budget: 'Low-to-moderate walking; respect, dress and access matter more than distance.',
      low_energy_version: 'Choose one public sacred layer and stop before adding another temple.',
      rain_version: 'Keep only confirmed public/covered access and remove exposed movement.'
    },
    QZM03: {
      route_shape: 'One port, gate, bridge or river-sea movement question—not a heritage checklist.',
      body_budget: 'Moderate walking with heat, traffic and waterfront continuity friction.',
      low_energy_version: 'Keep the most legible public infrastructure section.',
      rain_version: 'Shorten the waterfront and preserve the infrastructure question indoors.'
    },
    QZM04: {
      route_shape: 'One public-life layer—Nanyin, tea, food or streets—used to make heritage lived rather than staged.',
      body_budget: 'Low-to-moderate walking; programme and consent are dynamic.',
      low_energy_version: 'Choose one confirmed public cultural layer.',
      rain_version: 'Prefer confirmed indoor music, food or cultural context.'
    },
    QZM05: {
      route_shape: 'A Dehua production decision: understand ceramics, buy an object or join a separately verified making encounter.',
      body_budget: 'Transfer and access cost can exceed the workshop time.',
      low_energy_version: 'Keep public production/design evidence and remove private access assumptions.',
      rain_version: 'Use confirmed indoor production or museum layers.'
    },
    QZM06: {
      route_shape: 'Separate route interpretation, authentication, purchasing and artist booking.',
      body_budget: 'Low walking load but high trust, payment and delivery friction.',
      low_energy_version: 'Keep observation and buying separate; do not add sourcing tasks.',
      rain_version: 'Use public indoor evidence and postpone purchase decisions until checks pass.'
    },
    QZM07: {
      route_shape: 'A pacing decision on whether Dehua earns a full separate day.',
      body_budget: 'Transfer, hotel and recovery costs are central.',
      low_energy_version: 'Keep Quanzhou as the base unless Dehua adds a distinct question.',
      rain_version: 'Use current transport and indoor programme conditions before changing the route.'
    },
    QZM08: {
      route_shape: 'A release checkpoint for dates, payment, transport, sacred access and craft boundaries.',
      body_budget: 'Low sightseeing load; it prevents conditional access becoming a promise.',
      low_energy_version: 'Keep the public route and remove every unreleased encounter.',
      rain_version: 'Default branch when weather or access conditions are uncertain.'
    }
  },
  jingdezhen: {
    JZM01: {
      route_shape: 'One porcelain-system question linking material, labour, kiln, design and trade.',
      body_budget: 'Moderate walking and high attention load; process matters more than venue count.',
      low_energy_version: 'Keep one public material/process anchor and stop before adding another district.',
      rain_version: 'Strong indoor branch after current opening and programme checks.'
    },
    JZM02: {
      route_shape: 'One imperial-kiln/technical-history sequence explaining standards, management and technique.',
      body_budget: 'Low-to-moderate walking with museum attention fatigue.',
      low_energy_version: 'Choose one technical question and leave time to process it.',
      rain_version: 'Use confirmed indoor heritage layers.'
    },
    JZM03: {
      route_shape: 'One public art/design ecology question, never a private artist-access promise.',
      body_budget: 'Moderate programme and transfer uncertainty.',
      low_energy_version: 'Choose one confirmed public exhibition or district.',
      rain_version: 'Indoor branch after programme and access checks.'
    },
    JZM04: {
      route_shape: 'Separate observing, collecting, buying and sourcing before entering a market.',
      body_budget: 'Low walking load but high authenticity, pricing and delivery friction.',
      low_energy_version: 'Keep observation separate from purchase decisions.',
      rain_version: 'Use covered public markets and defer buying until checks pass.'
    },
    JZM05: {
      route_shape: 'A making-level decision: course, workshop, residency or apprenticeship are different products.',
      body_budget: 'Access, language, safety and time commitment are the real costs.',
      low_energy_version: 'Use public process observation unless a specific programme is released.',
      rain_version: 'Prefer confirmed indoor public making spaces.'
    },
    JZM06: {
      route_shape: 'A safety checkpoint for kiln, dust, firing and workshop conditions before any making encounter.',
      body_budget: 'Low sightseeing load but high safety and consent sensitivity.',
      low_energy_version: 'Remove the making encounter when controls are not documented.',
      rain_version: 'Keep public museum/design layers only.'
    },
    JZM07: {
      route_shape: 'A pacing and Jingdezhen–Dehua comparison, not an automatic second ceramics city.',
      body_budget: 'Transfer fatigue and material overlap are the main costs.',
      low_energy_version: 'Keep the stronger ceramics question in one base city.',
      rain_version: 'Use current transport and indoor programme conditions before changing cities.'
    },
    JZM08: {
      route_shape: 'A release checkpoint for arrival, language, payment and safe delivery of work.',
      body_budget: 'Low sightseeing load; it protects independent visitors from operational surprises.',
      low_energy_version: 'Keep the public route and remove every unsupported purchase or delivery promise.',
      rain_version: 'Use confirmed indoor public layers.'
    }
  },
  wudang: {
    WDM01: {
      route_shape: 'One heritage-system explanation linking mountain, architecture, Taoism and state building.',
      body_budget: 'Moderate-to-high attention and transfer load; the mountain is not a backdrop only.',
      low_energy_version: 'Keep one public architectural layer and remove extra ascent.',
      rain_version: 'Use confirmed public/covered heritage access.'
    },
    WDM02: {
      route_shape: 'A nights-and-transfer decision protecting early starts, recovery and realistic step capacity.',
      body_budget: 'Transfer and accommodation location determine feasibility.',
      low_energy_version: 'Add nights or reduce modules before adding mountain movement.',
      rain_version: 'Use the base with the strongest indoor and transport fallback.'
    },
    WDM03: {
      route_shape: 'One mountain movement plan with stairs, cable-car and weather contingencies.',
      body_budget: 'Potentially high steps and exposure; safety sets the route.',
      low_energy_version: 'Choose the lowest-load public option and set a turnaround.',
      rain_version: 'Remove exposed movement until same-day footing and weather checks pass.'
    },
    WDM04: {
      route_shape: 'One public architectural route, not every palace, temple or ridge in one day.',
      body_budget: 'Moderate walking and heritage attention load.',
      low_energy_version: 'Keep one public heritage anchor.',
      rain_version: 'Use confirmed covered/public heritage areas.'
    },
    WDM05: {
      route_shape: 'One etiquette-and-photography framework for sacred space, with observation before participation.',
      body_budget: 'Low walking load but high consent and conduct sensitivity.',
      low_energy_version: 'Observe publicly and remove private ritual assumptions.',
      rain_version: 'Keep only confirmed public access.'
    },
    WDM06: {
      route_shape: 'A boundary decision between observation, beginner movement, training and healing—not one generic Tai Chi promise.',
      body_budget: 'Physical and safeguarding requirements must be explicit.',
      low_energy_version: 'Keep public heritage and remove practice access until released.',
      rain_version: 'Use public architectural/cultural route only.'
    },
    WDM07: {
      route_shape: 'A recovery-and-base decision covering food, early starts, connectivity and fallback capacity.',
      body_budget: 'Low sightseeing load; it protects the mountain days that follow.',
      low_energy_version: 'Keep a stable base rather than changing accommodation repeatedly.',
      rain_version: 'Use the base with the strongest indoor and transport fallback.'
    },
    WDM08: {
      route_shape: 'A release checkpoint that tells the agent when to stop, escalate or keep the route public.',
      body_budget: 'Low sightseeing load; safety and evidence are the product boundary.',
      low_energy_version: 'Remove every unreleased practice, ritual or private-access claim.',
      rain_version: 'Default escalation branch when mountain conditions are uncertain.'
    }
  },
  jingmai: {
    JMM01: {
      route_shape: 'One living tea-landscape question linking forest, old groves, villages and livelihoods.',
      body_budget: 'Moderate outdoor and transfer load with weather and ecology sensitivity.',
      low_energy_version: 'Keep one low-impact public landscape route and protect recovery.',
      rain_version: 'Remove exposed forest movement until footing and weather are checked.'
    },
    JMM02: {
      route_shape: 'A nights-and-arrival decision before promising a deep mountain stay.',
      body_budget: 'Transfer days can consume the experience; short stays may not earn the route.',
      low_energy_version: 'Add nights or keep Jingmai as a future product rather than compressing it.',
      rain_version: 'Use the base with the strongest transport and shelter fallback.'
    },
    JMM03: {
      route_shape: 'One village/public-space observation with consent, never an arranged “authentic” encounter.',
      body_budget: 'Low walking load but high privacy, translation and local-rules sensitivity.',
      low_energy_version: 'Keep public observation and remove private homes or ceremonies.',
      rain_version: 'Use confirmed public/covered spaces only.'
    },
    JMM04: {
      route_shape: 'Separate learning, tasting, buying and collecting before any tea purchase is discussed.',
      body_budget: 'Low walking load but high trust, quality and payment friction.',
      low_energy_version: 'Keep public tea ecology and tasting context; defer purchase decisions.',
      rain_version: 'Use confirmed indoor tea context.'
    },
    JMM05: {
      route_shape: 'One low-impact walking/ecology route with a pre-set turnaround and emergency fallback.',
      body_budget: 'Weather, footing, water and access can change the route quickly.',
      low_energy_version: 'Turn back early; the landscape is not a fitness test.',
      rain_version: 'Remove the forest route until same-day conditions support it.'
    },
    JMM06: {
      route_shape: 'A practical recovery layer for accommodation, food, connectivity and medical fallback.',
      body_budget: 'Low sightseeing load; these conditions determine whether the mountain stay is safe.',
      low_energy_version: 'Keep a stable base and simplify transfers.',
      rain_version: 'Use the strongest shelter and connectivity fallback.'
    },
    JMM07: {
      route_shape: 'A tea-maker/guide release gate: no encounter is mentioned until identity, consent and operating evidence exist.',
      body_budget: 'Low sightseeing load but high safeguarding and access sensitivity.',
      low_energy_version: 'Keep the public landscape route and remove the interaction claim.',
      rain_version: 'Use public ecology and tea interpretation only.'
    },
    JMM08: {
      route_shape: 'A release and escalation checkpoint defining when the agent must stop rather than improvise access.',
      body_budget: 'Low sightseeing load; evidence and safety are the product boundary.',
      low_energy_version: 'Remove every private, ritual or supplier-dependent promise.',
      rain_version: 'Default escalation branch when mountain conditions are uncertain.'
    }
  }
};

const CITY_EXCLUSIONS = {
  shanghai: [
    'A second museum on the same day unless the first cannot answer the chosen question.',
    'An observation-deck stop added only for height or a guaranteed photograph.',
    'Residential compounds, private interiors or staged encounters with residents.',
    'Nanjing Road as a standalone sightseeing objective for an architecture-led, slow first visit.'
  ],
  chongqing: [
    'A second skyline viewpoint added only to collect another photograph.',
    'A full Hongyadong commercial-complex tour after the visual geography is already clear.',
    'Residential interiors, staged resident encounters or intrusive photography.',
    'A Wulong day trip added automatically to a Chongqing city stay; the transfer must earn its place.'
  ],
  beijing: [
    'A second imperial monument added after the main question is already answered.',
    'A Wall section chosen only because it is famous, without checking transfer, terrain and return cost.',
    'Private courtyards, residential interiors or staged encounters with hutong residents.',
    'A full Summer Palace day added automatically after the Forbidden City.'
  ],
  chengdu: [
    'A panda visit, hotpot meal and distant day trip compressed into the same day.',
    'A second food venue added only to make the itinerary look fuller.',
    'A day trip added automatically when Chengdu itself has not been understood.',
    'Private homes, staged “local” encounters or unconsented portraits.'
  ],
  'guilin-yangshuo': [
    'A scenery conveyor belt combining cruise, cycling, rafting and terraces in a short stay.',
    'Private village access or staged rural encounters.',
    'A water activity released without current weather and operating checks.'
  ],
  'quanzhou-dehua': [
    'A temple-and-shopping checklist that compresses religious and production systems into one day.',
    'Private ritual, resident access or artist encounters without explicit release.',
    'Purchase authentication or workshop promises made from research leads alone.'
  ],
  jingdezhen: [
    'A ceramic-shopping list presented as an understanding of production.',
    'Private artist, residency or apprenticeship access without a separate human gate.',
    'A purchase or delivery promise before identity, quality and settlement checks.'
  ],
  wudang: [
    'A guaranteed master, healing or martial-arts encounter.',
    'Private ritual or photography access without consent and release.',
    'A mountain route released without current weather, steps and recovery checks.'
  ],
  jingmai: [
    'An old-tree-tea shopping trip presented as a cultural-landscape route.',
    'Private homes, ceremonies, tea-maker meetings or resident portraits without consent.',
    'A deep mountain product compressed into too few nights or unsupported transport.'
  ]
};

function unique(items) {
  return [...new Set(items.map(item => String(item || '').trim()).filter(Boolean))];
}

function checkLines(decision) {
  const checks = [];
  for (const module of decision.selected_modules || []) {
    for (const item of module.required_confirmations || []) checks.push(item);
    if (module.output_rule) checks.push(module.output_rule);
  }
  for (const warning of decision.warnings || []) checks.push(warning);
  return unique(checks).slice(0, 10).map(item => `- ${item}`);
}

function publicFrame(runtime) {
  return CITY_FRAMES[runtime] || {
    thesis: 'Build a coherent route around the selected city modules rather than collecting every available stop.',
    tradeoff: 'The route keeps a fixed information budget and leaves lower-priority places out.',
    fallback: 'When live conditions change, preserve the route question and reduce transfers before adding more stops.'
  };
}

function publicStatus(status) {
  if (status === 'human_checked_ready') return 'human_checked_ready';
  if (status === 'research_draft') return 'research_draft';
  return 'draft_for_human_review';
}

function publicTripContext(context) {
  if (!context) return null;
  return {
    arrival_date: context.arrival_date ?? null,
    departure_date: context.departure_date ?? null,
    arrival_time_local: context.arrival_time_local ?? null,
    departure_time_local: context.departure_time_local ?? null,
    usable_time_window: context.usable_time_window ?? null,
    nights: context.nights ?? null,
    adults: context.adults ?? null,
    children: context.children ?? null,
    party_size: context.party_size ?? null,
    pace: context.pace ?? null,
    overnight_area: context.overnight_area ?? null,
    output_language: context.output_language ?? null,
    explicit_priorities: Array.isArray(context.explicit_priorities) ? context.explicit_priorities : [],
    explicit_avoidances: Array.isArray(context.explicit_avoidances) ? context.explicit_avoidances : [],
    inferred_needs: Array.isArray(context.inferred_needs)
      ? context.inferred_needs.map(item => ({
        question: item.confirmation_question || 'A route assumption needs confirmation.',
        why: item.reason || null
      }))
      : []
  };
}

/**
 * Structured customer-facing model for a website renderer.
 * It intentionally omits module IDs, raw sources, scores and supplier data.
 */
export function createPublicRoadbook({ runtime, decision, tripContext, markdown = null }) {
  const frame = publicFrame(runtime);
  const selected = decision.selected_modules || [];
  const byId = new Map(selected.map(module => [module.id, module]));
  const guidance = CITY_MODULE_GUIDANCE[runtime] || {};
  const operations = CITY_OPERATION_GUIDANCE[runtime] || {};
  const checks = unique([
    'Current opening, reservation, transport, weather and access conditions for the selected dates.',
    ...selected.flatMap(module => module.required_confirmations || []),
    ...(decision.warnings || [])
  ]).slice(0, 12);
  return {
    schema_version: '1.1',
    renderer_version: runtime === 'shanghai'
      ? 'shanghai-v1.2'
      : runtime === 'chongqing'
        ? 'chongqing-v1.2'
        : runtime === 'beijing'
          ? 'beijing-v1.2'
          : runtime === 'chengdu'
            ? 'chengdu-v1.2'
            : ['guangzhou', 'shenzhen', 'hangzhou', 'suzhou', 'guilin-yangshuo', 'quanzhou-dehua', 'jingdezhen', 'wudang', 'jingmai'].includes(runtime)
              ? `${runtime}-v1.2`
              : 'portfolio-v1.1',
    status: publicStatus(decision.status),
    city: decision.city || runtime,
    delivery_status: {
      public_state: publicStatus(decision.status),
      current_checks_required: publicStatus(decision.status) !== 'human_checked_ready',
      human_review_required: publicStatus(decision.status) !== 'human_checked_ready',
      booking_created: false,
      explanation: publicStatus(decision.status) === 'human_checked_ready'
        ? 'The route has passed the configured human-review evidence gate; this still does not create a booking or supplier promise.'
        : 'This route is a research or human-review draft. Current checks and human review are required before client delivery.'
    },
    route_thesis: frame.thesis,
    why_this_route: [
      'The selected modules are a small information budget, not a ranking of every attraction.',
      'Each day answers one question and leaves a realistic exit for weather, energy or access changes.'
    ],
    route_controls: {
      one_question_per_day: true,
      stop_when_answered: true,
      protect_recovery_time: true,
      explanation: 'The route gets shorter when the guest has understood the idea; more stops are not automatically better.'
    },
    trip_context: publicTripContext(tripContext),
    explicit_priorities: tripContext?.explicit_priorities || [],
    explicit_avoidances: tripContext?.explicit_avoidances || [],
    decision_brief: {
      what_we_heard: tripContext?.explicit_priorities || [],
      what_we_are_protecting: tripContext?.explicit_avoidances || [],
      inferred_needs: (tripContext?.inferred_needs || []).map(item => item.confirmation_question || 'A route assumption needs confirmation.')
    },
    hypotheses_to_confirm: (tripContext?.inferred_needs || []).map(item => ({
      question: item.confirmation_question || 'A route assumption needs confirmation.',
      why: item.reason || null
    })),
    days: (decision.days || []).map(day => ({
      day: day.day,
      theme: day.theme,
      modules: (day.module_ids || []).map(id => byId.get(id)).filter(Boolean).map(module => ({
        name: module.name,
        question: module.question,
        practical_note: module.output_rule || null,
        confirmations: module.required_confirmations || [],
        anchor: guidance[module.id]?.anchor || `Use ${module.name} to answer one concrete question, not to accumulate another stop.`,
        what_to_notice: guidance[module.id]?.notice || module.question || 'Notice how the place works in ordinary use, not only how it photographs.',
        stop_rule: guidance[module.id]?.stop || 'Stop when the route question is answered; preserve time for rest and unexpected city life.',
        main_friction: guidance[module.id]?.friction || 'Current access, weather, crowding and walking conditions need confirmation.',
        route_shape: operations[module.id]?.route_shape || 'Use this module to answer one question, then stop before adding another transfer.',
        body_budget: operations[module.id]?.body_budget || 'Walking, crowding, weather and current access need a dated check.',
        low_energy_version: operations[module.id]?.low_energy_version || 'Keep the shortest coherent version of this module.',
        rain_version: operations[module.id]?.rain_version || 'Preserve the question and move indoors only after current access is confirmed.'
      }))
    })),
    what_we_deliberately_leave_out: CITY_EXCLUSIONS[runtime] || [],
    deliberate_tradeoff: frame.tradeoff,
    fallback_logic: frame.fallback,
    checks_before_delivery: checks,
    delivery_boundary: 'Research draft until dated human checks support release. This does not create a booking, private-access promise or supplier recommendation.',
    markdown
  };
}

/**
 * Adds a customer-facing decision layer to legacy city renderers.
 * It never exposes internal IDs, raw database records or supplier fields.
 */
function tripContextLines(context = {}) {
  if (!context || Object.values(context).every(value => value == null || value === '')) return [];
  const party = context.party_size == null
    ? 'to confirm'
    : `${context.party_size} traveler${context.party_size === 1 ? '' : 's'}`;
  const lines = [
    '',
    '## Trip brief used for this draft',
    `- Dates: ${context.arrival_date || 'to confirm'} → ${context.departure_date || 'to confirm'}${context.nights == null ? '' : ` (${context.nights} night${context.nights === 1 ? '' : 's'})`}`,
    `- Usable time: ${context.usable_time_window || 'confirm arrival and departure windows'}${context.arrival_time_local || context.departure_time_local ? ` (${context.arrival_time_local || 'arrival time to confirm'} → ${context.departure_time_local || 'departure time to confirm'})` : ''}`,
    `- Travelers: ${party}`,
    `- Pace: ${context.pace || 'to confirm'}`,
    `- Overnight area: ${context.overnight_area || 'to confirm'}`,
    `- Output language: ${context.output_language || 'to confirm'}`,
    '',
    '### What we heard',
    `- Priorities: ${(context.explicit_priorities || []).join('; ') || 'to confirm'}`,
    `- Avoidances: ${(context.explicit_avoidances || []).join('; ') || 'to confirm'}`
  ];
  if (Array.isArray(context.inferred_needs) && context.inferred_needs.length) {
    lines.push('', '### Hypotheses to confirm');
    for (const item of context.inferred_needs) {
      lines.push(`- ${item.confirmation_question || 'A route assumption needs confirmation.'}`);
      if (item.reason) lines.push(`  - Why this came up: ${item.reason}`);
    }
  }
  return lines;
}

function insertTripContext(base, context) {
  const contextLines = tripContextLines(context);
  if (!contextLines.length) return base;
  const lines = base.trimEnd().split('\n');
  const sectionIndexes = lines
    .map((line, index) => (index > 0 && line.startsWith('## ') ? index : -1))
    .filter(index => index >= 0);
  const insertAt = sectionIndexes.length > 1 ? sectionIndexes[1] : sectionIndexes[0];
  if (insertAt === undefined) return `${base.trimEnd()}\n${contextLines.join('\n')}`;
  return [
    ...lines.slice(0, insertAt),
    ...contextLines,
    '',
    ...lines.slice(insertAt)
  ].join('\n');
}

// Put the product's real differentiator near the top of the customer-facing
// document. A generic AI answer can name places; this section records the
// decisions made for this traveller and the operational boundary around them.
function differentiatorLines(context = {}, decision = {}) {
  const priorities = context.explicit_priorities || [];
  const avoidances = context.explicit_avoidances || [];
  const priorityText = priorities.length ? priorities.join(', ') : 'the stated travel question';
  const avoidText = avoidances.length ? avoidances.join(', ') : 'unnecessary transfers and checklist pressure';
  return [
    '',
    '## Why this is not a generic AI itinerary',
    '',
    `- **Built from your brief:** the route protects ${priorityText} and avoids ${avoidText}.`,
    '- **A decision, not a ranking:** every day has one question, one physical anchor and a defined point at which to stop.',
    '- **Visible trade-offs:** places are removed on purpose when they add transfer, queue, privacy or fatigue cost without adding a new answer.',
    '- **Resilient by design:** the low-energy and rain versions preserve the same question instead of silently replacing the day with random attractions.',
    '- **Honest about certainty:** current opening, reservation, weather, transport and access facts remain marked for dated human checking before release.',
    `- **Selected scope:** ${Array.isArray(decision.selected_modules) ? decision.selected_modules.length : 0} route modules were used as an information budget, not as a list of everything researched.`
  ];
}

export function enhanceRoadbookMarkdown({ runtime, base, decision, tripContext }) {
  if (!base || !decision) return base;
  const contextualBase = insertTripContext(base, tripContext);
  const marker = '## Why this is not a generic AI itinerary';
  const withDifferentiator = contextualBase.includes(marker)
    ? contextualBase
    : `${contextualBase.trimEnd()}\n${differentiatorLines(tripContext || {}, decision).join('\n')}`;
  if (runtime === 'shanghai' || runtime === 'chongqing') return withDifferentiator;
  const frame = publicFrame(runtime);
  const guidance = CITY_MODULE_GUIDANCE[runtime] || {};
  const operations = CITY_OPERATION_GUIDANCE[runtime] || {};
  const moduleQuestions = (decision.selected_modules || [])
    .slice(0, 6)
    .flatMap(module => {
      const card = guidance[module.id] || {};
      const operation = operations[module.id] || {};
      return [
        `- **${module.name}** — ${module.question || 'Use this module only if it answers the traveler’s stated question.'}`,
        `  - **Anchor:** ${card.anchor || `Use ${module.name} to answer one concrete question, not to accumulate another stop.`}`,
        `  - **Notice:** ${card.notice || module.question || 'Notice how the place works in ordinary use, not only how it photographs.'}`,
        `  - **Stop rule:** ${card.stop || 'Stop when the route question is answered; preserve time for rest and unexpected city life.'}`,
        `  - **Main friction:** ${card.friction || 'Current access, weather, crowding and walking conditions need confirmation.'}`,
        `  - **Route shape:** ${operation.route_shape || 'Use one coherent public sequence to answer the module question, then stop before adding another transfer.'}`,
        `  - **Body and time budget:** ${operation.body_budget || 'Walking, weather, crowding and current access need a dated check.'}`,
        `  - **Low-energy version:** ${operation.low_energy_version || 'Keep the shortest coherent version of this module.'}`,
        `  - **Rain version:** ${operation.rain_version || 'Preserve the question and remove exposed movement unless current conditions support it.'}`
      ];
    });
  const lines = [
    '',
    '## Decision layer',
    '',
    `**Route thesis:** ${frame.thesis}`,
    '',
    '### Why this route is not a list',
    '- The selected modules are a small information budget, not a ranking of every attraction.',
    '- Each day should answer one question and leave a realistic exit for weather, energy or access changes.',
    '- The route gets shorter when the guest has understood the idea; more stops are not automatically better.',
    ...moduleQuestions,
    '',
    '### Deliberate trade-off',
    `- ${frame.tradeoff}`,
    '',
    '### Fallback logic',
    `- ${frame.fallback}`,
    '',
    '### Checks before delivery',
    ...checkLines(decision),
    '',
    '### Delivery boundary',
    '- This is a research draft until dated human checks support release.',
    '- Do not turn a research candidate into a booking, private-access promise or supplier recommendation.'
  ];
  return `${withDifferentiator.trimEnd()}\n${lines.join('\n')}`;
}

export { CITY_FRAMES };
