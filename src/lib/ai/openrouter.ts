/** OpenRouter integration for Growth AI.
 *
 * Growth AI uses OpenRouter's official Free Models Router (`openrouter/free`)
 * for free-model routing. The router dynamically selects an eligible free
 * model, so GrowthSpace does not hard-code GPT-OSS, Gemma, or another
 * individual free-model slug.
 *
 * Free-model responses should not be used for sensitive customer data unless
 * the selected OpenRouter/provider policy is appropriate for that data.
 */

/** OpenRouter's official Free Models Router. */
export const OPENROUTER_MODEL_A = "openrouter/free";

export function openrouterConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

/** Chat completion returning parsed JSON. */
export async function openrouterChatJSON<T>(opts: {
  model: string;
  system: string;
  user: string;
}): Promise<T> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://growthspacecrm.vercel.app",
      "X-Title": "GrowthSpace",
    },
    body: JSON.stringify({
      model: opts.model,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenRouter (${opts.model}) request failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  const content: string | undefined = data.choices?.[0]?.message?.content;
  if (!content) throw new Error(`OpenRouter (${opts.model}) returned no content`);

  const match = content.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : content) as T;
}

/** Plain-text chat completion for Growth AI free-form responses. */
export async function openrouterChatText(opts: {
  model: string;
  system: string;
  user: string;
}): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://growthspacecrm.vercel.app",
      "X-Title": "GrowthSpace",
    },
    body: JSON.stringify({
      model: opts.model,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenRouter (${opts.model}) request failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  const content: string | undefined = data.choices?.[0]?.message?.content;
  if (!content?.trim()) throw new Error(`OpenRouter (${opts.model}) returned no content`);
  return content.trim();
}
