import type { Category, City } from "@/lib/constants";

export type Expert = {
  id: string;
  name: string;
  city: City;
  category: Category;
  role: string;
  shortBio: string;
  pricePerDayUsd: number;
  videoLabel: string;
};

export const demoExperts: Expert[] = [
  {
    id: "wei-chen",
    name: "Wei Chen",
    city: "Jingdezhen",
    category: "porcelain",
    role: "Ceramic artist and guide",
    shortBio: "Third-generation porcelain family with access to private kilns and studio owners.",
    pricePerDayUsd: 240,
    videoLabel: "30s video intro",
  },
  {
    id: "liang-zhou",
    name: "Liang Zhou",
    city: "Beijing",
    category: "tcm",
    role: "Traditional medicine researcher",
    shortBio: "Explains herbs, clinic culture, and how locals think about daily wellness.",
    pricePerDayUsd: 220,
    videoLabel: "30s video intro",
  },
  {
    id: "mei-zhang",
    name: "Mei Zhang",
    city: "Chengdu",
    category: "sichuan_food",
    role: "Food writer and kitchen insider",
    shortBio: "Takes guests behind the counter for a real Chengdu eating day.",
    pricePerDayUsd: 180,
    videoLabel: "30s video intro",
  },
  {
    id: "hao-lin",
    name: "Hao Lin",
    city: "Chongqing",
    category: "photography",
    role: "Street photographer",
    shortBio: "Knows the best viewpoints, stairways, and night scenes for dramatic city shots.",
    pricePerDayUsd: 170,
    videoLabel: "30s video intro",
  },
  {
    id: "yue-fang",
    name: "Yue Fang",
    city: "Quanzhou",
    category: "maritime_silk_road",
    role: "Museum docent and local historian",
    shortBio: "Connects maritime trade, religions, and old neighborhood stories in one route.",
    pricePerDayUsd: 210,
    videoLabel: "30s video intro",
  },
];
