import { NextRequest, NextResponse } from "next/server";
import { chatStream } from "@/lib/secondme";
import { getAccessToken } from "@/lib/session";

export async function POST(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { message, sessionId } = await request.json();
    console.log("[API] Chat stream request:", { messageLength: message?.length, sessionId, hasToken: !!token });

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await chatStream(token, message, sessionId);

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat stream error:", error);
    return NextResponse.json(
      { 
        error: "Chat stream failed", 
        details: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    );
  }
}
