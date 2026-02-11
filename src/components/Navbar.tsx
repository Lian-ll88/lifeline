"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar({ userName }: { userName?: string }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "SOS" },
    { href: "/dashboard/profile", label: "档案" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/[0.06] glass">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-indigo-600 text-sm text-white">⚕</span>
          <span className="bg-gradient-to-r from-rose-400 to-indigo-400 bg-clip-text text-transparent">LifeLine</span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                pathname === link.href
                  ? "bg-white/[0.08] font-medium text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {userName && (
            <span className="text-sm text-zinc-500">{userName}</span>
          )}
          <a
            href="/api/auth/logout"
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            退出
          </a>
        </div>
      </div>
    </nav>
  );
}
