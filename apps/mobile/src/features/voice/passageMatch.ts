/** Lowercase, strip punctuation to spaces, collapse whitespace. */
export function normalizeSpeech(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * True when the spoken transcript is close enough to the target passage:
 * either side contains the other, or ≥85% of passage words appear.
 * Ported from the website demo (lib/demo/speech/useSpeechRecognition.ts).
 */
export function passageMatches(transcript: string, passage: string): boolean {
  const t = normalizeSpeech(transcript);
  const p = normalizeSpeech(passage);
  if (!t || !p) return false;
  if (t.includes(p) || p.includes(t)) return true;
  const words = p.split(' ');
  const matched = words.filter((w) => t.includes(w)).length;
  return matched / words.length >= 0.85;
}
