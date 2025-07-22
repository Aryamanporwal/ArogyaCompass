"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Search,
  SendHorizontal,
  Mic,
  Stethoscope,
  ShieldQuestion,
  Syringe,
  Moon,
  Brain,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { detectLanguage, speak, translate } from "@/lib/utils/gemini";

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : undefined;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();

  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = event.results[0][0].transcript;
    console.log("Recognized:", transcript);
  };
}

  

const suggestionCards = [
  { icon: <Moon size={16} />, label: "Why am I not getting proper sleep?" },
  { icon: <ShieldQuestion size={16} />, label: "Best diet for diabetic?" },
  { icon: <Brain size={16} />, label: "How to reduce anxiety naturally?" },
  { icon: <Syringe size={16} />, label: "Is vaccination safe for kids?" },
  { icon: <Stethoscope size={16} />, label: "Common cold vs flu symptoms?" },
];

const MedicalBot = () => {
  const [messages, setMessages] = useState([
    { user: false, text: "Hi there! 👋 How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [spokenLang, setSpokenLang] = useState<"hi" | "en">("en");
  const [lastReply, setLastReply] = useState<string | null>(null);

useEffect(() => {
  if (typeof window !== "undefined") {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognitionRef.current = recognition;
    } else {
      toast.error("Speech recognition not supported in this browser.");
    }
  }
}, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

const sendMessage = async (text: string, lang: "hi" | "en") => {
  setSpokenLang(lang); // For replay

  const newMessages = [...messages, { user: true, text }];
  setMessages(newMessages);
  setInput("");
  setLoading(true);

  try {
    const formattedMessages = newMessages.slice(1).map((msg) => ({
      role: msg.user ? "user" : "assistant",
      content: msg.text,
    }));

    const res = await axios.post("/api/medical-bot", { messages: formattedMessages });

    let replyText = res.data.reply || "Sorry, I couldn't find an answer.";

    if (lang === "hi") {
      replyText = await translate(replyText, "hi"); // Translate from English to Hindi
    }

    setLastReply(replyText); // Save for replay

    setMessages((prev) => [...prev, { user: false, text: replyText }]);

    // 👄 Speak it
    speak(replyText, lang === "hi" ? "hi-IN" : "en-IN");
  } catch  {
    setMessages((prev) => [
      ...prev,
      { user: false, text: "Sorry, something went wrong. Please try again." },
    ]);
  } finally {
    setLoading(false);
  }
};

const handleMicClick = () => {
  const recognition = recognitionRef.current;

  if (!recognition) {
    toast.error("Speech recognition is not available.");
    return;
  }

  if (isListening) {
    recognition.stop();
    setIsListening(false);
  } else {
    recognition.start();
  }

  recognition.onstart = () => {
    setIsListening(true);
    toast("🎙️ Listening...");
  };

  recognition.onend = () => {
    setIsListening(false);
    toast("🛑 Stopped listening");
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    console.error("Speech recognition error:", event.error);
    toast.error("Mic error: " + event.error);
    setIsListening(false);
  };

  recognition.onresult = async (event: SpeechRecognitionEvent) => {
    const transcript = event.results[0][0].transcript;

    // 🌏 Detect Language
    const lang = await detectLanguage(transcript);

    if (lang === "hi") {
      const translated = await translate(transcript, "en");
      await sendMessage(translated, "hi");
    } else {
      await sendMessage(transcript, "en");
    }
  };
};



  const cn = (light: string, dark: string) => `${light} dark:${dark}`;

  return (
    <div
      className="h-screen w-full font-inter transition-colors flex flex-col items-center justify-start bg-gray-100 text-[#232325] dark:bg-[#0a0a0a] dark:text-white overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Logo & Title */}
      {messages.length <= 1 && (
        <>
          <div className="mt-[7vh] mb-7 text-center">
            <Image
              src="/assets/icons/logo.png"
              alt="logo"
              width={70}
              height={70}
              className="mx-auto mb-3"
            />
            <h1 className="text-5xl font-light tracking-tight text-center">
              ArogyaCompass
            </h1>
          </div>

          {/* Suggestion Cards */}
          <div className="flex flex-wrap gap-2 mt-6 mb-8 w-full justify-center px-4">
            {suggestionCards.map((card, i) => (
              <button
                key={i}
                onClick={() => setInput(card.label)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition border border-[#e2e4e8] bg-[#f6f8fa] text-[#232325] hover:bg-[#ececf1] dark:border-[#292929] dark:bg-[#18181a] dark:hover:bg-[#212124] dark:text-white"
              >
                {card.icon}
                {card.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Chat Section */}
      {messages.length > 1 && (
        <div className="w-full max-w-2xl flex-1 flex flex-col px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 py-3 bg-gray-100 dark:bg-[#0a0a0a]">
            <div className="text-2xl font-light mb-1">
              {messages[messages.length - 2].text}
            </div>
            <div
              className={`flex items-center gap-2 text-base font-semibold ${
                loading ? "answer-animate" : ""
              }`}
              style={{
                minHeight: 28,
                borderRadius: 6,
                paddingLeft: 2,
                paddingRight: 12,
                transition: "background 0.2s",
              }}
            >
              <Stethoscope size={16} className="text-cyan-500" />
              Answer
            </div>
            <div className="border-b my-2 border-gray-300 dark:border-[#2e2e2e]" />
          </div>

          {/* Shimmer animation */}
          <style jsx>{`
            .answer-animate {
              position: relative;
              overflow: hidden;
              background: linear-gradient(
                90deg,
                transparent,
                #3fd8fa33 30%,
                transparent 60%
              );
              background-size: 200% 100%;
              animation: shimmer 1.2s linear infinite;
            }
            @keyframes shimmer {
              0% {
                background-position: -100% 0;
              }
              100% {
                background-position: 200% 0;
              }
            }
          `}</style>

          {/* Scrollable Answer */}
          <div
            className="flex-1 pr-1 pb-28"
            style={{
              overflowY: "scroll",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div style={{ scrollbarWidth: "none" }}>
              <div className="text-lg leading-relaxed mb-6">
                <ReactMarkdown>
                  {messages[messages.length - 1].text}
                </ReactMarkdown>
              </div>

              <div className="flex gap-6 mt-2 text-[#888] text-sm items-center">
                <button className="hover:underline flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor">
                    <path d="M8 12h8m0 0l-3-3m3 3l-3 3" />
                  </svg>
                  Shared
                </button>
                <button className="hover:underline">Export</button>
                <button className="hover:underline">Rewrite</button>

                {lastReply && (
                <button
                  onClick={() =>
                    speak(lastReply, spokenLang === "hi" ? "hi-IN" : "en-IN")
                  }
                  className="hover:underline"
                >
                  Replay
                </button>
              )}
                <div className="flex gap-2 ml-auto items-center">
                  {/* Like */}
                  <button
                    onClick={() =>
                      setFeedback((prev) =>
                        prev === "like" ? null : "like"
                      )
                    }
                    className="transition-colors"
                  >
                    <ThumbsUp
                      size={20}
                      strokeWidth={2}
                      className={
                        feedback === "like"
                          ? "text-blue-500"
                          : "text-gray-400"
                      }
                    />
                  </button>

                  {/* Dislike */}
                  <button
                    onClick={() =>
                      setFeedback((prev) =>
                        prev === "dislike" ? null : "dislike"
                      )
                    }
                    className="transition-colors"
                  >
                    <ThumbsDown
                      size={20}
                      strokeWidth={2}
                      className={
                        feedback === "dislike"
                          ? "text-blue-500"
                          : "text-gray-400"
                      }
                    />
                  </button>
                </div>
              </div>
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* Input Box */}
      <div
        className={cn(
          "w-full px-4 fixed bottom-4 max-w-2xl",
          "sm:px-6 lg:px-8"
        )}
      >
        <form
          className="flex items-center w-full py-3 px-3 rounded-2xl border shadow-md transition-colors bg-[#fff] border-[#ececf1] dark:bg-[#161616] dark:border-[#292929]"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input.trim(), "en");
          }}
        >
          <Search
            size={20}
            className="text-[#b4b4b4] dark:text-[#9ba1b4] mx-2"
          />
          <input
            className="flex-1 h-10 bg-transparent outline-none text-base placeholder:text-[#7a7a7a] px-4 font-normal text-[#232325] dark:text-white dark:placeholder:text-[#76777A]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything or @mention a Department"
            disabled={loading}
          />
          <button type="button" onClick={handleMicClick} className="mx-1">
            <Mic
              size={20}
              className={`cursor-pointer ${
                  isListening
                    ? "text-blue-500 animate-pulse"
                    : "text-[#b4b4b4] dark:text-[#a6afd7]"
                }`}
            />
          </button>
          <button
            type="submit"
            className="ml-2 rounded-lg bg-[#38bdf8] hover:bg-[#18bad6] transition text-white p-2 flex items-center shadow"
            disabled={loading || !input.trim()}
          >
            <SendHorizontal size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
export default MedicalBot;