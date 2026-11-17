// Server-only provider. Never import this file into the browser bundle.
// All inference remains disabled until credentials, models and a budget are configured.
export type AIConfig = { apiKey: string; textModel: string; imageModel: string };
export function readAIConfig(): AIConfig | null {
  const apiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
  const textModel = Deno.env.get("OPENAI_TEXT_MODEL")?.trim();
  const imageModel = Deno.env.get("OPENAI_IMAGE_MODEL")?.trim();
  return apiKey && textModel && imageModel ? { apiKey, textModel, imageModel } : null;
}
async function checkedJSON(response: Response) {
  if (!response.ok) throw new Error("AI_PROVIDER_HTTP_" + response.status);
  return await response.json();
}
export async function verifyProviderConnection(config: AIConfig) {
  // Checks access to configured models without generating billable content.
  for (const model of [config.textModel, config.imageModel]) {
    const result = await fetch("https://api.openai.com/v1/models/" + encodeURIComponent(model), {
      headers: { Authorization: "Bearer " + config.apiKey },
      signal: AbortSignal.timeout(15000),
    });
    await checkedJSON(result);
  }
  return true;
}
export async function createStructuredContent(config: AIConfig, instructions: string, input: string, schema: Record<string, unknown>) {
  const result = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: "Bearer " + config.apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.textModel, store: false, instructions, input, max_output_tokens: 6000,
      text: { format: { type: "json_schema", name: "activity_content", strict: true, schema } },
    }),
    signal: AbortSignal.timeout(90000),
  });
  const data = await checkedJSON(result);
  if (data.status !== "completed") throw new Error("AI_CONTENT_INCOMPLETE");
  const parts = (data.output ?? []).flatMap((item: {content?: {type: string; text?: string}[]}) => item.content ?? []);
  if (parts.some((part: {type: string}) => part.type === "refusal")) throw new Error("AI_CONTENT_REFUSED");
  const text = parts.filter((part: {type: string}) => part.type === "output_text").map((part: {text?: string}) => part.text ?? "").join("");
  if (!text) throw new Error("AI_CONTENT_EMPTY");
  return { content: JSON.parse(text), usage: data.usage ?? null };
}
export async function createIllustratedPage(config: AIConfig, reviewedPrompt: string, reference: Blob) {
  if (reference.type !== "image/png" || reference.size > 10 * 1024 * 1024) throw new Error("INVALID_LAYOUT_REFERENCE");
  const form = new FormData();
  form.set("model", config.imageModel);
  form.set("prompt", reviewedPrompt);
  form.set("image", reference, "layout-aprovado.png");
  form.set("size", "1024x1536");
  form.set("n", "1");
  const result = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST", headers: { Authorization: "Bearer " + config.apiKey }, body: form,
    signal: AbortSignal.timeout(120000),
  });
  const data = await checkedJSON(result);
  if (!data.data?.[0]?.b64_json) throw new Error("AI_IMAGE_EMPTY");
  return { pngBase64: data.data[0].b64_json as string, usage: data.usage ?? null };
}
