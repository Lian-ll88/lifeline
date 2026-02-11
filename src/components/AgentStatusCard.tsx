"use client";

import { useState, useEffect } from "react";

export interface AgentActivity {
  id: string;
  time: string;
  action: string;
  points: number;
}

export function AgentStatusHeader() {
  const [networkCount, setNetworkCount] = useState(847392);

  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkCount(prev => prev + Math.floor(Math.random() * 5));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md">
      <div className="glass rounded-2xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/25">
                AI
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">你的 LifeLine AI</h3>
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                在线 · 24/7 守护中
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">已连接 AI 网络</p>
            <p className="font-mono text-lg font-bold tabular-nums bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {networkCount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-3 text-sm text-zinc-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>当前状态：一切正常，无异常活动</span>
        </div>
      </div>
    </div>
  );
}

export function AgentActivityList() {
  const activities: AgentActivity[] = [
    { id: "1", time: "2小时前", action: "检测到异常心率，已为您预约心脏专科检查", points: 15 },
    { id: "2", time: "昨天", action: "协助一位只会日语的游客向药店描述过敏症状", points: 10 },
    { id: "3", time: "3天前", action: "自动拦截了一个伪装成税务局的诈骗电话", points: 5 },
  ];

  return (
    <div className="w-full max-w-md space-y-3 animate-fade-in delay-300">
      <h4 className="px-1 text-sm font-medium text-zinc-500">🤖 你的 AI 最近在做什么</h4>
      {activities.map((activity, idx) => (
        <div
          key={activity.id}
          className="glass flex items-start gap-3 rounded-2xl p-4 transition-all hover:bg-white/[0.06] animate-slide-up"
          style={{ animationDelay: `${400 + idx * 100}ms` }}
        >
          <div className="mt-1.5 flex h-2 w-2 flex-none rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.6)]" />
          <div className="flex-1 space-y-1">
            <p className="text-sm text-zinc-300 leading-relaxed">{activity.action}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-600">{activity.time}</p>
              {activity.points > 0 && (
                <span className="text-xs font-medium text-amber-400">+{activity.points} 生命点数</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AgentStatusCard() {
  return (
    <div className="w-full max-w-md space-y-6">
      <AgentStatusHeader />
      <AgentActivityList />
    </div>
  );
}
