// lib/utils/huggingface.ts

export async function callHuggingFaceMedicalModel(question: string): Promise<string> {
  const HF_API_KEY = process.env.NEXT_PUBLIC_HF_API_KEY;
  if (!HF_API_KEY) throw new Error('Missing HuggingFace API Key');

  const API_URL = "https://router.huggingface.co/v1/chat/completions";
  const model = "google/medgemma-4b-it:featherless-ai";

  // Format input as OpenAI-style chat messages
  const body = {
    messages: [
      { role: "user", content: [{ type: "text", text: question }] }
    ],
    model
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("HuggingFace error:", error);
    throw new Error('HuggingFace model call failed');
  }

  const result = await response.json();
  // Response format: { choices: [{message: {role: 'assistant', content: [...]}}], ... }
  const content = result?.choices?.[0]?.message?.content;
  // For text output, aggregate all message blocks of type:text
  if (Array.isArray(content)) {
    return content.filter(e => e.type === "text").map(e => e.text).join("\n");
  } else if (typeof content === "string") {
    return content;
  } else {
    return 'No answer received.';
  }
}
