import { ReactNode, useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "motion/react";

interface ContactButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  id?: string;
}

export function ContactButton({ children, onClick, className = "", id }: ContactButtonProps) {
  return (
    <motion.button
      id={id}
      onClick={onClick}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.4), 0 10px 30px rgba(182, 0, 168, 0.5)",
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={`relative px-8 py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-white rounded-full cursor-pointer overflow-hidden border border-white/15 ${className}`}
      style={{
        background: "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)",
        boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 4px 15px rgba(182, 0, 168, 0.25)"
      }}
    >
      {/* Ambient hover glow */}
      <motion.div 
        className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={false}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
}

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
  id?: string;
  key?: string | number;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.8,
  x = 0,
  y = 0,
  className = "",
  id
}: FadeInProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      transition={{
        delay,
        duration,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedText({ text, className = "" }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.25"]
  });

  const characters = text.split("");

  return (
    <span ref={containerRef} className={`inline-block relative ${className}`}>
      {characters.map((char, i) => {
        const start = i / characters.length;
        const end = (i + 1) / characters.length;
        const opacity = useTransform(scrollYProgress, [start, end], [0.25, 1]);
        
        return (
          <motion.span key={i} style={{ opacity }} className="inline-block whitespace-pre-wrap">
            {char}
          </motion.span>
        );
      })}
    </span>
  );
}
