import { z } from "zod";

export const realtimeSessionRequestSchema = z.object({
  purpose: z.literal("voice-demo").optional(),
});

export const realtimeSessionResponseSchema = z.object({
  client_secret: z.object({
    value: z.string(),
  }),
});
