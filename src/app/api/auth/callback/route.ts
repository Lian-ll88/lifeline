import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, getUserInfo } from "@/lib/secondme";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/session";
import type { SessionData } from "@/lib/session";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = request.cookies.get("oauth_state")?.value;

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  if (state !== savedState) {
    return NextResponse.redirect(new URL("/?error=state_mismatch", request.url));
  }

  try {
    const tokens = await exchangeCode(code);
    // Token exchange success

    let user: { userId: string; name: string; avatar: string } | undefined;
    try {
      const userRes = await getUserInfo(tokens.access_token);
      if (userRes.code === 0 && userRes.data) {
        user = {
          userId: userRes.data.userId,
          name: userRes.data.name,
          avatar: userRes.data.avatar,
        };
      }
    } catch {
      // User info fetch is optional, continue without it
    }

    const sessionData: SessionData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
      user,
    };

    // Create JWT token and set cookie directly on the redirect response
    const jwt = await createSessionToken(sessionData);
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.set(SESSION_COOKIE_NAME, jwt, SESSION_COOKIE_OPTIONS);
    response.cookies.delete("oauth_state");

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
