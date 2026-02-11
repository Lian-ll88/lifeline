"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatStreamProps {
  sessionId: string | null;
  onSessionId: (id: string) => void;
  initialMessage?: string;
}

export default function ChatStream({ sessionId, onSessionId, initialMessage }: ChatStreamProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSentInitial = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialMessage && !hasSentInitial.current) {
      hasSentInitial.current = true;
      sendMessage(initialMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setStreaming(true);

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Stream request failed: ${res.status} ${errorText}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let assistantContent = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("event: session")) {
            continue;
          }
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith("data:")) {
            const data = trimmedLine.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.sessionId) {
                onSessionId(parsed.sessionId);
              }
              const content = parsed.content || parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantContent += content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                  };
                  return updated;
                });
              }
            } catch {
              // ignore non-JSON SSE lines
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "连接中断，请重试。" },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  const renderMessageContent = (content: string) => {
    if (content.startsWith("✅")) {
      return <div className="flex items-center gap-2 text-emerald-400 font-medium">{content}</div>;
    }
    if (content.startsWith("🏥")) {
      return <div className="flex items-center gap-2 text-rose-400 font-medium">{content}</div>;
    }
    if (content.startsWith("🤖")) {
      return <div className="flex items-center gap-2 text-indigo-400 font-medium">{content}</div>;
    }
    if (content.startsWith("📞")) {
      return <div className="flex items-center gap-2 text-amber-400 font-medium">{content}</div>;
    }
    return <div className="whitespace-pre-wrap">{content}</div>;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-3 animate-fade-in">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-3xl">
                🤖
              </div>
              <p className="text-sm text-zinc-500">AI 救援助手已就绪，请描述你的情况</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-2.5 animate-slide-up ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {/* AI Avatar */}
            {msg.role === "assistant" && (
              <div className="flex-none flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-lg shadow-indigo-500/20">
                AI
              </div>
            )}

            {/* Message bubble */}
            <div
              className={`relative max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "rounded-br-md bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/20"
                  : "rounded-bl-md glass text-zinc-200"
              }`}
            >
              {msg.content ? (
                renderMessageContent(msg.content)
              ) : (
                /* Typing indicator */
                <div className="flex items-center gap-1.5 px-1 py-1">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              )}
            </div>

            {/* User Avatar */}
            {msg.role === "user" && (
              <div className="flex-none flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-xs text-white shadow-lg shadow-rose-500/20">
                You
              </div>
            )}
          </div>
        ))}

        {/* Streaming typing indicator when waiting */}
        {streaming && messages.length > 0 && messages[messages.length - 1].role === "user" && (
          <div className="flex items-end gap-2.5 justify-start animate-slide-up">
            <div className="flex-none flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
              AI
            </div>
            <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1.5 px-1 py-1">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-white/[0.06] p-4 glass">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="描述你的紧急情况..."
            disabled={streaming}
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
          >
            发送
          </button>
        </form>
      </div>
    </div>
  );
}
