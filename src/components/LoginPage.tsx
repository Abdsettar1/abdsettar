import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft, Check, Sparkles, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { Scene3D } from './Scene3D';
import Magnet from './Magnet';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Track Google Sign In state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Mouse coords normalization for Three.js and custom parallax parallax tracking
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // GSAP animation refs
  const loginFormRef = useRef<HTMLDivElement>(null);
  const showcaseContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Normalizing mouse to -1 to 1 space
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMouse({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Initial GSAP Entrances
    const ctx = gsap.context(() => {
      // Form elements sequence stagger
      gsap.fromTo('.gsap-fade-up', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, ease: 'power3.out' }
      );

      // Video showcase scale and translation slide from right
      gsap.fromTo(showcaseContainerRef.current,
        { opacity: 0, scale: 0.95, x: 50 },
        { opacity: 1, scale: 1, x: 0, duration: 1.4, ease: 'power4.out', delay: 0.15 }
      );
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      ctx.revert();
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please enter both your email address and password.');
      return;
    }
    
    setAuthError('');
    setIsLoading(true);

    // Interactive 2026 progress timeline simulation
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/command');
      }, 1000);
    }, 1800);
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setAuthError('');
    setTimeout(() => {
      setIsGoogleLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/command');
      }, 1000);
    }, 1500);
  };

  const handleForgotPassword = () => {
    setAuthError('A secure password reset link has been dispatched to your email address.');
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );

  // Dynamic parallax properties based on cursor position
  const formParallaxStyle = {
    transform: `translate3d(${mouse.x * 10}px, ${mouse.y * 10}px, 0)`,
    transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
  };

  const showcaseParallaxStyle = {
    transform: `perspective(1200px) rotateY(${mouse.x * 6}deg) rotateX(${mouse.y * -6}deg) translate3d(${mouse.x * 12}px, ${mouse.y * 12}px, 0)`,
    transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
    willChange: 'transform'
  };

  return (
    <div id="login-root" className="min-h-screen w-full bg-[#070709] font-sans flex flex-col md:flex-row relative overflow-x-hidden text-[#D7E2EA] select-none">
      
      {/* 3D FLOATING BACKGROUND LAYER */}
      <div id="three-bg" className="absolute inset-0 z-0 opacity-25 pointer-events-none">
        <Scene3D mouseX={mouse.x} mouseY={mouse.y} />
      </div>

      {/* LEFT SIDE: AUTHENTICATION PANEL (40% Desktop, 50% Tablet, 100% Mobile) */}
      <div 
        id="login-form-area"
        ref={loginFormRef}
        className="w-full md:w-1/2 lg:w-[40%] flex flex-col justify-between p-6 sm:p-8 md:p-12 relative z-10 bg-[#070709]/80 backdrop-blur-md border-r border-white/[0.03] order-2 md:order-1 min-h-[100dvh]"
      >
        {/* TOP NAVBAR AREA */}
        <div className="flex items-center justify-between w-full gs-nav gsap-fade-up">
          {/* Brand/Logo Section with elegant purple customized accent */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#7C3AED]/20 to-[#7C3AED]/10 border border-[#7C3AED]/30 shadow-[0_0_20px_rgba(124,58,237,0.15)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#8B5CF6]">
                <path d="M4 20V4H8L16 14V4H20V20H16L8 10V20H4Z" fill="currentColor" />
              </svg>
            </div>
            <span className="font-sans font-black tracking-[0.25em] text-xs text-white">NEXVEND</span>
          </div>

          {/* Home Redirection */}
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-white/50 hover:text-[#8B5CF6] transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span>BACK HOME</span>
          </button>
        </div>

        {/* MIDDLE CONTENT: THE FORM AREA */}
        <div 
          id="login-main-panel"
          style={formParallaxStyle}
          className="max-w-[420px] w-full mx-auto my-auto py-10 flex flex-col justify-center relative"
        >
          {/* Main Headers - Clean, Thin Luxury Typo */}
          <div className="mb-8 text-center md:text-left">
            <div className="inline-flex gap-1.5 items-center justify-center md:justify-start px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] tracking-widest font-black uppercase text-[#8B5CF6] mb-3.5 gsap-fade-up">
              <Sparkles size={11} className="text-[#8B5CF6]" />
              <span>LOGISTICS MANAGEMENT NODE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white mb-2 font-sans gsap-fade-up">
              Welcome <span className="font-semibold text-white">Back</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/45 tracking-wide leading-relaxed font-light gsap-fade-up">
              Sign in to continue managing your AI-powered logistics platform.
            </p>
          </div>

          {/* Validation Notice Banner */}
          <AnimatePresence mode="wait">
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`mb-6 p-4 rounded-xl text-xs font-medium tracking-wide border leading-relaxed ${
                  authError.includes('reset')
                    ? 'bg-[#7C3AED]/10 border-[#7C3AED]/20 text-[#A78BFA]'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}
              >
                {authError}
              </motion.div>
            )}
            
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl text-xs font-medium tracking-wide bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3"
              >
                <div className="p-1 rounded bg-emerald-500/15">
                  <Check size={12} />
                </div>
                <span>Authentication successful. Opening pipeline dashboard...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field with Interactive glow */}
            <div className="space-y-2 gsap-fade-up">
              <label htmlFor="email" className="block text-[10px] font-bold tracking-[0.18em] text-white/40 uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="your@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-white/[0.02] border border-white/[0.08] rounded-2xl pl-11 pr-4 text-xs font-light text-white placeholder-white/25 outline-none focus:border-[#7C3AED]/60 focus:bg-white/[0.04] focus:shadow-[0_0_20px_rgba(124,58,237,0.1)] transition-all duration-300 font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 gsap-fade-up">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-[10px] font-bold tracking-[0.18em] text-white/40 uppercase">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-white/[0.02] border border-white/[0.08] rounded-2xl pl-11 pr-12 text-xs font-light text-white placeholder-white/25 outline-none focus:border-[#7C3AED]/60 focus:bg-white/[0.04] focus:shadow-[0_0_20px_rgba(124,58,237,0.1)] transition-all duration-300 font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password links */}
            <div className="flex items-center justify-between text-xs pt-1 gsap-fade-up">
              <label className="flex items-center gap-2.5 cursor-pointer text-white/45 hover:text-white transition-colors select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4.5 h-4.5 rounded-lg border flex items-center justify-center transition-all duration-200 ${
                  rememberMe ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-white/10 bg-white/5'
                }`}>
                  {rememberMe && <Check size={11} className="text-white font-bold" />}
                </div>
                <span className="font-light tracking-wide text-xs">Remember me</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[#A78BFA] hover:text-[#C084FC] hover:underline transition-all duration-200 font-light text-xs cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 gsap-fade-up">
              {/* Primary Premium Magnet Login Button with Purple Glow dynamics */}
              <div className="w-full h-12 flex justify-center">
                <Magnet strength={8} padding={60}>
                  <button
                    type="submit"
                    disabled={isLoading || isGoogleLoading || isSuccess}
                    className="w-[360px] h-12 relative overflow-hidden rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] text-white bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] shadow-[0_4px_30px_rgba(124,58,237,0.25)] hover:shadow-[0_4px_40px_rgba(124,58,237,0.45)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 scale-100 hover:scale-[1.02] active:scale-95"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Initializing System...</span>
                      </>
                    ) : (
                      <>
                        <LogIn size={13} className="mr-0.5" />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </Magnet>
              </div>

              {/* Stripe styled Google Sign-In button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || isGoogleLoading || isSuccess}
                className="w-full h-12 rounded-2xl border border-white/[0.06] hover:border-white/15 bg-white/[0.01] hover:bg-white/[0.025] transition-all duration-200 cursor-pointer flex items-center justify-center text-xs font-light text-white/80 select-none"
              >
                {isGoogleLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <GoogleIcon />
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Don't have an account Option */}
          <div id="signup-option" className="text-center mt-6 gsap-fade-up">
            <span className="text-white/40 font-light text-xs mr-1.5">Don't have an account?</span>
            <button
              onClick={() => setAuthError('Enterprise registration can be initialized via helpdesk contact.')}
              className="text-[#A78BFA] hover:text-[#C084FC] hover:underline font-medium text-xs cursor-pointer inline-flex items-center gap-1"
            >
              <span>Create Account</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* BOTTOM FOOTER AREA */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-white/30 tracking-widest font-normal uppercase gap-2 mt-4 gsap-fade-up">
          <span>NEXVEND AI © 2026 // LOGISTICS ENGINE</span>
          <span className="mt-1 sm:mt-0 font-light">SECURE ENTERPRISE CONNECTION</span>
        </div>
      </div>

      {/* RIGHT SIDE: PREMIUM AUTOMATION VIDEO DISCOVERY SHOWCASE (60% Desktop, 50% Tablet, 100% Mobile) */}
      <div 
        id="video-wrapper"
        className="w-full md:w-1/2 lg:w-[60%] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 relative z-10 order-1 md:order-2 overflow-hidden h-[45vh] md:h-auto min-h-[380px]"
      >
        {/* Animated bezel framing box */}
        <div
          ref={showcaseContainerRef}
          style={showcaseParallaxStyle}
          className="relative w-full h-full max-w-2xl lg:max-w-none rounded-[28px] overflow-hidden bg-[#0A0A0E]/40 backdrop-blur-3xl border border-white/[0.05] shadow-[0_25px_60px_rgba(0,0,0,0.55),0_0_50px_rgba(124,58,237,0.06)] group flex flex-col justify-between animation-float duration-1000 p-3 sm:p-4"
        >
          {/* Subtle Glow aura behind the frame */}
          <div className="absolute inset-0 bg-[#7C3AED]/2 z-0 rounded-[28px] opacity-40 blur-2xl pointer-events-none group-hover:opacity-75 transition-opacity" />

          {/* Premium Video Background Showcase */}
          <div className="absolute inset-0 z-0 m-2 rounded-[22px] overflow-hidden bg-[#070709]">
            <VideoBackground />
          </div>

          {/* Gloss/Reflection Effect Overlays */}
          <div className="absolute inset-0 z-10 pointer-events-none rounded-[26px] bg-gradient-to-tr from-white/0 via-white/[0.025] to-white/0 select-none" />
          
          {/* TOP RIGHT VIDEO TAG PIN */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-[#070709]/75 backdrop-blur-lg rounded-full px-3 py-1 border border-white/[0.05]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" />
            <span className="text-[9px] font-bold tracking-widest text-white/50 uppercase select-none">
              LIVE_SYSTEM_STREAM
            </span>
          </div>

          {/* FOOTER-ALIGNED VALUE TEXT DISPLAY */}
          <div className="mt-auto relative z-20 bg-gradient-to-t from-[#070709]/95 via-[#070709]/75 to-transparent p-6 sm:p-8 md:p-10 rounded-[18px] border-t border-white/[0.03] select-none m-1">
            <div className="flex flex-col gap-3">
              {/* Badge */}
              <div className="inline-flex max-w-fit items-center gap-1.5 px-3 py-1 bg-[#7C3AED]/12 border border-[#7C3AED]/25 rounded-full text-[10px] font-semibold text-[#A78BFA] uppercase tracking-widest mb-1 shadow-[0_0_15px_rgba(124,58,237,0.15)] animate-pulse">
                <Sparkles size={10} className="text-[#A78BFA]" />
                <span>AI Logistics Platform</span>
              </div>
              
              {/* Heading */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight uppercase font-sans">
                Automate Operations <span className="font-light text-[#A78BFA]">With Intelligence</span>
              </h2>

              {/* Description */}
              <p className="text-[12px] sm:text-xs font-light text-[#D7E2EA]/75 leading-relaxed max-w-xl">
                Real-time fleet monitoring, smart automation, and AI-driven customer engagement. Track shipments, dispatch agents, and synchronize your store seamlessly.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// SECURE EMBEDDED HIGH QUALITY LOOP CHANNELS WITH FALLBACK DIRECT ENCODING
function VideoBackground() {
  const [playError, setPlayError] = useState(false);
  const videoId = "1rnbvC0ZFC1a0yggU9Hi5OzYcXaxTval5ahanWgMwaX4";
  
  // Directly exportable links ensuring Google Drive's API handles video payload cleanly
  const directUrl = `https://drive.google.com/uc?export=download&id=${videoId}`;
  const backupIframeUrl = `https://drive.google.com/file/d/${videoId}/preview?autoplay=1&mute=1&loop=1&controls=0`;

  return (
    <div className="absolute inset-0 w-full h-full bg-[#08080A] overflow-hidden">
      {/* Autoplay, muted, loop HTML5 element */}
      {!playError ? (
        <video
          src={directUrl}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setPlayError(true)}
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />
      ) : (
        /* Reliable Cross-Origin Embedding Fallback for strict drive authorization environments */
        <div className="absolute inset-0 w-full h-full scale-[1.3] pointer-events-none origin-center">
          <iframe
            src={backupIframeUrl}
            title="NexVend Autonomous Logistics Overview Video"
            allow="autoplay; encrypted-media"
            className="w-full h-full border-0 pointer-events-none"
            style={{ pointerEvents: 'none' }}
          />
        </div>
      )}

      {/* Dimmed black glass shading vignette to increase text separation readability */}
      <div className="absolute inset-0 bg-[#070709]/45 z-10 mix-blend-multiply pointer-events-none" />

      {/* Modern Neon glow radial mapping gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#7C3AED]/12 via-transparent to-transparent z-10 pointer-events-none" />

      {/* Left side fading mask */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#070709]/70 via-transparent to-[#070709]/10 z-10 pointer-events-none" />
    </div>
  );
}

