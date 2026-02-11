"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const [matchScore, setMatchScore] = useState(0);

  // Animate match score on mount
  useEffect(() => {
    if (!isOpen) return;
    const target = 87;
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setMatchScore(current);
    }, 20);
    return () => clearInterval(interval);
  }, [isOpen]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-emerald-400 to-cyan-400";
    if (score >= 60) return "from-amber-400 to-orange-400";
    return "from-rose-400 to-red-500";
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-xl glass p-2.5 shadow-lg transition-transform hover:scale-105 text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed left-0 top-0 z-50 h-full w-80 transform border-r border-white/[0.06] bg-[#111115] p-6 shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">LifeLine 档案</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {user ? (
          <div className="space-y-5 overflow-y-auto h-[calc(100%-120px)]">
            {/* User Profile */}
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-14 w-14 rounded-2xl border-2 border-indigo-500/30 object-cover shadow-lg"
                />
              ) : (
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {user.name?.[0] || "?"}
                </div>
              )}
              <div>
                <p className="font-bold text-white">{user.name}</p>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  保护中
                </p>
              </div>
            </div>

            {/* Match Score Card */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">当前匹配度</h3>
                <span className={`text-2xl font-bold bg-gradient-to-r ${getScoreColor(matchScore)} bg-clip-text text-transparent`}>
                  {matchScore}%
                </span>
              </div>

              {/* Score bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(matchScore)} transition-all duration-500 ease-out`}
                  style={{ width: `${matchScore}%` }}
                />
              </div>

              {/* Score breakdown */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { label: "响应速度", value: "95%" },
                  { label: "档案完整", value: "78%" },
                  { label: "网络覆盖", value: "89%" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <p className="text-xs font-semibold text-white">{item.value}</p>
                    <p className="text-[10px] text-zinc-500">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Medical Card */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">医疗急救卡</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-zinc-500">血型</p>
                  <p className="text-sm font-medium text-white">{user.bloodType || "未设置"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500">过敏史</p>
                  <p className="text-sm font-medium text-rose-400">{user.allergies || "无"}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500">语言能力</p>
                <p className="text-sm font-medium text-white">{user.languages || "未设置"}</p>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">紧急联系人</h3>
              <div>
                <p className="text-sm font-medium text-white">{user.emergencyContact || "未设置"}</p>
                <p className="text-xs text-zinc-500">{user.emergencyPhone || "---"}</p>
              </div>
            </div>

            <Link
              href="/dashboard/profile"
              onClick={() => setIsOpen(false)}
              className="block w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 text-center text-sm font-medium text-zinc-300 transition-all hover:bg-white/[0.08] hover:text-white"
            >
              编辑档案
            </Link>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-zinc-500">请先登录</p>
          </div>
        )}

        <div className="absolute bottom-6 left-6 right-6">
          <a
            href="/api/auth/logout"
            className="block w-full rounded-xl bg-white/[0.04] border border-white/[0.06] py-3 text-center text-sm font-medium text-zinc-500 transition-colors hover:bg-white/[0.08] hover:text-zinc-300"
          >
            退出登录
          </a>
        </div>
      </div>
    </>
  );
}
