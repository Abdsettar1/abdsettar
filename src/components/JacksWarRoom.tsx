import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu, X, Send, Paperclip, Mic, SquarePen, Users,
  ShoppingBag, MessageCircle, TrendingUp, BarChart2,
  ChevronRight, ArrowRight, Check, AlertCircle, Info,
  ExternalLink, UserCheck, Shield, Laptop, Zap,
  Lock, CheckCircle2, Share2, Copy, ChevronDown, Trash2, Volume2, VolumeX, Search, Plus, Sparkles
} from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

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

  const handleSelectSession = (sess: ChatSession) => {
    // Cancel any speech active on swap
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

  // Speech to Text Dictation
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

  // Text To Speech synthesize
  const handleSpeakText = (msgId: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    
    // Stripping potential markdown artifacts for cleaner voice dictation
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

  // Image Upload handler click + drag/drop
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

  const sendToJackForSession = async (messageText: string, targetSessionId: string, currentMsgs: ChatMessage[]) => {
    setIsTyping(true);
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

        if (jackResponse.detectedIntent === 'store' && jackResponse.nextAction === 'collecting-info') {
          if (activeSessionId === targetSessionId) {
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
          } else {
            setSessionsList(prevList => prevList.map(s => {
              if (s.id === targetSessionId) {
                const guided1: ChatMessage = {
                  id: `jack-guided-1-${Date.now()}`,
                  role: 'jack',
                  type: 'text',
                  content: "Perfect. Let's build your store. First — what's your store name?",
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
        content: 'Squad is currently being briefed. Give me a moment.',
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
    "Designing homepage layout...",
    "Setting up product pages...",
    "Configuring checkout flow...",
    "Adding your brand colors...",
    "Connecting payment gateway...",
    "Final touches..."
  ];

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

    // Build the user message bubble
    const userMsg: ChatMessage = {
      id: `user-msg-${Date.now()}`,
      role: "user",
      type: "text",
      content: textToSend || "Attached an image for review",
      image: attachedImage || undefined,
      timestamp: getTimestamp()
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputValue("");
    setAttachedImage(null);

    // If there is an image, provide a real custom product review response
    if (userMsg.image) {
      setIsTyping(true);
      setTimeout(() => {
        const productBriefReply: ChatMessage = {
          id: `jack-vision-${Date.now()}`,
          role: "jack",
          type: "assignment",
          content: "Commander, I've run a localized visual pass on the uploaded asset. Sofia Reyes recommends an ultra-clean layout with custom high-contrast borders. Leo Dumont is verifying competitive sourcing coordinates for this niche. Amir Hassan is ready to deploy target campaigns. Shall we initialize Sofia's store building module?",
          agents: [
            { name: "Sofia Reyes", role: "Layout & borders draft", emoji: "🛍️" },
            { name: "Leo Dumont", role: "Sourcing coordination", emoji: "🔍" },
            { name: "Amir Hassan", role: "Ad campaigns draft", emoji: "📈" }
          ],
          timestamp: getTimestamp()
        };
        setMessages(prev => [...prev, productBriefReply]);
        setIsTyping(false);
      }, 1500);
      return;
    }

    if (chatMode === "normal") {
      sendToJackForSession(textToSend, activeSessionId, nextMessages);
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
          setStoreInfo(prev => ({ ...prev, niche: textToSend }));
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
          setStoreInfo(prev => ({ ...prev, colorTheme: textToSend }));
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
          const finalInfo = { ...storeInfo, language: textToSend };
          setStoreInfo(prev => ({ ...prev, language: textToSend }));
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
      className="fixed inset-0 z-50 bg-[#0C0C0C] h-screen overflow-hidden flex flex-col text-[#D7E2EA] font-sans"
    >
      {/* Noise Texture Overlay */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.015'/%3E%3C/svg%3E")`,
          pointerEvents: "none",
          zIndex: 1
        }}
      />

      {/* DRAG AND DROP GLASS OVERLAY */}
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-8 border-4 border-dashed border-[#B600A8]/40 m-4 rounded-[32px] select-none pointer-events-none"
          >
            <div className="w-20 h-20 rounded-full bg-[#B600A8]/10 flex items-center justify-center border border-[#B600A8]/30 mb-4 animate-bounce">
              <Paperclip className="w-10 h-10 text-[#B600A8]" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-wider text-white">Drop product image to attach</h3>
            <p className="text-sm text-[#D7E2EA]/40 mt-1">Release to add this graphic to Jack's operational workspace</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP HEADER NAVIGATION BAR */}
      <header className="h-14 bg-[#0C0C0C]/80 border-b border-white/[0.04] backdrop-blur-md flex items-center justify-between px-4 sm:px-6 relative z-50 select-none">
        
        {/* Left side: Hamburger, Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-[#D7E2EA]/60 hover:text-white rounded-lg hover:bg-white/5 transition-all md:hidden cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo Brand with pulsing status ring */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#18011F] to-[#B600A8] flex items-center justify-center shadow-lg border border-[#B600A8]/45">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0C0C0C] animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-black tracking-[0.2em] uppercase text-white flex items-center gap-1.5 leading-none">
                NEXVEND <span className="text-[9px] text-[#B600A8] font-bold tracking-widest bg-[#B600A8]/10 px-1 py-0.5 rounded border border-[#B600A8]/10">OPS</span>
              </div>
              <div className="text-[9px] text-[#D7E2EA]/30 font-semibold tracking-wider font-mono mt-0.5 uppercase leading-none">
                Command Terminal v3.12
              </div>
            </div>
          </div>
        </div>

        {/* Center Section: Operational active log name */}
        <div className="hidden md:flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-full py-1 px-4 text-xs tracking-wider font-semibold uppercase text-[#D7E2EA]/70">
          <Zap className="w-3.5 h-3.5 text-[#B600A8]" />
          <span>Active Command:</span>
          <span className="text-[#B600A8] max-w-[150px] truncate">
            {sessionsList.find(s => s.id === activeSessionId)?.title || "Standard Log"}
          </span>
        </div>

        {/* Right side: Actions, buttons, exit */}
        <div className="flex items-center gap-2">
          
          <button
            onClick={handleCreateNewSession}
            title="Start New Session"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B600A8]/10 hover:bg-[#B600A8]/25 border border-[#B600A8]/30 rounded-full text-xs text-[#D7E2EA] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Session</span>
          </button>

          <button 
            onClick={() => setSquadOverlayOpen(true)}
            className="px-3 py-1.5 text-xs text-[#D7E2EA]/60 hover:text-white hover:bg-white/5 border border-white/5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-[#B600A8]" />
            <span className="hidden sm:inline">Squad Roster ({squadAgents.length})</span>
          </button>

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

        {/* LEFT SIDEBAR (Competitor-level Sessions history) */}
        <aside 
          className={`
            fixed md:relative top-0 bottom-0 left-0 w-64 pt-14 md:pt-0 z-40 md:z-20
            transition-transform duration-300 ease-in-out select-none flex flex-col h-full
          `}
          style={{
            background: 'rgba(255,255,255,0.012)',
            borderRight: '1px solid rgba(215,226,234,0.05)',
            backdropFilter: 'blur(16px)'
          }}
        >
          
          <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-6 scrollbar-none select-none">
            
            {/* Mission Log / Chat History list */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[10px] text-white/30 font-mono uppercase tracking-[0.12em] font-bold">
                  Mission Sessions
                </span>
                <span className="text-[9px] bg-white/[0.04] text-white/40 border border-white/5 rounded-full px-2 py-0.5 font-mono">
                  {sessionsList.length}
                </span>
              </div>

              {/* Session Search Bar */}
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 text-white/30 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search briefings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#D7E2EA] placeholder-white/20 outline-none focus:border-[#B600A8]/40 transition-all font-sans"
                />
              </div>
              
              <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1 scrollbar-none">
                {filteredSessions.map((sess) => {
                  const isActive = sess.id === activeSessionId;
                  return (
                    <div
                      key={sess.id}
                      onClick={() => handleSelectSession(sess)}
                      className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer border transition-all ${
                        isActive 
                          ? "bg-[#B600A8]/10 border-[#B600A8]/30 text-white" 
                          : "border-transparent text-white/60 hover:text-white hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <MessageCircle className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-[#B600A8]" : "text-white/30"}`} />
                        <span className="text-xs truncate font-medium font-sans leading-none">{sess.title}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(sess.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/15 text-white/30 hover:text-red-400 transition-all cursor-pointer flex-shrink-0"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
                {filteredSessions.length === 0 && (
                  <div className="text-[11px] text-white/20 text-center py-4 font-sans italic">
                    No matching sessions
                  </div>
                )}
              </div>
            </div>

            {/* Section 2 - Active Squad */}
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
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img 
                        src={agent.avatar}
                        alt={agent.name}
                        referrerPolicy="no-referrer"
                        style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover',
                        border: '1.5px solid rgba(215,226,234,0.12)' }} 
                      />
                      <div style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: 9, height: 9, borderRadius: '50%',
                        background: agent.status === 'active' ? '#4ade80' : '#fbbf24',
                        border: '1.5px solid #0C0C0C'
                      }} />
                    </div>

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

            {/* Section 3 - Mission Status */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 10, color: 'rgba(215,226,234,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>
                  MISSION STATUS
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(215,226,234,0.06)' }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
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
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(215,226,234,0.07)',
                  borderRadius: 10, padding: '8px 10px' }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#B600A8', lineHeight: 1 }}>72h</div>
                  <div style={{ fontSize: 9, color: 'rgba(215,226,234,0.3)', textTransform: 'uppercase',
                    letterSpacing: '0.08em', fontWeight: 300, marginTop: 2 }}>ETA</div>
                </div>
              </div>

              <div style={{ background: 'rgba(182,0,168,0.08)', border: '1px solid rgba(182,0,168,0.2)',
                borderRadius: 10, padding: '7px 12px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginTop: 6 }}>
                <span style={{ fontSize: 10, color: 'rgba(215,226,234,0.5)', textTransform: 'uppercase',
                  letterSpacing: '0.08em' }}>Store Status</span>
                <span style={{ fontSize: 10, color: '#B600A8', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.06em' }}>
                  {chatMode === "store-ready" ? "READY" : chatMode === "building" ? "BUILDING" : "STANDBY"}
                </span>
              </div>
            </div>

          </div>
        </aside>

        {/* 3. CENTER / CHAT STREAM PANEL */}
        <main className="flex-1 flex overflow-hidden relative z-10 select-none">
          
          <div className={`flex flex-col relative h-full overflow-hidden transition-all duration-500 ease-[0.25,0.1,0.25,1] ${
            showPreview ? "w-full md:w-[40%] bg-[#0C0C0C]" : "w-full"
          }`}>

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
          
            {/* Chat Stream Container */}
            <div 
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 lg:px-16 py-6 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/5 pb-36 select-text"
            >
              
              {/* If chat is newly cleared/empty, render beautiful competitor-level Starter Cards empty state */}
              {isChatEmpty ? (
                <div className="flex flex-col justify-center items-center py-10 md:py-16 text-center select-none max-w-2xl mx-auto">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#18011F] to-[#B600A8] flex items-center justify-center border border-[#B600A8]/40 shadow-xl mb-6 shadow-[#B600A8]/10"
                  >
                    <Sparkles className="w-8 h-8 text-white animate-pulse" />
                  </motion.div>
                  
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-2 leading-none">
                    Launch your e-commerce dream
                  </h2>
                  <p className="text-sm text-[#D7E2EA]/45 font-light max-w-md mb-10 leading-relaxed">
                    Brief commander Jack and the NexVend expert squad to design your store, launch target ads, or configure automations.
                  </p>

                  {/* Competitor prompt suggestions layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
                    {starterPrompts.map((st, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + index * 0.08 }}
                        onClick={() => handleSendMessage(st.prompt)}
                        className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#B600A8]/40 hover:bg-[#B600A8]/5 transition-all duration-300 cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
                      >
                        <div>
                          <div className="text-xl mb-2.5 bg-white/[0.04] w-9 h-9 rounded-xl flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform">{st.icon}</div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">{st.title}</h4>
                          <p className="text-[11px] text-[#D7E2EA]/40 leading-relaxed font-light">{st.desc}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#B600A8] font-bold uppercase tracking-widest mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Dispatch command</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === "user";
                  
                  if (isUser) {
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                        className="flex flex-col items-end w-full select-text"
                      >
                        <div 
                          className="max-w-[85%] sm:max-w-[70%] md:max-w-[60%] px-5 py-3.5 border border-white/5"
                          style={{
                            background: "linear-gradient(135deg, #18011F 0%, #B600A8 50%, #7621B0 100%)",
                            borderRadius: '18px 18px 4px 18px',
                            boxShadow: '0 4px 24px rgba(182,0,168,0.25), 0 1px 0 rgba(255,255,255,0.05) inset'
                          }}
                        >
                          {msg.image && (
                            <div className="mb-3.5 overflow-hidden rounded-xl border border-white/10 max-h-48">
                              <img src={msg.image} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <p className="text-white text-sm sm:text-[14px] font-normal leading-relaxed whitespace-pre-wrap font-sans">
                            {msg.content}
                          </p>
                          
                          <span className="block text-right mt-1.5 text-[9px] text-white/40 font-mono uppercase tracking-wider select-none">
                            {msg.timestamp}
                          </span>
                        </div>
                      </motion.div>
                    );
                  }

                  const isSpeaking = speakingId === msg.id;

                  // Jack's message bubble
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                      className="flex gap-3 w-full items-start select-text"
                    >
                      <div 
                        className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-0.5 select-none"
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
                        
                        {/* Interactive Reaction & Actions Panel */}
                        <div className="absolute right-4 -top-3.5 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto flex items-center gap-1 bg-[#121212]/95 border border-[#D7E2EA]/20 rounded-full py-0.5 px-1.5 shadow-lg shadow-black/80 backdrop-blur-md select-none">
                          
                          {/* Speak button next to message bubble */}
                          <button
                            onClick={(e) => handleSpeakText(msg.id, msg.content, e)}
                            className={`w-6.5 h-6.5 flex items-center justify-center rounded-full transition-all cursor-pointer active:scale-90 ${
                              isSpeaking ? "bg-[#B600A8]/30 border border-[#B600A8]/50 text-white" : "hover:bg-white/10 text-white/70 hover:text-white"
                            }`}
                            title={isSpeaking ? "Mute Reader" : "Speak Message"}
                          >
                            {isSpeaking ? (
                              <VolumeX className="w-3.5 h-3.5 text-white animate-pulse" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <div className="w-[1px] h-3 bg-white/10 mx-1" />

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

                        {/* Copy button next to message */}
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
                          className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-[#121212] hover:border-white/15 text-[#D7E2EA]/40 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer hidden sm:block z-20 select-none"
                          title="Copy Message"
                        >
                          {singleCopiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <motion.div 
                          initial={{ borderLeftColor: "#B600A8", borderLeftWidth: "3px" }}
                          animate={{ borderLeftColor: "rgba(215,226,234,0.08)", borderLeftWidth: "1px" }}
                          transition={{ duration: 1.2 }}
                          className="rounded-[18px] rounded-tl-[4px] px-5 py-4 border-t border-r border-b"
                          style={{
                            background: 'rgba(255,255,255,0.035)',
                            borderTopColor: 'rgba(215,226,234,0.07)',
                            borderRightColor: 'rgba(215,226,234,0.07)',
                            borderBottomColor: 'rgba(215,226,234,0.07)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 2px 16px rgba(0,0,0,0.2)'
                          }}
                        >
                          {/* Rich Markdown parse layout replaces the generic white-space p tags */}
                          <MarkdownRenderer content={msg.content} />

                          {msg.type === "assignment" && msg.agents && (
                            <div 
                              className="p-4 mt-3.5 space-y-3"
                              style={{
                                background: 'rgba(182,0,168,0.05)',
                                border: '1px solid rgba(182,0,168,0.15)',
                                borderRadius: 14,
                              }}
                            >
                              <div className="text-[10px] text-[#B600A8] font-bold tracking-[0.12em] uppercase font-mono select-none">
                                ⚡ SQUAD BRIEFING TARGETS
                              </div>
                              
                              <div className="flex flex-wrap gap-2 pt-1 select-none">
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

                        {reactions[msg.id] && Object.entries(reactions[msg.id]).some(([_, count]) => (count as number) > 0) && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5 pl-1.5 select-none">
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

                        <span className="text-[10px] text-[#D7E2EA]/20 font-mono mt-1.5 uppercase tracking-wider pl-1 font-semibold block select-none">
                          {msg.timestamp}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}

              {isTyping && (
                <motion.div
                  key="typing-indicator"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-3 w-full items-start select-none"
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

              <div ref={messagesEndRef} />
            </div>

            <AnimatePresence>
              {showScrollBottom && (
                <motion.button
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-32 right-6 z-40 bg-[#0C0C0C]/90 border border-white/10 hover:border-[#B600A8]/50 hover:bg-white/[0.05] text-[#D7E2EA]/70 hover:text-white p-2.5 rounded-full shadow-lg backdrop-blur-md transition-all cursor-pointer flex items-center justify-center select-none"
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
                  className="absolute bottom-32 left-6 z-40 bg-[#121212]/95 border border-[#B600A8]/40 shadow-xl rounded-xl px-4 py-2 flex items-center gap-2 backdrop-blur-md select-none"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest text-[#D7E2EA] font-semibold font-mono">Message Copied</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* INPUT DISPATCH BAR AREA */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0C0C0C] via-[#0C0C0C]/95 to-[#0C0C0C]/80 border-t border-white/[0.06] backdrop-blur-3xl flex flex-col justify-center px-4 sm:px-6 md:px-10 lg:px-16 py-3.5 z-10 select-none"
              style={{ minHeight: 110 }}
            >
              
              {/* Attached Image Preview Row */}
              <AnimatePresence>
                {attachedImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="flex items-center gap-2.5 p-2 bg-white/[0.04] border border-white/10 rounded-xl mb-3 w-max select-none"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                      <img src={attachedImage} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setAttachedImage(null)}
                        className="absolute top-0.5 right-0.5 bg-black/75 hover:bg-black text-white rounded-full p-0.5 transition-all cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <div className="pr-3">
                      <div className="text-[10px] text-white/80 font-bold uppercase tracking-wider font-mono">WORKSPACE ATTACHMENT</div>
                      <div className="text-[9px] text-[#D7E2EA]/40 font-mono mt-0.5">Image ready for Jack's vision module</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="w-full flex items-center gap-3">
                
                {/* Manual Attachment file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach Graphic Asset"
                  className="p-2 text-[#D7E2EA]/40 hover:text-white hover:bg-white/5 transition-all cursor-pointer rounded-lg flex-shrink-0"
                >
                  <Paperclip className="w-4.5 h-4.5" />
                </button>

                {/* Message Field Input with custom purple glow ring */}
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    chatMode === "collecting-info" 
                      ? "Fulfill active guided briefing parameter..." 
                      : "Brief Commander Jack on enterprise goals..."
                  }
                  className="flex-1 bg-white/[0.015] border border-white/10 rounded-[14px] px-5 py-2.5 text-sm text-[#D7E2EA] placeholder-[#D7E2EA]/25 outline-none focus:border-[#B600A8] focus:bg-white/[0.03] focus:ring-3 focus:ring-[#B600A8]/10 transition-all font-sans"
                />

                {/* Microphone Speech Dictation */}
                <button 
                  onClick={handleToggleSpeech}
                  title="Microphone Voice Dictation"
                  className={`p-2 transition-all cursor-pointer rounded-lg flex-shrink-0 ${
                    isListening ? "text-pink-500 bg-pink-500/10 animate-pulse" : "text-[#D7E2EA]/40 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Mic className="w-4.5 h-4.5" />
                </button>

                {/* Submit Command */}
                <motion.button
                  onClick={() => handleSendMessage()}
                  disabled={(!inputValue.trim() && !attachedImage) || isTyping}
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

              {/* Character Counter & Keyboard shortcut bar */}
              <div className="flex items-center justify-between mt-2 px-1 text-[9px] text-[#D7E2EA]/20 font-mono tracking-wider">
                <span>⌨ CHARACTERS: {inputValue.length}</span>
                <span className="hidden sm:inline">⚡ PRESS ENTER TO DISPATCH // ESC OR STARTER BUTTON TO SWAP</span>
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
                className="fixed bottom-0 left-0 right-0 h-[60vh] md:h-full z-50 md:z-auto md:relative md:bottom-auto md:left-auto md:right-auto md:w-[60%] bg-[#080808] border-t md:border-t-0 md:border-l border-[#D7E2EA]/10 md:border-[#D7E2EA]/8 rounded-t-[24px] md:rounded-t-none flex flex-col overflow-hidden shadow-2xl md:shadow-none select-none"
              >
                {isMobile && (
                  <div className="py-2.5 flex-shrink-0">
                    <div className="w-12 h-1 rounded-full bg-[#D7E2EA]/20 mx-auto" />
                  </div>
                )}

                {/* Preview Top Bar */}
                <div className="h-10 bg-white/[0.02] border-b border-[#D7E2EA]/6 flex items-center justify-between px-4 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                  </div>

                  <div className="bg-white/[0.04] border border-[#D7E2EA]/8 rounded-full px-4 py-1 max-w-[200px] flex items-center gap-2 select-none">
                    <Lock className="w-3 h-3 text-[#D7E2EA]/30" />
                    <span className="text-xs text-[#D7E2EA]/30 font-light truncate">nexvend.store/preview</span>
                  </div>

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
                        className="ml-2 p-1 rounded-full hover:bg-white/10 text-[#D7E2EA]/40 hover:text-white transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    flex: 1,
                    overflow: 'hidden',
                    background: '#080808',
                  }}
                >
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

                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "linear-gradient(to top, rgba(8,8,8,0.4) 0%, transparent 40%, transparent 60%, rgba(8,8,8,0.2) 100%)"
                    }}
                  />

                  {chatMode === "building" && (
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-10">
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

                      <span className="text-xs text-[#D7E2EA]/40 font-light font-mono select-none">
                        {formatTime(elapsedTime)}
                      </span>
                    </div>
                  )}

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
                          
                          <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          >
                            <CheckCircle2 className="w-16 h-16 text-[#28C840]" />
                          </motion.div>

                          <div className="space-y-2">
                            <h2 className="hero-heading bg-gradient-to-r from-white via-[#D7E2EA] to-[#D7E2EA]/40 font-black uppercase text-2xl sm:text-3xl tracking-tight leading-none text-center">
                              Your Store is Live.
                            </h2>
                            <p className="text-[#D7E2EA]/50 font-light text-sm">
                              nexvend.store/{storeInfo.name ? storeInfo.name.toLowerCase().replace(/\s+/g, '-') : 'live'}
                            </p>
                          </div>

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

      {/* SQUAD OVERLAY MODAL ROSTER PANEL */}
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

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                
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
