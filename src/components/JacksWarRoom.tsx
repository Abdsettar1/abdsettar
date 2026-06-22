import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu, X, Send, Paperclip, Mic, SquarePen, Users,
  ShoppingBag, MessageCircle, TrendingUp, BarChart2,
  ChevronRight, ArrowRight, Check, AlertCircle, Info,
  ExternalLink, UserCheck, Shield, Laptop, Zap,
  Lock, CheckCircle2, Share2, Copy, ChevronDown
} from "lucide-react";

interface Agent {
  name: string;
  role: string;
  avatar: string;
  status: "active" | "busy";
  avatarColor: string;
}

const squadAgents: Agent[] = [
  {
    name: "Sofia Reyes",
    role: "Store Design",
    avatar: "https://k.top4top.io/p_3823b6zzr1.png",
    status: "active",
    avatarColor: "border-[#BE4C00]"
  },
  {
    name: "Marcus Lee",
    role: "Tech Setup",
    avatar: "https://d.top4top.io/p_382318j801.png",
    status: "busy",
    avatarColor: "border-blue-500"
  },
  {
    name: "Amir Hassan",
    role: "Ad Campaigns",
    avatar: "https://b.top4top.io/p_3823htijt1.png",
    status: "active",
    avatarColor: "border-green-500"
  },
  {
    name: "Yuna Park",
    role: "Customer Support",
    avatar: "https://d.top4top.io/p_38238hz7z1.png",
    status: "active",
    avatarColor: "border-[#7621B0]"
  },
  {
    name: "Leo Dumont",
    role: "Product Research",
    avatar: "https://a.top4top.io/p_3823y9u641.png",
    status: "busy",
    avatarColor: "border-[#B600A8]"
  }
];

interface ChatMessage {
  id: string;
  role: "user" | "jack";
  type: "text" | "assignment";
  content: string;
  agents?: Array<{ name: string; role: string; emoji: string }>;
  timestamp: string;
}

export function JacksWarRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const BACKEND_URL = (((import.meta as any).env?.VITE_BACKEND_URL) || "").replace(/\/$/, "");
  const sessionId = useRef(`session-${Date.now()}-${Math.random()}`);

  const sendToJack = async (messageText: string, isInitial = false) => {
    setIsTyping(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          sessionId: sessionId.current
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const { response: jackResponse } = data;
        
        // Add Jack's message
        const jackMsg: ChatMessage = {
          id: `jack-${Date.now()}`,
          role: 'jack',
          type: jackResponse.assignedAgents && jackResponse.assignedAgents.length > 0 ? 'assignment' : 'text',
          content: jackResponse.message,
          agents: jackResponse.assignedAgents ? jackResponse.assignedAgents.map((a: string) => {
            const parts = a.split(' — ');
            const name = parts[0] || a;
            const role = parts[1] || 'Agent';
            let emoji = '⚡';
            if (name.includes('Sofia')) emoji = '🛍️';
            else if (name.includes('Marcus')) emoji = '⚙️';
            else if (name.includes('Amir')) emoji = '📈';
            else if (name.includes('Yuna')) emoji = '💬';
            else if (name.includes('Leo')) emoji = '🔍';
            return { name, role, emoji };
          }) : [],
          timestamp: getTimestamp()
        };

        setMessages(prev => [...prev, jackMsg]);

        // If store building intent detected, trigger split screen
        if (jackResponse.detectedIntent === 'store' && jackResponse.nextAction === 'collecting-info') {
          setChatMode('collecting-info');
          setBuildStep(1);
          
          setTimeout(() => {
            const guided1: ChatMessage = {
              id: `jack-guided-1-${Date.now()}`,
              role: 'jack',
              type: 'text',
              content: "Perfect. Let's build your store. First — what's your store name?",
              timestamp: getTimestamp()
            };
            setMessages(prev => [...prev, guided1]);
          }, 800);
        }
      } else {
        throw new Error(data.error || "Failed payload");
      }
    } catch (error) {
      console.error("Jack connection failed:", error);
      const fallbackMsg: ChatMessage = {
        id: `jack-fallback-${Date.now()}`,
        role: 'jack',
        type: 'text',
        content: isInitial 
          ? "Operational console initialized. All channels at standby. Tell me a bit about your business goals."
          : 'Squad is currently being briefed. Give me a moment.',
        timestamp: getTimestamp()
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [squadOverlayOpen, setSquadOverlayOpen] = useState(false);
  const [rotatingIndex, setRotatingIndex] = useState(0);
  const [reactions, setReactions] = useState<{ [msgId: string]: { [emoji: string]: number } }>({});

  // States for Live Store Builder
  const [chatMode, setChatMode] = useState<"normal" | "collecting-info" | "building" | "store-ready">("normal");
  const [buildStep, setBuildStep] = useState<1 | 2 | 3 | 4>(1);
  const [storeInfo, setStoreInfo] = useState<{ name: string; niche: string; colorTheme: string; language: string }>({
    name: "",
    niche: "",
    colorTheme: "",
    language: ""
  });
  const [showPreview, setShowPreview] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [singleCopiedId, setSingleCopiedId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 300;
    setShowScrollBottom(isScrolledUp);
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleReact = (msgId: string, emoji: string) => {
    setReactions(prev => {
      const msgReactions = prev[msgId] || {};
      const currentCount = msgReactions[emoji] || 0;
      return {
        ...prev,
        [msgId]: {
          ...msgReactions,
          [emoji]: currentCount > 0 ? 0 : 1
        }
      };
    });
  };

  // Rotating answers list
  const rotatingReplies = [
    "On it. I'm updating the squad now.",
    "Noted. Leo is already on it.",
    "Sofia's been briefed. Expect an update within the hour.",
    "Yuna will handle this on WhatsApp starting now.",
    "Amir is adjusting the campaign based on your input."
  ];

  // Utility to generate formatted timestamp
  const getTimestamp = () => {
    const timeStr = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `TODAY, ${timeStr}`;
  };

  // Mobile vs Desktop Detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Intent Detection Helper
  const detectStoreIntent = (text: string) => {
    const lowercase = text.toLowerCase();
    const keywords = ["store", "shop", "متجر", "dropshipping", "launch", "build", "create a store", "e-commerce site"];
    return keywords.some(kw => lowercase.includes(kw));
  };

  // Time Formatter
  const formatTime = (secs: number) => {
    const mm = String(Math.floor(secs / 60)).padStart(2, "0");
    const ss = String(secs % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const buildStepsTexts = [
    "Designing homepage layout...",
    "Setting up product pages...",
    "Configuring checkout flow...",
    "Adding your brand colors...",
    "Connecting payment gateway...",
    "Final touches..."
  ];

  // Timer and progress loop for the Live Builder
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (chatMode === "building") {
      setElapsedTime(0);
      setBuildProgress(0);
      interval = setInterval(() => {
        setElapsedTime(prev => {
          const nextTime = prev + 1;
          const pct = Math.min((nextTime / 45) * 100, 100);
          setBuildProgress(pct);

          if (nextTime >= 45) {
            clearInterval(interval);
            setChatMode("store-ready");
            
            // Send Jack's store ready message
            const finalReply: ChatMessage = {
              id: `jack-ready-msg-${Date.now()}`,
              role: "jack",
              type: "text",
              content: "Your store is live. Sofia nailed it. Visit it using the link in the preview panel, or I can connect Yuna to handle customer messages now. What's next?",
              timestamp: getTimestamp()
            };
            setMessages(prevMsgs => [...prevMsgs, finalReply]);
          }
          return nextTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [chatMode]);

  // Initial stream setup on mount
  useEffect(() => {
    // 1. Fetch initial message from location state or fallback
    const stateVal = location.state as { initialMessage?: string } | null;
    const initialPrompt = stateVal?.initialMessage || "Connect to active operational squad.";

    // 2. Add User message instantly
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      type: "text",
      content: initialPrompt,
      timestamp: getTimestamp()
    };
    setMessages([userMsg]);

    // 3. Command Jack on backend
    sendToJack(initialPrompt, true);
  }, []);

  // Scroll to bottom helper
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle Send Messaging
  const handleSendMessage = () => {
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue.trim();
    const userMsg: ChatMessage = {
      id: `user-msg-${Date.now()}`,
      role: "user",
      type: "text",
      content: userText,
      timestamp: getTimestamp()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");

    if (chatMode === "normal") {
      sendToJack(userText);
      return;
    }

    if (chatMode === "collecting-info") {
      setIsTyping(true);
      setTimeout(async () => {
        setIsTyping(false);
        const currentStep = buildStep;
        let replyContent = "";

        if (currentStep === 1) {
          setStoreInfo(prev => ({ ...prev, name: userText }));
          setBuildStep(2);
          replyContent = "Great name. What niche or products will you sell? (e.g. fashion, electronics, supplements)";
          
          const jackMsg: ChatMessage = {
            id: `jack-guided-2-${Date.now()}`,
            role: "jack",
            type: "text",
            content: replyContent,
            timestamp: getTimestamp()
          };
          setMessages(prev => [...prev, jackMsg]);
        } else if (currentStep === 2) {
          setStoreInfo(prev => ({ ...prev, niche: userText }));
          setBuildStep(3);
          replyContent = "Got it. What's your preferred color theme? (e.g. dark luxury, clean white, bold orange)";
          
          const jackMsg: ChatMessage = {
            id: `jack-guided-3-${Date.now()}`,
            role: "jack",
            type: "text",
            content: replyContent,
            timestamp: getTimestamp()
          };
          setMessages(prev => [...prev, jackMsg]);
        } else if (currentStep === 3) {
          setStoreInfo(prev => ({ ...prev, colorTheme: userText }));
          setBuildStep(4);
          replyContent = "Last one — what language should the store be in?";
          
          const jackMsg: ChatMessage = {
            id: `jack-guided-4-${Date.now()}`,
            role: "jack",
            type: "text",
            content: replyContent,
            timestamp: getTimestamp()
          };
          setMessages(prev => [...prev, jackMsg]);
        } else if (currentStep === 4) {
          const finalInfo = { ...storeInfo, language: userText };
          setStoreInfo(prev => ({ ...prev, language: userText }));
          replyContent = `All set. Sofia is designing your store now with a custom theme matching '${finalInfo.colorTheme}'. Watch it come to life →`;
          
          const jackMsg: ChatMessage = {
            id: `jack-guided-5-${Date.now()}`,
            role: "jack",
            type: "text",
            content: replyContent,
            timestamp: getTimestamp()
          };
          setMessages(prev => [...prev, jackMsg]);

          setTimeout(() => {
            setShowPreview(true);
            setChatMode("building");
          }, 300);

          try {
            const resp = await fetch(`${BACKEND_URL}/api/analyze`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                storeName: finalInfo.name,
                niche: finalInfo.niche,
                colorTheme: finalInfo.colorTheme,
                language: finalInfo.language
              })
            });
            const data = await resp.json();
            if (data.success && data.brief) {
              const { brief } = data;
              setTimeout(() => {
                const briefMsg: ChatMessage = {
                  id: `jack-brief-${Date.now()}`,
                  role: "jack",
                  type: "assignment",
                  content: `Squad brief completed for ${finalInfo.name}: "${brief.storeBrief || ''}"`,
                  agents: (brief.assignedTeam || []).map((t: any) => {
                    let emoji = '⚡';
                    if (t.agent.includes('Sofia')) emoji = '🛍️';
                    else if (t.agent.includes('Marcus')) emoji = '⚙️';
                    else if (t.agent.includes('Leo')) emoji = '🔍';
                    return { name: t.agent, role: t.task, emoji };
                  }),
                  timestamp: getTimestamp()
                };
                setMessages(prev => [...prev, briefMsg]);
              }, 4000);
            }
          } catch (e) {
            console.error("API Analyze failure:", e);
          }
        }
      }, 1000);
      return;
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    // Support standard Enter, Cmd+Enter, and Ctrl+Enter for power users
    if (e.key === "Enter" || (e.key === "Enter" && (e.metaKey || e.ctrlKey))) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartFreshChat = () => {
    const freshWelcome: ChatMessage = {
      id: `jack-fresh-${Date.now()}`,
      role: "jack",
      type: "text",
      content: "Operational slate cleared. All nodes have been recycled back to standby. Enter your next target directive below.",
      timestamp: getTimestamp()
    };
    setMessages([freshWelcome]);
  };

  const handleShareLink = () => {
    const fakeUrl = `https://nexvend.store/${storeInfo.name ? storeInfo.name.toLowerCase().replace(/\s+/g, "-") : "preview"}`;
    navigator.clipboard.writeText(fakeUrl);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const previewVariants = {
    hidden: isMobile ? { y: "100%", x: 0 } : { x: "100%", y: 0 },
    visible: { 
      x: 0, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1] as any
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 bg-[#0C0C0C] h-screen overflow-hidden flex flex-col text-[#D7E2EA] font-sans"
    >
      {/* Noise Texture Overlay */}
      <div 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
          position: 'fixed',
          inset: 0,
          zIndex: 99
        }}
      />
      
      {/* 1. TOP BAR */}
      <header 
        className="fixed top-0 left-0 right-0 h-14 bg-gradient-to-b from-[#080808]/90 to-[#080808]/80 backdrop-blur-3xl z-50 flex items-center justify-between px-4 sm:px-6"
        style={{
          borderBottom: '1px solid rgba(215,226,234,0.06)',
          borderTop: '1px solid rgba(215,226,234,0.04)',
        }}
      >
        
        {/* Left Side */}
        <div className="flex items-center gap-3">
          {/* Hamburger (Mobile) */}
          <button 
            onClick={() => setSidebarOpen(prev => !prev)}
            className="md:hidden p-1 text-[#D7E2EA]/60 hover:text-white transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Logo Brand */}
          <div 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="relative w-6 h-6 rounded bg-gradient-to-tr from-[#18011F] to-[#B600A8] flex items-center justify-center border border-white/5">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold uppercase tracking-[0.2em] text-sm sm:text-base hero-heading bg-gradient-to-r from-white to-[#D7E2EA]/40">
              NEXVEND <span className="text-[#B600A8] font-normal">// OPS</span>
            </span>
          </div>
        </div>

        {/* Center - Jack status */}
        <div className="flex items-center gap-2 bg-[#0C0C0C]/50 px-3 py-1 rounded-full border border-white/5">
          <div 
            className="relative w-9 h-9 rounded-full overflow-hidden border border-[#D7E2EA]/20 transition-all duration-300"
            style={{
              boxShadow: isTyping 
                ? '0 0 15px rgba(182,0,168,0.8), 0 0 0 2px rgba(182,0,168,0.6)' 
                : '0 0 0 2px rgba(182,0,168,0.4)',
              transition: 'box-shadow 0.3s ease'
            }}
          >
            <img 
              src="https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png" 
              alt="Jack Avatar" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-[#D7E2EA] flex items-center gap-1.5 leading-none">
              JACK
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 leading-none">
              <div style={{ position: 'relative', width: 6, height: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div
                  animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ position: 'absolute', inset: -3, borderRadius: '50%', background: '#4ade80' }}
                />
                <div style={{ position: 'relative', width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
              </div>
              <span className="text-[9px] text-[#D7E2EA]/30 font-light uppercase tracking-widest">Squad Leader</span>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Squad Button with Motion glow */}
          <motion.button 
            onClick={() => setSquadOverlayOpen(true)}
            whileHover={{ 
              boxShadow: "0 0 12px rgba(182,0,168,0.3)",
              borderColor: "rgba(182,0,168,0.5)",
              color: "#ffffff"
            }}
            whileTap={{ scale: 0.96 }}
            className="border border-[#D7E2EA]/15 rounded-full px-3 py-1 text-[10px] sm:text-xs text-[#D7E2EA]/60 uppercase tracking-widest hover:text-white transition-all cursor-pointer select-none"
          >
            Squad
          </motion.button>

          {/* New Chat Icon Button */}
          <button 
            onClick={handleStartFreshChat}
            title="Clear Conversation"
            className="w-8 h-8 flex items-center justify-center text-[#D7E2EA]/50 hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer"
          >
            <SquarePen className="w-4 h-4" />
          </button>

          {/* Close X Button */}
          <button 
            onClick={() => navigate("/")}
            title="Exit Workspace"
            className="w-8 h-8 flex items-center justify-center text-[#D7E2EA]/40 hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </header>

      {/* 2. MAIN CONTAINER AREA */}
      <div className="flex-1 flex overflow-hidden pt-14 relative">
        
        {/* Backdrop overlay for mobile sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
            />
          )}
        </AnimatePresence>

        {/* LEFT SIDEBAR (Upgraded Ops styling) */}
        <aside 
          className={`
            fixed md:relative top-0 bottom-0 left-0 w-64 pt-14 md:pt-0 z-40 md:z-20
            transition-transform duration-300 ease-in-out select-none flex flex-col h-full
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
          style={{
            background: 'rgba(255,255,255,0.015)',
            borderRight: '1px solid rgba(215,226,234,0.06)',
            backdropFilter: 'blur(10px)'
          }}
        >
          
          <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-6 scrollbar-thin">
            
            {/* Section 1 - Active Squad */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 10, color: 'rgba(215,226,234,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>
                  ACTIVE SQUAD
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(215,226,234,0.06)' }} />
              </div>
              
              <div className="space-y-1.5">
                {squadAgents.map((agent) => (
                  <motion.div
                    key={agent.name}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)', x: 2, borderColor: 'rgba(215,226,234,0.08)' }}
                    onClick={() => {
                      setInputValue(`Instruct ${agent.name} regarding target details...`);
                      setSidebarOpen(false);
                    }}
                    transition={{ duration: 0.15 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', borderRadius: 12, cursor: 'pointer',
                      border: '1px solid transparent',
                    }}
                  >
                    {/* Avatar with status ring */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img 
                        src={agent.avatar}
                        alt={agent.name}
                        referrerPolicy="no-referrer"
                        style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover',
                        border: '1.5px solid rgba(215,226,234,0.12)' }} 
                      />
                      {/* Status dot — bottom right of avatar */}
                      <div style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: 9, height: 9, borderRadius: '50%',
                        background: agent.status === 'active' ? '#4ade80' : '#fbbf24',
                        border: '1.5px solid #0C0C0C'
                      }} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(215,226,234,0.8)',
                        textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.2 }}>
                        {agent.name.split(" ")[0]}
                      </div>
                      <div className="truncate" style={{ fontSize: 10, color: 'rgba(215,226,234,0.3)',
                        fontWeight: 300, marginTop: 1 }}>
                        {agent.role}
                      </div>
                    </div>

                    {/* Activity indicator */}
                    {agent.status === 'active' && (
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                        style={{ fontSize: 9, color: '#4ade80', textTransform: 'uppercase',
                          letterSpacing: '0.08em', fontWeight: 300 }}
                      >
                        working
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Section 2 - Mission Status */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 10, color: 'rgba(215,226,234,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>
                  MISSION STATUS
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(215,226,234,0.06)' }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {/* Tasks Stat card */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(215,226,234,0.07)',
                  borderRadius: 10, padding: '8px 10px' }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: 'rgba(215,226,234,0.8)', lineHeight: 1 }}>
                    6
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(215,226,234,0.3)', textTransform: 'uppercase',
                    letterSpacing: '0.08em', fontWeight: 300, marginTop: 2 }}>
                    Tasks
                  </div>
                </div>
                {/* ETA card */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(215,226,234,0.07)',
                  borderRadius: 10, padding: '8px 10px' }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#B600A8', lineHeight: 1 }}>72h</div>
                  <div style={{ fontSize: 9, color: 'rgba(215,226,234,0.3)', textTransform: 'uppercase',
                    letterSpacing: '0.08em', fontWeight: 300, marginTop: 2 }}>ETA</div>
                </div>
              </div>

              {/* Store Status — full width */}
              <div style={{ background: 'rgba(182,0,168,0.08)', border: '1px solid rgba(182,0,168,0.2)',
                borderRadius: 10, padding: '7px 12px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginTop: 6 }}>
                <span style={{ fontSize: 10, color: 'rgba(215,226,234,0.5)', textTransform: 'uppercase',
                  letterSpacing: '0.08em' }}>Store Status</span>
                <span style={{ fontSize: 10, color: '#B600A8', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.06em' }}>
                  {chatMode === "store-ready" ? "Live ✓" : chatMode === "building" ? "Building..." : "In Progress"}
                </span>
              </div>
            </div>

            {/* Section 3 - Quick Actions */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 10, color: 'rgba(215,226,234,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>
                  QUICK ACTIONS
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(215,226,234,0.06)' }} />
              </div>

              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: "Launch Store", icon: ShoppingBag, color: "#BE4C00", text: "Sofia, launch custom store wireframe drafting immediately." },
                  { label: "WhatsApp Setup", icon: MessageCircle, color: "#7621B0", text: "Setup WhatsApp agent response workflows with Yuna" },
                  { label: "Find Products", icon: TrendingUp, color: "#B600A8", text: "Query high profit drop sourcing with Leo Dumont" },
                  { label: "Run Ads", icon: BarChart2, color: "#22c55e", text: "Ask Amir to initiate targeted growth funnels" }
                ].map((action) => (
                  <motion.button
                    key={action.label}
                    onClick={() => setInputValue(action.text)}
                    whileHover={{ borderColor: 'rgba(182,0,168,0.3)', backgroundColor: 'rgba(182,0,168,0.06)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                      padding: '9px 12px', borderRadius: 10,
                      border: '1px solid rgba(215,226,234,0.07)',
                      background: 'rgba(255,255,255,0.02)',
                      cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    <action.icon size={13} color={action.color} />
                    <span style={{ fontSize: 11, color: 'rgba(215,226,234,0.55)', textTransform: 'uppercase',
                      letterSpacing: '0.08em', fontWeight: 300 }}>
                      {action.label}
                    </span>
                    <ArrowRight size={10} color="rgba(215,226,234,0.15)" style={{ marginLeft: 'auto' }} />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Section 4 - Chat History */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 10, color: 'rgba(215,226,234,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>
                  PREVIOUS CHATS
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(215,226,234,0.06)' }} />
              </div>
              
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl hover:bg-white/[0.03] transition-all cursor-pointer flex flex-col gap-1 border border-transparent hover:border-white/5">
                  <div className="text-xs text-[#D7E2EA]/75 font-medium truncate">Store Launch Plan</div>
                  <div className="text-[10px] text-[#D7E2EA]/25 truncate font-light">Sofia is working on the...</div>
                  <div className="text-[9px] text-[#D7E2EA]/20 font-mono text-right mt-0.5">2d ago</div>
                </div>

                <div className="p-2.5 rounded-xl hover:bg-white/[0.03] transition-all cursor-pointer flex flex-col gap-1 border border-transparent hover:border-white/5">
                  <div className="text-xs text-[#D7E2EA]/75 font-medium truncate">WhatsApp Integration</div>
                  <div className="text-[10px] text-[#D7E2EA]/25 truncate font-light">Yuna confirmed setup...</div>
                  <div className="text-[9px] text-[#D7E2EA]/20 font-mono text-right mt-0.5">5d ago</div>
                </div>

                <div className="p-2.5 rounded-xl hover:bg-white/[0.03] transition-all cursor-pointer flex flex-col gap-1 border border-transparent hover:border-white/5">
                  <div className="text-xs text-[#D7E2EA]/75 font-medium truncate">Product Research</div>
                  <div className="text-[10px] text-[#D7E2EA]/25 truncate font-light">Leo found 3 winners...</div>
                  <div className="text-[9px] text-[#D7E2EA]/20 font-mono text-right mt-0.5">1w ago</div>
                </div>
              </div>
            </div>

          </div>

          {/* User Badge Info Block */}
          <div className="p-4 bg-black/40 border-t border-[#D7E2EA]/6 select-none flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#D7E2EA]/30 uppercase tracking-widest">
              OP_NODE // ACTIVE
            </span>
            <span className="text-[10px] font-mono text-[#B600A8] font-bold">
              SYS_GOOD
            </span>
          </div>

        </aside>

        {/* MAIN CHAT AREA VIEW */}
        <main className={`flex-1 flex relative h-full overflow-hidden ${showPreview ? "flex-col md:flex-row" : "flex-col"}`}>
          {/* Subtle radial glow behind chat area */}
          <div 
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(182,0,168,0.04) 0%, transparent 70%)',
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 0
            }}
          />
          
          {/* LEFT CHAT CONVERSATION PANEL */}
          <div className={`flex flex-col relative h-full overflow-hidden transition-all duration-500 ease-[0.25,0.1,0.25,1] ${
            showPreview ? "w-full md:w-[40%] bg-[#0C0C0C]" : "w-full"
          }`}>

            {/* Status Pill for store building process */}
            {(chatMode === "building" || chatMode === "store-ready") && (
              <div className="px-4 sm:px-6 md:px-10 lg:px-16 pt-4 flex-shrink-0 flex justify-center md:justify-start">
                <div 
                  className={`rounded-full px-3 py-1 flex items-center gap-2 border transition-all ${
                    chatMode === "store-ready" 
                      ? "bg-green-500/10 border-green-500/30" 
                      : "bg-[#B600A8]/10 border-[#B600A8]/30"
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    {chatMode === "building" && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B600A8] opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${chatMode === "store-ready" ? "bg-green-500" : "bg-[#B600A8]"}`}></span>
                  </span>
                  <span className={`text-[10px] uppercase tracking-widest font-light font-sans ${chatMode === "store-ready" ? "text-green-400" : "text-[#D7E2EA]/70"}`}>
                    {chatMode === "store-ready" ? "Store is live! ✓" : "Sofia is building your store..."}
                  </span>
                </div>
              </div>
            )}
          
            {/* Chat Messages Stream */}
            <div 
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 lg:px-16 py-6 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 select-none pb-24"
            >
              
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                
                if (isUser) {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                      className="flex flex-col items-end w-full"
                    >
                      <div 
                        className="max-w-[85%] sm:max-w-[70%] md:max-w-[60%] px-5 py-3.5 border border-white/5"
                        style={{
                          background: "linear-gradient(135deg, #18011F 0%, #B600A8 50%, #7621B0 100%)",
                          borderRadius: '18px 18px 4px 18px',
                          boxShadow: '0 4px 24px rgba(182,0,168,0.25), 0 1px 0 rgba(255,255,255,0.05) inset'
                        }}
                      >
                        <p className="text-white text-sm sm:text-[14px] font-normal leading-relaxed whitespace-pre-wrap font-sans">
                          {msg.content}
                        </p>
                        
                        <span className="block text-right mt-1.5 text-[9px] text-white/40 font-mono uppercase tracking-wider">
                          {msg.timestamp}
                        </span>
                      </div>
                    </motion.div>
                  );
                }

                // Rendering Jack's custom message type
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="flex gap-3 w-full items-start"
                  >
                    {/* Jack Avatar */}
                    <div 
                      className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-0.5"
                      style={{
                        border: '1.5px solid rgba(182,0,168,0.4)',
                        boxShadow: '0 0 12px rgba(182,0,168,0.2)'
                      }}
                    >
                      <img 
                        src="https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png" 
                        alt="Jack Avatar" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col max-w-[90%] sm:max-w-[80%] md:max-w-[70%] relative group">
                      
                      {/* Hover Reaction Panel */}
                      <div className="absolute right-4 -top-3.5 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto flex items-center gap-1 bg-[#121212]/95 border border-[#D7E2EA]/20 rounded-full py-0.5 px-1.5 shadow-lg shadow-black/80 backdrop-blur-md">
                        {["👍", "🚀", "❤️", "🔥", "😮"].map((emoji) => {
                          const isReacted = (reactions[msg.id]?.[emoji] || 0) > 0;
                          return (
                            <button
                              key={emoji}
                              onClick={() => handleReact(msg.id, emoji)}
                              className={`w-6.5 h-6.5 flex items-center justify-center text-[13px] rounded-full transition-all cursor-pointer active:scale-90 ${
                                isReacted ? "bg-[#B600A8]/30 border border-[#B600A8]/50 text-white" : "hover:bg-white/10 text-white/70 hover:text-white"
                              }`}
                            >
                              {emoji}
                            </button>
                          );
                        })}
                      </div>

                      {/* Copy action next to message / right of Jack messages */}
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                          setSingleCopiedId(msg.id);
                          setCopiedToast(true);
                          setTimeout(() => {
                            setSingleCopiedId(null);
                            setCopiedToast(false);
                          }, 2000);
                        }}
                        className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-[#121212] hover:border-white/15 text-[#D7E2EA]/40 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer hidden sm:block z-20"
                        title="Copy Message"
                      >
                        {singleCopiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Message Bubble container with brief left pulse border focus */}
                      <motion.div 
                        initial={{ borderLeftColor: "#B600A8", borderLeftWidth: "3px" }}
                        animate={{ borderLeftColor: "rgba(215,226,234,0.08)", borderLeftWidth: "1px" }}
                        transition={{ duration: 1.2 }}
                        className="rounded-[18px] rounded-tl-[4px] px-5 py-4 border-t border-r border-b"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          borderTopColor: 'rgba(215,226,234,0.08)',
                          borderRightColor: 'rgba(215,226,234,0.08)',
                          borderBottomColor: 'rgba(215,226,234,0.08)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 2px 16px rgba(0,0,0,0.2)'
                        }}
                      >
                        <p className="text-[#D7E2EA]/95 text-sm sm:text-[14px] font-light leading-relaxed whitespace-pre-wrap font-sans">
                          {msg.content}
                        </p>

                        {/* Rendering core task assignments */}
                        {msg.type === "assignment" && msg.agents && (
                          <div 
                            className="p-4 mt-3.5 space-y-3"
                            style={{
                              background: 'rgba(182,0,168,0.05)',
                              border: '1px solid rgba(182,0,168,0.15)',
                              borderRadius: 14,
                            }}
                          >
                            <div className="text-[10px] text-[#B600A8] font-bold tracking-[0.12em] uppercase">
                              ⚡ SQUAD BRIEFING TARGETS
                            </div>
                            
                            <div className="flex flex-wrap gap-2 pt-1">
                              {msg.agents.map((agent, index) => (
                                <div
                                  key={index}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(215,226,234,0.1)',
                                    borderRadius: 999,
                                    padding: '5px 10px 5px 6px'
                                  }}
                                  className="transition-all hover:bg-white/[0.08]"
                                >
                                  <span className="text-sm">{agent.emoji}</span>
                                  <div>
                                    <div style={{ fontSize: 11, color: 'rgba(215,226,234,0.7)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.2 }}>
                                      {agent.name.split(" ")[0]}
                                    </div>
                                    <div style={{ fontSize: 10, color: 'rgba(215,226,234,0.3)', fontWeight: 300, lineHeight: 1 }}>
                                      {agent.role}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </motion.div>

                      {/* Active reactions container */}
                      {reactions[msg.id] && Object.entries(reactions[msg.id]).some(([_, count]) => (count as number) > 0) && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5 pl-1.5">
                          {Object.entries(reactions[msg.id]).map(([emoji, count]) => {
                            if ((count as number) <= 0) return null;
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleReact(msg.id, emoji)}
                                className="flex items-center gap-1 bg-[#B600A8]/15 hover:bg-[#B600A8]/25 border border-[#B600A8]/40 rounded-full px-2 py-0.5 text-xs text-white transition-all cursor-pointer"
                              >
                                <span>{emoji}</span>
                                <span className="text-[10px] font-bold text-white/50">1</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <span className="text-[10px] text-[#D7E2EA]/20 font-mono mt-1.5 uppercase tracking-wider pl-1 font-semibold block">
                        {msg.timestamp}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {/* Live Typing Thinking Indicator dots */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    key="typing-indicator"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-3 w-full items-start"
                  >
                    <div 
                      className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-0.5"
                      style={{
                        border: '1.5px solid rgba(182,0,168,0.4)',
                        boxShadow: '0 0 12px rgba(182,0,168,0.2)'
                      }}
                    >
                      <img 
                        src="https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png" 
                        alt="Jack Avatar" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div 
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(215,226,234,0.08)',
                        borderRadius: '4px 18px 18px 18px',
                        padding: '14px 18px',
                        display: 'flex',
                        gap: 5,
                        alignItems: 'center'
                      }}
                      className="shadow-md"
                    >
                      {[0, 0.2, 0.4].map((delay, idx) => (
                        <motion.span 
                          key={idx}
                          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4], scale: [1, 1.15, 1] }}
                          transition={{ repeat: Infinity, duration: 1.2, delay: delay, ease: "easeInOut" }}
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: 'rgba(182,0,168,0.7)',
                            display: 'inline-block'
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Float Scroll-to-bottom and Copied Toasts over chat column */}
            <AnimatePresence>
              {showScrollBottom && (
                <motion.button
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-28 right-6 z-40 bg-[#0C0C0C]/90 border border-white/10 hover:border-[#B600A8]/50 hover:bg-white/[0.05] text-[#D7E2EA]/70 hover:text-white p-2.5 rounded-full shadow-lg backdrop-blur-md transition-all cursor-pointer flex items-center justify-center"
                >
                  <ChevronDown className="w-5 h-5 animate-pulse" />
                </motion.button>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {copiedToast && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute bottom-28 left-6 z-40 bg-[#121212]/95 border border-[#B600A8]/40 shadow-xl rounded-xl px-4 py-2 flex items-center gap-2 backdrop-blur-md"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest text-[#D7E2EA] font-semibold">Message Copied</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* INPUT DISPATCH BAR (Upgraded glass layout) */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0C0C0C] via-[#0C0C0C]/95 to-[#0C0C0C]/80 border-t border-white/[0.06] backdrop-blur-3xl flex flex-col justify-center px-4 sm:px-6 md:px-10 lg:px-16 py-3.5 z-10 select-none"
              style={{ height: 92 }}
            >
              
              <div className="w-full flex items-center gap-3">
                {/* Attachment Clip */}
                <button 
                  title="Attach Document"
                  className="p-2 text-[#D7E2EA]/40 hover:text-white hover:bg-white/5 transition-all cursor-pointer rounded-lg flex-shrink-0"
                >
                  <Paperclip className="w-4.5 h-4.5" />
                </button>

                {/* Message Field Input with custom purple glow ring on focus */}
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Jack to build an e-commerce store..."
                  className="flex-1 bg-white/[0.02] border border-white/10 rounded-[14px] px-5 py-2.5 text-sm text-[#D7E2EA] placeholder-[#D7E2EA]/30 outline-none focus:border-[#B600A8] focus:bg-white/[0.04] focus:ring-3 focus:ring-[#B600A8]/10 transition-all"
                />

                {/* Audio Mic Button */}
                <button 
                  title="Microphone Dictation"
                  className="p-2 text-[#D7E2EA]/40 hover:text-white hover:bg-white/5 transition-all cursor-pointer rounded-lg flex-shrink-0"
                >
                  <Mic className="w-4.5 h-4.5" />
                </button>

                {/* Submit Command with Framer Motion glow pulse on value change */}
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed group flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #18011F 0%, #B600A8 50%, #7621B0 100%)"
                  }}
                  animate={inputValue.trim() && !isTyping ? {
                    boxShadow: [
                      "0 0 4px rgba(182,0,168,0.25)",
                      "0 0 16px rgba(182,0,168,0.55)",
                      "0 0 4px rgba(182,0,168,0.25)"
                    ],
                    scale: [1, 1.03, 1]
                  } : {
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.6,
                    ease: "easeInOut"
                  }}
                >
                  <Send className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </motion.button>
              </div>

              {/* Character Counter & Keyboard shortcut block bar */}
              <div className="flex items-center justify-between mt-2 px-1 text-[9px] text-[#D7E2EA]/20 font-mono tracking-wider">
                <span>⌨ CHARACTERS: {inputValue.length}</span>
                <span className="hidden sm:inline">⚡ PRESS ENTER TO DISPATCH COMMAND // ESC TO CLEAR</span>
              </div>

            </div>

          </div>  {/* END OF LEFT CONVERSATION PANEL */}

          {/* RIGHT LIVE PREVIEW PANEL */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                variants={previewVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="fixed bottom-0 left-0 right-0 h-[60vh] md:h-full z-50 md:z-auto md:relative md:bottom-auto md:left-auto md:right-auto md:w-[60%] bg-[#080808] border-t md:border-t-0 md:border-l border-[#D7E2EA]/10 md:border-[#D7E2EA]/8 rounded-t-[24px] md:rounded-t-none flex flex-col overflow-hidden shadow-2xl md:shadow-none"
              >
                {/* Mobile pull handle */}
                {isMobile && (
                  <div className="py-2.5 flex-shrink-0">
                    <div className="w-12 h-1 rounded-full bg-[#D7E2EA]/20 mx-auto" />
                  </div>
                )}

                {/* Preview Top Bar */}
                <div className="h-10 bg-white/[0.02] border-b border-[#D7E2EA]/6 flex items-center justify-between px-4 flex-shrink-0">
                  {/* Left side - 3 macOS window dots */}
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                  </div>

                  {/* Center - Fake URL address bar */}
                  <div className="bg-white/[0.04] border border-[#D7E2EA]/8 rounded-full px-4 py-1 max-w-[200px] flex items-center gap-2 select-none">
                    <Lock className="w-3 h-3 text-[#D7E2EA]/30" />
                    <span className="text-xs text-[#D7E2EA]/30 font-light truncate">nexvend.store/preview</span>
                  </div>

                  {/* Right side - progress status */}
                  <div className="flex items-center gap-2 select-none">
                    <span className="text-[10px] text-[#B600A8] uppercase tracking-widest font-medium">LIVE BUILD</span>
                    <motion.span 
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                      className="w-2 h-2 rounded-full bg-[#B600A8]"
                    />
                    {isMobile && (
                      <button 
                        onClick={() => setShowPreview(false)}
                        className="ml-2 p-1 rounded-full hover:bg-white/10 text-[#D7E2EA]/40 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Video/Preview Container */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    flex: 1,
                    overflow: 'hidden',
                    background: '#080808',
                  }}
                >
                  
                  {/* Video loop */}
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  >
                    <source
                      src="https://56h9vhffu8.ucarecd.net/07714f09-0092-488e-8440-018fe29e129c/originalb9fb6ceb07693fa44427852f103beb62.mp4"
                      type="video/mp4"
                    />
                  </video>

                  {/* Gradient overlay */}
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "linear-gradient(to top, rgba(8,8,8,0.4) 0%, transparent 40%, transparent 60%, rgba(8,8,8,0.2) 100%)"
                    }}
                  />

                  {/* Bottom info bar */}
                  {chatMode === "building" && (
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-10">
                      {/* Left: build step with smooth cycle transition */}
                      <div className="h-5 flex items-center">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={Math.min(Math.floor(elapsedTime / 8), 5)}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.4 }}
                            className="text-xs text-[#D7E2EA]/70 font-light uppercase tracking-widest truncate"
                          >
                            {buildStepsTexts[Math.min(Math.floor(elapsedTime / 8), 5)]}
                          </motion.span>
                        </AnimatePresence>
                      </div>

                      {/* Right: elapsed timer */}
                      <span className="text-xs text-[#D7E2EA]/40 font-light font-mono select-none">
                        {formatTime(elapsedTime)}
                      </span>
                    </div>
                  )}

                  {/* Build progress bar */}
                  {chatMode === "building" && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5 z-20 overflow-hidden">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 45, ease: "linear" }}
                        className="bg-gradient-to-r from-[#B600A8] to-[#7621B0] h-full rounded-r"
                      />
                    </div>
                  )}

                  {/* "STORE READY" OVERLAY */}
                  <AnimatePresence>
                    {chatMode === "store-ready" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 bg-[#080808]/95 z-30 flex flex-col items-center justify-center p-6"
                      >
                        <div className="flex flex-col items-center max-w-sm text-center gap-6">
                          
                          {/* Success tick with spring bounce */}
                          <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          >
                            <CheckCircle2 className="w-16 h-16 text-[#28C840]" />
                          </motion.div>

                          {/* Heading */}
                          <div className="space-y-2">
                            <h2 className="hero-heading bg-gradient-to-r from-white via-[#D7E2EA] to-[#D7E2EA]/40 font-black uppercase text-2xl sm:text-3xl tracking-tight leading-none text-center">
                              Your Store is Live.
                            </h2>
                            <p className="text-[#D7E2EA]/50 font-light text-sm">
                              nexvend.store/{storeInfo.name ? storeInfo.name.toLowerCase().replace(/\s+/g, '-') : 'live'}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center justify-center gap-3">
                            <button
                              onClick={() => alert("Store Preview is coming soon inside your domain root!")}
                              className="bg-gradient-to-tr from-[#18011F] to-[#B600A8] border border-[#B600A8]/30 hover:shadow-[0_0_20px_rgba(182,0,168,0.4)] text-white font-semibold text-xs px-5 py-2.5 rounded-full uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(182,0,168,0.2)] hover:scale-[1.02] active:scale-95 cursor-pointer"
                            >
                              Visit Store
                            </button>
                            <button
                              onClick={handleShareLink}
                              className="border border-[#D7E2EA]/20 hover:border-white/45 bg-white/[0.04] hover:bg-white/[0.08] text-white/90 font-semibold text-xs px-5 py-2.5 rounded-full uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-1.5"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              Share Link
                            </button>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* Copied toast notification */}
                <AnimatePresence>
                  {copiedToast && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#28C840]/25 backdrop-blur-md border border-[#28C840]/50 text-white text-xs px-4 py-2 rounded-full shadow-lg font-medium tracking-wide z-50 select-none pointer-events-none"
                    >
                      ✓ Link copied to clipboard!
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            )}
          </AnimatePresence>

        </main>

      </div>

      {/* SQUAD OVERLAY MODAL PANEL */}
      <AnimatePresence>
        {squadOverlayOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0C0C0C]/85 backdrop-blur-xl flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md bg-white/[0.04] border border-[#D7E2EA]/10 rounded-[30px] p-6 shadow-2xl"
            >
              
              {/* Modal Close Button */}
              <button 
                onClick={() => setSquadOverlayOpen(false)}
                className="absolute top-5 right-5 p-1 rounded-full hover:bg-white/10 text-[#D7E2EA]/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <span className="text-[10px] text-[#D7E2EA]/30 font-mono tracking-[0.2em] uppercase block mb-1">NexVend Global Nodes</span>
                <h2 className="text-2xl font-black uppercase tracking-tight hero-heading bg-gradient-to-r from-white to-[#D7E2EA]/50">
                  Active Squad
                </h2>
              </div>

              {/* Agents Bio List inside squad overlay */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                
                {/* Jack card */}
                <div className="flex items-center justify-between pb-3.5 border-b border-[#D7E2EA]/10">
                  <div className="flex items-center gap-3.5">
                    <img 
                      src="https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png" 
                      alt="Jack" 
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border border-[#B600A8]"
                    />
                    <div>
                      <div className="text-sm font-bold uppercase text-white flex items-center gap-2">
                        Jack
                        <span className="text-[9px] bg-[#B600A8]/20 text-[#B600A8] rounded px-1.5 font-bold uppercase tracking-widest border border-[#B600A8]/20">Orchestrator</span>
                      </div>
                      <div className="text-xs text-[#D7E2EA]/40 font-light mt-0.5">Leader & tactical scheduler</div>
                    </div>
                  </div>
                  
                  <span className="bg-green-400/10 text-green-400 border border-green-400/20 rounded-full px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-mono">
                    Active
                  </span>
                </div>

                {/* Other 5 squad agents */}
                {squadAgents.map((agent) => (
                  <div 
                    key={agent.name} 
                    className="flex items-center justify-between pb-3.5 border-b border-[#D7E2EA]/6 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3.5">
                      <img 
                        src={agent.avatar} 
                        alt={agent.name} 
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover border border-white/10"
                      />
                      <div>
                        <div className="text-sm font-bold uppercase text-white">
                          {agent.name}
                        </div>
                        <div className="text-xs text-[#D7E2EA]/40 font-light mt-0.5">
                          {agent.role}
                        </div>
                      </div>
                    </div>
                    
                    <span className={`rounded-full px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-mono ${
                      agent.status === "active" 
                        ? "bg-green-400/10 text-green-400 border border-green-500/10" 
                        : "bg-amber-400/10 text-amber-400 border border-amber-500/10"
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Okay button CTA */}
              <button
                onClick={() => setSquadOverlayOpen(false)}
                className="w-full mt-6 py-3 bg-[#B600A8] hover:bg-[#B600A8]/80 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-[#B600A8]/25"
              >
                Close Roster Status
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
