import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft, Check } from 'lucide-react';

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please enter both your email and password.');
      return;
    }
    
    setAuthError('');
    setIsLoading(true);

    // Simulated authenticating process - premium loader experience
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
    setAuthError('An access code reset link has been dispatched to your email.');
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );

  return (
    <div className="fixed inset-0 min-h-screen w-screen overflow-hidden bg-[#0A0A0C] font-sans flex text-[#D7E2EA] select-none">
      
      {/* LEFT SIDE: AUTHENTICATION PANEL */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-between p-8 md:p-12 relative z-10 bg-[#0A0A0C]">
        
        {/* TOP NAVBAR AREA */}
        <div className="flex items-center justify-between">
          {/* Brand/Logo Section with elegant "N" icon */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#7B61FF]/20 to-[#7B61FF]/10 border border-[#7B61FF]/30 shadow-[0_0_20px_rgba(123,97,255,0.2)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#7B61FF]">
                <path d="M4 20V4H8L16 14V4H20V20H16L8 10V20H4Z" fill="currentColor" />
              </svg>
            </div>
            <span className="font-sans font-black tracking-[0.2em] text-sm md:text-md text-white">NEXVEND</span>
          </div>

          {/* Quick Back to home link */}
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span>BACK HOME</span>
          </button>
        </div>

        {/* MIDDLE CONTENT: THE FORM AREA */}
        <div className="max-w-[420px] w-full mx-auto my-auto py-10 flex flex-col justify-center">
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 font-sans">
              Welcome Back
            </h1>
            <p className="text-sm text-white/45 tracking-wide leading-relaxed">
              Authenticate your account to access your autonomous digital storefront workforce.
            </p>
          </div>

          {/* Error and Info Notices */}
          <AnimatePresence mode="wait">
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`mb-6 p-4 rounded-xl text-xs font-medium tracking-wide border uppercase leading-relaxed ${
                  authError.includes('reset')
                    ? 'bg-[#7B61FF]/10 border-[#7B61FF]/20 text-[#9E8AFF]'
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
                className="mb-6 p-4 rounded-xl text-xs font-medium tracking-wide bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase flex items-center gap-3"
              >
                <div className="p-1 rounded bg-emerald-500/15">
                  <Check size={12} />
                </div>
                <span>Authentication successful. Redirecting...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[10px] font-bold tracking-[0.15em] hover:text-[#7B61FF] text-white/40 uppercase transition-colors duration-200">
                Merchant Email
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
                  placeholder="your@store.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-white/[0.02] border border-white/[0.08] rounded-xl pl-11 pr-4 text-sm text-white placeholder-white/20 outline-none focus:border-[#7B61FF]/60 focus:bg-white/[0.04] focus:shadow-[0_0_20px_rgba(123,97,255,0.15)] transition-all duration-300 font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="access-code" className="block text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase">
                  Access Code
                </label>
              </div>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                />
                <input
                  id="access-code"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-white/[0.02] border border-white/[0.08] rounded-xl pl-11 pr-12 text-sm text-white placeholder-white/20 outline-none focus:border-[#7B61FF]/60 focus:bg-white/[0.04] focus:shadow-[0_0_20px_rgba(123,97,255,0.15)] transition-all duration-300 font-sans"
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

            {/* Remember Me & Forgot Password link */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-white/50 hover:text-white transition-colors select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all duration-200 ${
                  rememberMe ? 'bg-[#7B61FF] border-[#7B61FF]' : 'border-white/10 bg-white/5'
                }`}>
                  {rememberMe && <Check size={11} className="text-white font-bold" />}
                </div>
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[#7B61FF] hover:text-[#9E8AFF] hover:underline transition-all duration-200 font-medium cursor-pointer"
              >
                Forgot access code?
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              {/* Primary Login Button with Purple accents and hover effects */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading || isSuccess}
                className="w-full h-12 relative overflow-hidden rounded-xl font-bold text-xs uppercase tracking-widest text-white bg-[#7B61FF] hover:bg-[#6c51f5] shadow-[0_4px_30px_rgba(123,97,255,0.3)] hover:shadow-[0_4px_40px_rgba(123,97,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AUTHENTICATING OPERATIONS...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={13} />
                    <span>SECURE ACCESS</span>
                  </>
                )}
              </button>

              {/* Optional Google Sign-In button styled elegantly */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || isGoogleLoading || isSuccess}
                className="w-full h-12 rounded-xl border border-white/[0.08] hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-200 cursor-pointer flex items-center justify-center text-xs font-semibold tracking-wide text-white/80"
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
        </div>

        {/* BOTTOM FOULTER AREA */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/30 tracking-wider">
          <span>NEXVEND SYSTEMS // OPERATIONS NODE</span>
          <span className="mt-1 sm:mt-0">CONFIDENTIAL & SECURE CONNECTION</span>
        </div>
      </div>

      {/* RIGHT SIDE: LARGE EMBEDDED VIDEO BACKGROUND & BRANDING OVERLAY */}
      <div className="hidden lg:block lg:w-1/2 h-full relative">
        <VideoBackground />
      </div>

    </div>
  );
}

// COMPONENT: VIDEO BACKGROUND
function VideoBackground() {
  const [playError, setPlayError] = useState(false);
  const videoId = "1Hydz4w6yObKaYdR-wEDk4o1up7mEqg9F";
  
  // Directly exportable link configuration
  const directUrl = `https://drive.google.com/uc?export=download&id=${videoId}`;
  const backupIframeUrl = `https://drive.google.com/file/d/${videoId}/preview?autoplay=1&mute=1&loop=1&controls=0`;

  return (
    <div className="absolute inset-0 w-full h-full bg-[#08080A] overflow-hidden">
      
      {/* Autoplay, muted, looping fullscreen video */}
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
        /* Seamless Google Drive video embedding fallback to safeguard cross-origin security restrictions */
        <div className="absolute inset-0 w-full h-full scale-[1.3] pointer-events-none origin-center">
          <iframe
            src={backupIframeUrl}
            title="NexVend Ecosystem Video Preview"
            allow="autoplay; encrypted-media"
            className="w-full h-full border-0 pointer-events-none"
            style={{ pointerEvents: 'none' }}
          />
        </div>
      )}

      {/* PREMIUM OVERLAYS FOR LUXE BRANDING & READABILITY */}
      
      {/* Dark tint overlay to seamlessly bridge elements */}
      <div className="absolute inset-0 bg-[#0C0C0C]/40 z-10 mix-blend-multiply pointer-events-none" />

      {/* Deep purple gradient accent overlay referencing the brand palette */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#7B61FF]/15 via-transparent to-transparent z-10 pointer-events-none" />

      {/* High contrast gradient shielding the edges & left login form intersection */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0C0C0C]/80 via-[#0C0C0C]/25 to-[#0A0A0C]/40 z-10 pointer-events-none" />

      {/* Floating high-end text marker indicating video status */}
      <div className="absolute top-8 right-8 z-20 flex items-center gap-2 bg-[#0C0C0C]/60 backdrop-blur-md rounded-full px-3 py-1 border border-white/5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#7B61FF] animate-ping" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#7B61FF] absolute" />
        <span className="text-[9px] font-bold tracking-widest text-white/50 uppercase select-none">
          SYSTEM_DEMO_LOOP
        </span>
      </div>
    </div>
  );
}
