import FadeIn from "../components/FadeIn";
import Magnet from "../components/Magnet";
import ContactButton from "../components/ContactButton";
import { useNavigate } from "react-router-dom";

const navLinks = ["About", "Services", "Team", "Contact"];

export default function HeroSection() {
  const navigate = useNavigate();

  const handleNavClick = (label: string) => {
    if (label === "Contact") {
      navigate("/command");
      return;
    }
    const id = label.toLowerCase();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-screen flex flex-col overflow-x-clip bg-[#0C0C0C] text-[#D7E2EA] font-sans antialiased selection:bg-[#B600A8]/30 selection:text-white">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] rounded-full bg-[#B600A8]/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] rounded-full bg-[#7621B0]/5 blur-[100px] pointer-events-none z-0" />

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(215,226,234,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(215,226,234,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Navbar */}
      <FadeIn delay={0} y={-20} className="relative z-20">
        <nav className="flex justify-between items-center px-6 md:px-10 pt-6 md:pt-8 max-w-7xl mx-auto w-full">
          {/* Logo or Left items */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} 
            className="font-black uppercase tracking-[0.25em] text-white text-sm sm:text-base cursor-pointer hover:opacity-85 transition-opacity"
          >
            NEXVEND <span className="text-[#B600A8] font-light">// OPERATIONS</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => handleNavClick(link)}
                className="text-[#D7E2EA] font-medium uppercase tracking-wider text-xs sm:text-sm lg:text-base cursor-pointer transition-opacity duration-200 hover:opacity-70"
              >
                {link}
              </button>
            ))}
            
            {/* Glowing Command Center link */}
            <button
              onClick={() => navigate("/command")}
              className="px-4 py-1.5 rounded-full border border-[#B600A8] text-[#B600A8] text-xs font-semibold uppercase tracking-wider hover:bg-[#B600A8] hover:text-white transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(182,0,168,0.15)] hover:shadow-[0_0_20px_rgba(182,0,168,0.3)]"
            >
              Console
            </button>

            <button
              onClick={() => navigate("/login")}
              className="text-[#D7E2EA]/60 font-medium uppercase tracking-wider text-xs sm:text-sm border border-[#D7E2EA]/15 rounded-full px-4 py-1.5 hover:border-[#B600A8]/40 hover:text-[#D7E2EA] transition-all duration-200 cursor-pointer"
            >
              Login
            </button>
          </div>
        </nav>
      </FadeIn>

      {/* Hero Heading */}
      <div className="overflow-hidden w-full mt-10 sm:mt-12 md:mt-14 relative z-10 flex-grow flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full px-4 text-center select-none">
          <FadeIn delay={0.15} y={40}>
            <h1 className="hero-heading font-black uppercase tracking-tight leading-none text-white" style={{ fontSize: 'clamp(2rem, 8vw, 7rem)' }}>
              we sell. you win.
            </h1>
          </FadeIn>
        </div>
      </div>

      {/* Hero Portrait */}
      <div className="absolute left-1/2 -translate-x-1/2 z-10 top-[52%] -translate-y-1/2 pointer-events-none md:pointer-events-auto">
        <FadeIn delay={0.6} y={30}>
          <Magnet
            padding={150}
            strength={3}
            activeTransition="transform 0.3s ease-out"
            inactiveTransition="transform 0.6s ease-in-out"
          >
            <img
              src="https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png"
              alt="Jack — Squad Leader"
              className="w-[280px] sm:w-[360px] md:w-[300px] lg:w-[340px] object-contain drop-shadow-[0_20px_50px_rgba(182,0,168,0.15)]"
              loading="eager"
            />
          </Magnet>
        </FadeIn>
      </div>

      {/* Bottom bar */}
      <div className="mt-auto flex justify-between items-end pb-7 sm:pb-8 md:pb-10 px-6 md:px-10 max-w-7xl mx-auto w-full relative z-20">
        <FadeIn delay={0.35} y={20}>
          <p
            className="text-[#D7E2EA]/80 font-light uppercase tracking-wide leading-snug max-w-[160px] sm:max-w-[220px] md:max-w-[260px]"
            style={{ fontSize: "clamp(0.6rem, 0.95vw, 0.9rem)" }}
          >
            a mobile e-commerce squad that handles everything — from winning products to customer conversations
          </p>
        </FadeIn>

        <FadeIn delay={0.5} y={20}>
          <ContactButton 
            onClick={() => navigate("/command")}
            className="px-6 py-2.5 sm:px-8 sm:py-3 md:px-10 md:py-3.5 text-xs sm:text-sm md:text-base" 
          />
        </FadeIn>
      </div>
    </section>
  );
}
