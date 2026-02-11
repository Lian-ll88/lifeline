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

Nodes:
- me: User's personal AI
- network: The global A2A network
- #P911: Police AI
- #H120: Hospital/Emergency AI
- #F001: Family/Emergency Contact AI
- #T444: Translation AI
- #L888: Lawyer/Legal AI
- #I555: Insurance AI
- #R222: Roadside Assistance AI
- #C4D9: Navigation AI

Output Format:
Return ONLY a valid JSON object (NOT wrapped in markdown code blocks). The object must have two fields:

1. "script": An array of coordination events for animation. Each event has:
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
   - recommendation: string (one sentence of advice, Chinese)

Example for "fire":
{
  "script": [
    {"source":"me","target":"network","message":"扫描火警节点","type":"scan"},
    {"source":"network","target":"#F119","message":"✅ 消防AI","type":"found"},
    {"source":"me","target":"#F119","message":"上报火情坐标","type":"negotiate"},
    {"source":"#F119","target":"me","message":"消防车已出动","type":"confirm"}
  ],
  "summary": {
    "title": "火灾救援协调完成",
    "actions": [
      {"icon":"🚒","title":"消防出动","description":"消防车预计5分钟到达"},
      {"icon":"🏥","title":"医疗待命","description":"急救人员已随车出发"},
      {"icon":"📞","title":"家人通知","description":"已通知紧急联系人"}
    ],
    "recommendation": "请立即远离火源，前往安全地带等待救援"
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
