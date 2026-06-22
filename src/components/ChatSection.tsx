import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FadeIn } from "./Reusable";
import { Send, Check, AlertCircle } from "lucide-react";
import { Message } from "../types";

interface ChatSectionProps {
  onInitiateConsole?: (message: string) => void;
}

export function ChatSection({ onInitiateConsole }: ChatSectionProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "user",
      text: "I need to launch a dropshipping store and handle customer messages on WhatsApp.",
      isInitial: true
    },
    {
      id: "msg-2",
      sender: "jack",
      text: "Got it. I'm briefing the squad now:",
      pills: [
        "🛍 Sofia — Store Design",
        "💬 Yuna — WhatsApp Support",
        "📦 Leo — Product Research"
      ],
      isInitial: true
    },
    {
      id: "msg-3",
      sender: "jack",
      text: "Your store will be live within 72 hours. Yuna will be online on WhatsApp from day one.",
      isInitial: true
    }
  ]);

  const [inputValue, setInputValue] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessageText = inputValue.trim();

    if (onInitiateConsole) {
      onInitiateConsole(userMessageText);
      setInputValue("");
      return;
    }

    // 1. Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userMessageText
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");

    // 2. Trigger the "Jack is on it." toast
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);

    // 3. Simulated Response from Jack
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);

      // Simple keyword detection for intelligent feedback
      let jackReply = "Affirmative. Command received. The squad has been deployed to execute this task immediately.";
      let briefs: string[] = ["⚙️ Marcus — Tech Setup", "⚡ Amir — Operations"];

      const textLower = userMessageText.toLowerCase();
      if (textLower.includes("ad") || textLower.includes("marketing") || textLower.includes("traffic")) {
        jackReply = "Command received. I have assigned Amir to construct a highly targeted ad campaign and Marcus to monitor integration pipelines.";
        briefs = ["📈 Amir — Growth Ads", "🖥️ Marcus — Funnel Audit"];
      } else if (textLower.includes("design") || textLower.includes("logo") || textLower.includes("theme") || textLower.includes("look")) {
        jackReply = "Perfect. Sofia and Leo are on standby. Sofia is already initiating initial structural mockups for your review.";
        briefs = ["🛍️ Sofia — Creative Design", "🎨 Leo — Visual Mood"];
      } else if (textLower.includes("money") || textLower.includes("sales") || textLower.includes("scale") || textLower.includes("sell")) {
        jackReply = "Understood. The scaling engine is now online. Sofia is prepping conversions while Leo initiates high-converting asset tracking.";
        briefs = ["⚡ Leo — Weaponized Products", "🚀 Sofia — Conversion Tuning"];
      } else if (textLower.includes("support") || textLower.includes("chat") || textLower.includes("help") || textLower.includes("customer")) {
        jackReply = "Confirmed. Yuna will handle support flows while Sofia custom-builds integrated live widgets.";
        briefs = ["💬 Yuna — WhatsApp Lead", "🗳️ Sofia — Widget Deployment"];
      }

      const jackMsg: Message = {
        id: `jack-${Date.now()}`,
        sender: "jack",
        text: jackReply,
        pills: briefs
      };

      setMessages(prev => [...prev, jackMsg]);
    }, 1500);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    // Support standard Enter, Cmd+Enter, and Ctrl+Enter for power users
    if (e.key === "Enter" || (e.key === "Enter" && (e.metaKey || e.ctrlKey))) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section id="contact" className="relative w-full bg-[#0C0C0C] py-24 px-5 overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70vw] rounded-full bg-radial-gradient from-[#7621B0]/5 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Section Heading */}
        <FadeIn delay={0} y={40} className="text-center mb-4">
          <h2 className="hero-heading font-black uppercase tracking-tight leading-none text-center" style={{ fontSize: "clamp(2.5rem, 7vw, 84px)" }}>
            Command Jack.
          </h2>
        </FadeIn>

        {/* Sub-label */}
        <FadeIn delay={0.1} y={20} className="text-center mb-16">
          <p className="text-[#D7E2EA]/60 font-light uppercase tracking-[0.25em] text-xs sm:text-sm">
            Describe what you need. The squad gets briefed automatically.
          </p>
        </FadeIn>

        {/* Premium Chat Window */}
        <FadeIn delay={0.2} y={30} className="w-full max-w-3xl">
          <div className="bg-white/[0.03] border border-white/10 rounded-[30px] sm:rounded-[40px] overflow-hidden backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            
            {/* Chat Header Bar */}
            <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                
                {/* Jack's Avatar - Rounded & Bordered */}
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 shadow-[0_0_15px_rgba(182,0,168,0.3)]">
                  <img
                    src="https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png"
                    alt="Jack"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {/* Status Ring */}
                  <div className="absolute inset-0 border border-[#B600A8]/30 rounded-full" />
                </div>

                <div>
                  <div className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    Jack
                    <span className="text-[10px] text-white/40 font-mono font-normal">// SQUAD LEADER</span>
                  </div>
                  <div className="text-[11px] text-[#D7E2EA]/60 font-light tracking-wide">Ready for transmission</div>
                </div>

              </div>

              {/* Status Dot with pulse animation */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#D7E2EA]/40 font-mono uppercase tracking-widest hidden sm:inline">Encrypted link</span>
                <div className="relative flex h-2 w-2">
                  <motion.span 
                    animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                  />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollContainerRef}
              className="px-6 py-8 min-h-[360px] max-h-[460px] flex flex-col gap-5 overflow-y-auto bg-gradient-to-b from-transparent to-black/10"
            >
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <motion.div
                      key={msg.id}
                      initial={msg.isInitial ? false : { opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"} w-full`}
                    >
                      {/* Avatar for Jack */}
                      {!isUser && (
                        <div className="flex items-center gap-2 mb-1.5 ml-1">
                          <img
                            src="https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png"
                            alt="Jack Avatar"
                            referrerPolicy="no-referrer"
                            className="w-5 h-5 rounded-full object-cover border border-[#D7E2EA]/20"
                          />
                          <span className="text-[10px] text-[#D7E2EA]/50 font-bold uppercase tracking-widest">Jack</span>
                        </div>
                      )}

                      {/* Bubble content */}
                      <div
                        className={`px-5 py-3.5 text-sm leading-relaxed font-light ${
                          isUser
                            ? "bg-gradient-to-br from-[#18011F] via-[#7621B0] to-[#BE4C00] rounded-[22px] rounded-tr-[4px] text-white max-w-[85%] sm:max-w-[75%] shadow-[0_10px_20px_rgba(118,33,176,0.15)] border border-white/5"
                            : "bg-white/[0.06] border border-white/10 rounded-[22px] rounded-tl-[4px] text-[#D7E2EA] max-w-[90%] sm:max-w-[80%]"
                        }`}
                        style={isUser ? {
                          background: "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)"
                        } : {}}
                      >
                        <p className={isUser ? "text-white font-normal" : "text-[#D7E2EA]/90"}>
                          {msg.text}
                        </p>

                        {/* Assignment pills for Jack */}
                        {msg.pills && (
                          <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-white/[0.06]">
                            <p className="w-full text-[10px] text-[#D7E2EA]/40 font-mono uppercase tracking-widest mb-1">Squad Briefing Targets:</p>
                            {msg.pills.map((pill, i) => (
                              <div
                                key={i}
                                className="border border-white/10 bg-black/40 rounded-full px-3 py-1 text-[11px] text-white/80 font-normal uppercase tracking-wide flex items-center gap-1.5 hover:border-white/20 transition-all cursor-default"
                              >
                                {pill}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Simulated Jack Typing indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-start w-full"
                  >
                    <div className="flex items-center gap-2 mb-1 ml-1">
                      <img
                        src="https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png"
                        alt="Jack Avatar"
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full object-cover border border-[#D7E2EA]/20"
                      />
                      <span className="text-[10px] text-[#D7E2EA]/50 font-bold uppercase tracking-widest">Jack</span>
                    </div>
                    <div className="bg-white/[0.04] border border-white/5 rounded-[22px] rounded-tl-[4px] px-5 py-3.5 flex items-center gap-1.5">
                      <motion.div animate={{ scale: [0.7, 1.2, 0.7] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-[#B600A8]" />
                      <motion.div animate={{ scale: [0.7, 1.2, 0.7] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-[#B600A8]" />
                      <motion.div animate={{ scale: [0.7, 1.2, 0.7] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-[#B600A8]" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Bar */}
            <div className="px-4 py-4 border-t border-white/[0.08] flex items-center gap-3 bg-black/30">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your goal..."
                className="flex-1 bg-transparent border border-white/10 rounded-full px-5 py-3.5 text-white placeholder-white/20 font-light text-xs sm:text-sm outline-none transition-colors focus:border-white/25 focus:bg-white/[0.01]"
              />
              
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="relative px-6 py-3.5 rounded-full cursor-pointer overflow-hidden border border-white/10 text-xs text-white font-bold uppercase tracking-widest hover:shadow-[0_4px_15px_rgba(182,0,168,0.4)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed group"
                style={{
                  background: "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)",
                }}
              >
                <span className="hidden sm:inline">Send</span>
                <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>

          </div>
        </FadeIn>

      </div>

      {/* Toast Notification: AnimatePresence */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-50 px-6 py-3.5 rounded-full text-white text-xs font-bold uppercase tracking-widest border border-white/10 flex items-center gap-2.5 shadow-[0_10px_30px_rgba(182,0,168,0.4)] whitespace-nowrap"
            style={{
              background: "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)",
            }}
          >
            <Check className="w-4 h-4 text-white bg-white/20 rounded-full p-0.5" />
            Jack is on it.
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
