// app/api/medical-bot/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { callHuggingFaceMedicalModel } from '@/lib/utils/huggingface';
import { summarizeFromMedlinePlus, getDrugInfoFromRxNorm } from '@/lib/utils/medicalSources';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: Message[] = body.messages;

    const latestMessage = messages?.[messages.length - 1]?.content;
    if (!latestMessage) {
      return NextResponse.json({ reply: "No input received." }, { status: 400 });
    }

    const prompt = `You are a helpful medical assistant. Provide medically accurate information.\n\nQuestion: ${latestMessage}`;
    
    // AI response from HuggingFace model
    const aiReply = await callHuggingFaceMedicalModel(prompt);

    // Optional: Lookup trusted references
    const medlineSummary = await summarizeFromMedlinePlus(latestMessage);
    const rxnormInfo = await getDrugInfoFromRxNorm(latestMessage);

    const reply = `${aiReply}\n\n🔍 Reference:\n${medlineSummary ? '• ' + medlineSummary : ''}${rxnormInfo ? '\n• ' + rxnormInfo : ''}`;

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { reply: "Sorry, something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
