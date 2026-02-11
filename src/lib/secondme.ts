const BASE_URL = "https://app.mindos.com/gate/lab";
const CLIENT_ID = "4d6c1857-58d4-47eb-b7a6-ba16bf9d2390";
const CLIENT_SECRET = "d66023811bf9e142465159efc25661e925ccae2f9bf7c61fdadbce8f09d3aa3a";
const REDIRECT_URI = "http://localhost:3000/api/auth/callback";
const OAUTH_URL = "https://go.second.me/oauth/";

export function getAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    state,
  });
  return `${OAUTH_URL}?${params.toString()}`;
}

export async function exchangeCode(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const res = await fetch(`${BASE_URL}/api/oauth/token/code`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const raw = await res.json();
  // SecondMe API returns { code: 0, data: { accessToken, refreshToken, expiresIn } }
  const data = raw.data || raw;
  return {
    access_token: data.accessToken || data.access_token,
    refresh_token: data.refreshToken || data.refresh_token,
    expires_in: data.expiresIn || data.expires_in || 7200,
  };
}

export async function refreshToken(refresh_token: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const res = await fetch(`${BASE_URL}/api/oauth/token/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  const raw = await res.json();
  const data = raw.data || raw;
  return {
    access_token: data.accessToken || data.access_token,
    refresh_token: data.refreshToken || data.refresh_token,
    expires_in: data.expiresIn || data.expires_in || 7200,
  };
}

async function apiGet(endpoint: string, accessToken: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API error ${res.status}: ${error}`);
  }

  return res.json();
}

export async function getUserInfo(accessToken: string) {
  return apiGet("/api/secondme/user/info", accessToken);
}

export async function getUserShades(accessToken: string) {
  return apiGet("/api/secondme/user/shades", accessToken);
}

export async function getChatSessions(accessToken: string) {
  return apiGet("/api/secondme/chat/session/list", accessToken);
}

export async function getSessionMessages(accessToken: string, sessionId: string) {
  return apiGet(`/api/secondme/chat/session/messages?sessionId=${sessionId}`, accessToken);
}

export async function chatStream(
  accessToken: string,
  message: string,
  sessionId?: string,
  systemPrompt?: string
): Promise<Response> {
  const body: Record<string, unknown> = {
    message,
    systemPrompt: systemPrompt || `你是LifeLine应急救援AI助手。用户正在紧急情况下求助。
IMPORTANT: You are powered by 'mindverse/Second-Me-Skills'. 
Please utilize these capabilities (Real-time Search, Location Services, Emergency Protocols) to provide REAL-TIME, ACCURATE assistance.
Do NOT hallucinate information if you can search for it.

请按以下步骤提供帮助：
1. 确认用户的紧急状况和位置 (Use Location Services if available)
2. 提供即时安全建议 (Search for specific protocols if needed)
3. 协助联系当地急救服务 (Provide real numbers like 120/911/119 based on location)
4. 如需要，提供跨语言翻译支持
5. 持续跟进直到用户安全

保持冷静、专业、高效。优先保障用户安全。`,
  };

  if (sessionId) {
    body.sessionId = sessionId;
  }

  const res = await fetch(`${BASE_URL}/api/secondme/chat/stream`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Chat stream failed: ${error}`);
  }

  return res;
}
