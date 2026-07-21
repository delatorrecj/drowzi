/** Lowercase, strip punctuation to spaces, collapse whitespace. */
export function normalizeSpeech(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Edit distance between two tokens. */
function levenshtein(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const curr = [i];
    for (let j = 1; j <= b.length; j += 1) {
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = curr;
  }
  return prev[b.length];
}

/** True when at least 85% of passage words have an exact or close token match. */
export function passageMatches(transcript: string, passage: string): boolean {
  const t = normalizeSpeech(transcript);
  const p = normalizeSpeech(passage);
  if (!t || !p) return false;
  // Padding retains short-phrase containment without matching word fragments.
  if (` ${t} `.includes(` ${p} `) || ` ${p} `.includes(` ${t} `)) return true;

  const transcriptWords = t.split(' ');
  const passageWords = p.split(' ');
  const matched = passageWords.filter((word) => {
    const maxDistance = word.length <= 4 ? 1 : 2;
    return transcriptWords.some(
      (candidate) => candidate === word || levenshtein(candidate, word) <= maxDistance,
    );
  }).length;
  return matched / passageWords.length >= 0.85;
}
