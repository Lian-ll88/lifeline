import { NextResponse } from "next/server";
import { getUserShades } from "@/lib/secondme";
import { getAccessToken } from "@/lib/session";

export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getUserShades(token);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Get user shades error:", error);
    return NextResponse.json({ error: "Failed to fetch shades" }, { status: 500 });
  }
}
