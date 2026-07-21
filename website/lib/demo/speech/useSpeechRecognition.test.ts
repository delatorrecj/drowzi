import { describe, expect, it } from "vitest";

import { passageMatches } from "@/lib/demo/speech/useSpeechRecognition";

const PASSAGE = "the quick brown fox jumps over the lazy dog";

describe("passageMatches", () => {
  it("accepts an exact read (ignoring case and punctuation)", () => {
    expect(passageMatches("The quick brown fox jumps over the lazy dog.", PASSAGE)).toBe(true);
  });

  it("accepts minor mis-hears within edit-distance tolerance", () => {
    // "browm", "jump", "dogg" are each within tolerance of the target word.
    expect(passageMatches("the quick browm fox jump over the lazy dogg", PASSAGE)).toBe(true);
  });

  it("rejects unrelated speech", () => {
    expect(passageMatches("i would like a coffee please", PASSAGE)).toBe(false);
  });

  it("rejects empty transcript", () => {
    expect(passageMatches("", PASSAGE)).toBe(false);
  });
});
