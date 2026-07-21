/**
 * Minimal server-only OpenAI chat helper. No SDK — one fetch. Never import
 * from client code; OPENAI_API_KEY must stay server-side.
 */
import "server-only";

const MODEL = "gpt-4o-mini";
const ENDPOINT = "https://api.openai.com/v1/chat/completions";

export type ChatMessage = { role: "system" | "user"; content: string };

export function hasApiKey(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Returns the assistant text, or null if no key is configured / the call fails.
 * Callers must handle null with a local fallback so the demo never hard-breaks.
 */
export async function chat(
  messages: ChatMessage[],
  opts: { json?: boolean; maxTokens?: number } = {},
): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: opts.maxTokens ?? 300,
        temperature: 0.7,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}
