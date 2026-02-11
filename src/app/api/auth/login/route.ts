import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/secondme";

export async function GET() {
  const state = crypto.randomUUID();
  const url = getAuthUrl(state);

  const response = NextResponse.redirect(url);
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
