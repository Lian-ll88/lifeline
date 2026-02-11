"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SessionList from "@/components/SessionList";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function HistoryPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (!selectedId) return;

    async function loadMessages() {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/chat/sessions?sessionId=${selectedId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.data) setMessages(data.data);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    }

    loadMessages();
  }, [selectedId]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 pb-8 pt-20">
        <h1 className="mb-6 text-2xl font-bold">救援记录</h1>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <div>
            <SessionList onSelect={setSelectedId} selectedId={selectedId} />
          </div>

          <div className="rounded-2xl border border-border bg-card">
            {!selectedId ? (
              <div className="flex h-64 items-center justify-center text-muted">
                选择一条记录查看详情
              </div>
            ) : loadingMessages ? (
              <div className="flex h-64 items-center justify-center text-muted">
                加载中...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-muted">
                暂无消息
              </div>
            ) : (
              <div className="space-y-4 p-4 max-h-[600px] overflow-y-auto">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-accent text-white"
                          : "bg-background border border-border"
                      }`}
                    >
                      <p>{msg.content}</p>
                      {msg.timestamp && (
                        <p className={`mt-1 text-xs ${msg.role === "user" ? "text-white/60" : "text-muted"}`}>
                          {new Date(msg.timestamp).toLocaleString("zh-CN")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
