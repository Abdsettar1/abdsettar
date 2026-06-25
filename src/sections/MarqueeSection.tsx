import { useRef, useEffect, useState } from "react";

const images = [
  "https://56h9vhffu8.ucarecd.net/49e09bc5-b700-45c4-aad4-d927290e726e/MindVideo_20260625025933_493.mp4",
  "https://56h9vhffu8.ucarecd.net/afeff9a0-3e53-497a-9742-90954c124f67/MindVideo_20260625022411_268.mp4",
  "https://56h9vhffu8.ucarecd.net/ff4f9fee-bd9a-4e00-a087-6ede07a65a1e/MindVideo_20260625024230_792onlinevideocuttercom.mp4",
  "https://56h9vhffu8.ucarecd.net/6177e466-e05b-4910-8e4a-231970d0db50/2026062511155158e3b286e39fc660.mp4",
  "https://56h9vhffu8.ucarecd.net/eda3d008-7064-44f3-90fd-af083bf1eecb/3r3ula02500dji3ixxgcbsn396r5l0k1onlinevideocuttercom.mp4",
  "https://56h9vhffu8.ucarecd.net/f1d21859-3e43-4e3f-b6d8-309b5f4bcc0d/20260625114358a00e13e0c17751d9.mp4",
  "https://56h9vhffu8.ucarecd.net/6071b4d2-4406-4fcf-9dcb-59627db6e8ee/1ew9ox32500dji5g8peibz7bw0ko7678onlinevideocuttercom.mp4",
  "https://56h9vhffu8.ucarecd.net/ec425b3e-e094-4399-9d4d-430679ae18c1/BasicModel1782344245000onlinevideocuttercom.mp4",
  "https://56h9vhffu8.ucarecd.net/b365b0a9-21f9-4dd6-8fa7-d350f848a953/202606251326215d86e941a9baff14.mp4",
];

const row1 = images.slice(0, 5);
const row2 = images.slice(5);

function triple(arr: string[]) {
  return [...arr, ...arr, ...arr];
}

// Highly optimized viewport-aware video component with shimmer skeleton placeholder
function LazyMarqueeVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasLoaded(true);
          requestAnimationFrame(() => {
            if (videoRef.current) {
              videoRef.current.play().catch(() => {});
            }
          });
        } else {
          video.pause();
        }
      },
      {
        rootMargin: "300px", // Preload and start playing 300px before entering viewport
        threshold: 0.01,
      }
    );

    observer.observe(video);

    return () => {
      observer.unobserve(video);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className="relative flex-shrink-0 bg-neutral-900 overflow-hidden rounded-2xl"
      style={{ width: 420, height: 270 }}
    >
      {/* Self-contained CSS Keyframes & Shimmer placeholder */}
      {!isVideoReady && (
        <div className="absolute inset-0 z-10 w-full h-full bg-neutral-950">
          <style>{`
            @keyframes shimmerEffect {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          `}</style>
          <div
            className="w-full h-full"
            style={{
              background: "linear-gradient(90deg, #0e0e0e 25%, #1f1f1f 50%, #0e0e0e 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmerEffect 1.5s infinite linear",
            }}
          />
        </div>
      )}

      <video
        ref={videoRef}
        src={hasLoaded ? src : undefined}
        className={`w-full h-full object-cover transition-opacity duration-700 ${
          isVideoReady ? "opacity-100" : "opacity-0"
        }`}
        style={{ willChange: "transform" }}
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={() => setIsVideoReady(true)}
        onPlaying={() => setIsVideoReady(true)}
      />
    </div>
  );
}

export default function MarqueeSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  const [row1Offset, setRow1Offset] = useState(0);
  const [row2Offset, setRow2Offset] = useState(0);

  const row1IsVisible = useRef(false);
  const row2IsVisible = useRef(false);

  // Set up individual IntersectionObservers for each row to pause/resume scroll calculation and animation updates
  useEffect(() => {
    const observer1 = new IntersectionObserver(
      ([entry]) => {
        row1IsVisible.current = entry.isIntersecting;
      },
      { rootMargin: "200px" }
    );

    const observer2 = new IntersectionObserver(
      ([entry]) => {
        row2IsVisible.current = entry.isIntersecting;
      },
      { rootMargin: "200px" }
    );

    if (row1Ref.current) observer1.observe(row1Ref.current);
    if (row2Ref.current) observer2.observe(row2Ref.current);

    return () => {
      observer1.disconnect();
      observer2.disconnect();
    };
  }, []);

  // Set up the passive scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const scrollOffset =
        (window.scrollY - sectionTop + window.innerHeight) * 0.3;

      if (row1IsVisible.current) {
        setRow1Offset(scrollOffset);
      }
      if (row2IsVisible.current) {
        setRow2Offset(scrollOffset);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const row1Images = triple(row1);
  const row2Images = triple(row2);

  return (
    <section
      ref={sectionRef}
      className="bg-[#0C0C0C] pt-24 pb-10 overflow-x-clip"
    >
      <div className="flex flex-col gap-3">
        {/* Row 1 — moves RIGHT */}
        <div
          ref={row1Ref}
          className="flex gap-3"
          style={{
            transform: `translateX(${row1Offset - 200}px)`,
            willChange: "transform",
          }}
        >
          {row1Images.map((src, i) => (
            <LazyMarqueeVideo key={i} src={src} />
          ))}
        </div>

        {/* Row 2 — moves LEFT */}
        <div
          ref={row2Ref}
          className="flex gap-3"
          style={{
            transform: `translateX(-${row2Offset - 200}px)`,
            willChange: "transform",
          }}
        >
          {row2Images.map((src, i) => (
            <LazyMarqueeVideo key={i} src={src} />
          ))}
        </div>
      </div>
    </section>
  );
}
