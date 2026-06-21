import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal, 
  Send, 
  ShieldAlert, 
  ArrowLeft, 
  CheckCircle, 
  HelpCircle, 
  Layers, 
  Radio, 
  Cpu, 
  Play, 
  Settings,
  Users,
  Activity,
  Plus,
  RefreshCw,
  Search,
  Zap,
  Layout,
  MessageSquare
} from "lucide-react";
import { Message } from "../types";

interface CommandConsoleProps {
  initialMessage: string;
  onExit: () => void;
}

interface Agent {
  name: string;
  role: string;
  avatar: string;
  status: "ONLINE" | "ANALYZING" | "STANDBY" | "PROCESSING";
  efficiency: string;
  activeWork: string;
  avatarColor: string;
  description: string;
}

const squadAgents: Agent[] = [
  {
    name: "Jack",
    role: "Squad Leader / Orchestration",
    avatar: "https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png",
    status: "ONLINE",
    efficiency: "99.8%",
    activeWork: "Managing global pipeline",
    avatarColor: "border-[#B600A8]",
    description: "Multi-agent deployment coordinator. Decodes raw prompts to generate precise tactical plans across all teams."
  },
  {
    name: "Sofia",
    role: "Conversion & Store Architecture",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
    status: "STANDBY",
    efficiency: "98.4%",
    activeWork: "Drafting high-conversion UI layouts",
    avatarColor: "border-[#BE4C00]",
    description: "Crafts beautiful, hyper-optimized checkout funnels, landing pages, and interactive digital store designs."
  },
  {
    name: "Yuna",
    role: "Support Protocols (WhatsApp/TG)",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200",
    status: "ONLINE",
    efficiency: "99.2%",
    activeWork: "Structuring auto-responder flows",
    avatarColor: "border-[#7621B0]",
    description: "Configures real-time human-in-the-loop customer support gateways to upsell and nurture leads 24/7."
  },
  {
    name: "Leo",
    role: "Sourcing & Product Validation",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200",
    status: "PROCESSING",
    efficiency: "96.7%",
    activeWork: "Filtering trending viral supplies",
    avatarColor: "border-[#18011F]",
    description: "Researches supply chains, tracks micro-trends, and validates product viability to eliminate risk."
  },
  {
    name: "Amir",
    role: "Growth & Traffic Generation",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
    status: "ONLINE",
    efficiency: "98.9%",
    activeWork: "Prepping Meta/TikTok ad sets",
    avatarColor: "border-green-500",
    description: "Deploys algorithmic advertising, handles scaling budgets, and crafts creative hooks that lower CAC."
  }
];

export function CommandConsole({ initialMessage, onExit }: CommandConsoleProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentAgent, setCurrentAgent] = useState<Agent>(squadAgents[0]);
  const [isTyping, setIsTyping] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "INITIALIZING ENCRYPTED COGNITIVE LAYER...",
    "ESTABLISHING SECURE MULTI-ROUTING GATEWAY...",
    "SQUAD OFFC_0 SECURE UPLINK STATUS: GOOD",
  ]);
  const [milestones, setMilestones] = useState([
    { id: "m1", text: "Goal decoded by Jack", done: true },
    { id: "m2", text: "Sourcing winning product assets", done: false },
    { id: "m3", text: "Store infrastructure deployment", done: false },
    { id: "m4", text: "Ad creatives formulation", done: false },
    { id: "m5", text: "Live support system validation", done: false }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Load initial prompt
  useEffect(() => {
    let dateStr = new Date().toLocaleTimeString();
    setSystemLogs(prev => [...prev, `[${dateStr}] SEC_UPLINK: Connected to operational nodes.`]);

    if (initialMessage.trim()) {
      const userMsg: Message = {
        id: `user-init`,
        sender: "user",
        text: initialMessage
      };
      setMessages([userMsg]);
      setIsTyping(true);
      
      setSystemLogs(prev => [
        ...prev,
        `[${dateStr}] DEPOSITING OBJECTIVE: "${initialMessage.slice(0, 30)}..."`,
        `[${dateStr}] JACK: Orchestrating squad pipelines.`
      ]);

      setTimeout(() => {
        setIsTyping(false);
        const reply: Message = {
          id: `jack-init`,
          sender: "jack",
          text: `Roger that. Secure uplink verified. I've logged your target objectives. Currently formulating tasks for Sofia, Yuna, and Leo. Describe any details or specific timelines below. Let's build your empire.`,
          pills: [
            "🛠️ Core Store Architecture Setup",
            "📦 Validate Winning Suppliers",
            "💬 WhatsApp Support Onboarding"
          ]
        };
        setMessages(prev => [...prev, reply]);
        setMilestones(prev => 
          prev.map(m => m.id === "m1" ? { ...m, done: true } : m)
        );
      }, 1800);
    } else {
      // Default initial greetings
      setMessages([
        {
          id: "welcome",
          sender: "jack",
          text: "Welcome to the Operations Workspace. I am Jack, your Squad Leader. Drop your goal in the terminal below, and I will dispatch tasks to our active specialists immediately.",
          pills: ["🚀 Launch Web Store", "💬 Setup Support Agents", "📈 Set Ad Budget"]
        }
      ]);
    }
  }, [initialMessage]);

  // Scroll to chat bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Scroll logs to bottom
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollTop = logEndRef.current.scrollHeight;
    }
  }, [systemLogs]);

  const addLog = (text: string) => {
    const time = new Date().toLocaleTimeString();
    setSystemLogs(prev => [...prev, `[${time}] ${text}`]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const query = inputValue.trim();
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    addLog(`USER COMMAND INPUT: "${query}"`);

    setIsTyping(true);

    // AI Responses Logic based on query text
    setTimeout(() => {
      setIsTyping(false);
      let replyText = "Affirmative. Task distributed across tactical nodes. Processing structural data arrays.";
      let briefs: string[] = ["⚙️ Technical Integration", "🔋 Live Testing Ready"];

      const lower = query.toLowerCase();
      if (lower.includes("design") || lower.includes("store") || lower.includes("theme") || lower.includes("look")) {
        replyText = "Sofia is taking charge of your storefront architecture. Designing clean, high-performance paths to conversion. We'll use a razor-sharp typography grid.";
        briefs = ["🛍️ Sofia: Design Draft", "🎨 Brand Fonts Sync"];
        addLog("SOFIA NODE: Task assigned // Designing UI wires");
        setMilestones(prev => 
          prev.map(m => m.id === "m3" ? { ...m, done: true } : m)
        );
      } else if (lower.includes("product") || lower.includes("sell") || lower.includes("source") || lower.includes("research")) {
        replyText = "Leo is conducting real-time market viability analysis. Sifting out high-risk products, focusing strictly on double-digit margin potentials with reliable shipping speeds.";
        briefs = ["📦 Leo: Supplier Sourcing", "💎 Margin Assessment"];
        addLog("LEO NODE: Task assigned // Scrutinizing drop feeds");
        setMilestones(prev => 
          prev.map(m => m.id === "m2" ? { ...m, done: true } : m)
        );
      } else if (lower.includes("support") || lower.includes("whatsapp") || lower.includes("reply") || lower.includes("customer")) {
        replyText = "Yuna is establishing the automated support tunnels. She is integrating active AI prompts with human-in-the-loop support triggers on WhatsApp so you close 85% of abandoned carts.";
        briefs = ["💬 Yuna: WhatsApp Bridge", "🤖 Support Prompt Setup"];
        addLog("YUNA NODE: Task assigned // Bridging WhatsApp webhook");
        setMilestones(prev => 
          prev.map(m => m.id === "m5" ? { ...m, done: true } : m)
        );
      } else if (lower.includes("ad") || lower.includes("marketing") || lower.includes("tiktok") || lower.includes("meta")) {
        replyText = "Amir is cooking up targeted campaigns. Building hyper-focused ad structures on TikTok and Meta, optimized strictly against direct purchases. Fast loop testing begins instantly.";
        briefs = ["📈 Amir: Campaign Framework", "🎯 Pixel Setup Verified"];
        addLog("AMIR NODE: Task assigned // Loading marketing pixels");
        setMilestones(prev => 
          prev.map(m => m.id === "m4" ? { ...m, done: true } : m)
        );
      } else {
        addLog("JACK NODE: Syncing general objectives across squad pools.");
      }

      const jackMsg: Message = {
        id: `jack-${Date.now()}`,
        sender: "jack",
        text: replyText,
        pills: briefs
      };

      setMessages(prev => [...prev, jackMsg]);
    }, 1400);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    // Support standard Enter, Cmd+Enter, and Ctrl+Enter for power users
    if (e.key === "Enter" || (e.key === "Enter" && (e.metaKey || e.ctrlKey))) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePingAgent = (agent: Agent) => {
    addLog(`PINGING NODE // ${agent.name.toUpperCase()} RE-BRIEF REQUESTED...`);
    setToastMessage(`Pinging ${agent.name}...`);
    setTimeout(() => setToastMessage(""), 2000);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const isOnline = agent.status === "ONLINE" || agent.status === "PROCESSING";
      const agentReply: Message = {
        id: `agent-reply-${Date.now()}`,
        sender: "jack",
        text: isOnline 
          ? `[Direct Transmission from ${agent.name}]: "Roger that command room. Currently ${agent.activeWork.toLowerCase()}. Fully synchronized with Jack's guidelines. We are on course."` 
          : `[Node notification]: ${agent.name} is on structural standby. They have already received their brief from Jack and will begin processing very shortly.`,
        pills: [`🎯 Efficiency: ${agent.efficiency}`, `⚡ ${agent.role.split(" ")[0]} Ready`]
      };
      setMessages(prev => [...prev, agentReply]);
      addLog(`${agent.name.toUpperCase()} RESPONSE: Handshake successful.`);
    }, 1000);
  };

  const handleToggleMilestone = (id: string) => {
    setMilestones(prev => 
      prev.map(m => m.id === id ? { ...m, done: !m.done } : m)
    );
    addLog(`MILESTONE MANUAL OVERRIDE: Toggled ID ${id}.`);
  };

  // Quick helper presets
  const handlePresetCommand = (command: string) => {
    setInputValue(command);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 bg-[#0C0C0C] flex flex-col h-screen text-[#D7E2EA] font-sans selection:bg-[#B600A8]/30 selection:text-white"
    >
      
      {/* 1. Header Control Bar */}
      <header className="relative flex-shrink-0 bg-[#0C0C0C] border-b border-white/10 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 z-10 backdrop-blur-md bg-opacity-95">
        
        {/* Left Title Area */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onExit}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D7E2EA]/60 hover:text-white transition-colors border border-white/10 hover:border-white/20 rounded-full px-4 py-2 hover:bg-white/[0.03] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#B600A8]" />
            Exit Operations
          </button>

          <div className="hidden md:block w-[1px] h-6 bg-white/10" />

          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#B600A8] animate-pulse" />
            <span className="text-sm font-black uppercase tracking-[0.2em] text-white">
              NEXVEND <span className="text-[#B600A8] font-normal">// CONTROL CONSOLE</span>
            </span>
          </div>
        </div>

        {/* Central UPLINK status monitoring */}
        <div className="hidden lg:flex items-center gap-6 font-mono text-[11px] text-[#D7E2EA]/50 tracking-wider">
          <div className="flex items-center gap-2 bg-black/40 px-3.5 py-1.5 rounded-md border border-white/5">
            <Radio className="w-3.5 h-3.5 text-[#B600A8]" />
            UPLINK: <span className="text-green-400 font-bold">100% ENCRYPTED</span>
          </div>

          <div className="flex items-center gap-2 bg-black/40 px-3.5 py-1.5 rounded-md border border-white/5">
            <Cpu className="w-3.5 h-3.5 text-[#BE4C00]" />
            LAUNCH TIMELINE: <span className="text-white font-bold">72h COUNTDOWN</span>
          </div>

          <div className="flex items-center gap-2 bg-black/40 px-3.5 py-1.5 rounded-md border border-white/5">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            SQUAD_LOAD: <span className="text-white font-bold">OPTIMAL</span>
          </div>
        </div>

        {/* Brand visual corner watermark */}
        <div className="flex items-center gap-2 font-mono text-[9px] opacity-30 select-none tracking-widest">
          SECURE CONNECTION // PROTOCOL_V3
        </div>

      </header>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        
        {/* Fine background decoration detail */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #D7E2EA 1px, transparent 1px),
              linear-gradient(to bottom, #D7E2EA 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px"
          }}
        />

        {/* 2.1 LEFT SIDEBAR: Active Squad Network */}
        <aside className="w-80 border-r border-white/10 flex-shrink-0 flex-col hidden xl:flex bg-black/10 backdrop-blur-xs select-none">
          
          <div className="p-5 border-b border-white/5">
            <div className="text-[11px] font-mono text-[#D7E2EA]/40 uppercase tracking-[0.2em] mb-1">
              Active Operational Units
            </div>
            <h3 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#B600A8]" />
              The Squad Network
            </h3>
          </div>

          {/* SQUAD MEMBER CARDS */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {squadAgents.map((agent) => {
              const worksAsCurrent = currentAgent.name === agent.name;
              return (
                <div
                  key={agent.name}
                  onClick={() => setCurrentAgent(agent)}
                  className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    worksAsCurrent
                      ? "bg-white/[0.04] border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_20px_rgba(0,0,0,0.3)]"
                      : "bg-[#0C0C0C]/40 border-white/[0.04] hover:bg-white/[0.01] hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar Circle */}
                      <div className={`relative w-9 h-9 rounded-full overflow-hidden border ${agent.avatarColor}`}>
                        <img 
                          src={agent.avatar} 
                          alt={agent.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          {agent.name}
                          {agent.name === "Jack" && <span className="text-[8px] bg-[#B600A8]/20 text-[#B600A8] border border-[#B600A8]/30 rounded px-1">LEAD</span>}
                        </h4>
                        <span className="text-[10px] text-[#D7E2EA]/50 font-light truncate max-w-[150px] inline-block">
                          {agent.role.split(" (")[0]}
                        </span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        agent.status === "ONLINE" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                        agent.status === "PROCESSING" ? "bg-[#B600A8]/10 text-[#B600A8] border border-[#B600A8]/20" :
                        "bg-white/[0.05] text-[#D7E2EA]/40 border border-white/[0.08]"
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                  </div>

                  {/* Micro activity details */}
                  <div className="text-[10px] font-mono text-[#D7E2EA]/40 uppercase tracking-wider pt-2 border-t border-white/[0.03] flex justify-between">
                    <span>Performance</span>
                    <span className="text-[#D7E2EA] font-semibold">{agent.efficiency}</span>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Quick ping panel */}
          <div className="p-4 bg-black/40 border-t border-white/[0.08]">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <h5 className="text-[10px] font-mono text-[#D7E2EA]/40 uppercase tracking-widest mb-1.5">
                Current Select Node Bio
              </h5>
              <div className="text-xs font-bold text-[#D7E2EA] uppercase mb-1">{currentAgent.name} // PROFILE</div>
              <p className="text-[11px] text-[#D7E2EA]/60 font-light leading-relaxed mb-3">
                {currentAgent.description}
              </p>
              <button
                onClick={() => handlePingAgent(currentAgent)}
                className="w-full py-2 bg-[#B600A8]/10 hover:bg-[#B600A8] border border-[#B600A8]/20 hover:border-transparent text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors cursor-pointer"
              >
                Pling {currentAgent.name} Directly
              </button>
            </div>
          </div>

        </aside>

        {/* 2.2 CENTER AREA: Encrypted Conversation Stream (The main engine) */}
        <main className="flex-1 flex flex-col h-full bg-[#0C0C0C]/30 relative overflow-hidden">
          
          {/* Audio Visualizer pattern / top decoration bar */}
          <div className="h-10 bg-black/40 border-b border-white/5 px-6 flex items-center justify-between z-0 select-none">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-[#D7E2EA]/30 uppercase tracking-widest">
                Active Uplink Carrier
              </span>
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-[#B600A8]/50 rounded-full animate-[pulse_1.2s_infinite]" />
                <span className="w-0.5 h-3 bg-[#B600A8] rounded-full animate-[pulse_1.5s_infinite_0.2s]" />
                <span className="w-0.5 h-1 bg-[#B600A8]/30 rounded-full animate-[pulse_1s_infinite_0.4s]" />
                <span className="w-0.5 h-2.5 bg-[#B600A8] rounded-full animate-[pulse_1.3s_infinite_0.1s]" />
              </div>
            </div>

            <div className="text-[10px] font-mono text-[#D7E2EA]/30 uppercase tracking-wider">
              Node: <span className="text-[#D7E2EA]/60">{currentAgent.name.toUpperCase()} / {currentAgent.role.split(" / ")[0].toUpperCase()}</span>
            </div>
          </div>

          {/* Conversation history area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
            
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"} w-full`}
                >
                  {/* Sender title label */}
                  <div className="flex items-center gap-2 mb-1.5 ml-1 select-none">
                    {!isUser && (
                      <div className="relative w-5 h-5 rounded-full overflow-hidden border border-[#B600A8]/30">
                        <img 
                          src="https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png" 
                          alt="Jack Avatar" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <span className="text-[10px] text-[#D7E2EA]/40 font-bold uppercase tracking-widest font-mono">
                      {isUser ? "COGNITIVE_COMMAND (YOU)" : "JACK // COOP_SQUAD"}
                    </span>
                    <span className="text-[9px] text-[#D7E2EA]/20 font-mono tracking-wider">
                      {new Date().toLocaleTimeString().slice(0, 5)}
                    </span>
                  </div>

                  {/* Message bubble styling with ultimate fidelity */}
                  <div
                    className={`px-5 py-4 text-sm leading-relaxed ${
                      isUser
                        ? "bg-gradient-to-br from-[#18011F] via-[#7621B0] to-[#BE4C00] rounded-[24px] rounded-tr-[4px] text-white max-w-[85%] sm:max-w-[70%] shadow-[0_15px_30px_rgba(118,33,176,0.15)] border border-white/5"
                        : "bg-white/[0.04] border border-white/10 rounded-[24px] rounded-tl-[4px] text-[#D7E2EA] max-w-[90%] sm:max-w-[80%]"
                    }`}
                  >
                    <p className={isUser ? "text-white font-normal" : "text-[#D7E2EA]/90 font-light"}>
                      {msg.text}
                    </p>

                    {/* Briefing targets tags underneath responses */}
                    {msg.pills && (
                      <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-col gap-2">
                        <span className="text-[10px] font-mono text-[#D7E2EA]/40 uppercase tracking-widest">
                          Secured Briefing Modules Generated:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {msg.pills.map((pill, idx) => (
                            <div
                              key={idx}
                              className="border border-white/10 bg-black/40 rounded-lg px-3 py-1.5 text-xs text-[#D7E2EA]/90 font-light uppercase tracking-wide flex items-center gap-1 hover:border-white/20 transition-all cursor-default scale-95"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-[#B600A8]" />
                              {pill}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Simulated typing loading indicators */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-start w-full"
              >
                <div className="flex items-center gap-2 mb-1 ml-1 font-mono">
                  <span className="text-[10px] text-[#D7E2EA]/40 font-bold uppercase tracking-widest">
                    JACK IS CALCULATING RESPONSE...
                  </span>
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded-[22px] rounded-tl-[4px] px-5 py-4 flex items-center gap-2">
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="w-2 h-2 rounded-full bg-[#B600A8]" />
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }} className="w-2 h-2 rounded-full bg-[#B600A8]" />
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }} className="w-2 h-2 rounded-full bg-[#B600A8]" />
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick presets buttons panel */}
          <div className="px-6 py-2.5 bg-black/20 border-t border-white/[0.05] flex items-center gap-2.5 overflow-x-auto select-none no-scrollbar">
            <span className="text-[10px] font-mono text-[#D7E2EA]/30 uppercase tracking-widest flex-shrink-0">
              Query Presets:
            </span>
            <button
              onClick={() => handlePresetCommand("What is the current status of Sofia's store building task?")}
              className="px-3.5 py-1.5 bg-[#0C0C0C] border border-white/10 hover:border-white/20 text-xs text-[#D7E2EA]/80 rounded-full transition-all hover:bg-white/[0.02] whitespace-nowrap cursor-pointer"
            >
              📊 Check Store Draft
            </button>
            <button
              onClick={() => handlePresetCommand("Can Leo sync high margin winning products for drop shipping?")}
              className="px-3.5 py-1.5 bg-[#0C0C0C] border border-white/10 hover:border-white/20 text-xs text-[#D7E2EA]/80 rounded-full transition-all hover:bg-white/[0.02] whitespace-nowrap cursor-pointer"
            >
              💎 Sync Sourced Products
            </button>
            <button
              onClick={() => handlePresetCommand("Deploy WhatsApp automatic gateway with Yuna")}
              className="px-3.5 py-1.5 bg-[#0C0C0C] border border-white/10 hover:border-white/20 text-xs text-[#D7E2EA]/80 rounded-full transition-all hover:bg-white/[0.02] whitespace-nowrap cursor-pointer"
            >
              💬 Bridging WhatsApp Bots
            </button>
            <button
              onClick={() => handlePresetCommand("Instruct Amir to deploy Meta dynamic growth vectors")}
              className="px-3.5 py-1.5 bg-[#0C0C0C] border border-white/10 hover:border-white/20 text-xs text-[#D7E2EA]/80 rounded-full transition-all hover:bg-white/[0.02] whitespace-nowrap cursor-pointer"
            >
              📈 Plan Target Ad Campaign
            </button>
          </div>

          {/* Dynamic input messaging bar */}
          <div className="p-5 bg-black/40 border-t border-white/10 flex flex-col gap-3 z-10">
            
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Brief or ask squad leader Jack...`}
                className="flex-1 bg-transparent border border-white/10 rounded-full px-6 py-4 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-white/25 focus:bg-white/[0.01]"
              />

              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="px-7 py-4 rounded-full text-xs text-white font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group transition-shadow"
                style={{
                  background: "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)",
                  boxShadow: "0 4px 15px rgba(182, 0, 168, 0.25)"
                }}
              >
                Deploy Command
                <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-[#D7E2EA]/30 uppercase tracking-widest">
              <div>TRANSMISSION COGNITIVE CHANNEL: SECURED AES-256</div>
              <div>PRESS ENTER KEY FOR SECURE DISPATCH</div>
            </div>

          </div>

        </main>

        {/* 2.3 RIGHT SIDEBAR: Telemetry Log Terminal & Milestone Checkbox */}
        <aside className="w-80 border-l border-white/10 flex-shrink-0 flex-col hidden lg:flex bg-[#0C0C0C]">
          
          {/* Milestone checklist tracker */}
          <div className="p-5 border-b border-white/5 select-none">
            <div className="text-[11px] font-mono text-[#D7E2EA]/40 uppercase tracking-[0.2em] mb-1">
              Mission Directives
            </div>
            <h3 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-1.5">
              <CheckCircle className="w-4.5 h-4.5 text-[#BE4C00]" />
              Action Checklists
            </h3>

            {/* Checkbox lines */}
            <div className="mt-4 flex flex-col gap-2.5">
              {milestones.map((milestone) => (
                <div 
                  key={milestone.id}
                  onClick={() => handleToggleMilestone(milestone.id)}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    milestone.done 
                      ? "bg-[#B600A8] border-[#B600A8] text-white" 
                      : "border-white/25 group-hover:border-[#B600A8]/50"
                  }`}>
                    {milestone.done && <span className="text-[9px] font-bold">✓</span>}
                  </div>
                  <span className={`text-[11.5px] font-light leading-none transition-colors ${
                    milestone.done 
                      ? "text-[#D7E2EA]/40 line-through" 
                      : "text-[#D7E2EA]/85 group-hover:text-white"
                  }`}>
                    {milestone.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* TELEMETRY TERMINAL INTERACTIVE STREAM */}
          <div className="flex-1 flex flex-col min-h-0">
            
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/10 select-none">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-[#B600A8]" />
                <span className="text-xs font-black uppercase text-white tracking-widest">
                  Live Operations Log
                </span>
              </div>
              <span className="text-[9px] font-mono text-green-400 font-bold tracking-widest animate-pulse">
                • STREAMING
              </span>
            </div>

            {/* Log list */}
            <div 
              ref={logEndRef}
              className="flex-1 p-4 overflow-y-auto font-mono text-[10px] text-zinc-400 leading-relaxed bg-[#060606] flex flex-col gap-2.5 scroll-smooth"
            >
              {systemLogs.map((log, idx) => {
                const isHighlight = log.includes("SEC_UPLINK") || log.includes("NODE") || log.includes("CONNECTED");
                return (
                  <div 
                    key={idx} 
                    className={`transition-all ${
                      isHighlight ? "text-[#B600A8]/80 font-bold" : "text-[#D7E2EA]/50"
                    }`}
                  >
                    {log}
                  </div>
                );
              })}
            </div>

            {/* Terminal input panel footer bar for logs reset */}
            <div className="p-4 bg-black/30 border-t border-white/[0.05] flex justify-between items-center select-none">
              <button 
                onClick={() => {
                  setSystemLogs([
                    "FLUSHING OPERATIONS STREAM BUFFER...",
                    "SEC_UPLINK LINK RE-INITIALIZED.",
                    "SQUAD TELEMETRY CHANNELS READY."
                  ]);
                }}
                className="text-[9px] font-mono text-[#D7E2EA]/30 hover:text-white uppercase tracking-widest flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Clear Telemetry Logs
              </button>

              <span className="text-[9px] font-mono text-yellow-500/50">
                BUFFERS: NORMAL
              </span>
            </div>

          </div>

        </aside>

      </div>

      {/* Subtle bottom micro notification toast inside app */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-24 left-1/2 z-50 bg-[#B600A8] text-white px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
