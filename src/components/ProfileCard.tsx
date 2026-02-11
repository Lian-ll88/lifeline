"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface UserInfo {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  selfIntroduction: string;
  profileCompleteness: number;
}

interface Shade {
  tag: string;
  description: string;
  publicVersion: string;
}

export default function ProfileCard() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [shades, setShades] = useState<Shade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [userRes, shadesRes] = await Promise.all([
          fetch("/api/user/info"),
          fetch("/api/user/shades"),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.data) setUser(userData.data);
        }

        if (shadesRes.ok) {
          const shadesData = await shadesRes.json();
          if (shadesData.data) setShades(shadesData.data);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-border" />
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-border" />
            <div className="h-3 w-32 rounded bg-border" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted">
        无法加载用户信息
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-4">
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.name}
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-xl font-bold text-white">
            {user.name?.[0] || "?"}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold">{user.name}</h3>
          {user.email && <p className="text-sm text-muted">{user.email}</p>}
        </div>
      </div>

      {user.bio && <p className="text-sm text-muted">{user.bio}</p>}

      {shades.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted">兴趣标签</h4>
          <div className="flex flex-wrap gap-2">
            {shades.map((shade, i) => (
              <span
                key={i}
                className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent"
                title={shade.description}
              >
                {shade.publicVersion || shade.tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {user.profileCompleteness !== undefined && (
        <div>
          <div className="flex items-center justify-between text-xs text-muted">
            <span>资料完整度</span>
            <span>{user.profileCompleteness}%</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-border">
            <div
              className="h-1.5 rounded-full bg-accent transition-all"
              style={{ width: `${user.profileCompleteness}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
