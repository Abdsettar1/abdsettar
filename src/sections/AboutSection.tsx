import FadeIn from "../components/FadeIn";
import AnimatedText from "../components/AnimatedText";
import ContactButton from "../components/ContactButton";
import { useNavigate } from "react-router-dom";

export default function AboutSection() {
  const navigate = useNavigate();

  return (
    <section
      id="about"
      className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-8 md:px-10 py-20 overflow-x-clip bg-[#0C0C0C]"
    >
      {/* Decorative images */}
      <FadeIn
        delay={0.1}
        x={-80}
        y={0}
        duration={0.9}
        className="absolute top-[4%] left-[1%] sm:left-[2%] md:left-[4%] pointer-events-none"
      >
        <img
          src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png"
          alt=""
          className="w-[120px] sm:w-[160px] md:w-[210px] object-contain"
          loading="lazy"
        />
      </FadeIn>

      <FadeIn
        delay={0.25}
        x={-80}
        y={0}
        duration={0.9}
        className="absolute bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%] pointer-events-none"
      >
        <img
          src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png"
          alt=""
          className="w-[100px] sm:w-[140px] md:w-[180px] object-contain"
          loading="lazy"
        />
      </FadeIn>

      <FadeIn
        delay={0.15}
        x={80}
        y={0}
        duration={0.9}
        className="absolute top-[4%] right-[1%] sm:right-[2%] md:right-[4%] pointer-events-none"
      >
        <img
          src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png"
          alt=""
          className="w-[120px] sm:w-[160px] md:w-[210px] object-contain"
          loading="lazy"
        />
      </FadeIn>

      <FadeIn
        delay={0.3}
        x={80}
        y={0}
        duration={0.9}
        className="absolute bottom-[8%] right-[3%] sm:right-[6%] md:right-[10%] pointer-events-none"
      >
        <img
          src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png"
          alt=""
          className="w-[130px] sm:w-[170px] md:w-[220px] object-contain"
          loading="lazy"
        />
      </FadeIn>

      {/* Content */}
      <div className="flex flex-col items-center gap-10 sm:gap-12 md:gap-14 relative z-10">
        <FadeIn delay={0} y={40}>
          <h2
            className="hero-heading font-black uppercase leading-none tracking-tight text-center text-white"
            style={{ fontSize: "clamp(3rem, 8vw, 100px)" }}
          >
            About us
          </h2>
        </FadeIn>

        <div style={{ fontSize: "clamp(1rem, 1.5vw, 1.1rem)" }} className="px-4">
          <AnimatedText
            text="NexVend is a mobile e-commerce squad built for serious sellers. We plug into your business and handle everything — winning product research, store setup, customer support across WhatsApp, Telegram, and Facebook, and growth strategies that actually convert. You focus on scaling. We handle the rest."
            className="text-[#D7E2EA] font-medium text-center leading-relaxed max-w-[560px]"
          />
        </div>

        <FadeIn delay={0.2} y={20}>
          <ContactButton 
            onClick={() => navigate("/command")}
            className="px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-sm md:text-base" 
          />
        </FadeIn>
      </div>
    </section>
  );
}
