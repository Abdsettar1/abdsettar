import { useState, useRef, useEffect } from "react";
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useTransform, 
  useSpring, 
  useMotionTemplate 
} from "framer-motion";

// =========================================================
// CUSTOM TEXT ANIMATION COMPONENTS
// =========================================================

interface ScrambleInProps {
  text: string;
  delay: number; // in ms
  triggered: boolean;
}

export function ScrambleIn({ text, delay, triggered }: ScrambleInProps) {
  const [revealedCount, setRevealedCount] = useState<number>(-1);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_#@!%&+?/[]{}*^$";

  useEffect(() => {
    if (!triggered) return;

    const timeoutId = setTimeout(() => {
      setRevealedCount(0);
      let frame = 0;
      const intervalId = setInterval(() => {
        frame++;
        const currentReveal = Math.floor(frame * 0.5);
        setRevealedCount(currentReveal);
        if (currentReveal >= text.length) {
          clearInterval(intervalId);
        }
      }, 25);
      return () => clearInterval(intervalId);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [triggered, text, delay]);

  if (!triggered || revealedCount === -1) {
    return <span dangerouslySetInnerHTML={{ __html: "&nbsp;" }} />;
  }

  const result = text.split("").map((char, index) => {
    if (char === " ") return " ";
    if (index < revealedCount) return char;
    if (index < revealedCount + 3) {
      return chars[Math.floor(Math.random() * chars.length)];
    }
    return "";
  }).join("");

  return <span>{result}</span>;
}

interface ScrambleTextProps {
  text: string;
  isHovered: boolean;
  className?: string;
}

export function ScrambleText({ text, isHovered, className = "" }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_#@!%&+?/[]{}*^$";

  useEffect(() => {
    if (!isHovered) {
      setDisplayText(text);
      return;
    }

    let frame = 0;
    const intervalId = setInterval(() => {
      frame++;
      const revealedCount = Math.floor(frame / 4);
      if (revealedCount >= text.length) {
        setDisplayText(text);
        clearInterval(intervalId);
        return;
      }

      const nextText = text.split("").map((char, index) => {
        if (char === " ") return " ";
        if (index < revealedCount) return char;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join("");

      setDisplayText(nextText);
    }, 25);

    return () => clearInterval(intervalId);
  }, [isHovered, text]);

  return <span className={className}>{displayText}</span>;
}

// =========================================================
// CUSTOM SVG LOGO (SynapseXLogo)
// =========================================================
export function SynapseXLogo({ className = "w-6 h-6" }: { className?: string }) {
  const path = "M 1.5,23 L 1.5,33 C 1.5,38.5 6,43 11.5,43 L 16.5,43 C 22,43 26.5,38.5 26.5,33 Q 28,28 33,26.5 C 38.5,26.5 43,22 43,16.5 L 43,11.5 C 43,6 38.5,1.5 33,1.5 L 23,1.5 Q 12,12 1.5,23 Z";
  return (
    <svg className={className} viewBox="-50 -50 100 100" fill="currentColor">
      <path d={path} />
      <path d={path} transform="rotate(90)" />
      <path d={path} transform="rotate(180)" />
      <path d={path} transform="rotate(270)" />
    </svg>
  );
}

// =========================================================
// ANIMATED HAMBURGER (SquashHamburger)
// =========================================================
interface SquashHamburgerProps {
  isOpen: boolean;
  onClick?: () => void;
  isMobile?: boolean;
}

export function SquashHamburger({ isOpen, onClick, isMobile = false }: SquashHamburgerProps) {
  const width = isMobile ? 15 : 18;
  const height = isMobile ? 10 : 12;
  const barHeight = isMobile ? 1.2 : 1.5;

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col justify-between focus:outline-none cursor-pointer"
      style={{ width, height }}
    >
      {/* Top bar */}
      <motion.span
        className="absolute bg-white rounded-full left-0 right-0"
        style={{ height: barHeight, top: 0, originX: 0.5, originY: 0.5 }}
        animate={
          isOpen
            ? { rotate: 45, y: height / 2 - barHeight / 2 }
            : { rotate: 0, y: 0 }
        }
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      {/* Middle bar */}
      <motion.span
        className="absolute bg-white rounded-full left-0 right-0"
        style={{ height: barHeight, top: height / 2 - barHeight / 2 }}
        animate={isOpen ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      {/* Bottom bar */}
      <motion.span
        className="absolute bg-white rounded-full left-0 right-0"
        style={{ height: barHeight, bottom: 0, originX: 0.5, originY: 0.5 }}
        animate={
          isOpen
            ? { rotate: -45, y: -(height / 2 - barHeight / 2) }
            : { rotate: 0, y: 0 }
        }
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
    </div>
  );
}

// =========================================================
// OPTIMIZED VIEWPORT-AWARE VIDEO COMPONENT
// =========================================================
interface IntersectionVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

export function IntersectionVideo({ src, className, ...props }: IntersectionVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(video);

    return () => {
      observer.unobserve(video);
      observer.disconnect();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      playsInline
      muted
      loop
      preload="metadata"
      style={{ willChange: "transform, opacity" }}
      {...props}
    />
  );
}

// =========================================================
// MAIN GENRITE PAGE (REDESIGNED FOR SYNAPSEX THEME)
// =========================================================
export function GenritePage() {
  const [entranceComplete, setEntranceComplete] = useState(false);

  // References for scroll-based parallax
  const section2Ref = useRef<HTMLDivElement>(null);

  // Video Scrubbing refs
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const lastClientXRef = useRef<number | null>(null);
  const isSeekingRef = useRef<boolean>(false);
  const pendingTimeRef = useRef<number | null>(null);
  const desiredTimeRef = useRef<number>(0);
  const accumulatedDeltaRef = useRef<number>(0);

  // Dynamically load Bootstrap Icons for Apple icon
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
    document.head.appendChild(link);
    
    // Set entrance complete after 800ms
    const timer = setTimeout(() => {
      setEntranceComplete(true);
    }, 800);

    return () => {
      document.head.removeChild(link);
      clearTimeout(timer);
    };
  }, []);

  // Framer Motion useScroll & custom spring transformation for Section 2
  const { scrollYProgress: section2ScrollProgress } = useScroll({
    target: section2Ref,
    offset: ["start end", "end start"]
  });

  const section2Spring = useSpring(section2ScrollProgress, {
    stiffness: 80,
    damping: 25,
    mass: 1.0
  });

  const yScaleValue = useTransform(section2Spring, [0, 1], [60, -120]);
  const section2Opacity = useTransform(section2Spring, [0, 0.3, 0.5, 1], [0, 0, 1, 1]);
  const section2Transform = useMotionTemplate`rotateX(24deg) translateY(${yScaleValue}px) translateZ(15px)`;

  // requestAnimationFrame loop for Hero Video scrubbing to avoid blocking main thread
  useEffect(() => {
    let rafId: number;
    const updateScrub = () => {
      rafId = requestAnimationFrame(updateScrub);

      if (accumulatedDeltaRef.current === 0) return;

      const video = heroVideoRef.current;
      if (!video || !video.duration) return;

      const sensitivity = 0.8;
      const deltaT = accumulatedDeltaRef.current * 0.01 * sensitivity;
      accumulatedDeltaRef.current = 0; // Consume the accumulated delta

      let target = video.currentTime + deltaT;
      if (target < 0) target = 0;
      if (target > video.duration) target = video.duration;

      desiredTimeRef.current = target;

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        video.currentTime = target;
      } else {
        pendingTimeRef.current = target;
      }
    };

    rafId = requestAnimationFrame(updateScrub);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Mouse scrubbing event handlers for Hero Video (Video #1)
  const handleMouseMoveScrub = (e: React.MouseEvent) => {
    if (lastClientXRef.current === null) {
      lastClientXRef.current = e.clientX;
      return;
    }
    const deltaX = e.clientX - lastClientXRef.current;
    lastClientXRef.current = e.clientX;

    accumulatedDeltaRef.current += deltaX;
  };

  const handleSeeked = () => {
    isSeekingRef.current = false;
    const video = heroVideoRef.current;
    if (video && pendingTimeRef.current !== null) {
      const nextTime = pendingTimeRef.current;
      pendingTimeRef.current = null;
      isSeekingRef.current = true;
      video.currentTime = nextTime;
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    lastClientXRef.current = e.clientX;
  };

  const handleMouseLeave = () => {
    lastClientXRef.current = null;
  };

  return (
    <div 
      dir="ltr"
      className="min-h-screen bg-black text-white selection:bg-white/20 selection:text-white antialiased overflow-x-hidden relative"
      style={{ fontFamily: '"Space Mono", monospace' }}
    >


      {/* =========================================================
          SECTION 1: HERO (Full viewport height, mouse scrubbed)
          ========================================================= */}
      <section 
        onMouseMove={handleMouseMoveScrub}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative h-screen h-[100dvh] w-full flex flex-col justify-between overflow-hidden bg-black z-10 select-none cursor-ew-resize"
      >
        {/* Background Video - pauses on load, mouse scrubbed */}
        <video
          ref={heroVideoRef}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_083515_290e5a10-0b95-41af-a5e2-32b6389baa4d.mp4"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
          playsInline
          muted
          onSeeked={handleSeeked}
        />

        {/* Dot grid overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-0" 
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "24x24px",
            opacity: 0.05
          }}
        />

        {/* Large background watermark text */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
          style={{ transform: "translateY(50px)" }}
        >
          <span 
            className="font-anton select-none text-center leading-none"
            style={{
              fontSize: "clamp(120px, 30vw, 521px)",
              letterSpacing: "-4px",
              opacity: 0.10,
              background: "radial-gradient(circle, rgba(142,127,148,0) 0%, #8E7F94 70%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            GENRITE AI
          </span>
        </div>

        {/* Empty layout push spacer */}
        <div className="flex-1" />

        {/* Hero Bottom Row */}
        <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12 max-w-7xl mx-auto flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          
          {/* Left Column */}
          <div className="flex flex-col gap-4 text-left">
            <h1 className="text-white font-light leading-[0.95] tracking-[-0.03em] text-[clamp(40px,10vw,100px)] uppercase">
              <ScrambleIn text="VISUAL" delay={200} triggered={entranceComplete} />
              <br />
              <ScrambleIn text="INTELLIGENCE" delay={500} triggered={entranceComplete} />
            </h1>
            
            <motion.p
              initial={{ y: 25, opacity: 0 }}
              animate={entranceComplete ? { y: 0, opacity: 1 } : { y: 25, opacity: 0 }}
              transition={{
                duration: 0.9,
                ease: [0.215, 0.610, 0.355, 1.000],
                delay: 0.2
              }}
              className="max-w-md text-[13px] sm:text-[15px] text-white/60 leading-relaxed font-mono"
            >
              A premium, full-stack generative AI engine designed to produce ultra-realistic cinematic sequences, high-fidelity promotional branding, and intelligent product analysis.
            </motion.p>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4 text-left md:text-right">
            <h1 className="text-white font-light leading-[0.95] tracking-[-0.03em] text-[clamp(40px,10vw,100px)] uppercase">
              <ScrambleIn text="ABSOLUTE" delay={700} triggered={entranceComplete} />
              <br />
              <ScrambleIn text="CREATIVITY" delay={1000} triggered={entranceComplete} />
            </h1>
          </div>

        </div>

      </section>

      {/* =========================================================
          SECTION 2: Cinematic Text (Full viewport height)
          ========================================================= */}
      <section 
        ref={section2Ref}
        className="relative h-screen h-[100dvh] min-h-[600px] w-full flex items-center justify-center bg-black overflow-hidden"
      >
        {/* Background Video #2 (viewport-aware autoplay) */}
        <IntersectionVideo
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_092455_089c54f8-3b03-4966-9df1-e9746063d0ef.mp4"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        />

        {/* Top gradient overlay */}
        <div 
          className="absolute top-0 left-0 right-0 h-[180px] z-10 pointer-events-none"
          style={{ background: "linear-gradient(180deg, #010103 0%, transparent 100%)" }}
        />

        {/* 3D Perspective Text Container */}
        <div 
          className="relative z-20 max-w-5xl w-full flex items-center justify-center"
          style={{ perspective: 400 }}
        >
          <motion.p
            style={{
              transform: section2Transform,
              opacity: section2Opacity,
              transformStyle: "preserve-3d",
              willChange: "transform, opacity"
            }}
            className="font-sans font-normal text-[22px] sm:text-[30px] md:text-[36px] lg:text-[42px] text-white leading-[1.35] tracking-[-0.02em] select-none px-6 sm:px-12 text-center"
          >
            Genrite fuses cutting-edge generative neural nets with luxury digital art. We decode complex product aesthetics and simple textual prompts into cinematic video clips and ultra-high-definition visual assets. We are building the future of autonomous, high-speed digital commercial production.
          </motion.p>
        </div>
      </section>

      {/* =========================================================
          SECTION 3: Metrics (Min-h-screen)
          ========================================================= */}
      <section className="relative min-h-screen w-full flex items-center justify-center bg-black overflow-hidden py-32 px-6">
        {/* Background Video #3 (viewport-aware autoplay) */}
        <IntersectionVideo
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095810_ecea3dd2-fc5e-4e41-8696-4219290b6589.mp4"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        />

        <div className="relative z-10 max-w-6xl w-full mx-auto flex flex-col items-center">
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.2 }}
            className="text-white/40 text-[13px] sm:text-[14px] tracking-[0.2em] uppercase mb-20 text-center font-mono"
          >
            PERFORMANCE & EFFICIENCY METRICS
          </motion.p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 w-full">
            {/* Metric 1 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0 }}
              className="flex flex-col items-center text-center"
            >
              <span className="text-white text-[clamp(48px,10vw,96px)] font-light tracking-[-0.04em] leading-none font-mono">
                3.2s
              </span>
              <span className="text-white/40 text-[13px] sm:text-[15px] mt-4 tracking-wide font-mono">
                Scene Generation Speed
              </span>
            </motion.div>

            {/* Metric 2 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="flex flex-col items-center text-center"
            >
              <span className="text-white text-[clamp(48px,10vw,96px)] font-light tracking-[-0.04em] leading-none font-mono">
                99.2%
              </span>
              <span className="text-white/40 text-[13px] sm:text-[15px] mt-4 tracking-wide font-mono">
                Prompt Coherence Rate
              </span>
            </motion.div>

            {/* Metric 3 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              <span className="text-white text-[clamp(48px,10vw,96px)] font-light tracking-[-0.04em] leading-none font-mono">
                4K UHD
              </span>
              <span className="text-white/40 text-[13px] sm:text-[15px] mt-4 tracking-wide font-mono">
                Maximum Native Resolution
              </span>
            </motion.div>
          </div>

        </div>
      </section>

      {/* =========================================================
          SECTION 4: Technology / Adaptive Intelligence
          ========================================================= */}
      <section className="relative h-screen h-[100dvh] min-h-[650px] w-full flex flex-col justify-between bg-black overflow-hidden px-8 sm:px-12 md:px-16 py-12 sm:py-16">
        {/* Background Video #4 (viewport-aware autoplay) */}
        <IntersectionVideo
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095750_32a52ce0-2005-45c9-9093-41f03fde9530.mp4"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        />

        {/* Top area */}
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-start gap-6 pt-16 text-left">
          <motion.h2
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.0 }}
            className="text-white font-light text-[clamp(36px,8vw,72px)] leading-[0.95] tracking-[-0.03em] uppercase font-mono"
          >
            CREATIVE <br /> PRODUCTION STUDIO
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.0, delay: 0.2 }}
            className="text-white/50 text-[13px] sm:text-[15px] leading-relaxed max-w-xs text-left md:pt-2 font-mono"
          >
            Genrite\'s adaptive visual engine scans design coordinates, textural dimensions, and brand attributes to synthesize publication-grade advertising creative instantly.
          </motion.p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Grid */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 w-full text-left">
          {[
            {
              title: "Cinematic Video",
              desc: "Deploy beautiful, physically coherent 4K reels from minimalist prompts with incredible camera flight paths."
            },
            {
              title: "Hyper-Real Photos",
              desc: "Simulate intricate studio lighting, natural shadows, and organic textures that capture and hold attention."
            },
            {
              title: "Telemetry Scanning",
              desc: "Analyze and decode physical features of your products to construct optimized catalog layouts and marketing compositions."
            },
            {
              title: "UHD Rendering",
              desc: "Instantly upgrade lighting quality, micro-bevels, and texture resolution for flawless production quality."
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 + idx * 0.1 }}
              className="flex flex-col"
            >
              <h4 className="text-white text-[14px] sm:text-[16px] font-normal mb-2 font-mono">
                {item.title}
              </h4>
              <p className="text-white/40 text-[12px] sm:text-[14px] leading-relaxed font-mono">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =========================================================
          SECTION 5: Architecture (Min-h-screen, pure black, no video)
          ========================================================= */}
      <section className="relative min-h-screen w-full bg-black flex items-center justify-center px-6 py-32 text-center">
        <div className="max-w-3xl w-full mx-auto flex flex-col items-center">
          
          {/* Heading Block */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.0 }}
            className="flex flex-col items-center"
          >
            <p className="text-white/40 text-[13px] sm:text-[14px] tracking-[0.2em] uppercase mb-8 font-mono">
              CREATIVE PIPELINE
            </p>
            <h3 className="text-white font-light text-[clamp(28px,6vw,56px)] leading-[1.15] tracking-[-0.02em] mb-10 font-mono uppercase">
              Three Steps. Endless Creation.
            </h3>
            <p className="text-white/45 text-[15px] sm:text-[17px] leading-relaxed max-w-xl mx-auto font-mono">
              Your custom aesthetic parameters are fed directly into the model, processed through layered diffusion neural nets, and outputted as optimized cinematic commercial assets.
            </p>
          </motion.div>

          {/* Layer Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="mt-20 flex flex-col items-center gap-4 w-full"
          >
            {[
              { layer: "PHASE 01", name: "Ideation & Prompt Input" },
              { layer: "PHASE 02", name: "Generative Rendering" },
              { layer: "PHASE 03", name: "Ultra-HD Master Export" }
            ].map((card, idx) => (
              <div
                key={idx}
                className="w-full max-w-md h-[72px] border border-white/10 rounded-lg flex items-center justify-between px-6 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 transition-all cursor-default"
              >
                <span className="text-white/30 text-[12px] tracking-[0.15em] uppercase font-mono">
                  {card.layer}
                </span>
                <span className="text-white text-[16px] sm:text-[18px] font-light font-mono">
                  {card.name}
                </span>
              </div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* =========================================================
          FOOTER
          ========================================================= */}
      <footer className="relative bg-black w-full overflow-hidden border-t border-white/10 flex flex-col md:flex-row min-h-[400px]">
        {/* Left Half: Video #5 (viewport-aware autoplay) */}
        <div className="w-full md:w-1/2 h-[300px] md:h-auto relative">
          <IntersectionVideo
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_080203_fd7f4f85-3a86-4837-8192-85e7bfe68e75.mp4"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        </div>

        {/* Right Half: Content */}
        <div className="w-full md:w-1/2 flex flex-col justify-between p-10 sm:p-16 bg-black z-10 text-left">
          <div>
            {/* Top logo & text */}
            <div className="flex items-center gap-2 mb-8 select-none justify-start">
              <SynapseXLogo className="w-[18px] h-[18px] text-white/70" />
              <span className="text-[15px] font-medium text-white/70 tracking-tight font-mono">Genrite AI</span>
            </div>
            <p className="text-white/40 text-[14px] sm:text-[15px] leading-relaxed max-w-sm font-mono">
              Next-generation visual production and creative asset synthesis powered by elite diffusion technology. Engineered for forward-thinking enterprises demanding unparalleled visual dominance.
            </p>
          </div>

          <div>
            <p className="text-white/25 text-[12px] mt-12 font-mono">
              &copy; 2026 Genrite AI Studio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
