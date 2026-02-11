"use client";

import { useEffect, useState } from "react";

interface Session {
  sessionId: string;
  lastMessage: string;
  updatedAt: string;
  messageCount: number;
}

interface SessionListProps {
  onSelect: (sessionId: string) => void;
  selectedId?: string;
}

export default function SessionList({ onSelect, selectedId }: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/chat/sessions");
        if (res.ok) {
          const data = await res.json();
          if (data.data) setSessions(data.data);
        }
      } catch (error) {
        console.error("Failed to load sessions:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-4">
            <div className="h-4 w-3/4 rounded bg-border" />
            <div className="mt-2 h-3 w-1/2 rounded bg-border" />
          </div>
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted">
        <p className="text-lg">暂无救援记录</p>
        <p className="mt-1 text-sm">按下 SOS 按钮开始你的第一次求救</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.map((session) => (
        <button
          key={session.sessionId}
          onClick={() => onSelect(session.sessionId)}
          className={`w-full rounded-xl border p-4 text-left transition-colors ${
            selectedId === session.sessionId
              ? "border-accent bg-accent/5"
              : "border-border bg-card hover:border-accent/50"
          }`}
        >
          <p className="text-sm font-medium truncate">
            {session.lastMessage || "救援会话"}
          </p>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted">
            <span>{new Date(session.updatedAt).toLocaleString("zh-CN")}</span>
            <span>{session.messageCount} 条消息</span>
          </div>
        </button>
      ))}
    </div>
  );
}
