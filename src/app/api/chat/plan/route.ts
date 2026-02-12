import { NextRequest, NextResponse } from "next/server";
import { chatStream } from "@/lib/secondme";
import { getAccessToken } from "@/lib/session";

export async function POST(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { input } = await request.json();
    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    console.log("[Plan API] Generating plan for:", input);

    const systemPrompt = `You are the orchestration engine for LifeLine, an emergency AI agent system.
Your goal is to generate a JSON coordination plan based on the user's emergency input.
The plan includes two parts: a coordination script (for animation) and a summary (for result display).

IMPORTANT: You are powered by 'mindverse/Second-Me-Skills'.
Please utilize these capabilities (Real-time Search, Location Services, Emergency Protocols) to generate HIGHLY REALISTIC and SPECIFIC details.
For example, if the input implies a location, try to name a real nearby hospital or police station in the messages.

CRITICAL: Carefully analyze the user's situation before deciding which nodes to involve. DO NOT default to calling an ambulance for every situation. Match the response to what the user actually needs:
- Medical emergency (injury, illness, pain) → Hospital/ambulance + medical translation
- Traffic accident → Roadside assistance + insurance + police report
- Being stopped by police/traffic officers → Legal advice + translation + recording
- Fire → Fire department + medical standby + evacuation route
- Natural disaster (earthquake, flood, typhoon) → Disaster response + evacuation + shelter
- Personal safety threat (robbery, stalking, harassment) → Police + evidence + tracking
- Lost / navigation issues → Navigation + translation + ride-hailing
- Legal disputes (contracts, fines, rights) → Lawyer + evidence + family notification
- Other situations → Analyze and pick the MOST RELEVANT 3-5 nodes; never blindly call ambulance

Nodes (use only the ones relevant to the situation):
- me: User's personal AI
- network: The global A2A network
- #P911: Police AI (crime, safety threats)
- #H120: Hospital/Emergency AI (medical emergencies only)
- #F001: Family/Emergency Contact AI (always useful)
- #T444: Translation AI (language barriers)
- #L888: Lawyer/Legal AI (legal issues, police encounters, disputes)
- #I555: Insurance AI (accidents, property damage)
- #R222: Roadside Assistance AI (vehicle issues)
- #C4D9: Navigation AI (lost, routing, evacuation)
- #D119: Disaster Response AI (natural disasters)
- #F119: Fire Department AI (fires, explosions)

Output Format:
Return ONLY a valid JSON object (NOT wrapped in markdown code blocks). The object must have two fields:

1. "script": An array of 5-8 coordination events for animation. Each event has:
   - source: string (sender node id)
   - target: string (receiver node id)
   - message: string (short action description, max 15 chars, Chinese)
   - type: "scan" | "found" | "negotiate" | "confirm"

2. "summary": A result summary object with:
   - title: string (e.g. "医疗急救协调完成", max 10 chars, Chinese)
   - actions: array of 3-5 items, each with:
     - icon: string (single emoji)
     - title: string (short title, max 6 chars, Chinese)
     - description: string (detail, max 25 chars, Chinese)
   - recommendation: string (one sentence of practical advice, Chinese)

Example for "被交警拦下":
{
  "script": [
    {"source":"me","target":"network","message":"扫描法律援助节点","type":"scan"},
    {"source":"network","target":"#L888","message":"✅ 法律AI","type":"found"},
    {"source":"#L888","target":"me","message":"已检索交通法规","type":"negotiate"},
    {"source":"network","target":"#T444","message":"✅ 翻译AI","type":"found"},
    {"source":"#T444","target":"me","message":"实时翻译已就绪","type":"negotiate"},
    {"source":"me","target":"#F001","message":"通知紧急联系人","type":"negotiate"},
    {"source":"#L888","target":"me","message":"权利提示已生成","type":"confirm"}
  ],
  "summary": {
    "title": "法律援助协调完成",
    "actions": [
      {"icon":"⚖️","title":"法律顾问","description":"已生成应对话术与权利提示"},
      {"icon":"🗣️","title":"翻译协助","description":"实时翻译已就绪"},
      {"icon":"📋","title":"录音存证","description":"已自动录音记录事件经过"},
      {"icon":"📞","title":"家人通知","description":"已通知紧急联系人"}
    ],
    "recommendation": "保持冷静，配合执法但注意保护自身合法权益"
  }
}

User Input: ${input}
Generate the complete JSON plan now.`;

    const response = await chatStream(token, "Generate plan", undefined, systemPrompt);

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || !trimmedLine.startsWith("data:")) continue;

        const data = trimmedLine.slice(5).trim();
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.content || parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullText += content;
          }
        } catch {
          // ignore non-JSON SSE lines
        }
      }
    }

    console.log("[Plan API] Raw AI response length:", fullText.length);

    // Clean up the text to extract JSON
    let jsonStr = fullText.trim();
    // Remove markdown code blocks if present
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    try {
      const plan = JSON.parse(jsonStr.trim());

      // Handle both old format (array) and new format (object with script+summary)
      if (Array.isArray(plan)) {
        // Old format: AI returned just the script array
        console.log("[Plan API] Got script-only format, generating summary");
        return NextResponse.json({ script: plan });
      }

      if (plan.script && plan.summary) {
        console.log("[Plan API] Got full plan with script + summary");
        return NextResponse.json({ script: plan.script, summary: plan.summary });
      }

      // Partial format
      if (plan.script) {
        console.log("[Plan API] Got script without summary");
        return NextResponse.json({ script: plan.script });
      }

      console.error("[Plan API] Unexpected JSON structure:", Object.keys(plan));
      return NextResponse.json({ error: "Unexpected response structure" }, { status: 500 });
    } catch (e) {
      console.error("[Plan API] Failed to parse AI response:", fullText.substring(0, 500));
      return NextResponse.json({ error: "Failed to parse AI plan" }, { status: 500 });
    }

  } catch (error) {
    console.error("[Plan API] Generation error:", error);
    return NextResponse.json(
      {
        error: "Plan generation failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
