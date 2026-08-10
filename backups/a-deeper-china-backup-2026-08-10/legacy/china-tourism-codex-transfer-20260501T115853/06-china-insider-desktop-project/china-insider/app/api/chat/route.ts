import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getServerSupabaseEnv } from "@/lib/supabase/env";
import { mockExperts } from "@/lib/mock-data";

const chatRequestSchema = z.object({
  message: z.string().min(1).max(4000),
});

type RetrievedContext = {
  source: "supabase" | "mock" | "none";
  notes: string[];
};

async function retrieveContext(message: string): Promise<RetrievedContext> {
  const lowered = message.toLowerCase();
  const env = getServerSupabaseEnv();

  if (env.success) {
    try {
      const supabase = createSupabaseAdminClient();
      const { data, error } = await supabase.from("experts").select("name, city, headline").limit(5);

      if (!error && data && data.length > 0) {
        return {
          source: "supabase",
          notes: data.map(
            (expert) => `${expert.name} — ${expert.city}: ${expert.headline}`,
          ),
        };
      }
    } catch {
      // fall through to mock retrieval
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
      notes: matchedExperts.slice(0, 5).map(
        (expert) => `${expert.name} — ${expert.city}: ${expert.headline}`,
      ),
    };
  }

  return { source: "none", notes: [] };
}

function buildFallbackReply(message: string, context: RetrievedContext) {
  const contextLine =
    context.notes.length > 0
      ? `I found relevant context from ${context.source === "supabase" ? "your database" : "the current demo knowledge base"}: ${context.notes.join("; ")}.`
      : "I have your request, but there is no structured destination context attached yet.";

  return {
    reply:
      `I understand the direction: ${message}. ${contextLine} ` +
      "Next, I would refine city mood, pace, and priorities with you before generating a bespoke route book.",
    routeBookPreview: [
      "Intent capture: mood, pace, and cultural priorities",
      "Context retrieval: destinations, experts, and local knowledge",
      "Concierge shaping: narrow to the right rhythm and route",
      "Route book output: cities, sequence, and suggested experiences",
    ],
    contextSource: context.source,
    usedModel: false,
  };
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

  const { message } = parsed.data;
  const context = await retrieveContext(message);

  // TODO: replace with a real model provider once env/config is confirmed.
  const response = buildFallbackReply(message, context);

  return NextResponse.json(response);
}
