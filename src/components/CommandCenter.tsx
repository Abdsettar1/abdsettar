import { HeroSection } from "./HeroSection";
import { ThreeDPlaceholderSection } from "./ThreeDPlaceholderSection";
import { ChatSection } from "./ChatSection";
import { ServicesGridSection } from "./ServicesGridSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { CTASection } from "./CTASection";
import { useNavigate } from "react-router-dom";

export function CommandCenter() {
  const navigate = useNavigate();

  const handleLaunchChat = (initialMsg: string = "") => {
    navigate("/chat", { state: { initialMessage: initialMsg } });
  };

  const handleScrollToContact = () => {
    const el = document.getElementById("contact");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0C0C0C] text-[#D7E2EA] font-sans antialiased selection:bg-[#B600A8]/30 selection:text-white overflow-x-hidden">
      
      {/* 1. Hero Section */}
      <HeroSection onContactClick={() => handleLaunchChat("Connect to active operational squad.")} />

      {/* 2. 3D Placeholder Section */}
      <ThreeDPlaceholderSection />

      {/* 3. Chat Section - Passing the navigation handler */}
      <ChatSection onInitiateConsole={handleLaunchChat} />

      {/* 4. Services Grid Section (white overlay pulls up) */}
      <ServicesGridSection />

      {/* 5. How It Works Section (dark overlay pulls up) */}
      <HowItWorksSection />

      {/* 6. CTA Section */}
      <CTASection onContactClick={() => handleLaunchChat("Initiate campaign briefing.")} />

      {/* Premium Minimal Footer */}
      <footer className="w-full bg-[#0C0C0C] py-12 border-t border-white/[0.05] text-center text-xs text-[#D7E2EA]/30 uppercase tracking-[0.2em] select-none">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            © {new Date().getFullYear()} NexVend. All rights reserved.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-[#D7E2EA]/60 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-[#D7E2EA]/60 cursor-pointer transition-colors">Terms of Command</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
