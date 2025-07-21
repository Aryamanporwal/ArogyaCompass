"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Search,
  SendHorizontal,
  Mic,
  Stethoscope,
  ShieldQuestion,
  Syringe,
  Moon,
  Brain,
} from "lucide-react";
import Image from "next/image";

const suggestionCards = [
  { icon: <Moon size={16} />, label: "Why am I not getting proper sleep?" },
  { icon: <ShieldQuestion size={16} />, label: "Best diet for diabetic?" },
  { icon: <Brain size={16} />, label: "How to reduce anxiety naturally?" },
  { icon: <Syringe size={16} />, label: "Is vaccination safe for kids?" },
  { icon: <Stethoscope size={16} />, label: "Common cold vs flu symptoms?" },
];

const MedicalBot = () => {
  const [messages, setMessages] = useState([
    {
      user: false,
      text: "Hi there! 👋 How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

        const sendMessage = async () => {
        if (!input.trim()) return;
        const newMessages = [
            ...messages,
            { user: true, text: input }
        ];

        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const formattedMessages = newMessages.slice(1).map(msg => ({
            role: msg.user ? "user" : "assistant",
            content: msg.text,
            }));
            const res = await axios.post(
            `${window.location.origin}/api/medical-bot`,   
            { messages: formattedMessages }
            );
            setMessages(prev => [
            ...prev,
            {
                user: false,
                text: res.data.reply || "Sorry, I couldn't find an answer to that. 🩺",
            }
            ]);
        } catch {
            setMessages(prev => [
            ...prev,
            {
                user: false,
                text: "Sorry, something went wrong. Please try again.",
            }
            ]);
        } finally {
            setLoading(false);
        }
        };


  function cn(light: string, dark: string) {
    return `${light} dark:${dark}`;
  }

  return (
    <div
      className="h-screen w-full  font-inter transition-colors flex flex-col items-center justify-start bg-gray-100 text-[#232325] dark:bg-[#0a0a0a] dark:text-white"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Logo & Title (Hidden after first message) */}
      {messages.length <= 1 && (
        <div className="mt-[7vh] mb-7 text-center">
          <Image
            src="/assets/icons/logo.png"
            alt="logo"
            width={70}
            height={70}
            className="mx-auto mb-3"
          />
          <h1 className="text-5xl font-light tracking-tight text-center">ArogyaCompass
        </h1>
        </div>
      )}

      {/* Messages (shown after input) */}
      {messages.length > 1 && (
        <div
          className={cn(
            "w-full max-w-2xl px-5 mb-100 mt-6",
            "sm:px-6 lg:px-8"
          )}
        >
          <div className="text-2xl font-light mb-2">{messages[messages.length - 2].text}</div>
          <div className="flex items-center gap-2 my-2 text-base font-semibold">
            <Stethoscope size={16} className="text-cyan-500" />
            Answer
          </div>
          <div className="border-b border-gray-300 dark:border-[#2e2e2e] mb-3" />

          <div
            style={{
              overflowY: "auto",
              maxHeight: "100%",               // Doesn't restrict height, but allows scroll if needed
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",         // Firefox
              msOverflowStyle: "none",        // IE/Edge
            }}
            className="custom-scroll-wrapper"
          >
            <div className="text-lg leading-relaxed">
              {messages[messages.length - 1].text}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-6 mt-4 text-[#888] text-sm items-center">
              <button className="hover:underline flex items-center gap-1 ">
                <svg className="w-4 h-4" fill="none" stroke="currentColor">
                  <path d="M8 12h8m0 0l-3-3m3 3l-3 3" />
                </svg>
                Shared
              </button>
              <button className="hover:underline">Export</button>
              <button className="hover:underline">Rewrite</button>
              <div className="flex gap-2 ml-auto items-center">
                <button>👍</button>
                <button>👎</button>
              </div>
            </div>
          </div>

          <style jsx>{`
            .custom-scroll-wrapper::-webkit-scrollbar {
              display: none;
            }
          `}</style>

        </div>
      )}

      {/* Suggestion Buttons (only before messages start) */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mt-6 mb-8 w-full justify-center px-4">
          {suggestionCards.map((card, i) => (
            <button
              key={i}
              onClick={() => setInput(card.label)}
              className= "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition border border-[#e2e4e8] bg-[#f6f8fa] text-[#232325] hover:bg-[#ececf1] dark:border-[#292929] dark:bg-[#18181a] dark:hover:bg-[#212124] dark:text-white"   
            >
              {card.icon}
              {card.label}
            </button>
          ))}
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
            sendMessage();
          }}
        >
          <Search size={20} className="text-[#b4b4b4] dark:text-[#9ba1b4] mx-2" />
          <input
            className="flex-1 h-10 bg-transparent outline-none border-none text-base placeholder:text-[#7a7a7a] px-4 font-normal text-[#232325] dark:text-white dark:placeholder:text-[#76777A]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything or @mention a Department"
            disabled={loading}
          />
          <Mic size={20} className="text-[#b4b4b4] dark:text-[#a6afd7] mx-1" />
          <button
            type="submit"
            className="ml-2 rounded-lg bg-[#38bdf8] hover:bg-[#18bad6] transition text-white p-2 flex items-center shadow"
            disabled={loading || !input.trim()}
          >
            <SendHorizontal size={18} />
          </button>
        </form>
      </div>

      <div ref={messagesEndRef} className="mb-[100px]" />
    </div>
  );
};

export default MedicalBot;
