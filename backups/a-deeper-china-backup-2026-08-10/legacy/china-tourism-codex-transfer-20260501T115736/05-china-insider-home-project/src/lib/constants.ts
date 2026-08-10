export const CITIES = [
  "Beijing",
  "Jingdezhen",
  "Chongqing",
  "Chengdu",
  "Quanzhou",
] as const;

export type City = (typeof CITIES)[number];

export const CITY_NOTES = {
  Beijing: "History, TCM, calligraphy",
  Jingdezhen: "Porcelain and kiln culture",
  Chongqing: "Photography and urban texture",
  Chengdu: "Sichuan food and tea houses",
  Quanzhou: "Maritime Silk Road and local history",
} satisfies Record<City, string>;

export const CITY_CARDS = {
  Beijing: {
    image:
      "https://images.unsplash.com/photo-1547981609-4b6bf67db7af?auto=format&fit=crop&w=1200&q=80",
    note: "From hutongs to temple courtyards",
  },
  Jingdezhen: {
    image:
      "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=1200&q=80",
    note: "Kilns, clay, and porcelain studios",
  },
  Chongqing: {
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    note: "Layered streets and river light",
  },
  Chengdu: {
    image:
      "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1200&q=80",
    note: "Tea houses and Sichuan flavor",
  },
  Quanzhou: {
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
    note: "Harbor stories and maritime routes",
  },
} satisfies Record<City, { image: string; note: string }>;

export const CITY_DETAILS = {
  Beijing: {
    slug: "beijing",
    intro: "A city for history, calligraphy, TCM, and quiet hutong-level discovery.",
    highlights: ["Hutong walks", "Calligraphy studios", "Traditional medicine"],
    featuredCategory: "tcm",
  },
  Jingdezhen: {
    slug: "jingdezhen",
    intro: "The porcelain capital, built for hands-on making and private kiln stories.",
    highlights: ["Kiln visits", "Porcelain workshops", "Collector access"],
    featuredCategory: "porcelain",
  },
  Chongqing: {
    slug: "chongqing",
    intro: "A layered mountain city for photography, stairways, and night textures.",
    highlights: ["Night city shoots", "River viewpoints", "Hidden stair routes"],
    featuredCategory: "photography",
  },
  Chengdu: {
    slug: "chengdu",
    intro: "Slow food, tea houses, and a deep Sichuan local rhythm.",
    highlights: ["Tea houses", "Kitchen access", "Local eating routes"],
    featuredCategory: "sichuan_food",
  },
  Quanzhou: {
    slug: "quanzhou",
    intro: "A maritime heritage city where trade, faith, and local stories overlap.",
    highlights: ["Maritime Silk Road", "Multi-faith heritage", "Old neighborhood walks"],
    featuredCategory: "maritime_silk_road",
  },
} satisfies Record<City, { slug: string; intro: string; highlights: string[]; featuredCategory: Category }>;

export const CITIES_BY_SLUG = Object.fromEntries(
  CITIES.map((city) => [CITY_DETAILS[city].slug, city]),
) as Record<(typeof CITY_DETAILS)[City]["slug"], City>;

export const CATEGORIES = [
  "porcelain",
  "tea",
  "sichuan_food",
  "kung_fu",
  "calligraphy",
  "tcm",
  "photography",
  "maritime_silk_road",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CANCELLATION_WINDOWS_HOURS = {
  full_refund: 48,
  half_refund: 24,
} as const;

export const PLATFORM_FEE_PCT = 25 as const;
