import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 overflow-hidden">
      {/* Ambient glow effects */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-rose-600/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md space-y-8 text-center">
        {/* Logo */}
        <div className="space-y-3 animate-fade-in">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500 to-indigo-600 text-4xl text-white shadow-lg shadow-indigo-500/30 animate-float">
            ⚕
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            LifeLine
          </h1>
          <p className="text-lg text-zinc-400">AI 应急救援网络</p>
        </div>

        {/* Feature cards */}
        <div className="space-y-3 animate-fade-in delay-150">
          {[
            { icon: "🆘", title: "一键SOS求救", desc: "紧急情况下快速触发AI救援" },
            { icon: "🌍", title: "跨语言支持", desc: "AI实时翻译，跨越语言障碍" },
            { icon: "📋", title: "紧急档案", desc: "存储医疗信息和紧急联系人" },
          ].map((item) => (
            <div
              key={item.title}
              className="glass flex items-center gap-4 rounded-2xl p-4 text-left transition-all hover:border-white/15 hover:bg-white/[0.06]"
            >
              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white/[0.06] text-2xl">
                {item.icon}
              </div>
              <div>
                <p className="font-medium text-white">{item.title}</p>
                <p className="text-sm text-zinc-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="space-y-3 animate-fade-in delay-300">
          <Link
            href="/api/auth/login"
            className="group relative inline-flex h-13 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative z-10">使用 SecondMe 登录</span>
            <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-indigo-700 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex h-13 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-base font-medium text-zinc-300 backdrop-blur-sm transition-all hover:bg-white/[0.08] hover:text-white hover:border-white/20"
          >
            演示模式 (跳过登录)
          </Link>
        </div>

        <p className="text-xs text-zinc-500 animate-fade-in delay-500">
          登录即表示你同意 LifeLine 访问你的 SecondMe 账户信息
        </p>
      </div>
    </div>
  );
}
