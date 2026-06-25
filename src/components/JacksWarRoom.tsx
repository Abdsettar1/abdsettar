import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu, X, Send, Paperclip, Mic, SquarePen, Users,
  ShoppingBag, MessageCircle, TrendingUp, BarChart2,
  ChevronRight, ArrowRight, Check, AlertCircle, Info,
  ExternalLink, UserCheck, Shield, Laptop, Zap,
  Lock, CheckCircle2, Share2, Copy, ChevronDown, Trash2, 
  Volume2, VolumeX, Search, Plus, Sparkles, Database,
  Code, Globe, HelpCircle, Eye, Monitor, Smartphone, Tablet, Star,
  Sliders
} from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface Agent {
  name: string;
  role: string;
  avatar: string;
  status: "active" | "busy" | "thinking";
  avatarColor: string;
  borderColor: string;
  themeColor: string;
}

const squadAgents: Agent[] = [
  {
    name: "Jack",
    role: "Operational Commander",
    avatar: "https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png",
    status: "active",
    avatarColor: "bg-purple-500",
    borderColor: "border-[#B600A8]",
    themeColor: "#B600A8"
  },
  {
    name: "Sofia Reyes",
    role: "UX & Store Design",
    avatar: "https://k.top4top.io/p_3823b6zzr1.png",
    status: "active",
    avatarColor: "bg-amber-500",
    borderColor: "border-[#FF7A00]",
    themeColor: "#FF7A00"
  },
  {
    name: "Marcus Lee",
    role: "Backend & Systems",
    avatar: "https://d.top4top.io/p_382318j801.png",
    status: "active",
    avatarColor: "bg-blue-500",
    borderColor: "border-blue-500",
    themeColor: "#3B82F6"
  },
  {
    name: "Amir Hassan",
    role: "Ad Campaigns",
    avatar: "https://b.top4top.io/p_3823htijt1.png",
    status: "busy",
    avatarColor: "bg-green-500",
    borderColor: "border-green-500",
    themeColor: "#10B981"
  },
  {
    name: "Yuna Park",
    role: "Customer Success",
    avatar: "https://d.top4top.io/p_38238hz7z1.png",
    status: "active",
    avatarColor: "bg-violet-500",
    borderColor: "border-[#7621B0]",
    themeColor: "#7621B0"
  },
  {
    name: "Leo Dumont",
    role: "Product Sourcing",
    avatar: "https://a.top4top.io/p_3823y9u641.png",
    status: "active",
    avatarColor: "bg-pink-500",
    borderColor: "border-pink-500",
    themeColor: "#EC4899"
  }
];

interface ChatMessage {
  id: string;
  role: "user" | "jack";
  type: "text" | "assignment";
  content: string;
  image?: string;
  agents?: Array<{ name: string; role: string; emoji: string }>;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  chatMode: "normal" | "collecting-info" | "building" | "store-ready";
  buildStep: 1 | 2 | 3 | 4;
  storeInfo: { name: string; niche: string; colorTheme: string; language: string };
  showPreview: boolean;
  elapsedTime: number;
  buildProgress: number;
  createdAt: number;
}

const starterPrompts = [
  {
    title: "Build apparel dropshipping store",
    desc: "Launch a custom premium apparel shop with designer Sofia.",
    prompt: "I want to build a premium apparel dropshipping store with Sofia Reyes as my store design lead.",
    icon: "🛒"
  },
  {
    title: "Formulate ad campaigns",
    desc: "Draft viral TikTok and Meta ad setups with Amir's squad.",
    prompt: "Help me design high-converting TikTok and Meta ad campaigns with Amir Hassan for my brand.",
    icon: "📈"
  },
  {
    title: "Research winning products",
    desc: "Conduct product research on trending niche items.",
    prompt: "Analyze the current market and suggest 5 high-margin trending products with Leo Dumont.",
    icon: "🔍"
  },
  {
    title: "Support automation setup",
    desc: "Automate custom support channels on WhatsApp.",
    prompt: "I need to set up custom automated customer support workflows with Yuna Park.",
    icon: "💬"
  }
];

export function JacksWarRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const BACKEND_URL = (((import.meta as any).env?.VITE_BACKEND_URL) || "").replace(/\/$/, "");

  // Multi-session & local storage states
  const [sessionsList, setSessionsList] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Speech and audio states
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const recognitionRef = useRef<any>(null);

  // File and attachment states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Core chat states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [squadOverlayOpen, setSquadOverlayOpen] = useState(false);
  const [reactions, setReactions] = useState<{ [msgId: string]: { [emoji: string]: number } }>({});

  // Preview Mode (Desktop, Tablet, Mobile)
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // Redesign Input-specific States for Larger, Professional, and Feature-rich Workspace
  const [selectedTargetAgent, setSelectedTargetAgent] = useState<string>("Jack");
  const [deepBrainAnalysis, setDeepBrainAnalysis] = useState<boolean>(false);
  const [showTemplatesDropdown, setShowTemplatesDropdown] = useState<boolean>(false);
  const [showAgentSelector, setShowAgentSelector] = useState<boolean>(false);

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

  // Custom Background Config state (dynamic adjustments)
  const [bgSize, setBgSize] = useState<string>("cover"); // "cover" | "contain" | "auto" | "150% 150%" | "200% 200%"
  const [bgOpacity, setBgOpacity] = useState<number>(16); // 0 to 100
  const [bgBlur, setBgBlur] = useState<number>(2); // 0 to 20px
  const [showBgConfig, setShowBgConfig] = useState<boolean>(false);

  // Mock WooCommerce Products generated dynamically on the fly based on Niche
  const [storeProducts, setStoreProducts] = useState<Array<{ id: number; name: string; price: string; oldPrice: string; rating: number; image: string; tag: string }>>([]);

  // Mock logs showing active squad actions
  const [systemLogs, setSystemLogs] = useState<Array<{ id: string; time: string; text: string; agent: string; type: "info" | "success" | "warning" }>>([
    { id: "1", time: "08:00:12", text: "Secure command link established", agent: "Jack", type: "info" },
    { id: "2", time: "08:01:05", text: "Database cluster active on port 3306", agent: "Marcus Lee", type: "success" }
  ]);

  // Load and synchronize sessions from local storage
  useEffect(() => {
    const saved = localStorage.getItem("jacks_war_room_sessions");
    let parsed: ChatSession[] = [];
    try {
      if (saved) parsed = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse saved sessions", e);
    }

    const stateVal = location.state as { initialMessage?: string } | null;
    const initialPrompt = stateVal?.initialMessage;

    if (parsed.length > 0) {
      setSessionsList(parsed);
      
      if (initialPrompt) {
        const newSessionId = `session-${Date.now()}`;
        const newSess: ChatSession = {
          id: newSessionId,
          title: initialPrompt.length > 25 ? initialPrompt.slice(0, 25) + "..." : initialPrompt,
          messages: [
            {
              id: `user-${Date.now()}`,
              role: "user",
              type: "text",
              content: initialPrompt,
              timestamp: getTimestamp()
            }
          ],
          chatMode: "normal",
          buildStep: 1,
          storeInfo: { name: "", niche: "", colorTheme: "", language: "" },
          showPreview: false,
          elapsedTime: 0,
          buildProgress: 0,
          createdAt: Date.now()
        };
        const updated = [newSess, ...parsed];
        setSessionsList(updated);
        setActiveSessionId(newSessionId);
        localStorage.setItem("jacks_war_room_sessions", JSON.stringify(updated));
        
        setMessages(newSess.messages);
        setChatMode("normal");
        setBuildStep(1);
        setStoreInfo(newSess.storeInfo);
        setShowPreview(false);
        setElapsedTime(0);
        setBuildProgress(0);
        
        setTimeout(() => {
          sendToJackForSession(initialPrompt, newSessionId, newSess.messages);
        }, 100);
      } else {
        const last = parsed[0];
        setActiveSessionId(last.id);
        setMessages(last.messages);
        setChatMode(last.chatMode || "normal");
        setBuildStep(last.buildStep || 1);
        setStoreInfo(last.storeInfo || { name: "", niche: "", colorTheme: "", language: "" });
        setShowPreview(last.showPreview || false);
        setElapsedTime(last.elapsedTime || 0);
        setBuildProgress(last.buildProgress || 0);
      }
    } else {
      const defaultId = `session-${Date.now()}`;
      const defaultSess: ChatSession = {
        id: defaultId,
        title: "New Operations Briefing",
        messages: [
          {
            id: `jack-fresh-${Date.now()}`,
            role: "jack",
            type: "text",
            content: "Operational console initialized. All channels at standby. Let's build your enterprise or research your target market. Choose a starter command below or type your custom instruction.",
            timestamp: getTimestamp()
          }
        ],
        chatMode: "normal",
        buildStep: 1,
        storeInfo: { name: "", niche: "", colorTheme: "", language: "" },
        showPreview: false,
        elapsedTime: 0,
        buildProgress: 0,
        createdAt: Date.now()
      };
      
      const list = [defaultSess];
      setSessionsList(list);
      setActiveSessionId(defaultId);
      setMessages(defaultSess.messages);
      setChatMode("normal");
      setBuildStep(1);
      setStoreInfo(defaultSess.storeInfo);
      setShowPreview(false);
      setElapsedTime(0);
      setBuildProgress(0);
      localStorage.setItem("jacks_war_room_sessions", JSON.stringify(list));

      if (initialPrompt) {
        const userMsg: ChatMessage = {
          id: `user-${Date.now()}`,
          role: "user",
          type: "text",
          content: initialPrompt,
          timestamp: getTimestamp()
        };
        const activeMessages = [...defaultSess.messages, userMsg];
        setMessages(activeMessages);
        
        defaultSess.messages = activeMessages;
        defaultSess.title = initialPrompt.length > 25 ? initialPrompt.slice(0, 25) + "..." : initialPrompt;
        localStorage.setItem("jacks_war_room_sessions", JSON.stringify([defaultSess]));
        
        sendToJackForSession(initialPrompt, defaultId, activeMessages);
      }
    }
  }, []);

  // Save active session changes to localStorage automatically
  useEffect(() => {
    if (!activeSessionId || sessionsList.length === 0) return;

    const updated = sessionsList.map(s => {
      if (s.id === activeSessionId) {
        let newTitle = s.title;
        if (s.title === "New Operations Briefing" || s.title === "New Session") {
          const firstUserMsg = messages.find(m => m.role === "user");
          if (firstUserMsg) {
            newTitle = firstUserMsg.content.length > 25 
              ? firstUserMsg.content.slice(0, 25) + "..." 
              : firstUserMsg.content;
          }
        }
        return {
          ...s,
          title: newTitle,
          messages,
          chatMode,
          buildStep,
          storeInfo,
          showPreview,
          elapsedTime,
          buildProgress
        };
      }
      return s;
    });

    const stringified = JSON.stringify(updated);
    if (localStorage.getItem("jacks_war_room_sessions") !== stringified) {
      setSessionsList(updated);
      localStorage.setItem("jacks_war_room_sessions", stringified);
    }
  }, [messages, chatMode, buildStep, storeInfo, showPreview, elapsedTime, buildProgress, activeSessionId]);

  // Generate customized products when niche is selected/submitted
  useEffect(() => {
    if (!storeInfo.niche) return;
    const nicheLower = storeInfo.niche.toLowerCase();
    let computedProducts = [];

    if (nicheLower.includes("fashion") || nicheLower.includes("apparel") || nicheLower.includes("clothing")) {
      computedProducts = [
        { id: 1, name: "Urban Stealth Trench", price: "$189.00", oldPrice: "$279.00", rating: 4.9, image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600&auto=format&fit=crop", tag: "Designer Choice" },
        { id: 2, name: "Matrix Oversized Knit", price: "$110.00", oldPrice: "$150.00", rating: 4.8, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop", tag: "Hot Seller" },
        { id: 3, name: "Cyber-Glow Cargo V2", price: "$145.00", oldPrice: "$195.00", rating: 5.0, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop", tag: "New Release" },
        { id: 4, name: "Neon-Line High-Tops", price: "$220.00", oldPrice: "$310.00", rating: 4.7, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop", tag: "Highly Curated" }
      ];
    } else if (nicheLower.includes("electronics") || nicheLower.includes("gadgets") || nicheLower.includes("tech")) {
      computedProducts = [
        { id: 1, name: "AeroShield ANC Headphones", price: "$299.00", oldPrice: "$399.00", rating: 5.0, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop", tag: "Holographic Audio" },
        { id: 2, name: "Apex Chronograph V3", price: "$450.00", oldPrice: "$590.00", rating: 4.9, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop", tag: "Limited Run" },
        { id: 3, name: "Solar-Pulse Pocket Bank", price: "$79.00", oldPrice: "$110.00", rating: 4.8, image: "https://images.unsplash.com/photo-1622445262465-2481c4574875?q=80&w=600&auto=format&fit=crop", tag: "Sourced" },
        { id: 4, name: "Neural-Link Desk Speaker", price: "$180.00", oldPrice: "$240.00", rating: 4.6, image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=600&auto=format&fit=crop", tag: "Trending" }
      ];
    } else {
      // General Luxury items
      computedProducts = [
        { id: 1, name: "Omni Comfort Flask", price: "$49.00", oldPrice: "$75.00", rating: 5.0, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=600&auto=format&fit=crop", tag: "Sourced" },
        { id: 2, name: "Nomad Premium Pack", price: "$165.00", oldPrice: "$240.00", rating: 4.9, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop", tag: "Hot Trend" },
        { id: 3, name: "Aura Diffuser Glow", price: "$89.00", oldPrice: "$120.00", rating: 4.8, image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600&auto=format&fit=crop", tag: "Trending Now" },
        { id: 4, name: "Titanium Essential Cutlery", price: "$125.00", oldPrice: "$180.00", rating: 4.7, image: "https://images.unsplash.com/photo-1501159779489-224497a7e2b0?q=80&w=600&auto=format&fit=crop", tag: "Elite Sourcing" }
      ];
    }
    setStoreProducts(computedProducts);
  }, [storeInfo.niche]);

  const handleSelectSession = (sess: ChatSession) => {
    window.speechSynthesis.cancel();
    setSpeakingId(null);

    setActiveSessionId(sess.id);
    setMessages(sess.messages);
    setChatMode(sess.chatMode || "normal");
    setBuildStep(sess.buildStep || 1);
    setStoreInfo(sess.storeInfo || { name: "", niche: "", colorTheme: "", language: "" });
    setShowPreview(sess.showPreview || false);
    setElapsedTime(sess.elapsedTime || 0);
    setBuildProgress(sess.buildProgress || 0);
    setSidebarOpen(false);
  };

  const handleCreateNewSession = () => {
    window.speechSynthesis.cancel();
    setSpeakingId(null);

    const newId = `session-${Date.now()}`;
    const newSess: ChatSession = {
      id: newId,
      title: "New Operations Briefing",
      messages: [
        {
          id: `jack-fresh-${Date.now()}`,
          role: "jack",
          type: "text",
          content: "Operational console initialized. All channels at standby. Choose an automated starter flow below or enter your custom target directive.",
          timestamp: getTimestamp()
        }
      ],
      chatMode: "normal",
      buildStep: 1,
      storeInfo: { name: "", niche: "", colorTheme: "", language: "" },
      showPreview: false,
      elapsedTime: 0,
      buildProgress: 0,
      createdAt: Date.now()
    };

    const updated = [newSess, ...sessionsList];
    setSessionsList(updated);
    setActiveSessionId(newId);
    
    setMessages(newSess.messages);
    setChatMode("normal");
    setBuildStep(1);
    setStoreInfo(newSess.storeInfo);
    setShowPreview(false);
    setElapsedTime(0);
    setBuildProgress(0);

    localStorage.setItem("jacks_war_room_sessions", JSON.stringify(updated));
  };

  const handleDeleteSession = (sessId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.speechSynthesis.cancel();
    setSpeakingId(null);

    const filtered = sessionsList.filter(s => s.id !== sessId);
    setSessionsList(filtered);
    localStorage.setItem("jacks_war_room_sessions", JSON.stringify(filtered));

    if (activeSessionId === sessId) {
      if (filtered.length > 0) {
        const first = filtered[0];
        setActiveSessionId(first.id);
        setMessages(first.messages);
        setChatMode(first.chatMode || "normal");
        setBuildStep(first.buildStep || 1);
        setStoreInfo(first.storeInfo || { name: "", niche: "", colorTheme: "", language: "" });
        setShowPreview(first.showPreview || false);
        setElapsedTime(first.elapsedTime || 0);
        setBuildProgress(first.buildProgress || 0);
      } else {
        const defaultId = `session-${Date.now()}`;
        const defaultSess: ChatSession = {
          id: defaultId,
          title: "New Operations Briefing",
          messages: [
            {
              id: `jack-fresh-${Date.now()}`,
              role: "jack",
              type: "text",
              content: "Operational console initialized. All channels at standby. Choose an automated starter flow below or enter your custom target directive.",
              timestamp: getTimestamp()
            }
          ],
          chatMode: "normal",
          buildStep: 1,
          storeInfo: { name: "", niche: "", colorTheme: "", language: "" },
          showPreview: false,
          elapsedTime: 0,
          buildProgress: 0,
          createdAt: Date.now()
        };
        setSessionsList([defaultSess]);
        setActiveSessionId(defaultId);
        setMessages(defaultSess.messages);
        setChatMode("normal");
        setBuildStep(1);
        setStoreInfo(defaultSess.storeInfo);
        setShowPreview(false);
        setElapsedTime(0);
        setBuildProgress(0);
        localStorage.setItem("jacks_war_room_sessions", JSON.stringify([defaultSess]));
      }
    }
  };

  const handleToggleSpeech = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not fully supported in this browser. Please try Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setInputValue(prev => prev + (prev ? " " : "") + text);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSpeakText = (msgId: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`\-]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.onend = () => {
      setSpeakingId(null);
    };
    utterance.onerror = () => {
      setSpeakingId(null);
    };

    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const appendSystemLog = (text: string, agent: string, type: "info" | "success" | "warning" = "info") => {
    const time = new Date().toTimeString().split(' ')[0];
    setSystemLogs(prev => [{ id: String(Date.now()), time, text, agent, type }, ...prev.slice(0, 15)]);
  };

  const sendToJackForSession = async (messageText: string, targetSessionId: string, currentMsgs: ChatMessage[]) => {
    setIsTyping(true);
    appendSystemLog(`Analyzing user instruction: "${messageText.slice(0, 30)}..."`, "Jack", "info");

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          sessionId: targetSessionId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const { response: jackResponse } = data;
        
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

        if (activeSessionId === targetSessionId) {
          setMessages(prev => [...prev, jackMsg]);
        } else {
          setSessionsList(prevList => prevList.map(s => {
            if (s.id === targetSessionId) {
              return { ...s, messages: [...s.messages, jackMsg] };
            }
            return s;
          }));
        }

        appendSystemLog("Operational command received from Jack Node", "Jack", "success");

        if (jackResponse.detectedIntent === 'store' && jackResponse.nextAction === 'collecting-info') {
          if (activeSessionId === targetSessionId) {
            setChatMode('collecting-info');
            setBuildStep(1);
            
            setTimeout(() => {
              const guided1: ChatMessage = {
                id: `jack-guided-1-${Date.now()}`,
                role: 'jack',
                type: 'text',
                content: "Perfect. Let's design and deploy your WooCommerce storefront immediately. First — **what is your desired Store Name?**",
                timestamp: getTimestamp()
              };
              setMessages(prev => [...prev, guided1]);
              appendSystemLog("Initiating guided configuration pass", "Sofia Reyes", "info");
            }, 800);
          } else {
            setSessionsList(prevList => prevList.map(s => {
              if (s.id === targetSessionId) {
                const guided1: ChatMessage = {
                  id: `jack-guided-1-${Date.now()}`,
                  role: 'jack',
                  type: 'text',
                  content: "Perfect. Let's design and deploy your WooCommerce storefront immediately. First — **what is your desired Store Name?**",
                  timestamp: getTimestamp()
                };
                return {
                  ...s,
                  chatMode: 'collecting-info',
                  buildStep: 1,
                  messages: [...s.messages, guided1]
                };
              }
              return s;
            }));
          }
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
        content: 'Commander, the deep-space satellite uplink is resetting. I am running automated local routines to process your command.',
        timestamp: getTimestamp()
      };
      if (activeSessionId === targetSessionId) {
        setMessages(prev => [...prev, fallbackMsg]);
      } else {
        setSessionsList(prevList => prevList.map(s => {
          if (s.id === targetSessionId) {
            return { ...s, messages: [...s.messages, fallbackMsg] };
          }
          return s;
        }));
      }
    } finally {
      setIsTyping(false);
    }
  };

  const getTimestamp = () => {
    const timeStr = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `TODAY, ${timeStr}`;
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatTime = (secs: number) => {
    const mm = String(Math.floor(secs / 60)).padStart(2, "0");
    const ss = String(secs % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const buildStepsTexts = [
    "Establishing Cloud Databases...",
    "Drafting Premium Store Layout...",
    "Curating Sourced Top-Selling Products...",
    "Injecting Selected Brand Accent Theme...",
    "Syncing Meta & TikTok Pixels...",
    "Polishing WooCommerce Responsive CSS..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (chatMode === "building") {
      setElapsedTime(0);
      setBuildProgress(0);
      appendSystemLog("Commencing layout compilation...", "Sofia Reyes", "info");
      appendSystemLog("Configuring secure SSL parameters...", "Marcus Lee", "info");

      interval = setInterval(() => {
        setElapsedTime(prev => {
          const nextTime = prev + 1;
          const pct = Math.min((nextTime / 45) * 100, 100);
          setBuildProgress(pct);

          // Append simulated squad comments in real-time
          if (nextTime === 8) {
            appendSystemLog("Database schema verified. 4 tables mounted.", "Marcus Lee", "success");
          } else if (nextTime === 16) {
            appendSystemLog("Visual elements matching palette configured.", "Sofia Reyes", "success");
          } else if (nextTime === 24) {
            appendSystemLog("Leo found 4 winning products with high margins.", "Leo Dumont", "success");
          } else if (nextTime === 32) {
            appendSystemLog("Formulating custom WhatsApp support channels.", "Yuna Park", "info");
          } else if (nextTime === 40) {
            appendSystemLog("TikTok ad creatives drafted and prepared.", "Amir Hassan", "success");
          }

          if (nextTime >= 45) {
            clearInterval(interval);
            setChatMode("store-ready");
            appendSystemLog("DEPLOYMENT COMPLETED successfully", "Jack", "success");
            
            const finalReply: ChatMessage = {
              id: `jack-ready-msg-${Date.now()}`,
              role: "jack",
              type: "text",
              content: "### Deployment Status: ONLINE\n\nYour WooCommerce storefront is live and functional! Designer Sofia Reyes nailed the look. Leo Dumont has finalized sourcing channels for the trending products, and Yuna Park is connected to handle your live customer messages directly. \n\nClick the Visit Store button to examine the build, or describe any edits you need!",
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

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 150);
  };

  const handleSendMessage = (customPromptText?: string) => {
    const textToSend = customPromptText || inputValue.trim();
    if (!textToSend && !attachedImage) return;

    let contentWithContext = textToSend;
    if (selectedTargetAgent !== "Jack" && !customPromptText) {
      contentWithContext = `[@${selectedTargetAgent}]: ${contentWithContext}`;
      appendSystemLog(`Routing command payload directly to ${selectedTargetAgent} node...`, selectedTargetAgent, "info");
    }
    if (deepBrainAnalysis && !customPromptText) {
      contentWithContext = `${contentWithContext}\n\n*[System Note: Deep Sourcing telemetry scan requested]*`;
      appendSystemLog(`Deep Sourcing telemetry scan active - high coverage supplier sweep...`, "Leo Dumont", "success");
    }

    const userMsg: ChatMessage = {
      id: `user-msg-${Date.now()}`,
      role: "user",
      type: "text",
      content: contentWithContext || "Uploaded custom asset for visual briefing",
      image: attachedImage || undefined,
      timestamp: getTimestamp()
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputValue("");
    setAttachedImage(null);

    if (userMsg.image) {
      setIsTyping(true);
      appendSystemLog("Initiating Computer Vision routine...", "Marcus Lee", "info");
      setTimeout(() => {
        const productBriefReply: ChatMessage = {
          id: `jack-vision-${Date.now()}`,
          role: "jack",
          type: "assignment",
          content: "### Visual Intelligence Briefing\n\nCommander, I've run a detailed pass on your attached graphic. \n- **Sofia Reyes** recommends a premium high-contrast dark wireframe structure.\n- **Leo Dumont** has identified 4 highly profitable sourcing coordinates matching this exact aesthetic style.\n- **Amir Hassan** is drafting Meta ad visual assets with a high CTR look. \n\nShall we let Sofia deploy this custom template into your active WooCommerce build?",
          agents: [
            { name: "Sofia Reyes", role: "Layout & borders draft", emoji: "🛍️" },
            { name: "Leo Dumont", role: "Sourcing coordination", emoji: "🔍" },
            { name: "Amir Hassan", role: "Ad campaigns draft", emoji: "📈" }
          ],
          timestamp: getTimestamp()
        };
        setMessages(prev => [...prev, productBriefReply]);
        appendSystemLog("Visual payload mapped to active session.", "Jack", "success");
        setIsTyping(false);
      }, 1500);
      return;
    }

    if (chatMode === "normal") {
      sendToJackForSession(contentWithContext, activeSessionId, nextMessages);
      return;
    }

    if (chatMode === "collecting-info") {
      setIsTyping(true);
      setTimeout(async () => {
        setIsTyping(false);
        const currentStep = buildStep;
        let replyContent = "";

        if (currentStep === 1) {
          setStoreInfo(prev => ({ ...prev, name: textToSend }));
          setBuildStep(2);
          replyContent = "Outstanding name selection. Next — **what specific product niche or industry will you sell in?** (e.g. streetwear fashion, minimalist tech accessories, premium vitamins)";
          appendSystemLog(`Store Name registered: ${textToSend}`, "Sofia Reyes", "success");
          
          const jackMsg: ChatMessage = {
            id: `jack-guided-2-${Date.now()}`,
            role: "jack",
            type: "text",
            content: replyContent,
            timestamp: getTimestamp()
          };
          setMessages(prev => [...prev, jackMsg]);
        } else if (currentStep === 2) {
          setStoreInfo(prev => ({ ...prev, niche: textToSend }));
          setBuildStep(3);
          replyContent = "Understood. Our sourcing nodes are tracking key winners. Now — **what is your desired color theme accent?** (e.g. electric magenta, stealth obsidian, clean nordic white)";
          appendSystemLog(`Product niche registered: ${textToSend}`, "Leo Dumont", "success");
          
          const jackMsg: ChatMessage = {
            id: `jack-guided-3-${Date.now()}`,
            role: "jack",
            type: "text",
            content: replyContent,
            timestamp: getTimestamp()
          };
          setMessages(prev => [...prev, jackMsg]);
        } else if (currentStep === 3) {
          setStoreInfo(prev => ({ ...prev, colorTheme: textToSend }));
          setBuildStep(4);
          replyContent = "Excellent choice. Final question — **what primary language should we configure the storefront in?** (e.g. English, Spanish, German, French)";
          appendSystemLog(`Color accent palette: ${textToSend}`, "Sofia Reyes", "success");
          
          const jackMsg: ChatMessage = {
            id: `jack-guided-4-${Date.now()}`,
            role: "jack",
            type: "text",
            content: replyContent,
            timestamp: getTimestamp()
          };
          setMessages(prev => [...prev, jackMsg]);
        } else if (currentStep === 4) {
          const finalInfo = { ...storeInfo, language: textToSend };
          setStoreInfo(prev => ({ ...prev, language: textToSend }));
          replyContent = `Commander, all parameters are successfully captured. Sofia Reyes is compiling your live WooCommerce site with custom CSS themed as **${finalInfo.colorTheme}**. Marcus is setting up database pipelines.\n\nPreparing real-time workspace compilation display...`;
          appendSystemLog(`Target language set: ${textToSend}`, "Marcus Lee", "success");
          
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
                  content: `### Strategic Ops Brief: ${finalInfo.name}\n\n"${brief.storeBrief || ''}"`,
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
                appendSystemLog("Briefing document deployed to terminal.", "Jack", "success");
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
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
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

  const handleShareLink = () => {
    const fakeUrl = `https://nexvend.store/${storeInfo.name ? storeInfo.name.toLowerCase().replace(/\s+/g, "-") : "preview"}`;
    navigator.clipboard.writeText(fakeUrl);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const filteredSessions = sessionsList.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.messages && s.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const isChatEmpty = messages.length <= 1;

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
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="fixed inset-0 z-50 bg-[#FCFCFD] h-screen overflow-hidden flex flex-col text-[#000000] font-sans selection:bg-[#B600A8]/10 selection:text-[#B600A8]"
    >
      {/* 2. BACKGROUND IMAGE INTEGRATED SEAMLESSLY - Covers Viewport, low opacity, subtle blur */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 bg-no-repeat bg-center transition-all duration-300" 
        style={{ 
          backgroundImage: `url("https://56h9vhffu8.ucarecd.net/e57da16f-4db3-4941-9bcd-19fbb1d0cd08/image.png")`,
          backgroundSize: bgSize,
          opacity: bgOpacity / 100,
          filter: `blur(${bgBlur}px)`
        }}
      />

      {/* Radiant glows adapted for Elegant Light Mode workspace */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-[#B600A8]/5 blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-[#7621B0]/4 blur-[130px] pointer-events-none z-0" />

      {/* DRAG AND DROP GLASS OVERLAY */}
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/90 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-8 border-4 border-dashed border-[#B600A8]/45 m-4 rounded-[32px] select-none pointer-events-none"
          >
            <div className="w-20 h-20 rounded-full bg-[#B600A8]/10 flex items-center justify-center border border-[#B600A8]/20 mb-4 animate-bounce">
              <Paperclip className="w-10 h-10 text-[#B600A8]" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-wider text-[#000000]">Drop image element here</h3>
            <p className="text-sm text-[#333333]/60 mt-1">Slices and maps visual parameters instantly to Sofia's active design draft</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP COMMAND HUD HEADER (Light Premium glass) */}
      <header className="h-14 bg-white/85 border-b border-black/5 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 relative z-50 select-none">
        
        {/* Underline Indicator Accent instead of top scanning border */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#B600A8]/70 to-transparent" />

        {/* Left Side: Hamburger, Brand Identity */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-[#333333] hover:text-[#000000] rounded-lg hover:bg-black/5 transition-all md:hidden cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7621B0] to-[#B600A8] flex items-center justify-center shadow-md border border-[#B600A8]/25 shadow-[#B600A8]/20">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-black tracking-[0.2em] uppercase text-[#000000] flex items-center gap-1.5 leading-none">
                NEXVEND <span className="text-[9px] text-white font-bold tracking-widest bg-gradient-to-r from-[#7621B0] to-[#B600A8] px-1.5 py-0.5 rounded shadow-sm">WAR ROOM</span>
              </div>
              <div className="text-[9px] text-[#333333]/50 font-semibold tracking-wider font-mono mt-0.5 uppercase leading-none">
                Uplink Active // Latency: 38ms
              </div>
            </div>
          </div>
        </div>

        {/* Center: Command HUD Display */}
        <div className="hidden md:flex items-center gap-3 bg-black/[0.02] border border-black/5 rounded-full py-1 px-4 text-xs font-mono tracking-wider text-[#333333] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <Zap className="w-3.5 h-3.5 text-[#B600A8] animate-pulse" />
          <span className="text-black/40">ACTIVE MISSION:</span>
          <span className="text-black font-semibold uppercase tracking-widest truncate max-w-[190px]">
            {storeInfo.name || sessionsList.find(s => s.id === activeSessionId)?.title || "PREMIUM DROPSHIPPING STORE"}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#B600A8] animate-[ping_1.5s_infinite]" />
        </div>

        {/* Right side: Actions, buttons, exit */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNewSession}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B600A8]/10 hover:bg-[#B600A8]/20 border border-[#B600A8]/20 rounded-full text-xs text-[#B600A8] font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Briefing</span>
          </button>

          <button 
            onClick={() => setSquadOverlayOpen(true)}
            className="px-3 py-1.5 text-xs text-[#333333]/80 hover:text-black hover:bg-black/5 border border-black/5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            <Users className="w-3.5 h-3.5 text-[#B600A8]" />
            <span className="hidden sm:inline font-bold">ROSTER ({squadAgents.length})</span>
          </button>

          {/* Custom Background Settings Trigger */}
          <div className="relative">
            <button 
              onClick={() => setShowBgConfig(!showBgConfig)}
              className={`px-3 py-1.5 text-xs rounded-full transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95 border ${
                showBgConfig 
                  ? "bg-[#B600A8] text-white border-[#B600A8] font-bold" 
                  : "text-[#333333]/80 hover:text-black hover:bg-black/5 border-black/5 bg-white font-bold"
              }`}
              title="Adjust Chat Background"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">BG STYLING</span>
            </button>

            {/* Floating Background Config Dropdown */}
            <AnimatePresence>
              {showBgConfig && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-72 bg-white border border-black/10 rounded-2xl p-4 shadow-xl z-[100] text-left text-black"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-black/5 mb-3">
                    <span className="text-[10px] font-black tracking-widest text-[#B600A8] uppercase font-mono">
                      BACKGROUND CONFIG
                    </span>
                    <button 
                      onClick={() => setShowBgConfig(false)}
                      className="p-1 text-black/40 hover:text-black rounded-full hover:bg-black/5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Background Size selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#333333]/70 font-mono block uppercase">
                        Size & Scaling
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { label: "Cover", value: "cover" },
                          { label: "Contain", value: "contain" },
                          { label: "Fit Width", value: "100% auto" },
                          { label: "Original", value: "auto" },
                          { label: "Zoom 1.5x", value: "150% 150%" },
                          { label: "Zoom 2.0x", value: "200% 200%" }
                        ].map((sz) => (
                          <button
                            key={sz.value}
                            type="button"
                            onClick={() => setBgSize(sz.value)}
                            className={`px-1.5 py-1 text-[10px] rounded font-semibold transition-all border ${
                              bgSize === sz.value 
                                ? "bg-[#B600A8]/10 text-[#B600A8] border-[#B600A8]/20" 
                                : "bg-black/[0.02] border-transparent text-[#333333]/70 hover:bg-black/[0.05]"
                            }`}
                          >
                            {sz.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Transparency Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-[#333333]/70 font-mono uppercase">
                        <span>Transparency / Opacity</span>
                        <span className="text-black font-semibold">{bgOpacity}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={bgOpacity}
                        onChange={(e) => setBgOpacity(Number(e.target.value))}
                        className="w-full accent-[#B600A8] h-1.5 bg-black/5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Blur Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-[#333333]/70 font-mono uppercase">
                        <span>Blur Level</span>
                        <span className="text-black font-semibold">{bgBlur}px</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="16"
                        step="1"
                        value={bgBlur}
                        onChange={(e) => setBgBlur(Number(e.target.value))}
                        className="w-full accent-[#B600A8] h-1.5 bg-black/5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Presets and resets */}
                    <div className="pt-2 border-t border-black/5 flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setBgSize("cover");
                          setBgOpacity(16);
                          setBgBlur(2);
                        }}
                        className="px-2.5 py-1 text-[9px] font-bold text-black/50 hover:text-black hover:bg-black/5 rounded border border-transparent transition-all"
                      >
                        Reset Defaults
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => navigate("/")}
            title="Exit Command Suite"
            className="w-8 h-8 flex items-center justify-center text-[#333333]/60 hover:text-black hover:bg-black/5 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </header>

      {/* 2. MAIN WORKSPACE VIEWPORT */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Collapsible Left Sidebar for Mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm"
            />
          )}
        </AnimatePresence>

        {/* SLIM COMMAND SIDEBAR / SQUAD ROSTER (Left Rail) */}
        <aside 
          className={`
            fixed md:relative top-0 bottom-0 left-0 w-[72px] bg-white/60 border-r border-black/5 backdrop-blur-lg z-40 md:z-10
            transition-transform duration-300 ease-in-out select-none flex flex-col items-center py-6 gap-6 h-full
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <div className="flex flex-col items-center gap-1 text-center w-full select-none mb-3">
            <span className="text-[8px] tracking-widest text-[#B600A8] font-bold uppercase font-mono">SQUAD</span>
            <div className="w-4 h-[1px] bg-black/10" />
          </div>

          <div className="flex-1 w-full flex flex-col gap-4 items-center overflow-y-auto scrollbar-none px-2 select-none">
            {squadAgents.map((agent) => {
              const isSpeaking = isTyping && (
                (agent.name === "Jack" && !isTyping) || 
                (agent.name === "Sofia Reyes" && chatMode === "collecting-info" && buildStep === 3) ||
                (agent.name === "Leo Dumont" && chatMode === "collecting-info" && buildStep === 2) ||
                (agent.name === "Marcus Lee" && chatMode === "building")
              );

              return (
                <div key={agent.name} className="relative group flex flex-col items-center select-none">
                  <div className="relative">
                    {/* Breathing circle border */}
                    <div 
                      className={`w-11 h-11 rounded-full p-[1.5px] transition-all duration-500 cursor-pointer ${
                        isSpeaking ? "animate-pulse" : "group-hover:scale-105"
                      }`}
                      style={{
                        background: isSpeaking 
                          ? `radial-gradient(circle, ${agent.themeColor} 0%, transparent 80%)`
                          : "rgba(0,0,0,0.03)",
                        border: `1.5px solid ${isSpeaking ? agent.themeColor : "rgba(0,0,0,0.08)"}`,
                        boxShadow: isSpeaking ? `0 0 10px ${agent.themeColor}` : "none"
                      }}
                      onClick={() => {
                        setInputValue(`Ask ${agent.name}: `);
                        setIsInputFocused(true);
                      }}
                    >
                      <img 
                        src={agent.avatar} 
                        alt={agent.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    {/* Status dot */}
                    <span 
                      className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white animate-pulse"
                      style={{
                        backgroundColor: agent.status === "active" ? "#10B981" : agent.status === "thinking" ? "#F59E0B" : "#B600A8"
                      }}
                    />
                  </div>
                  
                  {/* Floating Agent Name Label */}
                  <div className="absolute left-14 bg-white border border-black/5 text-[#000000] text-[10px] font-bold rounded-lg px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all shadow-md z-50 whitespace-nowrap">
                    <div>{agent.name}</div>
                    <div className="text-[8px] text-[#333333]/60 font-light lowercase">{agent.role}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SQUAD CONTROL HUD TOGGLE */}
          <button 
            onClick={() => setSquadOverlayOpen(true)}
            title="Squad Management console"
            className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-all text-[#333333] hover:text-black cursor-pointer border border-black/5"
          >
            <Users className="w-4.5 h-4.5" />
          </button>
        </aside>

        {/* 3. MAIN INTERACTIVE DIALOGUE / CHAT AREA (40% default width, floating layers) */}
        <main className="flex-1 flex overflow-hidden relative z-10">
          
          {/* Left Strategic Dialogue Module (Floating styled) */}
          <div className="flex-1 flex flex-col h-full bg-transparent relative">
            
            {/* Session Explorer Subheader (Modern Light glass) */}
            <div className="h-11 bg-white/75 border-b border-black/5 flex items-center justify-between px-4 sm:px-6 select-none flex-shrink-0 z-10">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-[#333333]/50 tracking-wider font-mono">ACTIVE DEPLOYMENT STREAM:</span>
                <span className="text-[10px] text-black font-bold uppercase font-mono max-w-[150px] truncate">
                  {sessionsList.find(s => s.id === activeSessionId)?.title || "WORKSPACE BRIEFING"}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {/* Search / filter icon */}
                <div className="relative flex items-center">
                  <input 
                    type="text"
                    placeholder="Filter pipeline..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-28 sm:w-36 bg-black/5 border border-black/5 rounded-lg text-[9px] pl-6 pr-2 py-1 outline-none text-[#000000] placeholder-[#333333]/30 transition-all focus:w-44 focus:bg-white focus:border-[#B600A8]/30 font-sans"
                  />
                  <Search className="w-2.5 h-2.5 text-[#333333]/30 absolute left-2" />
                </div>

                {sessionsList.length > 1 && (
                  <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    title="Toggle Sessions View"
                    className="p-1.5 rounded-lg text-[#333333]/60 hover:text-black hover:bg-black/5 transition-all cursor-pointer"
                  >
                    <SquarePen className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Sessions list drawer overlay (Light theme) */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div 
                  initial={{ x: -260, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -260, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 25 }}
                  className="absolute left-0 top-11 bottom-0 w-64 bg-white/95 backdrop-blur-xl border-r border-black/10 shadow-xl z-20 flex flex-col"
                >
                  <div className="p-3.5 border-b border-black/5 flex items-center justify-between">
                    <span className="text-[9px] font-black tracking-widest text-[#B600A8] uppercase font-mono">MISSION BLUEPRINTS</span>
                    <button 
                      onClick={() => setSidebarOpen(false)}
                      className="p-1 text-[#333333]/50 hover:text-black rounded-full hover:bg-black/5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredSessions.map((sess) => {
                      const isActive = sess.id === activeSessionId;
                      return (
                        <div
                          key={sess.id}
                          onClick={() => handleSelectSession(sess)}
                          className={`
                            group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-left transition-all
                            ${isActive ? "bg-[#B600A8]/10 border border-[#B600A8]/20 text-[#000000]" : "hover:bg-black/5 text-[#333333]/70"}
                          `}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xs">{sess.chatMode === "store-ready" ? "🛒" : "⚡"}</span>
                            <div className="truncate">
                              <div className="text-[11px] font-bold truncate leading-snug">{sess.title}</div>
                              <div className="text-[8px] text-[#333333]/40 font-mono tracking-wider mt-0.5">
                                {sess.messages.length} COMS // {new Date(sess.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <button 
                            onClick={(e) => handleDeleteSession(sess.id, e)}
                            className="p-1 text-black/10 hover:text-red-500 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                            title="Purge session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                    {filteredSessions.length === 0 && (
                      <div className="text-center py-6 text-[10px] text-[#333333]/40 font-mono">No matching records</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CHAT MESSAGES PANEL */}
            <div 
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 relative scrollbar-thin scroll-smooth"
            >
              {/* THE "BRAIN" ANIMATION - Subtle abstract rotating pulsing shape in background of chat */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <motion.svg 
                  width="220" 
                  height="220" 
                  viewBox="0 0 100 100" 
                  className="opacity-25"
                  animate={{
                    rotate: 360,
                    scale: isTyping ? [1, 1.15, 1] : [1, 1.05, 1]
                  }}
                  transition={{
                    rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                    scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <defs>
                    <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#B600A8" stopOpacity="0.12" />
                      <stop offset="70%" stopColor="#7621B0" stopOpacity="0.04" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <circle cx="50%" cy="50%" r="48" fill="url(#brainGlow)" />
                  <motion.path 
                    d="M50,15 C65,12 85,25 80,50 C75,75 60,88 50,85 C40,88 25,75 20,50 C15,25 35,12 50,15 Z" 
                    fill="none" 
                    stroke="rgba(182, 0, 168, 0.15)" 
                    strokeWidth="0.75"
                    animate={{
                      d: isTyping 
                        ? [
                            "M50,15 C68,10 88,23 83,53 C78,83 63,85 50,82 C37,85 22,83 17,53 C12,23 32,10 50,15 Z",
                            "M50,18 C63,15 82,28 78,48 C74,68 58,92 50,86 C42,92 26,68 22,48 C18,28 37,15 50,18 Z",
                            "M50,15 C65,12 85,25 80,50 C75,75 60,88 50,85 C40,88 25,75 20,50 C15,25 35,12 50,15 Z"
                          ]
                        : [
                            "M50,15 C65,12 85,25 80,50 C75,75 60,88 50,85 C40,88 25,75 20,50 C15,25 35,12 50,15 Z",
                            "M50,17 C63,14 82,22 82,47 C82,72 58,85 50,83 C42,85 18,72 18,47 C18,22 37,14 50,17 Z",
                            "M50,15 C65,12 85,25 80,50 C75,75 60,88 50,85 C40,88 25,75 20,50 C15,25 35,12 50,15 Z"
                          ]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.path 
                    d="M30,30 Q50,45 70,30" 
                    fill="none" 
                    stroke="rgba(118, 33, 176, 0.1)" 
                    strokeWidth="0.5" 
                  />
                  <motion.path 
                    d="M35,65 Q50,50 65,65" 
                    fill="none" 
                    stroke="rgba(118, 33, 176, 0.1)" 
                    strokeWidth="0.5" 
                  />
                  <circle cx="50%" cy="50%" r="2" fill="#B600A8" opacity="0.4" />
                </motion.svg>
              </div>

              {/* STARTER SUGGESTIONS IF CHAT IS EMPTY */}
              {isChatEmpty && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 pt-4 max-w-lg mx-auto text-center relative z-10"
                >
                  <div className="space-y-2 select-none">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                      E-Commerce Command Deck
                    </h2>
                    <p className="text-xs text-[#333333]/70 font-sans max-w-sm mx-auto leading-relaxed">
                      All nodes of Sofia, Marcus, Yuna, and Leo stand ready. Dispatch a mission blueprint parameter below to activate live store generation.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {starterPrompts.map((p) => (
                      <motion.div
                        key={p.title}
                        onClick={() => {
                          setInputValue(p.prompt);
                          handleSendMessage(p.prompt);
                        }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-3.5 bg-white border border-black/5 rounded-2xl text-left cursor-pointer transition-all shadow-sm hover:border-[#B600A8]/30 hover:shadow-[0_4px_16px_rgba(182,0,168,0.06)] group"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-base">{p.icon}</span>
                          <h3 className="text-xs font-bold text-black uppercase group-hover:text-[#B600A8] transition-colors">{p.title}</h3>
                        </div>
                        <p className="text-[10px] text-[#333333]/65 font-sans leading-relaxed">{p.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* MESSAGE BUBBLES GRID */}
              <div className="space-y-4 max-w-3xl mx-auto relative z-10">
                {messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 220, damping: 20 }}
                      className={`flex gap-3.5 text-left ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {/* Avatar */}
                      {!isUser && (
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-black/5 shadow-sm bg-white">
                          <img 
                            src="https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png" 
                            alt="Jack"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="max-w-[85%] space-y-1.5">
                        
                        {/* Header metadata label */}
                        <div className="flex items-center gap-2 text-[9px] text-[#333333]/40 font-mono tracking-wider">
                          <span className="font-bold text-black/70">{isUser ? "COMMANDER (YOU)" : "JACK // AGENT UPLINK"}</span>
                          <span>•</span>
                          <span>{msg.timestamp}</span>
                        </div>

                        {/* Content bubble */}
                        <div 
                          className={`
                            p-4 rounded-[20px] text-xs leading-relaxed transition-all shadow-sm
                            ${isUser 
                              ? "bg-[#F3E8FF] border border-[#E9D5FF] text-black rounded-tr-sm" 
                              : "bg-white border border-black/5 text-black rounded-tl-sm"
                            }
                          `}
                        >
                          {msg.image && (
                            <div className="mb-3.5 rounded-xl overflow-hidden border border-black/5 shadow-sm max-w-[240px]">
                              <img src={msg.image} alt="Visual Attachment" className="w-full h-auto object-cover" />
                            </div>
                          )}

                          {/* Render Rich Markdown with light theme compatibility */}
                          <div className="prose prose-sm prose-neutral max-w-none text-black">
                            <MarkdownRenderer content={msg.content} />
                          </div>

                          {/* SQUAD DEPLOYED AGENTS INFO (Typewriter / Assignment) */}
                          {msg.type === "assignment" && msg.agents && msg.agents.length > 0 && (
                            <div className="mt-4 pt-3.5 border-t border-black/5 space-y-2 select-none">
                              <span className="text-[8px] font-black tracking-widest text-[#B600A8] uppercase font-mono block">
                                Assigned SQUAD CODES
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {msg.agents.map((agent, i) => (
                                  <div 
                                    key={i} 
                                    className="flex items-center gap-2 p-2 bg-black/[0.02] border border-black/5 rounded-xl text-left"
                                  >
                                    <span className="text-sm">{agent.emoji}</span>
                                    <div>
                                      <div className="text-[10px] font-bold text-black uppercase leading-none">{agent.name}</div>
                                      <div className="text-[8px] text-[#333333]/50 font-light mt-0.5">{agent.role}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Speech controls and Reactions */}
                        <div className="flex items-center gap-3 px-1 select-none">
                          
                          {/* Audio Speech Button */}
                          {!isUser && (
                            <button
                              onClick={(e) => handleSpeakText(msg.id, msg.content, e)}
                              className={`
                                flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-bold transition-all border
                                ${speakingId === msg.id 
                                  ? "bg-[#B600A8]/10 text-[#B600A8] border-[#B600A8]/20 animate-pulse" 
                                  : "bg-white border-black/5 text-[#333333]/60 hover:text-black hover:border-black/10"
                                }
                              `}
                            >
                              {speakingId === msg.id ? (
                                <>
                                  <VolumeX className="w-3 h-3 text-[#B600A8]" />
                                  <span>MUTE AUDIO</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3 h-3" />
                                  <span>READ OUT LOUD</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Quick Reactions */}
                          <div className="flex items-center gap-1">
                            {["👍", "🔥", "🚀", "💡"].map((emoji) => {
                              const count = (reactions[msg.id] && reactions[msg.id][emoji]) || 0;
                              return (
                                <button
                                  key={emoji}
                                  onClick={() => handleReact(msg.id, emoji)}
                                  className={`
                                    px-1.5 py-0.5 rounded text-[10px] transition-all
                                    ${count > 0 
                                      ? "bg-[#B600A8]/10 text-[#B600A8] border border-[#B600A8]/20 font-bold scale-105" 
                                      : "hover:bg-black/5 text-[#333333]/50 border border-transparent"
                                    }
                                  `}
                                >
                                  {emoji} {count > 0 ? "1" : ""}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                      </div>

                      {/* User Avatar */}
                      {isUser && (
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-[#E9D5FF] bg-gradient-to-tr from-[#7621B0]/20 to-[#B600A8]/20 flex items-center justify-center font-black text-xs text-[#B600A8] select-none shadow-sm">
                          CO
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* AI Typewriter simulated loading */}
                {isTyping && (
                  <div className="flex gap-3.5 text-left justify-start">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-black/5 bg-white flex items-center justify-center">
                      <img 
                        src="https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png" 
                        alt="Jack"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-[9px] text-[#333333]/40 font-mono">JACK IS THINKING...</div>
                      <div className="bg-white border border-black/5 px-4 py-3 rounded-[20px] rounded-tl-sm flex items-center gap-2 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-[#B600A8] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-[#B600A8] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-[#B600A8] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        <span className="text-[10px] text-[#333333]/50 ml-1 font-mono">Synthesizing command pipeline...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* FLOATING COMMAND INPUT BAR PANEL */}
            <div className="p-4 bg-transparent relative z-20 max-w-3xl mx-auto w-full select-none">
              
              {/* FLOATING WHITE CAPSULE CONTAINER WITH DYNAMIC PURPLE GLOW */}
              <div 
                id="command-capsule-container"
                className={`
                  bg-white/95 backdrop-blur-xl rounded-[28px] flex flex-col p-5.5 transition-all duration-300 relative border text-left
                  ${isInputFocused || inputValue.trim() 
                    ? "shadow-[0_20px_50px_rgba(182,0,168,0.18),0_0_40px_rgba(182,0,168,0.25)] border-[#B600A8]" 
                    : "shadow-[0_12px_36px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] border-black/10 hover:border-black/20"
                  }
                `}
                style={{
                  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Floating layout scroll helper indicator */}
                <AnimatePresence>
                  {showScrollBottom && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onClick={scrollToBottom}
                      className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/95 border border-black/5 hover:border-black/10 text-black text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 transition-all cursor-pointer select-none z-35"
                    >
                      <span>SCROLL DOWN</span>
                      <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Row 1: Strategic Action Toolbar & Telemetry Metrics */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-3 mb-3 select-none text-[11px]">
                  {/* Left: Agent Targeting Selector Dropdown with Node Info */}
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <button
                        onClick={() => setShowAgentSelector(!showAgentSelector)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-black font-extrabold uppercase rounded-full transition-all cursor-pointer border border-transparent hover:border-black/5 text-[10px] tracking-wider"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#B600A8] animate-ping absolute" />
                        <span className="w-2 h-2 rounded-full bg-[#B600A8] relative" />
                        <span>NODE: {selectedTargetAgent}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[#333333]/60" />
                      </button>
                      
                      {showAgentSelector && (
                        <div className="absolute left-0 bottom-full mb-2 w-64 bg-white border border-black/10 rounded-2xl p-1.5 shadow-2xl z-50 space-y-0.5">
                          <div className="text-[9px] font-black tracking-widest text-[#B600A8] uppercase font-mono px-2 py-1.5 select-none border-b border-black/5">
                            Route Directive To
                          </div>
                          {[
                            { name: "Jack", desc: "Command Center (All Nodes)", avatar: "https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png" },
                            { name: "Sofia Reyes", desc: "UX & Store Design Node", avatar: "https://k.top4top.io/p_3823b6zzr1.png" },
                            { name: "Marcus Lee", desc: "Backend & Systems Node", avatar: "https://d.top4top.io/p_382318j801.png" },
                            { name: "Yuna Park", desc: "Frontend & Interactions Node", avatar: "https://f.top4top.io/p_38231v44q1.png" },
                            { name: "Leo Dumont", desc: "Sourcing & Suppliers Node", avatar: "https://a.top4top.io/p_38234y23p1.png" },
                            { name: "Amir Hassan", desc: "Growth & Growth Ops Node", avatar: "https://b.top4top.io/p_3823y6mno1.png" }
                          ].map((agent) => (
                            <button
                              key={agent.name}
                              onClick={() => {
                                setSelectedTargetAgent(agent.name);
                                setShowAgentSelector(false);
                              }}
                              className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                                selectedTargetAgent === agent.name 
                                  ? "bg-[#B600A8]/10 text-black font-bold" 
                                  : "hover:bg-black/5 text-[#333333]/80"
                              }`}
                            >
                              <img src={agent.avatar} alt={agent.name} className="w-5 h-5 rounded-full object-cover border border-black/10" referrerPolicy="no-referrer" />
                              <div>
                                <div className="text-[10px] font-bold leading-none">{agent.name}</div>
                                <div className="text-[8px] text-[#333333]/50 leading-none mt-1">{agent.desc}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Passive Live Telemetry Badge (Professional Hardware Look) */}
                    <div className="hidden md:flex items-center gap-3 bg-neutral-50 px-3 py-1 rounded-full border border-black/5 font-mono text-[9px] text-[#333333]/50">
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        <span>FPS: 60</span>
                      </div>
                      <div>PING: 32ms</div>
                      <div className="text-[#B600A8]/80 font-bold">TUNNEL: TLS 1.3</div>
                    </div>
                  </div>

                  {/* Right: Toggle Mode & Presets */}
                  <div className="flex items-center gap-2">
                    {/* Deep Sourcing SATELLITE mode */}
                    <button
                      onClick={() => {
                        setDeepBrainAnalysis(!deepBrainAnalysis);
                        if (!deepBrainAnalysis) {
                          appendSystemLog("Initiated deep brain telemetry sourcing scan...", "Leo Dumont", "info");
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold transition-all border ${
                        deepBrainAnalysis 
                          ? "bg-[#B600A8]/15 text-[#B600A8] border-[#B600A8]/30 shadow-[0_0_12px_rgba(182,0,168,0.15)]" 
                          : "bg-neutral-50 text-[#333333]/60 border-transparent hover:text-black hover:bg-neutral-100"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#B600A8]" />
                      <span>DEEP SEARCH</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${deepBrainAnalysis ? "bg-[#B600A8] animate-pulse" : "bg-neutral-300"}`} />
                    </button>

                    {/* Pre-packaged directives */}
                    <div className="relative">
                      <button
                        onClick={() => setShowTemplatesDropdown(!showTemplatesDropdown)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-[#333333]/70 hover:text-black font-extrabold rounded-full transition-all cursor-pointer border border-black/5"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>QUICK OPS</span>
                      </button>

                      {showTemplatesDropdown && (
                        <div className="absolute right-0 bottom-full mb-2 w-64 bg-white border border-black/10 rounded-2xl p-2 shadow-2xl z-50 space-y-1">
                          <div className="text-[9px] font-black tracking-widest text-[#B600A8] uppercase font-mono px-2 py-1 select-none border-b border-black/5">
                            Interactive Directives
                          </div>
                          {[
                            { title: "Generate Fashion Shop", desc: "Build dropshipping site in streetwear apparel", prompt: "Generate streetwear apparel storefront" },
                            { title: "Inspect Suppliers API", desc: "Scan active dropship supply coordinates", prompt: "Run high fidelity telemetry scan on supplier nodes" },
                            { title: "Review Checkout Latency", desc: "Diagnose database and CSS loading speeds", prompt: "Optimize database latency and run diagnostic pipeline" },
                            { title: "Draft Meta Ad Copy", desc: "Draft marketing and ad copy scripts", prompt: "Draft ad copies and conversion assets for trending items" }
                          ].map((tmpl, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setInputValue(tmpl.prompt);
                                setShowTemplatesDropdown(false);
                              }}
                              className="w-full text-left p-2 rounded-xl hover:bg-black/5 transition-all group"
                            >
                              <div className="text-[10px] font-bold text-black uppercase group-hover:text-[#B600A8] transition-colors">{tmpl.title}</div>
                              <div className="text-[8px] text-[#333333]/60 leading-normal mt-0.5">{tmpl.desc}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interactive Suggested Chips / Prompt Accelerator */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3.5 select-none">
                  <span className="text-[8px] font-black text-[#333333]/30 tracking-wider uppercase font-mono mr-1">SUGGESTIONS:</span>
                  {[
                    { label: "🎯 Find Winners", prompt: "Find trending dropshipping products in streetwear fashion with high margins" },
                    { label: "🎨 Obsidian Skin", prompt: "Apply a sleek Stealth Obsidian color palette with neon magenta highlights" },
                    { label: "⚡ Fast Checkout", prompt: "Scan systems and configure caching to reduce checkout latency to < 300ms" },
                    { label: "📊 Supplier Audit", prompt: "Perform deep audit of active dropship suppliers and coordinate logistic routes" }
                  ].map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => setInputValue(chip.prompt)}
                      className="px-2.5 py-1 text-[9px] font-bold rounded-lg bg-[#B600A8]/5 hover:bg-[#B600A8]/10 text-neutral-800 hover:text-black border border-[#B600A8]/5 hover:border-[#B600A8]/20 transition-all cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Graphic Attachment Preview Bubble inside the chat input */}
                {attachedImage && (
                  <div className="mb-3.5 bg-neutral-50 border border-black/5 rounded-2xl p-2.5 max-w-[240px] flex items-center justify-between shadow-sm relative group select-none">
                    <div className="flex items-center gap-2.5">
                      <img src={attachedImage} alt="Attach element" className="w-10 h-10 rounded-lg object-cover border border-black/5" />
                      <div>
                        <span className="text-[9px] font-extrabold text-black uppercase block">ATTACHED DESIGN</span>
                        <span className="text-[7px] font-mono text-[#333333]/45">PNG IMAGE ASSET</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAttachedImage(null)}
                      className="p-1 hover:bg-red-500/10 hover:text-red-500 text-[#333333]/40 rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Row 2: Large Professional Multi-layered Command Input Area */}
                <div className="flex items-start gap-3 py-2 px-3.5 bg-neutral-50/80 border border-black/5 focus-within:border-[#B600A8]/30 rounded-2xl transition-all">
                  <div className="text-[11px] font-black text-[#B600A8] font-mono select-none mt-1.5">
                    CMD://
                  </div>
                  <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    placeholder={
                      chatMode === "collecting-info" 
                        ? "Fulfill active guided briefing parameter..." 
                        : "Brief Command Center on your dropshipping targets..."
                    }
                    className="flex-1 bg-transparent py-1 text-sm sm:text-base text-black placeholder-[#333333]/30 outline-none transition-all font-sans font-semibold"
                  />
                </div>

                {/* Row 3: Action Controls Bar */}
                <div className="flex items-center justify-between border-t border-black/5 pt-3.5 mt-3.5 select-none">
                  <div className="flex items-center gap-1.5">
                    {/* File Uploader */}
                    <input 
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach Design / Graphic Asset"
                      className="p-2.5 text-[#333333]/50 hover:text-black hover:bg-neutral-100 transition-all cursor-pointer rounded-xl flex-shrink-0 border border-transparent"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>

                    {/* Mic speech dictation */}
                    <button 
                      onClick={handleToggleSpeech}
                      title="Microphone Voice Dictation"
                      className={`p-2.5 transition-all cursor-pointer rounded-xl flex-shrink-0 border border-transparent ${
                        isListening 
                          ? "text-white bg-red-500 border-red-500/20 animate-pulse" 
                          : "text-[#333333]/50 hover:text-black hover:bg-neutral-100"
                      }`}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3.5">
                    {/* Character Metric byte breakdown */}
                    <div className="hidden sm:flex flex-col items-end gap-1 font-mono text-[8px] text-[#333333]/35">
                      <span>SIZE: {inputValue.length} BYTES</span>
                      <div className="w-16 h-1 bg-neutral-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#7621B0] to-[#B600A8]" 
                          style={{ width: `${Math.min((inputValue.length / 280) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Dispatch Button (Vibrant gradient with sleek design) */}
                    <motion.button
                      onClick={() => handleSendMessage()}
                      disabled={(!inputValue.trim() && !attachedImage) || isTyping}
                      whileHover={{ scale: 1.025 }}
                      whileTap={{ scale: 0.975 }}
                      className="flex items-center gap-2.5 px-5 py-3 rounded-xl cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed group flex-shrink-0 bg-gradient-to-tr from-[#7621B0] to-[#B600A8] text-white shadow-lg shadow-[#B600A8]/20 hover:shadow-[0_0_20px_rgba(182,0,168,0.4)] text-xs font-black uppercase tracking-wider"
                    >
                      <span>DISPATCH OPS</span>
                      <Send className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Character Counter & Keyboard shortcuts */}
              <div className="flex items-center justify-between mt-3 px-2 text-[8px] text-[#333333]/30 font-mono tracking-widest uppercase">
                <span>⌨ PAYLOAD BYTES: {inputValue.length}</span>
                <span className="hidden sm:inline">⚡ ENTER TO DISPATCH // DIRECTIVE PIPELINE v3.15</span>
              </div>
            </div>
          </div>  {/* END OF LEFT STRATEGIC PANEL */}

          {/* 4. RIGHT TACTICAL PREVIEW PANEL (60% width - Active Store Rendering & Mission Timeline) */}
          <AnimatePresence>
            {(showPreview || chatMode === "building" || chatMode === "store-ready") && (
              <motion.div
                variants={previewVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="fixed bottom-0 left-0 right-0 h-[65vh] md:h-full z-30 md:z-auto md:relative md:bottom-auto md:left-auto md:right-auto md:w-[58%] flex bg-white/70 border-t md:border-t-0 md:border-l border-black/5 overflow-hidden select-none"
              >
                {/* Subtle backdrops inside Right Preview */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-md pointer-events-none z-0" />

                <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
                  
                  {/* Web Frame Control Header (Light Mac Style) */}
                  <div className="h-12 bg-white/90 border-b border-black/5 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-10 select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] shadow-sm" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] shadow-sm" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] shadow-sm" />
                    </div>

                    <div className="bg-black/5 border border-black/5 rounded-full px-4 py-1 flex items-center gap-2 max-w-[250px] truncate select-none">
                      <Lock className="w-3 h-3 text-[#333333]/40" />
                      <span className="text-[10px] text-[#333333]/50 font-mono tracking-wider truncate">
                        https://{storeInfo.name ? storeInfo.name.toLowerCase().replace(/\s+/g, '-') : 'nexvend'}.store/preview
                      </span>
                    </div>

                    {/* Device Layout Selectors */}
                    <div className="flex items-center gap-1 bg-black/5 border border-black/5 rounded-lg p-0.5 select-none">
                      <button 
                        onClick={() => setPreviewDevice("desktop")}
                        className={`p-1 rounded transition-all cursor-pointer ${previewDevice === "desktop" ? "bg-[#B600A8] text-white" : "text-[#333333]/45 hover:text-black"}`}
                        title="Desktop Layout View"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setPreviewDevice("tablet")}
                        className={`p-1 rounded transition-all cursor-pointer ${previewDevice === "tablet" ? "bg-[#B600A8] text-white" : "text-[#333333]/45 hover:text-black"}`}
                        title="Tablet Layout View"
                      >
                        <Tablet className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setPreviewDevice("mobile")}
                        className={`p-1 rounded transition-all cursor-pointer ${previewDevice === "mobile" ? "bg-[#B600A8] text-white" : "text-[#333333]/45 hover:text-black"}`}
                        title="Mobile Responsive View"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Interactive WooCommerce Render Showcase */}
                  <div className="flex-1 overflow-y-auto p-6 bg-neutral-100 flex items-center justify-center relative select-none">
                    
                    {/* Wireframe matrix grid underlay during build */}
                    {chatMode === "building" && (
                      <div className="absolute inset-0 bg-[radial-gradient(#d1d1d1_1px,transparent_1px)] [background-size:16px_16px] opacity-40 z-0" />
                    )}

                    <motion.div
                      className="w-full h-full max-w-full rounded-2xl border border-black/5 bg-white flex flex-col overflow-hidden relative shadow-lg transition-all duration-500"
                      style={{
                        width: previewDevice === "mobile" ? "375px" : previewDevice === "tablet" ? "768px" : "100%",
                        height: "100%",
                        boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.08)",
                        maxHeight: "100%"
                      }}
                    >
                      {/* Interactive Storefront top header */}
                      <div className="h-14 bg-white border-b border-black/5 flex items-center justify-between px-5 select-none">
                        <span className="text-sm font-black tracking-widest text-black uppercase">
                          🛍️ {storeInfo.name || "NEXVEND ACTIVE"}
                        </span>
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-[#333333]/60 select-none">
                          <span className="hover:text-black transition-colors cursor-pointer">Shop</span>
                          <span className="hover:text-black transition-colors cursor-pointer">About</span>
                          <span className="hover:text-black transition-colors cursor-pointer">Support</span>
                          <div className="h-4 w-[1px] bg-black/10" />
                          <button className="px-3.5 py-1.5 bg-[#B600A8] hover:bg-[#B600A8]/90 text-white text-[9px] font-black rounded-full uppercase tracking-widest shadow-sm shadow-[#B600A8]/20">
                            Cart (0)
                          </button>
                        </div>
                      </div>

                      {/* Store main canvas render */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin bg-neutral-50/50">
                        
                        {/* Dynamic Hero banner with selected colors */}
                        <div className="relative rounded-2xl overflow-hidden py-12 px-6 sm:px-8 text-left bg-white border border-black/5 shadow-sm">
                          {/* Colored overlay matching custom theme */}
                          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 blur-3xl animate-pulse" 
                            style={{ backgroundColor: storeInfo.colorTheme.includes("magenta") || storeInfo.colorTheme.includes("purple") ? "#B600A8" : "#3B82F6" }} 
                          />
                          
                          <div className="max-w-md relative z-10 space-y-3">
                            <span className="text-[9px] font-black tracking-[0.25em] text-[#B600A8] uppercase font-mono block">
                              FALL // WINTER CATALOG LIVE
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight leading-none">
                              THE NEXT EVOLUTION OF {storeInfo.niche || "STREET LUXURY"} IS HERE.
                            </h2>
                            <p className="text-[10px] text-[#333333]/60 font-sans leading-relaxed">
                              Sourced and curated by Jack's elite operational intelligence squad. Limitless performance configured standard.
                            </p>
                            <button 
                              className="px-4 py-2 text-[9px] font-black uppercase tracking-wider text-white bg-black hover:bg-neutral-800 rounded-full transition-all cursor-pointer shadow-sm"
                            >
                              Explore Drops
                            </button>
                          </div>
                        </div>

                        {/* Product Grid showcase */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-black">
                              🔥 Sourced Drops ({storeProducts.length})
                            </h3>
                            <span className="text-[9px] text-[#B600A8] font-bold uppercase tracking-wider font-mono">
                              Verified Suppliers Active
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {storeProducts.map(p => (
                              <div 
                                key={p.id}
                                className="bg-white border border-black/5 hover:border-[#B600A8]/30 rounded-2xl p-3 flex flex-col group/item transition-all shadow-sm hover:shadow-[0_4px_20px_rgba(182,0,168,0.06)]"
                              >
                                <div className="aspect-video sm:aspect-square rounded-xl overflow-hidden mb-3 relative bg-neutral-100 border border-black/5">
                                  <img 
                                    src={p.image} 
                                    alt={p.name} 
                                    className="w-full h-full object-cover group-hover/item:scale-102 transition-transform duration-500"
                                  />
                                  <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-md text-[8px] font-black uppercase tracking-widest font-mono text-[#B600A8] px-2 py-0.5 rounded-md border border-black/5 shadow-sm">
                                    {p.tag}
                                  </span>
                                </div>
                                <h4 className="text-xs font-bold text-black uppercase tracking-wide truncate">{p.name}</h4>
                                <div className="flex items-center justify-between mt-1 select-none">
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-xs font-mono font-bold text-[#B600A8]">{p.price}</span>
                                    <span className="text-[9px] font-mono text-[#333333]/40 line-through">{p.oldPrice}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                    <span className="text-[9px] text-[#333333]/60 font-bold font-mono">{p.rating}</span>
                                  </div>
                                </div>
                                
                                {/* PREMIUM CARD HOVER GLOW SOURCE BUTTON */}
                                <button 
                                  onClick={() => alert(`Sourcing configuration loaded: Sourcing ${p.name}`)}
                                  className="w-full mt-3 py-2 bg-black hover:bg-[#B600A8] text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm hover:shadow-[0_0_12px_rgba(182,0,168,0.4)]"
                                >
                                  Source Now
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Customer Support Widget Demo */}
                        <div className="p-4 rounded-xl border border-black/5 bg-white flex items-center justify-between select-none shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#B600A8]/10 border border-[#B600A8]/20 flex items-center justify-center text-sm">
                              💬
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-black uppercase tracking-wider">Automated Support Channels Connected</div>
                              <div className="text-[9px] text-[#333333]/60 font-sans mt-0.5">Yuna Park is managing standard questions on auto-pilot.</div>
                            </div>
                          </div>
                          <span className="bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-[8px] uppercase tracking-wider font-mono font-bold">
                            Online
                          </span>
                        </div>

                      </div>

                      {/* Store footer bar */}
                      <div className="h-10 border-t border-black/5 bg-white flex items-center justify-between px-5 select-none">
                        <span className="text-[8px] text-[#333333]/40 font-mono uppercase tracking-widest">
                          © {storeInfo.name || "NEXVEND BUILD"}. POWERED BY WOOCY OPS.
                        </span>
                        <span className="text-[8px] text-[#B600A8] font-bold font-mono uppercase tracking-widest">
                          UPLINK PROTECTED
                        </span>
                      </div>
                    </motion.div>

                    {/* Matrix Scanning Overlay during build step */}
                    {chatMode === "building" && (
                      <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center p-6">
                        <div className="max-w-xs text-center space-y-4">
                          
                          {/* Animated Cyber Ring */}
                          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#B600A8]/30 animate-spin" />
                            <div className="absolute inset-2 rounded-full border border-[#7621B0]/30 animate-[ping_1.5s_infinite]" />
                            <Sparkles className="w-6 h-6 text-[#B600A8] animate-pulse" />
                          </div>

                          <div className="space-y-1.5 select-none">
                            <h4 className="text-xs font-black uppercase tracking-widest text-black font-mono">
                              COMPILING WOOCY STOREFRONT
                            </h4>
                            <p className="text-[10px] text-[#333333]/60 font-mono">
                              Step {buildStep}/4: {buildStepsTexts[Math.min(Math.floor(elapsedTime / 8), 5)]}
                            </p>
                          </div>

                          {/* Building Progress bar */}
                          <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden select-none">
                            <motion.div 
                              className="bg-gradient-to-r from-[#7621B0] to-[#B600A8] h-full rounded-full"
                              style={{ width: `${buildProgress}%` }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-[8px] font-mono text-[#333333]/40 uppercase tracking-wider">
                            <span>ELAPSED: {formatTime(elapsedTime)}s</span>
                            <span>PROG: {Math.round(buildProgress)}%</span>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* Final Deployed live page state */}
                    <AnimatePresence>
                      {chatMode === "store-ready" && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white border border-green-500/30 p-4 rounded-2xl w-[90%] max-w-sm flex items-center justify-between shadow-xl backdrop-blur-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-sm text-green-700">
                              ✓
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-black uppercase tracking-wider">Deployment Complete</div>
                              <div className="text-[9px] text-[#333333]/60 font-sans mt-0.5 font-medium">Your shop is functional. Sourcing lines live.</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={handleShareLink}
                              className="px-3.5 py-1.5 bg-[#B600A8] hover:bg-[#B600A8]/90 text-white text-[9px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all shadow-sm shadow-[#B600A8]/20"
                            >
                              Share Link
                            </button>
                          </div>
                        </div>
                      )}
                    </AnimatePresence>

                  </div>

                </div>

                {/* FAR RIGHT MISSION TIMELINE / REAL-TIME SYSTEM LOGS (Adapted for elegant light mode) */}
                <div className="w-60 bg-white/80 border-l border-black/5 p-4 flex flex-col select-none h-full hidden lg:flex">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/5 select-none">
                    <span className="text-[9px] font-black text-[#333333]/40 tracking-[0.2em] uppercase font-mono">
                      Tactical Timeline
                    </span>
                    <span className="text-[8px] bg-[#B600A8]/10 text-[#B600A8] rounded px-1.5 py-0.5 font-bold font-mono">
                      ONLINE
                    </span>
                  </div>

                  {/* Vertical Timeline logs */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-none font-mono">
                    {systemLogs.map((log) => (
                      <div key={log.id} className="text-left space-y-1">
                        <div className="flex items-center justify-between text-[8px] text-[#333333]/40">
                          <span>[{log.time}]</span>
                          <span className="text-[#B600A8] font-bold">{log.agent}</span>
                        </div>
                        <p className={`text-[10px] leading-relaxed ${
                          log.type === "success" ? "text-green-600 font-medium" : log.type === "warning" ? "text-amber-600" : "text-[#333333]"
                        }`}>
                          &gt; {log.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Diagnostic stats */}
                  <div className="mt-auto pt-4 border-t border-black/5 space-y-2 select-none">
                    <div className="flex justify-between items-center text-[9px] text-[#333333]/40 font-mono uppercase">
                      <span>DEPLOY METHOD</span>
                      <span className="text-black font-bold">WOOCY v2</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-[#333333]/40 font-mono uppercase">
                      <span>SATELLITE PIN</span>
                      <span className="text-[#B600A8] font-bold">NEX-V315</span>
                    </div>
                  </div>

                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </main>

      </div>

      {/* SQUAD OVERLAY MODAL ROSTER PANEL (Elegant clean white theme) */}
      <AnimatePresence>
        {squadOverlayOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-md flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-lg bg-white border border-black/10 rounded-[30px] p-6 shadow-2xl"
            >
              <button 
                onClick={() => setSquadOverlayOpen(false)}
                className="absolute top-5 right-5 p-1 rounded-full hover:bg-black/5 text-[#333333]/50 hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 select-none">
                <span className="text-[10px] text-[#B600A8] font-mono tracking-[0.25em] uppercase block mb-1">
                  NexVend Ops Command Suite
                </span>
                <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                  Squad Roster Status
                </h2>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                {squadAgents.map((agent) => (
                  <div 
                    key={agent.name} 
                    className="flex items-center justify-between pb-3.5 border-b border-black/5 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3.5 text-left">
                      <div className="relative">
                        <img 
                          src={agent.avatar} 
                          alt={agent.name} 
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-full object-cover border border-black/5 shadow-sm"
                        />
                        <span 
                          className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white"
                          style={{ backgroundColor: agent.status === "active" ? "#10B981" : "#F59E0B" }}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-bold uppercase text-black flex items-center gap-2">
                          {agent.name}
                          <span className="text-[8px] bg-black/5 border border-black/5 rounded-md px-1.5 py-0.5 text-[#333333]/60 font-mono">
                            NODE
                          </span>
                        </div>
                        <div className="text-xs text-[#333333]/50 font-medium mt-0.5">
                          {agent.role}
                        </div>
                      </div>
                    </div>
                    
                    <span className={`rounded-full px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-mono font-bold ${
                      agent.status === "active" 
                        ? "bg-green-100 text-green-700 border border-green-200" 
                        : "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSquadOverlayOpen(false)}
                className="w-full mt-6 py-3 bg-[#B600A8] hover:bg-[#B600A8]/95 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md shadow-[#B600A8]/20 hover:shadow-[0_4px_20px_rgba(182,0,168,0.35)]"
              >
                Return to Battle Console
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share / Copy Toasts */}
      <AnimatePresence>
        {copiedToast && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-100 border border-green-200 text-green-800 text-xs px-5 py-2.5 rounded-full shadow-lg font-bold tracking-wide z-[100] select-none pointer-events-none"
          >
            ✓ Copy link established!
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
