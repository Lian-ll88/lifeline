"use client";

import { useState, useEffect, useRef } from "react";
import type { EmergencyPlan, EmergencyPlanSummary } from "@/types/emergency";

interface A2AEvent {
  id: string;
  source: string;
  target: string;
  message: string;
  type: "broadcast" | "found" | "negotiate" | "success";
  timestamp: number;
}

interface Node {
  id: string;
  type: "me" | "nurse" | "doctor" | "family" | "ambulance" | "police" | "lawyer" | "mechanic" | "insurance";
  label: string;
  x: number;
  y: number;
  status: "searching" | "connected" | "active";
}

const MEDICAL_SCENARIO: Omit<A2AEvent, "timestamp">[] = [
  { id: "1", source: "me", target: "network", message: "📡 正在向 847,392 个 AI 广播求救信号...", type: "broadcast" },
  { id: "2", source: "network", target: "me", message: "✅ 找到 医学翻译AI (#A7B2)", type: "found" },
  { id: "3", source: "nurse", target: "me", message: "我的主人是东京护士，我能翻译医疗术语", type: "negotiate" },
  { id: "4", source: "network", target: "me", message: "✅ 找到 导航AI (#C4D9)", type: "found" },
  { id: "5", source: "doctor", target: "me", message: "我已查到最近医院是东京医科大学，距离2.3km", type: "negotiate" },
  { id: "6", source: "network", target: "me", message: "✅ 找到 紧急联络AI (#E9F1)", type: "found" },
  { id: "7", source: "family", target: "me", message: "我会通知你家人的AI，但不会吵醒他们", type: "negotiate" },
  { id: "8", source: "me", target: "network", message: "🚑 正在协调救护车与支付...", type: "negotiate" },
  { id: "9", source: "me", target: "me", message: "✅ 你的AI已完成所有协调", type: "success" },
];

const SECURITY_SCENARIO: Omit<A2AEvent, "timestamp">[] = [
  { id: "1", source: "me", target: "network", message: "📡 启动最高级别安全警报广播...", type: "broadcast" },
  { id: "2", source: "network", target: "me", message: "✅ 找到 警方联络AI (#P911)", type: "found" },
  { id: "3", source: "police", target: "me", message: "已自动将当前坐标 (35.69, 139.70) 发送至新宿警署", type: "negotiate" },
  { id: "4", source: "network", target: "me", message: "✅ 找到 法律援助AI (#L888)", type: "found" },
  { id: "5", source: "lawyer", target: "me", message: "保持沉默，我已为你准备好紧急法律建议", type: "negotiate" },
  { id: "6", source: "network", target: "me", message: "✅ 找到 监控取证AI (#C333)", type: "found" },
  { id: "7", source: "family", target: "me", message: "已调取附近 3 个公共摄像头画面作为证据", type: "negotiate" },
  { id: "8", source: "me", target: "network", message: "🚓 警车已出动，预计 3 分钟到达", type: "negotiate" },
  { id: "9", source: "me", target: "me", message: "✅ 安全保护程序已全面激活", type: "success" },
];

const TRAFFIC_SCENARIO: Omit<A2AEvent, "timestamp">[] = [
  { id: "1", source: "me", target: "network", message: "📡 广播交通事故信息...", type: "broadcast" },
  { id: "2", source: "network", target: "me", message: "✅ 找到 道路救援AI (#R222)", type: "found" },
  { id: "3", source: "mechanic", target: "me", message: "拖车已出发，已避开拥堵路段", type: "negotiate" },
  { id: "4", source: "network", target: "me", message: "✅ 找到 保险理赔AI (#I555)", type: "found" },
  { id: "5", source: "insurance", target: "me", message: "现场照片已自动上传，理赔流程已开启", type: "negotiate" },
  { id: "6", source: "network", target: "me", message: "✅ 找到 交通疏导AI (#T777)", type: "found" },
  { id: "7", source: "police", target: "me", message: "已通知后方车辆注意避让，防止二次事故", type: "negotiate" },
  { id: "8", source: "me", target: "network", message: "🚗 代步车已安排，将在维修站等候", type: "negotiate" },
  { id: "9", source: "me", target: "me", message: "✅ 事故处理协调完成", type: "success" },
];

const MEDICAL_SUMMARY: EmergencyPlanSummary = {
  title: "医疗急救协调完成",
  actions: [
    { icon: "🚑", title: "救护车", description: "预计 15 分钟后到达 (已自动支付)" },
    { icon: "🏥", title: "前往医院", description: "东京医科大学病院 (距离 2.3km)" },
    { icon: "🗣️", title: "医疗翻译", description: "已预约 #A7B2 AI 协助沟通" },
    { icon: "📞", title: "家人通知", description: "已给妈妈的 AI 留言，未打扰睡眠" },
  ],
  recommendation: "请保持冷静，医疗团队即将到达",
};

const SECURITY_SUMMARY: EmergencyPlanSummary = {
  title: "安全保护协调完成",
  actions: [
    { icon: "🚓", title: "警察出动", description: "新宿警署巡逻车，预计 3 分钟到达" },
    { icon: "⚖️", title: "法律援助", description: "#L888 律师已生成紧急话术指引" },
    { icon: "📹", title: "证据保全", description: "已锁定周边 3 个公共摄像头画面" },
    { icon: "📍", title: "实时追踪", description: "位置已共享给警方与紧急联系人" },
  ],
  recommendation: "请尽量远离危险区域，等待警方到达",
};

const TRAFFIC_SUMMARY: EmergencyPlanSummary = {
  title: "事故处理协调完成",
  actions: [
    { icon: "🔧", title: "道路救援", description: "拖车已出发，预计 12 分钟到达" },
    { icon: "👮", title: "事故报备", description: "已向交管部门自动提交事故简报" },
    { icon: "📝", title: "保险理赔", description: "#I555 AI 已开启快速理赔通道" },
    { icon: "🚗", title: "代步安排", description: "维修期间代步车已预约" },
  ],
  recommendation: "请确保人身安全后，在安全位置等待救援",
};

function selectFallback(input: string): { scenario: Omit<A2AEvent, "timestamp">[]; summary: EmergencyPlanSummary } {
  const lower = (input || "").toLowerCase();
  if (lower.includes("抢劫") || lower.includes("偷") || lower.includes("打架") || lower.includes("危险")) {
    return { scenario: SECURITY_SCENARIO, summary: SECURITY_SUMMARY };
  }
  if (lower.includes("车祸") || lower.includes("撞") || lower.includes("车") || lower.includes("故障")) {
    return { scenario: TRAFFIC_SCENARIO, summary: TRAFFIC_SUMMARY };
  }
  return { scenario: MEDICAL_SCENARIO, summary: MEDICAL_SUMMARY };
}

export default function A2AVisualizer({ onComplete, initialInput }: {
  onComplete: (plan: EmergencyPlan) => void;
  initialInput?: string;
}) {
  const [events, setEvents] = useState<A2AEvent[]>([]);
  const [nodes, setNodes] = useState<Node[]>([
    { id: "me", type: "me", label: "你的AI", x: 50, y: 50, status: "active" }
  ]);
  const [loading, setLoading] = useState(true);
  const [scenario, setScenario] = useState<Omit<A2AEvent, "timestamp">[]>([]);
  const planRef = useRef<EmergencyPlan | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Fetch AI Plan
  useEffect(() => {
    async function fetchPlan() {
      if (!initialInput) {
        console.log("[A2A] No input provided, using medical fallback");
        const fb = selectFallback("");
        setScenario(fb.scenario);
        planRef.current = { script: [], summary: fb.summary, isAIGenerated: false };
        setLoading(false);
        return;
      }

      try {
        console.log(`[A2A] Fetching AI plan for: "${initialInput}"`);

        const res = await fetch("/api/chat/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: initialInput }),
        });

        if (res.status === 401) {
          console.warn("[A2A] Not authenticated (401) - using fallback");
          throw new Error("UNAUTHORIZED");
        }

        if (!res.ok) {
          console.error(`[A2A] API failed with status ${res.status}`);
          throw new Error(`API_ERROR_${res.status}`);
        }

        const data = await res.json();
        console.log("[A2A] AI plan received, has summary:", !!data.summary);

        if (data.script && Array.isArray(data.script) && data.script.length > 0) {
          // Map API script to animation format
          const apiScenario = data.script.map((item: any, index: number) => ({
            id: `ai-${index}`,
            source: item.source.includes("me") ? "me" : item.source.includes("network") ? "network" :
                    item.source.includes("P911") ? "police" :
                    item.source.includes("H120") ? "nurse" :
                    item.source.includes("L888") ? "lawyer" :
                    item.source.includes("I555") ? "insurance" :
                    item.source.includes("R222") ? "mechanic" :
                    item.source.includes("T444") ? "nurse" : "network",
            target: item.target === "me" ? "me" : "network",
            message: item.message,
            type: item.type === "scan" ? "broadcast" : item.type === "found" ? "found" : item.type === "confirm" ? "success" : "negotiate"
          }));

          // Add start and end events
          apiScenario.unshift({
            id: "start",
            source: "me",
            target: "network",
            message: `📡 正在向 AI 网络广播: "${initialInput}"`,
            type: "broadcast"
          });
          apiScenario.push({
            id: "end",
            source: "me",
            target: "me",
            message: "✅ 你的AI已完成所有协调",
            type: "success"
          });

          setScenario(apiScenario);

          // Use AI summary if available, otherwise generate from fallback
          const summary = data.summary || selectFallback(initialInput).summary;
          planRef.current = {
            script: data.script,
            summary,
            isAIGenerated: true,
          };
        } else {
          throw new Error("Empty script");
        }
      } catch (e) {
        console.error("[A2A] AI Plan failed, using fallback:", e);
        const fb = selectFallback(initialInput || "");
        setScenario(fb.scenario);
        planRef.current = { script: [], summary: fb.summary, isAIGenerated: false };
      } finally {
        setLoading(false);
      }
    }

    fetchPlan();
  }, [initialInput]);

  // Run Animation
  useEffect(() => {
    if (loading || scenario.length === 0) return;

    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex >= scenario.length) {
        clearInterval(interval);
        setTimeout(() => {
          if (planRef.current) {
            onComplete(planRef.current);
          }
        }, 1500);
        return;
      }

      const event = scenario[currentIndex];
      setEvents(prev => [...prev, { ...event, timestamp: Date.now() }]);

      // Update nodes based on event
      if (event.type === "found") {
        const nodeId = event.message.match(/#\w+/)?.[0] || `node-${currentIndex}`;
        const label = event.message.split(" ")[2] || "AI Node";
        const type = label.includes("医") ? "nurse" :
                     label.includes("警") ? "police" :
                     label.includes("律") ? "lawyer" :
                     label.includes("修") ? "mechanic" :
                     label.includes("险") ? "insurance" : "nurse";

        setNodes(prev => {
          if (prev.find(n => n.id === nodeId)) return prev;
          return [...prev, {
            id: nodeId,
            type,
            label,
            x: 20 + Math.random() * 60,
            y: 20 + Math.random() * 60,
            status: "connected"
          }];
        });
      }

      currentIndex++;
    }, 1500);

    return () => clearInterval(interval);
  }, [loading, scenario, onComplete]);

  // Scroll to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center space-y-6 animate-pulse">
        <div className="relative h-32 w-32">
           <div className="absolute inset-0 rounded-full border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
           <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-blue-500 border-b-transparent border-l-transparent animate-spin [animation-direction:reverse]"></div>
           <div className="absolute inset-0 flex items-center justify-center text-4xl">🧠</div>
        </div>
        <div>
          <h3 className="text-xl font-bold">AI 正在生成救援方案...</h3>
          <p className="text-sm text-zinc-500 mt-2">分析您的情况 &quot;{initialInput}&quot; 并连接相关节点</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Network Visualization Area */}
      <div className="relative h-64 w-full bg-black/40 rounded-b-3xl overflow-hidden shadow-inner flex-shrink-0 border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>

        {/* Central Pulse */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
           <div className="relative">
             <div className="absolute inset-0 animate-ping rounded-full bg-indigo-500 opacity-20 h-32 w-32 -m-10"></div>
             <div className="absolute inset-0 animate-pulse rounded-full bg-indigo-500 opacity-10 h-64 w-64 -m-26"></div>
           </div>
        </div>

        {/* Nodes */}
        <div className="relative w-full h-full">
           {nodes.map((node) => {
             const style = node.id === "me"
               ? { left: "50%", top: "50%", transform: "translate(-50%, -50%)" }
               : { left: `${node.x}%`, top: `${node.y}%` };

             return (
               <div key={node.id} className="absolute transition-all duration-500" style={style}>
                 <div className={`flex flex-col items-center gap-2 ${node.status === "connected" ? "animate-in zoom-in" : ""}`}>
                   <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-lg border-2 ${
                     node.type === "me" ? "bg-indigo-600 border-indigo-400 z-10" : "bg-zinc-800 border-zinc-600"
                   }`}>
                     <span className="text-xl">
                       {node.type === "me" ? "🤖" : node.type === "nurse" ? "🗣️" : node.type === "doctor" ? "🏥" : node.type === "police" ? "👮" : node.type === "lawyer" ? "⚖️" : node.type === "mechanic" ? "🔧" : node.type === "insurance" ? "📝" : "📞"}
                     </span>
                   </div>
                   <span className="text-[10px] text-zinc-400 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm whitespace-nowrap">
                     {node.label}
                   </span>
                 </div>

                 {/* Connection Line to Center */}
                 {node.id !== "me" && (
                   <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[500px] h-[500px] pointer-events-none opacity-30 overflow-visible">
                     <line
                       x1="50%" y1="50%"
                       x2={node.x > 50 ? "-50%" : "150%"}
                       y2={node.y > 50 ? "-50%" : "150%"}
                       stroke="white"
                       strokeWidth="1"
                       strokeDasharray="4 4"
                       className="animate-pulse"
                     />
                   </svg>
                 )}
               </div>
             );
           })}
        </div>
      </div>

      {/* Log Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/40">
        <div className="text-center py-2">
           <span className="px-3 py-1 rounded-full bg-zinc-800 text-xs text-zinc-500">
             A2A 协商频道 (加密)
           </span>
        </div>

        {events.map((event) => (
          <div key={event.id} className={`flex ${event.source === "me" ? "justify-end" : "justify-start"} animate-slide-up`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm border ${
              event.type === "broadcast" ? "bg-rose-500/10 border-rose-500/20 text-rose-300 w-full text-center" :
              event.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 w-full text-center font-bold" :
              event.source === "me"
                ? "bg-white/[0.06] border-white/10 text-zinc-200"
                : "bg-indigo-500/10 border-indigo-500/20 text-indigo-200"
            }`}>
              {event.type === "found" && <div className="text-xs font-bold mb-1 text-zinc-500">系统通知</div>}
              {event.source !== "me" && event.type === "negotiate" && (
                <div className="text-xs font-bold mb-1 text-zinc-500">
                   {events.find(e => e.type === "found" && e.message.includes(event.source))?.message.split(" ")[2] || "AI Node"}
                </div>
              )}
              {event.message}
            </div>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
