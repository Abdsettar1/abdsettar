import { motion } from "motion/react";
import { ContactButton } from "./Reusable";
import { Cpu } from "lucide-react";
import { useEffect, useState } from "react";

function FloatingBoxes() {
  const boxes = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 40 + 20,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 4,
    rotateX: Math.random() * 360,
    rotateY: Math.random() * 360,
    opacity: Math.random() * 0.12 + 0.04,
  }));

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      {boxes.map((box) => (
        <motion.div
          key={box.id}
          style={{
            position: 'absolute',
            left: `${box.x}%`,
            top: `${box.y}%`,
            width: box.size,
            height: box.size,
            border: '1px solid rgba(182,0,168,0.3)',
            borderRadius: '4px',
            opacity: box.opacity,
            transformStyle: 'preserve-3d',
          }}
          animate={{
            rotateX: [box.rotateX, box.rotateX + 180, box.rotateX + 360],
            rotateY: [box.rotateY, box.rotateY + 180, box.rotateY + 360],
            y: [0, -20, 0],
            opacity: [box.opacity, box.opacity * 2.5, box.opacity],
          }}
          transition={{
            duration: box.duration,
            delay: box.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

interface HeroSectionProps {
  onContactClick: () => void;
}

export function HeroSection({ onContactClick }: HeroSectionProps) {
  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative w-full h-screen min-h-[650px] bg-[#0C0C0C] flex flex-col justify-between overflow-hidden select-none"
    >
      <FloatingBoxes />

      {/* Purple ambient glow — top left */}
      <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] rounded-full bg-[#B600A8]/5 blur-[120px] pointer-events-none z-0" />
      {/* Purple ambient glow — bottom right */}
      <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] rounded-full bg-[#7621B0]/5 blur-[100px] pointer-events-none z-0" />

      {/* Subtle CSS tech grid */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(215,226,234,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(215,226,234,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* TOP NAVBAR */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full px-6 md:px-12 pt-6 flex justify-between items-center"
        style={{ position: "relative", zIndex: 2 }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-3 group cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-[#18011F] to-[#B600A8] flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(182,0,168,0.2)]">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="font-black uppercase tracking-[0.25em] text-white text-sm sm:text-base">
            NEXVEND <span className="text-[#B600A8] font-light">// COMMAND</span>
          </span>
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-4 sm:gap-8">
          {[
            { label: "Home", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
            { label: "Services", action: () => handleScroll("services") },
            { label: "Squad", action: () => handleScroll("squad") },
            { label: "Contact", action: onContactClick },
          ].map((link) => (
            <button
              key={link.label}
              onClick={link.action}
              className="text-[#D7E2EA] text-xs font-semibold uppercase tracking-widest hover:opacity-70 transition-opacity duration-200 cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </div>
      </motion.nav>

      {/* HERO CONTENT */}
      <div
        className="flex-grow flex flex-col justify-center items-center px-4 w-full text-center"
        style={{ position: "relative", zIndex: 2 }}
      >
        <div className="overflow-hidden mb-1 sm:mb-2">
          <motion.h1
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="hero-heading font-black uppercase tracking-tighter leading-none text-[13vw] sm:text-[14vw] md:text-[15.5vw] lg:text-[16vw] text-center"
          >
            your orders.
          </motion.h1>
        </div>

        <div className="overflow-hidden mb-6 sm:mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="hero-heading font-black uppercase tracking-tighter leading-none text-[13vw] sm:text-[14vw] md:text-[15.5vw] lg:text-[16vw] text-center"
          >
            our mission.
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-[#D7E2EA] font-light uppercase tracking-[0.3em] text-center max-w-xl mx-auto px-4"
          style={{ fontSize: "clamp(0.75rem, 1.4vw, 1.25rem)" }}
        >
          Drop your goal. Jack and the squad take it from there.
        </motion.p>
      </div>

      {/* BOTTOM BAR */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full px-6 md:px-12 pb-10 flex justify-between items-end gap-6"
        style={{ position: "relative", zIndex: 2 }}
      >
        <div
          className="text-[#D7E2EA] font-light uppercase tracking-wider leading-snug max-w-[280px]"
          style={{ fontSize: "clamp(0.7rem, 1.2vw, 1rem)" }}
        >
          every task routed. <br />
          every agent briefed. <br />
          every result tracked.
        </div>

        <ContactButton onClick={onContactClick}>Start Now</ContactButton>
      </motion.div>
    </section>
  );
}
