import { motion } from "motion/react";
import { ContactButton, FadeIn } from "./Reusable";

interface CTASectionProps {
  onContactClick: () => void;
}

export function CTASection({ onContactClick }: CTASectionProps) {
  return (
    <section className="relative w-full bg-[#0C0C0C] py-32 px-5 text-center select-none overflow-hidden">
      
      {/* Background neon radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70vw] rounded-full bg-radial-gradient from-[#B600A8]/5 to-transparent blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-8">
        
        {/* Small Label Pill */}
        <FadeIn delay={0} y={20}>
          <div className="border border-[#D7E2EA]/20 bg-black/40 rounded-full px-5 py-2 text-xs text-[#D7E2EA]/50 font-medium uppercase tracking-[0.25em]">
            READY TO SCALE?
          </div>
        </FadeIn>

        {/* Section Heading */}
        <FadeIn delay={0.15} y={30}>
          <h2 className="hero-heading font-black uppercase tracking-tight leading-tight" style={{ fontSize: "clamp(2rem, 5.6vw, 63px)" }}>
            Let's build your empire.
          </h2>
        </FadeIn>

        {/* Sub-text */}
        <FadeIn delay={0.25} y={20}>
          <p className="text-[#D7E2EA]/50 font-light uppercase tracking-[0.25em] text-xs sm:text-sm md:text-base max-w-lg mx-auto">
            One message to Jack. The squad handles the rest.
          </p>
        </FadeIn>

        {/* ContactButton Action */}
        <FadeIn delay={0.4} y={20} className="mt-2">
          <ContactButton onClick={onContactClick}>
            Start Now
          </ContactButton>
        </FadeIn>

        {/* Social Proof Micro-stats Section */}
        <FadeIn delay={0.5} y={25} className="w-full max-w-xl mt-12">
          <div className="flex flex-row items-center justify-center gap-4 sm:gap-8">
            
            {/* Stat 1 */}
            <div className="flex flex-col items-center flex-1">
              <span className="font-black text-[#D7E2EA] tracking-tight leading-none" style={{ fontSize: "clamp(1rem, 1.7vw, 1.4rem)" }}>
                50+
              </span>
              <span className="mt-2 font-light text-[#D7E2EA]/40 uppercase tracking-[0.2em] text-[10px] sm:text-xs">
                Stores
              </span>
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] h-8 bg-white/10 self-center" />

            {/* Stat 2 */}
            <div className="flex flex-col items-center flex-1">
              <span className="font-black text-[#D7E2EA] tracking-tight leading-none" style={{ fontSize: "clamp(1rem, 1.7vw, 1.4rem)" }}>
                24/7
              </span>
              <span className="mt-2 font-light text-[#D7E2EA]/40 uppercase tracking-[0.2em] text-[10px] sm:text-xs">
                Support
              </span>
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] h-8 bg-white/10 self-center" />

            {/* Stat 3 */}
            <div className="flex flex-col items-center flex-1">
              <span className="font-black text-[#D7E2EA] tracking-tight leading-none" style={{ fontSize: "clamp(1rem, 1.7vw, 1.4rem)" }}>
                72h
              </span>
              <span className="mt-2 font-light text-[#D7E2EA]/40 uppercase tracking-[0.2em] text-[10px] sm:text-xs">
                Launch
              </span>
            </div>

          </div>
        </FadeIn>

      </div>

    </section>
  );
}
