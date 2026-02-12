"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import SOSButton from "@/components/SOSButton";
import { AgentStatusHeader, AgentActivityList } from "@/components/AgentStatusCard";
import A2AVisualizer from "@/components/A2AVisualizer";
import type { EmergencyPlan } from "@/types/emergency";

export default function Dashboard() {
  const [sosActive, setSosActive] = useState(false);
  const [demoState, setDemoState] = useState<"idle" | "input" | "coordinating" | "result">("idle");
  const [emergencyInput, setEmergencyInput] = useState("");
  const [emergencyPlan, setEmergencyPlan] = useState<EmergencyPlan | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleSOS() {
    setSosActive(true);
    setDemoState("input");
  }

  function handleBack() {
    setSosActive(false);
    setDemoState("idle");
    setEmergencyInput("");
    setEmergencyPlan(null);
  }

  function handleStartCoordination() {
    if (!emergencyInput.trim()) return;
    setDemoState("coordinating");
  }

  function handleCoordinationComplete(plan: EmergencyPlan) {
    setEmergencyPlan(plan);
    setDemoState("result");
  }

  useEffect(() => {
    if (demoState === "input" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [demoState]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-rose-600/8 blur-[120px]" />
      </div>

      <Sidebar />
      <Navbar />

      {!sosActive ? (
        <main className="relative z-10 flex flex-1 flex-col justify-between pt-20 px-4 pb-6">
          <div className="flex justify-center w-full">
            <AgentStatusHeader />
          </div>

          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-zoom-in delay-150 scale-125 my-4">
              <SOSButton onPress={handleSOS} />
            </div>
            <p className="text-sm text-zinc-500 animate-fade-in delay-300 mt-6 text-center">
              长按 3 秒，让你的 AI 呼叫全球救援网络
            </p>
          </div>

          <div className="flex justify-center w-full">
            <AgentActivityList />
          </div>
        </main>
      ) : (
        <main className="relative z-10 flex flex-1 flex-col pt-14 h-[100dvh]">
          {/* Status bar */}
          <div className="flex items-center justify-between border-b border-white/[0.06] glass px-4 py-3">
            <button
              onClick={handleBack}
              className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              &larr; 结束
            </button>
            <div className="flex items-center gap-2 rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className="text-sm font-bold text-rose-400">
                {demoState === "input" ? "等待指令" : demoState === "coordinating" ? "AI 网络协作中" : "救援方案已就绪"}
              </span>
            </div>
          </div>

          {demoState === "input" && (
            <div className="flex flex-1 flex-col items-center justify-center p-6 animate-fade-in">
              <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-white">发生了什么紧急情况？</h2>
                  <p className="text-zinc-500">你的 AI 需要了解情况以连接正确的救援节点</p>
                </div>

                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={emergencyInput}
                    onChange={(e) => setEmergencyInput(e.target.value)}
                    placeholder="例如：肚子剧痛、发生车祸、遇到抢劫..."
                    className="w-full min-h-[120px] rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-lg text-white placeholder-zinc-600 shadow-sm outline-none ring-2 ring-transparent transition-all focus:ring-indigo-500/40 focus:border-indigo-500/30 resize-none"
                  />
                  <button className="absolute right-4 bottom-4 p-2 rounded-full bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                  </button>
                </div>

                <div className="grid gap-3">
                  <button
                    onClick={handleStartCoordination}
                    disabled={!emergencyInput.trim()}
                    className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-4 text-lg font-bold text-white shadow-lg shadow-rose-500/20 transition-all hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    立即启动救援
                  </button>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["肚子痛", "车祸", "迷路", "被交警拦", "着火了", "地震", "被跟踪", "纠纷"].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setEmergencyInput(tag)}
                        className="px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] text-sm font-medium text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-300 transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {demoState === "coordinating" && (
            <A2AVisualizer
              onComplete={handleCoordinationComplete}
              initialInput={emergencyInput}
            />
          )}

          {demoState === "result" && emergencyPlan && (
            <div className="flex-1 overflow-y-auto p-4 animate-fade-in">
              <div className="mx-auto max-w-md space-y-6">
                <div className="glass rounded-2xl p-6">
                  <div className="mb-4 flex items-center gap-3 border-b border-white/[0.06] pb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl text-emerald-400">
                      ✅
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{emergencyPlan.summary.title}</h2>
                      <p className="text-sm text-zinc-500">
                        {emergencyPlan.isAIGenerated ? "AI 实时生成的救援方案" : "无需操作，请保持冷静"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {emergencyPlan.summary.actions.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="text-xl">{action.icon}</span>
                        <div>
                          <p className="font-semibold text-white">{action.title}</p>
                          <p className="text-sm text-zinc-400">{action.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {emergencyPlan.summary.recommendation && (
                    <div className="mt-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3">
                      <p className="text-sm text-indigo-300">
                        💡 {emergencyPlan.summary.recommendation}
                      </p>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-white/[0.06]">
                    <button className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all">
                      查看详细报告 (附件)
                    </button>
                  </div>
                </div>

                <div className="text-center text-xs text-zinc-600">
                  {emergencyPlan.isAIGenerated
                    ? "本次救援由 SecondMe AI 实时协调"
                    : "本次救援由 4 个 AI 节点协作完成"}
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
