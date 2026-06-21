import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "./Reusable";

interface StepData {
  id: string;
  number: string;
  title: string;
  description: string;
}

const steps: StepData[] = [
  {
    id: "step-1",
    number: "01",
    title: "Tell Jack",
    description: "Open the command center. Describe your goal in plain words — your store, your audience, your timeline. No forms. No jargon."
  },
  {
    id: "step-2",
    number: "02",
    title: "We Plan",
    description: "Jack breaks down your request and briefs each agent with a precise role. Sofia, Yuna, Leo, Marcus, Amir — everyone knows their mission."
  },
  {
    id: "step-3",
    number: "03",
    title: "We Execute",
    description: "The squad gets to work. You get updates. Results land in 72 hours or less — store live, agents online, products sourced."
  }
];

export function HowItWorksSection() {
  return (
    <section 
      id="squad" 
      className="relative z-20 w-full bg-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 px-5 py-24 select-none overflow-hidden"
    >
      {/* Background neon dots/ambient noise */}
      <div className="absolute top-1/4 left-1/10 w-80 h-80 bg-[#B600A8]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-80 h-80 bg-[#7621B0]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        
        {/* Section Heading */}
        <div className="text-center mb-16">
          <FadeIn delay={0} y={40}>
            <h2 className="hero-heading font-black uppercase leading-none tracking-tight text-center" style={{ fontSize: "clamp(3rem, 10vw, 110px)" }}>
              How It Works.
            </h2>
          </FadeIn>
        </div>

        {/* 3 Horizontal Steps Container */}
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            return (
              <div key={step.id} className="flex flex-col md:flex-row flex-1 items-stretch gap-6">
                
                {/* Step Card */}
                <FadeIn 
                  delay={index * 0.15} 
                  y={30} 
                  className="flex-grow flex flex-col p-8 sm:p-10 bg-white/[0.02] border border-white/[0.08] rounded-[30px] hover:border-[#B600A8]/40 hover:bg-white/[0.03] transition-all duration-300 group cursor-default"
                >
                  {/* Step Large Number */}
                  <div className="hero-heading font-black leading-none mb-4 tracking-tighter" style={{ fontSize: "clamp(4.5rem, 8vw, 100px)" }}>
                    {step.number}
                  </div>

                  {/* Step Title */}
                  <h3 
                    className="font-black uppercase text-[#D7E2EA] mb-4 tracking-wide group-hover:text-white transition-colors"
                    style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)" }}
                  >
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p 
                    className="font-light text-[#D7E2EA]/60 leading-relaxed max-w-sm"
                    style={{ fontSize: "clamp(0.85rem, 1.5vw, 1.05rem)" }}
                  >
                    {step.description}
                  </p>

                  <div className="mt-8 pt-4 border-t border-white/[0.03] flex items-center justify-between text-[11px] font-mono text-[#D7E2EA]/20 uppercase tracking-widest">
                    <span>SECTOR_0{index + 1}</span>
                    <span>READY</span>
                  </div>
                </FadeIn>

                {/* Horizontal connector arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex flex-shrink-0 items-center justify-center">
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    >
                      <ArrowRight className="w-7 h-7 text-[#D7E2EA]/20 self-center" />
                    </motion.div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
