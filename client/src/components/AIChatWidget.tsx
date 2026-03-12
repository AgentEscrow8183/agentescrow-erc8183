/* ==========================================================
   AIChatWidget — AgentEscrow ERC-8183
   Design: Floating chat button + slide-up panel with cosmic theme
   Uses AIChatBox component from template + tRPC ai.chat procedure
   ========================================================== */

import { useState, useCallback } from "react";
import { X, MessageCircle, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { AIChatBox } from "@/components/AIChatBox";
import type { Message } from "@/components/AIChatBox";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663364387669/fEjhcY4s7LeuDVrQJHn5VB/ae-icon-v4-QFJAJsj8FMjz5GGVfkXy5E.webp";

const SUGGESTED_PROMPTS = [
  "What is ERC-8183?",
  "How does the escrow work?",
  "Who is the Evaluator?",
  "What happens when a job expires?",
  "How do hooks work in ERC-8183?",
  "How does ERC-8183 integrate with ERC-8004?",
];

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  // Only show user/assistant messages in the chat box (filter system messages)
  const [isLoading, setIsLoading] = useState(false);

  const chatMutation = trpc.ai.chat.useMutation();

  const handleSendMessage = useCallback(
    async (content: string) => {
      const userMessage: Message = { role: "user", content };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setIsLoading(true);

      try {
        const result = await chatMutation.mutateAsync({
          messages: newMessages,
        });

        const rawContent = result.content;
        const assistantMessage: Message = {
          role: "assistant",
          content: typeof rawContent === "string" ? rawContent : "Sorry, I could not generate a response.",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        const errorMessage: Message = {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, chatMutation]
  );

  return (
    <>
      {/* Chat Panel */}
      <div
        className={`fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 transition-all duration-300 ease-out ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        style={{ width: "min(380px, calc(100vw - 2rem))" }}
      >
        {/* Panel */}
        <div
          className="rounded-2xl overflow-hidden shadow-2xl border border-white/[0.1]"
          style={{
            background: "rgba(10, 14, 26, 0.95)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 0 60px rgba(114, 232, 218, 0.15), 0 20px 60px rgba(0,0,0,0.6)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
                style={{ background: "rgba(16,22,40,1)", boxShadow: "0 0 12px rgba(114,232,218,0.3)" }}
              >
                <img src={LOGO_URL} alt="AgentEscrow" className="w-full h-full object-contain p-0.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-sm font-bold text-white"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    AE Assistant
                  </span>
                  <Sparkles className="w-3 h-3 text-[oklch(0.72_0.18_195)]" />
                </div>
                <p className="text-[10px] font-mono text-[oklch(0.72_0.18_195)]">
                  ERC-8183 Expert
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[oklch(0.55_0.03_220)] hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Box */}
          <AIChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Ask about ERC-8183..."
            height={420}
            emptyStateMessage="Ask me anything about the AgentEscrow ERC-8183 protocol — escrow mechanics, roles, state machine, hooks, or integrations."
            suggestedPrompts={SUGGESTED_PROMPTS}
            className="border-none rounded-none bg-transparent"
          />
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group"
        style={{
          background: isOpen
            ? "oklch(0.72 0.18 195)"
            : "linear-gradient(135deg, oklch(0.72 0.18 195), oklch(0.55 0.22 290))",
          boxShadow: isOpen
            ? "0 0 30px rgba(114, 232, 218, 0.5)"
            : "0 0 20px rgba(114, 232, 218, 0.3), 0 8px 32px rgba(0,0,0,0.4)",
          width: "3.25rem",
          height: "3.25rem",
        }}
        aria-label={isOpen ? "Close AI Chat" : "Open AI Chat"}
      >
        <div
          className="transition-all duration-300"
          style={{ transform: isOpen ? "rotate(0deg) scale(1)" : "rotate(0deg) scale(1)" }}
        >
          {isOpen ? (
            <X className="w-5 h-5 text-[oklch(0.08_0.025_265)]" />
          ) : (
            <MessageCircle className="w-5 h-5 text-[oklch(0.08_0.025_265)]" />
          )}
        </div>

        {/* Pulse ring when closed */}
        {!isOpen && (
          <span
            className="absolute inset-0 rounded-2xl animate-ping"
            style={{
              background: "oklch(0.72 0.18 195 / 0.3)",
              animationDuration: "2.5s",
            }}
          />
        )}
      </button>

      {/* Tooltip */}
      {!isOpen && (
        <div
          className="fixed bottom-4 sm:bottom-6 right-16 sm:right-20 z-50 px-3 py-1.5 rounded-xl text-xs font-semibold text-[oklch(0.08_0.025_265)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
          style={{
            background: "oklch(0.72 0.18 195)",
            boxShadow: "0 4px 16px rgba(114,232,218,0.3)",
          }}
        >
          Ask AI about ERC-8183
        </div>
      )}
    </>
  );
}
