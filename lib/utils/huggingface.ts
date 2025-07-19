export async function callHuggingFaceMedicalModel(prompt: string): Promise<string> {
  const HF_API_KEY = process.env.HF_API_KEY;
  if (!HF_API_KEY) throw new Error('Missing HuggingFace API Key');

  const response = await fetch('https://api-inference.huggingface.co/models/medalpaca/medalpaca-7b', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 300 },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("HuggingFace error:", error);
    throw new Error('HuggingFace model call failed');
  }

  const result = await response.json();
  return result[0]?.generated_text ?? 'No answer received.';
}
