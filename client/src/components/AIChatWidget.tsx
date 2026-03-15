import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2, MessageSquare } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { nanoid } from "nanoid";
import { Streamdown } from "streamdown";

const SESSION_KEY = "agentescrow_chat_session";

function getOrCreateSession() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = nanoid(16);
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

type Message = { role: "user" | "assistant"; content: string };

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm **AgentBot**, your ERC-8183 protocol guide. Ask me anything about job escrow, wallet setup, or smart contract interactions.",
    },
  ]);
  const sessionId = useRef(getOrCreateSession());
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMsg = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || sendMsg.isPending) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    sendMsg.mutate({ sessionId: sessionId.current, message: msg });
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[oklch(0.72_0.22_195)] text-[oklch(0.07_0.015_260)] flex items-center justify-center glow-cyan shadow-xl transition-all ${
          open ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Bot className="w-6 h-6" />
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm sm:w-80 md:w-96 h-[420px] sm:h-[500px] flex flex-col cyber-card rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[oklch(0.78_0.22_195/0.15)] bg-[oklch(0.09_0.02_260)]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[oklch(0.72_0.22_195/0.2)] border border-[oklch(0.72_0.22_195/0.4)] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[oklch(0.78_0.22_195)]" />
                </div>
                <div>
                  <p className="text-xs font-['Orbitron'] font-bold text-[oklch(0.78_0.22_195)]">AGENTBOT</p>
                  <p className="text-[10px] text-[oklch(0.55_0.04_220)]">ERC-8183 Protocol Guide</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.92_0.02_200)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-[oklch(0.72_0.22_195/0.2)] border border-[oklch(0.72_0.22_195/0.3)] flex items-center justify-center mr-2 mt-1 shrink-0">
                      <Bot className="w-3 h-3 text-[oklch(0.78_0.22_195)]" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[oklch(0.72_0.22_195/0.2)] border border-[oklch(0.72_0.22_195/0.3)] text-[oklch(0.92_0.02_200)]"
                        : "bg-[oklch(0.14_0.025_260)] border border-[oklch(0.2_0.03_260)] text-[oklch(0.82_0.05_200)]"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Streamdown className="prose prose-invert prose-xs max-w-none [&_p]:m-0 [&_code]:text-[oklch(0.78_0.22_195)] [&_strong]:text-[oklch(0.92_0.02_200)]">
                        {msg.content}
                      </Streamdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {sendMsg.isPending && (
                <div className="flex items-center gap-2 text-[oklch(0.55_0.04_220)]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-xs">AgentBot is thinking...</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-[oklch(0.78_0.22_195/0.15)]">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Ask about ERC-8183..."
                  className="flex-1 bg-[oklch(0.14_0.025_260)] border border-[oklch(0.2_0.03_260)] rounded px-3 py-2 text-xs text-[oklch(0.92_0.02_200)] placeholder:text-[oklch(0.55_0.04_220)] focus:outline-none focus:border-[oklch(0.72_0.22_195/0.5)]"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sendMsg.isPending}
                  className="w-8 h-8 rounded bg-[oklch(0.72_0.22_195)] text-[oklch(0.07_0.015_260)] flex items-center justify-center disabled:opacity-40 hover:bg-[oklch(0.78_0.22_195)] transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[9px] text-[oklch(0.55_0.04_220)] mt-1.5 text-center">
                AgentBot AI · ERC-8183 Protocol
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
