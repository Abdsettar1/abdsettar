import { motion } from "motion/react";
import { 
  ShoppingBag, 
  MessageCircle, 
  Send, 
  TrendingUp, 
  BarChart2, 
  Zap, 
  ArrowUpRight 
} from "lucide-react";
import { FadeIn } from "./Reusable";

interface ServiceCardData {
  id: string;
  icon: any;
  title: string;
  description: string;
}

const serviceCards: ServiceCardData[] = [
  {
    id: "sc-1",
    icon: ShoppingBag,
    title: "Store Builder",
    description: "We design and launch your store from zero. Fast, clean, built to convert from day one."
  },
  {
    id: "sc-2",
    icon: MessageCircle,
    title: "WhatsApp Support",
    description: "Real agents plugged into your WhatsApp — answering customers, closing sales, 24/7."
  },
  {
    id: "sc-3",
    icon: Send,
    title: "Telegram & Messenger",
    description: "We connect your store to Telegram and Messenger with dedicated agents per channel."
  },
  {
    id: "sc-4",
    icon: TrendingUp,
    title: "Winning Products",
    description: "Leo researches only the products proven to sell — no guessing, no wasted budget."
  },
  {
    id: "sc-5",
    icon: BarChart2,
    title: "Ad Campaigns",
    description: "Amir runs your Meta and TikTok ads from creative to optimization. You pay for results."
  },
  {
    id: "sc-6",
    icon: Zap,
    title: "Full Growth System",
    description: "Pricing strategy, post-purchase flows, retention — the complete engine to scale your store."
  }
];

export function ServicesGridSection() {
  return (
    <section 
      id="services" 
      className="relative z-10 w-full bg-[#FFFFFF] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 px-5 py-20 pb-28 md:py-24 select-none"
    >
      
      <div className="max-w-6xl mx-auto">
        
        {/* Main Heading */}
        <div className="text-center mb-4">
          <FadeIn delay={0} y={30}>
            <h2 className="text-[#0C0C0C] font-black uppercase leading-none tracking-tight text-center" style={{ fontSize: "clamp(3rem, 10vw, 110px)" }}>
              Pick Your Weapon.
            </h2>
          </FadeIn>
        </div>

        {/* Subtitle */}
        <div className="text-center mb-20">
          <FadeIn delay={0.1} y={20}>
            <p className="text-[#0C0C0C]/50 font-light uppercase tracking-[0.25em] text-xs sm:text-sm max-w-lg mx-auto">
              Every tool your store needs. One squad to run them all.
            </p>
          </FadeIn>
        </div>

        {/* 6 cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {serviceCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <FadeIn 
                key={card.id} 
                delay={index * 0.08} 
                y={25}
                className="h-full"
              >
                <div 
                  className="group flex flex-col justify-between p-8 bg-[#F8F8F8] border border-black/[0.06] rounded-[28px] h-full transition-all duration-300 hover:bg-white hover:shadow-[0_20px_50px_rgba(182,0,168,0.06)] hover:-translate-y-1.5 cursor-pointer"
                >
                  <div>
                    {/* Icon container */}
                    <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0C0C0C]/5 text-[#B600A8] group-hover:bg-[#B600A8] group-hover:text-white transition-all duration-300">
                      <IconComponent className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" />
                    </div>

                    {/* Card Title */}
                    <h3 
                      className="font-black uppercase text-[#0C0C0C] mb-3 group-hover:text-[#B600A8] transition-colors duration-300"
                      style={{ fontSize: "clamp(1.1rem, 2vw, 1.4rem)" }}
                    >
                      {card.title}
                    </h3>

                    {/* Description */}
                    <p 
                      className="font-light text-[#0C0C0C]/60 leading-relaxed"
                      style={{ fontSize: "clamp(0.85rem, 1.4vw, 1rem)" }}
                    >
                      {card.description}
                    </p>
                  </div>

                  {/* Corner Accent Arrow and bottom bar */}
                  <div className="mt-8 pt-4 border-t border-black/[0.04] flex justify-between items-center">
                    <span className="text-[10px] font-mono text-black/30 tracking-widest uppercase group-hover:text-black/50 transition-colors">
                      N_WEAPON_0{index + 1}
                    </span>
                    <div className="text-[#B600A8]/50 group-hover:text-[#B600A8] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>

                </div>
              </FadeIn>
            );
          })}
        </div>

      </div>

    </section>
  );
}
