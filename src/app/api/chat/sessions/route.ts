import { NextRequest, NextResponse } from "next/server";
import { getChatSessions, getSessionMessages } from "@/lib/secondme";
import { getAccessToken } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionId = request.nextUrl.searchParams.get("sessionId");

  try {
    if (sessionId) {
      const data = await getSessionMessages(token, sessionId);
      return NextResponse.json(data);
    }

    const data = await getChatSessions(token);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Chat sessions error:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}
