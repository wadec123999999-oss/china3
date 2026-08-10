import { NextResponse } from "next/server";
import { z } from "zod";

import { CATEGORIES, CITIES, type Category, type City } from "@/lib/constants";
import { matchExperts } from "@/lib/matching/match-experts";
import { type TravelBrief, mockExperts } from "@/lib/mock-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getServerSupabaseEnv } from "@/lib/supabase/env";

const paceSchema = z.enum(["slow", "balanced", "immersive"]);

const chatRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  inputMode: z.enum(["text", "voice"]).optional().default("text"),
  initialCity: z.string().nullable().optional(),
  initialInterests: z.string().nullable().optional(),
  initialPace: z.string().nullable().optional(),
});

const routeBookSchema = z.object({
  title: z.string().min(1),
  overview: z.string().min(1),
  days: z
    .array(
      z.object({
        day: z.number().int().min(1),
        title: z.string().min(1),
        focus: z.string().min(1),
        activities: z.array(z.string().min(1)).min(2).max(5),
      }),
    )
    .min(2)
    .max(4),
  nextStep: z.string().min(1),
});

const responsePayloadSchema = z.object({
  reply: z.string().min(1),
  travelBrief: z.object({
    city: z.string().nullable(),
    category: z.string().nullable(),
    interests: z.string().min(1),
    pace: paceSchema,
    durationDays: z.number().int().min(1).max(14),
    budgetBand: z.string().min(1),
    travelStyle: z.string().min(1),
    whyThisFits: z.string().min(1),
  }),
  routeBook: routeBookSchema,
});

type RetrievedContext = {
  source: "supabase" | "mock" | "none";
  notes: string[];
};

type ExpertMatchResponse = {
  slug: string;
  name: string;
  city: string;
  headline: string;
  reason: string;
  sampleSession: string;
};

type ChatApiResponse = z.infer<typeof responsePayloadSchema> & {
  expertMatches: ExpertMatchResponse[];
  contextSource: RetrievedContext["source"];
  usedModel: boolean;
  modelProvider: "dashscope" | "openai" | "fallback";
  modelName: string;
};

const cityHints: Record<City, string[]> = {
  beijing: ["beijing", "hutong", "calligraphy", "capital", "forbidden city"],
  chengdu: ["chengdu", "sichuan", "tea house", "teahouse", "panda"],
  chongqing: ["chongqing", "mountain city", "hotpot", "photography", "night"],
  jingdezhen: ["jingdezhen", "porcelain", "ceramic", "pottery", "kiln"],
  quanzhou: ["quanzhou", "maritime", "port", "religion", "temple"],
  jingmai_mountain: ["jingmai", "tea mountain", "tea", "pu'er", "puer"],
  wudang_mountain: ["wudang", "taoist", "tai chi", "taichi", "kung fu"],
};

const categoryHints: Record<Category, string[]> = {
  porcelain: ["porcelain", "ceramic", "pottery", "kiln", "glaze"],
  tea: ["tea", "puer", "pu'er", "gongfu", "teahouse"],
  sichuan_food: ["food", "sichuan", "spicy", "hotpot", "market", "culinary"],
  kung_fu: ["kung fu", "martial", "taichi", "tai chi", "movement"],
  calligraphy: ["calligraphy", "ink", "brush", "painting"],
  tcm: ["tcm", "medicine", "wellness", "acupuncture", "healing"],
  photography: ["photography", "photo", "camera", "street", "visual"],
  maritime_silk_road: ["maritime", "silk road", "port", "heritage", "history"],
};

function extractDurationDays(message: string) {
  const match = message.match(/(\d+)\s*(day|days)/i);
  const parsed = Number(match?.[1] ?? 3);

  if (!Number.isFinite(parsed)) {
    return 3;
  }

  return Math.min(Math.max(parsed, 1), 14);
}

function inferPace(message: string): z.infer<typeof paceSchema> {
  const lowered = message.toLowerCase();

  if (
    ["slow", "gentle", "calm", "easy", "relaxed"].some((token) =>
      lowered.includes(token),
    )
  ) {
    return "slow";
  }

  if (
    ["deep", "immersive", "intense", "serious", "obsessed"].some((token) =>
      lowered.includes(token),
    )
  ) {
    return "immersive";
  }

  return "balanced";
}

function normalizeCitySlug(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  return value.replaceAll("-", "_");
}

function inferBudgetBand(message: string) {
  const lowered = message.toLowerCase();

  if (["luxury", "high-end", "premium", "private"].some((token) => lowered.includes(token))) {
    return "Premium";
  }

  if (["budget", "affordable", "cheap"].some((token) => lowered.includes(token))) {
    return "Value-conscious";
  }

  return "Premium but thoughtful";
}

function detectCity(message: string, initialCity?: string | null) {
  const lowered = message.toLowerCase();
  const normalizedInitialCity = normalizeCitySlug(initialCity);

  if (
    normalizedInitialCity &&
    CITIES.includes(normalizedInitialCity as City)
  ) {
    return normalizedInitialCity as City;
  }

  for (const city of CITIES) {
    if (cityHints[city].some((hint) => lowered.includes(hint))) {
      return city;
    }
  }

  return undefined;
}

function detectCategory(message: string) {
  const lowered = message.toLowerCase();

  for (const category of CATEGORIES) {
    if (categoryHints[category].some((hint) => lowered.includes(hint))) {
      return category;
    }
  }

  return undefined;
}

async function retrieveContext(message: string): Promise<RetrievedContext> {
  const lowered = message.toLowerCase();
  const env = getServerSupabaseEnv();

  if (env.success) {
    try {
      const supabase = createSupabaseAdminClient();
      const { data, error } = await supabase
        .from("experts")
        .select("name, city, headline")
        .limit(6);

      if (!error && data && data.length > 0) {
        return {
          source: "supabase",
          notes: data.map(
            (expert) => `${expert.name} — ${expert.city}: ${expert.headline}`,
          ),
        };
      }
    } catch {
      // fall back to mock context
    }
  }

  const matchedExperts = mockExperts.filter((expert) => {
    const haystack = [
      expert.name,
      expert.city,
      expert.headline,
      expert.bio,
      ...expert.tags,
      ...expert.categories,
    ]
      .join(" ")
      .toLowerCase();

    return lowered
      .split(/\s+/)
      .filter(Boolean)
      .some((token) => haystack.includes(token));
  });

  if (matchedExperts.length > 0) {
    return {
      source: "mock",
      notes: matchedExperts.slice(0, 6).map(
        (expert) => `${expert.name} — ${expert.city}: ${expert.headline}`,
      ),
    };
  }

  return { source: "none", notes: [] };
}

function buildFallbackRouteBook(brief: {
  city?: City;
  category?: Category;
  interests: string;
  pace: z.infer<typeof paceSchema>;
  durationDays: number;
  budgetBand: string;
}) {
  const cityLabel = brief.city ? brief.city.replaceAll("_", " ") : "China";
  const categoryLabel = brief.category
    ? brief.category.replaceAll("_", " ")
    : "cultural";
  const days = Array.from({ length: Math.min(Math.max(brief.durationDays, 2), 3) }).map(
    (_, index) => ({
      day: index + 1,
      title:
        index === 0
          ? "Arrival and orientation"
          : index === 1
            ? "Core deep-dive experience"
            : "Refinement and local texture",
      focus:
        index === 0
          ? `Enter ${cityLabel} through the right lens`
          : index === 1
            ? `Go deeper into ${categoryLabel}`
            : "Shape the route around slower, more memorable moments",
      activities:
        index === 0
          ? [
              "Meet the city through a guided framing session",
              "Clarify the traveler's interests, pace, and sensory preferences",
              "Anchor the trip around one or two signature experiences",
            ]
          : index === 1
            ? [
                "Spend time with an expert whose practice matches the brief",
                "Blend context, interpretation, and hands-on or observational depth",
                "Leave room for a slower meal, tea, or reflective pause",
              ]
            : [
                "Add a quieter local stop that broadens the theme",
                "Refine the rest of the trip based on energy and curiosity",
                "Turn the consultation into a bookable next step",
              ],
    }),
  );

  return {
    title: `${brief.durationDays}-day ${cityLabel} ${categoryLabel} route`,
    overview:
      `A private, ${brief.pace} itinerary shaped around ${brief.interests}. ` +
      `This first pass is designed for a ${brief.budgetBand.toLowerCase()} traveler who wants more than a generic city tour.`,
    days,
    nextStep:
      "The next step is to confirm the best-fit expert, tighten logistics, and turn this draft into a bookable route.",
  };
}

function buildFallbackReply(
  message: string,
  context: RetrievedContext,
  brief: {
    city?: City;
    category?: Category;
    interests: string;
    pace: z.infer<typeof paceSchema>;
    durationDays: number;
    budgetBand: string;
  },
  expertMatches: ExpertMatchResponse[],
): ChatApiResponse {
  const routeBook = buildFallbackRouteBook(brief);
  const cityLabel = brief.city ? brief.city.replaceAll("_", " ") : "a better-fit city";
  const categoryLabel = brief.category
    ? brief.category.replaceAll("_", " ")
    : "cultural depth";
  const contextLine =
    context.notes.length > 0
      ? `I found relevant context from ${
          context.source === "supabase" ? "your database" : "the current demo knowledge base"
        }.`
      : "I’m working from your prompt and the current demo knowledge base.";

  return {
    reply:
      `I hear that you're looking for ${categoryLabel} with a ${brief.pace} rhythm, and ${cityLabel} looks like the strongest first fit. ` +
      `${contextLine} I turned your prompt into a first travel brief, matched local experts, and drafted a route book you can refine from here.`,
    travelBrief: {
      city: brief.city ?? null,
      category: brief.category ?? null,
      interests: message,
      pace: brief.pace,
      durationDays: brief.durationDays,
      budgetBand: brief.budgetBand,
      travelStyle: "Private expert-led cultural journey",
      whyThisFits:
        expertMatches.length > 0
          ? `Your prompt aligns with ${expertMatches[0].name} and a more curated route shape than a generic city tour.`
          : "Your prompt already points toward a strong cultural route; the next step is narrowing the exact expert and city rhythm.",
    },
    routeBook,
    expertMatches,
    contextSource: context.source,
    usedModel: false,
    modelProvider: "fallback",
    modelName: "deterministic-planner",
  };
}

function extractJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in model response.");
  }

  return text.slice(start, end + 1);
}

async function generateWithOpenAI(input: {
  message: string;
  inputMode: "text" | "voice";
  brief: {
    city?: City;
    category?: Category;
    interests: string;
    pace: z.infer<typeof paceSchema>;
    durationDays: number;
    budgetBand: string;
  };
  context: RetrievedContext;
  expertMatches: ExpertMatchResponse[];
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const model = process.env.OPENAI_CHAT_MODEL || "gpt-4.1-mini";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are an English-speaking luxury cultural travel concierge for China. " +
            "Your job is to turn a traveler's rough interest into a clear, tasteful, private travel brief and first-pass route book. " +
            "Stay specific, grounded, and persuasive without sounding corporate. " +
            "Return valid JSON only.",
        },
        {
          role: "user",
          content: JSON.stringify({
            traveler_message: input.message,
            input_mode: input.inputMode,
            inferred_brief: input.brief,
            retrieval_context: input.context,
            expert_matches: input.expertMatches,
            required_shape: {
              reply:
                "2-4 sentence concierge reply that sounds warm, high-touch, and useful.",
              travelBrief: {
                city: "string or null",
                category: "string or null",
                interests: "string",
                pace: "slow | balanced | immersive",
                durationDays: "integer 1-14",
                budgetBand: "string",
                travelStyle: "string",
                whyThisFits: "string",
              },
              routeBook: {
                title: "string",
                overview: "string",
                days: [
                  {
                    day: "integer",
                    title: "string",
                    focus: "string",
                    activities: ["2-5 strings"],
                  },
                ],
                nextStep: "string",
              },
            },
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("OpenAI request failed.");
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | null;
      };
    }>;
  };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  const parsed = responsePayloadSchema.parse(
    JSON.parse(extractJsonObject(content)),
  );

  return parsed;
}

async function generateWithDashScope(input: {
  message: string;
  inputMode: "text" | "voice";
  brief: {
    city?: City;
    category?: Category;
    interests: string;
    pace: z.infer<typeof paceSchema>;
    durationDays: number;
    budgetBand: string;
  };
  context: RetrievedContext;
  expertMatches: ExpertMatchResponse[];
}) {
  const apiKey = process.env.DASHSCOPE_API_KEY;

  if (!apiKey) {
    return null;
  }

  const model = process.env.DASHSCOPE_MODEL || "qwen-plus";
  const response = await fetch(
    "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You are an English-speaking luxury cultural travel concierge for China. " +
              "Your job is to turn a traveler's rough interest into a clear, tasteful, private travel brief and first-pass route book. " +
              "Stay specific, grounded, and persuasive without sounding corporate. " +
              "Return valid JSON only.",
          },
          {
            role: "user",
            content: JSON.stringify({
              traveler_message: input.message,
              input_mode: input.inputMode,
              inferred_brief: input.brief,
              retrieval_context: input.context,
              expert_matches: input.expertMatches,
              required_shape: {
                reply:
                  "2-4 sentence concierge reply that sounds warm, high-touch, and useful.",
                travelBrief: {
                  city: "string or null",
                  category: "string or null",
                  interests: "string",
                  pace: "slow | balanced | immersive",
                  durationDays: "integer 1-14",
                  budgetBand: "string",
                  travelStyle: "string",
                  whyThisFits: "string",
                },
                routeBook: {
                  title: "string",
                  overview: "string",
                  days: [
                    {
                      day: "integer",
                      title: "string",
                      focus: "string",
                      activities: ["2-5 strings"],
                    },
                  ],
                  nextStep: "string",
                },
              },
            }),
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error("DashScope request failed.");
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | null;
      };
    }>;
  };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("DashScope returned an empty response.");
  }

  const parsed = responsePayloadSchema.parse(
    JSON.parse(extractJsonObject(content)),
  );

  return parsed;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a message." },
      { status: 400 },
    );
  }

  const { message, inputMode, initialCity } = parsed.data;
  const context = await retrieveContext(message);
  const mergedMessage = [
    parsed.data.initialInterests,
    parsed.data.initialPace ? `Preferred pace: ${parsed.data.initialPace}` : "",
    message,
  ]
    .filter(Boolean)
    .join(". ");
  const brief: TravelBrief = {
    city: detectCity(mergedMessage, initialCity),
    category: detectCategory(mergedMessage),
    interests: mergedMessage,
    pace: inferPace(mergedMessage),
  };
  const durationDays = extractDurationDays(mergedMessage);
  const budgetBand = inferBudgetBand(mergedMessage);
  const expertMatches = matchExperts(brief).map((expert) => ({
    slug: expert.slug,
    name: expert.name,
    city: expert.city,
    headline: expert.headline,
    reason: expert.reasons[0] ?? "Good fit for this brief",
    sampleSession: expert.sampleSession,
  }));

  const provider = process.env.AI_TEXT_PROVIDER || "dashscope";
  const modelInput = {
    message,
    inputMode,
    brief: {
      city: brief.city,
      category: brief.category,
      interests: brief.interests,
      pace: brief.pace,
      durationDays,
      budgetBand,
    },
    context,
    expertMatches,
  };

  if (provider === "dashscope" || provider === "auto") {
    try {
      const modelResult = await generateWithDashScope(modelInput);

      if (modelResult) {
        const payload: ChatApiResponse = {
          ...modelResult,
          expertMatches,
          contextSource: context.source,
          usedModel: true,
          modelProvider: "dashscope",
          modelName: process.env.DASHSCOPE_MODEL || "qwen-plus",
        };

        return NextResponse.json(payload);
      }
    } catch {
      // Fall through to the next provider or deterministic planning.
    }
  }

  if (provider === "openai" || provider === "auto" || provider === "dashscope") {
    try {
      const modelResult = await generateWithOpenAI(modelInput);

      if (modelResult) {
        const payload: ChatApiResponse = {
          ...modelResult,
          expertMatches,
          contextSource: context.source,
          usedModel: true,
          modelProvider: "openai",
          modelName: process.env.OPENAI_CHAT_MODEL || "gpt-4.1-mini",
        };

        return NextResponse.json(payload);
      }
    } catch {
      // If live providers fail, fall back to deterministic planning.
    }
  }

  const response = buildFallbackReply(
    message,
    context,
    {
      city: brief.city,
      category: brief.category,
      interests: brief.interests,
      pace: brief.pace,
      durationDays,
      budgetBand,
    },
    expertMatches,
  );

  return NextResponse.json(response);
}
