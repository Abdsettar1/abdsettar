import HeroSection from "../sections/HeroSection";
import MarqueeSection from "../sections/MarqueeSection";
import AboutSection from "../sections/AboutSection";
import ServicesSection from "../sections/ServicesSection";
import TeamSection from "../sections/TeamSection";
import ProjectsSection from "../sections/ProjectsSection";

export function LandingPage() {
  return (
    <div className="overflow-x-clip bg-[#0C0C0C] min-h-screen text-[#D7E2EA]">
      <HeroSection />
      <MarqueeSection />
      <AboutSection />
      <ServicesSection />
      <TeamSection />
      <ProjectsSection />
      
      {/* Premium minimal footer for portfolio page */}
      <footer className="w-full bg-[#0C0C0C] py-14 border-t border-white/[0.05] text-center text-xs text-[#D7E2EA]/30 uppercase tracking-[0.2em] select-none relative z-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            © {new Date().getFullYear()} NexVend Squad. All rights reserved.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-[#D7E2EA]/60 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-[#D7E2EA]/60 cursor-pointer transition-colors">Terms of Operations</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
