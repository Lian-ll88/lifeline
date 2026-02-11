import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "lifeline_session";
const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "lifeline-dev-secret-change-in-production-32ch"
);

export interface SessionData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user?: {
    userId: string;
    name: string;
    avatar: string;
  };
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionData;
  } catch {
    return null;
  }
}

export async function createSessionToken(data: SessionData): Promise<string> {
  return new SignJWT(data as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 30 * 24 * 60 * 60,
};

export async function setSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  const token = await createSessionToken(data);

  cookieStore.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;

  // If token is still valid (more than 5 minutes left), return it directly
  if (Date.now() / 1000 <= session.expires_at - 300) {
    return session.access_token;
  }

  // Token is expiring soon, but still return it and let the client handle refresh
  // Server-to-server refresh without cookies doesn't work in Next.js
  console.log("[Session] Token expiring soon, returning existing token");
  return session.access_token;
}
