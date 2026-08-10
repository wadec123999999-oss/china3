import { describe, expect, it } from "vitest";
import {
  extractMatchedCategory,
  extractTranscript,
  isMatchedEvent,
  isThinkingEvent,
} from "./browser-realtime";

describe("browser realtime helpers", () => {
  it("extracts transcript text from common event shapes", () => {
    expect(
      extractTranscript({
        type: "conversation.item.input_audio_transcription.completed",
        transcript: "I love porcelain",
      }),
    ).toBe("I love porcelain");

    expect(
      extractTranscript({
        type: "response.audio_transcript.delta",
        delta: "Matching you with Jingdezhen",
      }),
    ).toBe("Matching you with Jingdezhen");
  });

  it("extracts a matched category from tool arguments", () => {
    expect(
      extractMatchedCategory({
        type: "response.output_item.done",
        item: {
          name: "match_expert",
          arguments: JSON.stringify({ category: "porcelain" }),
        },
      }),
    ).toBe("porcelain");

    expect(
      extractMatchedCategory({
        type: "response.output_item.done",
        item: {
          name: "save_brief",
          arguments: JSON.stringify({ interests: ["tea"] }),
        },
      }),
    ).toBeNull();

    expect(
      extractMatchedCategory({
        type: "response.output_item.done",
        item: {
          name: "match_expert",
          arguments: JSON.stringify({ category: "not-a-category" }),
        },
      }),
    ).toBeNull();
  });

  it("maps response lifecycle events", () => {
    expect(isThinkingEvent({ type: "response.created" })).toBe(true);
    expect(isThinkingEvent({ type: "response.output_item.added" })).toBe(true);
    expect(isMatchedEvent({ type: "response.done" })).toBe(true);
  });
});
