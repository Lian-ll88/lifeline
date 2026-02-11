"use client";

import { useState, useEffect } from "react";

export interface UserProfile {
  name: string;
  avatar: string;
  bloodType?: string;
  allergies?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  languages?: string;
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load from localStorage first (for the demo profile updates)
    const localProfile = localStorage.getItem("lifeline_profile");
    if (localProfile) {
      setUser(JSON.parse(localProfile));
      setLoading(false);
      return;
    }

    // Fallback to API
    fetch("/api/user/info")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
           // Adapt API response to our profile shape
           // API returns { code: 0, data: { ... } } or similar
           const userData = data.data || data;
           setUser({
            name: userData.name || "User",
            avatar: userData.avatar || "",
          });
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
