import { useState, useEffect } from "react";

export function ThreeDPlaceholderSection() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const borderRadius = width < 640 ? "24px" : width < 1024 ? "32px" : "40px";

  return (
    <section
      style={{
        background: "#0C0C0C",
        width: "100%",
        padding: "0 0 40px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Video wrapper */}
      <div
        style={{
          width: "90%",
          maxWidth: "1100px",
          borderRadius: borderRadius,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 0 80px rgba(182,0,168,0.12), 0 0 0 1px rgba(215,226,234,0.06)",
        }}
      >
        {/* THE VIDEO */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "cover",
          }}
        >
          <source
            src="https://56h9vhffu8.ucarecd.net/04a45a72-b49d-43b4-8684-f79076dfd411/drive_1915167336773857299_401197305_5903_202606_20_d5ca9b3b0f56a3b9853ee954a69b8909_d8rfsnqcc84o0tt40hng.mp4"
            type="video/mp4"
          />
        </video>

        {/* TOP gradient fade — blends with #0C0C0C above */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "120px",
            background: "linear-gradient(to bottom, #0C0C0C 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* BOTTOM gradient fade — blends with #0C0C0C below */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "120px",
            background: "linear-gradient(to top, #0C0C0C 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* LEFT gradient fade */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "80px",
            background: "linear-gradient(to right, #0C0C0C 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* RIGHT gradient fade */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "80px",
            background: "linear-gradient(to left, #0C0C0C 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Subtle purple glow overlay — adds NexVend feel */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(182,0,168,0.04) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      </div>
    </section>
  );
}
