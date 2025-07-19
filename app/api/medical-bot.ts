
import type { NextApiRequest, NextApiResponse } from "next";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { message } = req.body;

  try {
    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // or "gpt-4" if enabled
        messages: [
          {
            role: "system",
            content: `You are a helpful medical assistant. You give reliable, FACTUAL, clear, and concise answers to questions about medicines, diseases, symptoms, and general health. Always recommend seeing a doctor for urgent or dangerous symptoms.`,
          },
          { role: "user", content: message },
        ],
        max_tokens: 600,
      }),
    });

    const data = await completion.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "Sorry, I don't have an answer for that. 🩺";

    res.status(200).json({ reply });
  } catch {
    res.status(500).json({ reply: "Sorry, the medical bot is unavailable. Please try again later." });
  }
}
