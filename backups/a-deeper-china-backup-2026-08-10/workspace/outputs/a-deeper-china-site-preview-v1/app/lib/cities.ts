export type CitySlug = "shanghai" | "chongqing" | "beijing" | "chengdu";

export type CityRecord = {
  slug: CitySlug;
  name: string;
  kicker: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  imageCredit: string;
  readAs: string;
  protect: string;
  question: string;
  nights: string;
  route: string;
  notes: string[];
};

export const cities: CityRecord[] = [
  {
    slug: "shanghai",
    name: "Shanghai",
    kicker: "Layers / river light / old lanes",
    title: "Read the city from the river edge.",
    summary: "Architecture, river light, old lanes and the feeling of a place still changing under your feet.",
    image: "/cities/shanghai-pudong.jpg",
    imageAlt: "Shanghai skyline and river at dusk",
    imageCredit: "Unsplash / Shanghai skyline",
    readAs: "layers",
    protect: "one slow afternoon",
    question: "Where did the city go next?",
    nights: "2–4 nights",
    route: "The Bund → old neighbourhoods → one deliberate Pudong crossing",
    notes: ["Use the river as a clock, not a photo stop.", "Pair one iconic building with a street-level counterpoint.", "Keep a rain branch ready: museum, lane, teahouse."],
  },
  {
    slug: "chongqing",
    name: "Chongqing",
    kicker: "Topography / bridges / night light",
    title: "A city changes when the ground disappears.",
    summary: "A vertical city where a ten-minute map distance can become a day of stairs, river crossings, food and changing light.",
    image: "/cities/chongqing-night.png",
    imageAlt: "Chongqing skyline, bridge and river at night",
    imageCredit: "Wikimedia Commons / Chongqing Skyline At Night",
    readAs: "topography",
    protect: "the first evening",
    question: "How do people actually move?",
    nights: "2–3 nights",
    route: "Yuzhong peninsula → Liziba → river crossings → one night view",
    notes: ["Plan by levels and crossings, not only by kilometres.", "Start with one neighbourhood before chasing the skyline.", "Leave transfer time for stairs, queues and weather."],
  },
  {
    slug: "beijing",
    name: "Beijing",
    kicker: "Scale / thresholds / long time",
    title: "History is not a backdrop. It is the route.",
    summary: "The capital works when the great monuments sit inside a slower reading of courtyards, thresholds, scale and ordinary life.",
    image: "/cities/beijing-temple.jpg",
    imageAlt: "Temple of Heaven in Beijing against a blue sky",
    imageCredit: "Wikimedia Commons / Temple of Heaven",
    readAs: "scale",
    protect: "one unplanned lane",
    question: "What changed around the wall?",
    nights: "3–5 nights",
    route: "Temple of Heaven → hutong morning → palace scale → Great Wall decision",
    notes: ["Do not put the Great Wall on the arrival day.", "Choose one palace-scale experience and let it breathe.", "The best Beijing route has thresholds between monuments."],
  },
  {
    slug: "chengdu",
    name: "Chengdu",
    kicker: "Rhythm / tea / soft edges",
    title: "Leave room for the afternoon to become itself.",
    summary: "A city that teaches a traveler to leave room: for tea, a late lunch, a park bench and a second look at the street.",
    image: "/cities/chengdu-anshun.jpg",
    imageAlt: "Anshun Bridge over the Jin River in Chengdu at night",
    imageCredit: "Wikimedia Commons / Anshun Bridge",
    readAs: "rhythm",
    protect: "one long lunch",
    question: "What happens if nothing is next?",
    nights: "2–4 nights",
    route: "People's Park → tea house → old lanes → Anshun Bridge after dark",
    notes: ["Treat tea as a duration, not a checkbox.", "Keep one day free of a major attraction.", "Use Chongqing only when the contrast earns the transfer."],
  },
];

export const cityBySlug = Object.fromEntries(cities.map((city) => [city.slug, city])) as Record<CitySlug, CityRecord>;

export const archiveGroups = [
  { label: "East coast", cities: "Shanghai · Hangzhou · Suzhou" },
  { label: "North", cities: "Beijing · Great Wall" },
  { label: "Sichuan–Chongqing", cities: "Chengdu · Chongqing · Jiuzhaigou" },
  { label: "South", cities: "Guangzhou · Shenzhen · Guilin–Yangshuo" },
  { label: "Specialist routes", cities: "Jingdezhen · Quanzhou–Dehua · Wudang · Jingmai" },
];
