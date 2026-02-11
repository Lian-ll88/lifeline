import { NextResponse } from "next/server";
import { refreshToken } from "@/lib/secondme";
import { getSession, setSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  try {
    const tokens = await refreshToken(session.refresh_token);

    await setSession({
      ...session,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
  }
}
