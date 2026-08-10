import { CATEGORIES } from "@/lib/constants";

export const REALTIME_MODEL = "gpt-4o-realtime-preview-2024-12-17";
export const REALTIME_VOICE = "alloy";

export const REALTIME_TOOLS = [
  {
    type: "function",
    name: "save_brief",
    description: "Persist the conversation brief once interests are clear.",
    parameters: {
      type: "object",
      required: ["interests", "depth_level"],
      properties: {
        cities: { type: "array", items: { type: "string" } },
        days: { type: "integer" },
        interests: { type: "array", items: { type: "string" } },
        interests_detailed: { type: "string" },
        depth_level: { type: "string", enum: ["curious", "enthusiast", "expert"] },
        budget_usd_per_day: { type: "integer" },
        pace: { type: "string", enum: ["relaxed", "medium", "packed"] },
      },
    },
  },
  {
    type: "function",
    name: "match_expert",
    description: "Call after save_brief to surface a matching expert.",
    parameters: {
      type: "object",
      required: ["category"],
      properties: {
        category: { type: "string", enum: CATEGORIES },
        city_hint: { type: "string" },
      },
    },
  },
] as const;

export const REALTIME_SYSTEM_PROMPT = `You are an enthusiastic travel concierge specializing in deep, interest-driven experiences in China. You're speaking with a foreign traveler.

Your job is to quickly understand what the traveler loves, then surface a matching local expert.

Rules:
- Ask short, warm follow-up questions.
- Go deeper than surface interests.
- As soon as the interest is clear, call save_brief.
- Then call match_expert.
- Keep responses short and natural.
- Never mention pricing unless asked.
- If the traveler is vague, gently guide them toward specific interests, cities, and pace.`;
