import Anthropic from "@anthropic-ai/sdk";

export async function generarTexto(prompt: string, maxTokens = 500): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Falta configurar ANTHROPIC_API_KEY en el servidor");
  }

  const client = new Anthropic({ apiKey });
  const respuesta = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });

  const bloque = respuesta.content.find((b) => b.type === "text");
  if (!bloque || bloque.type !== "text") {
    throw new Error("Claude no devolvió texto");
  }

  return bloque.text;
}
