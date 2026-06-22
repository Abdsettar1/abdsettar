import { useRef, useState, useEffect, ReactNode } from "react";

interface MagnetProps {
  children: ReactNode;
  padding?: number;
  strength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
}

export default function Magnet({
  children,
  padding = 100,
  strength = 4,
  activeTransition = "transform 0.3s ease-out",
  inactiveTransition = "transform 0.6s ease-in-out",
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;

      const distance = Math.sqrt(distX * distX + distY * distY);
      const threshold = Math.max(rect.width, rect.height) / 2 + padding;

      if (distance < threshold) {
        setIsActive(true);
        el.style.transition = activeTransition;
        el.style.transform = `translate3d(${distX / strength}px, ${distY / strength}px, 0)`;
        el.style.willChange = "transform";
      } else {
        setIsActive(false);
        el.style.transition = inactiveTransition;
        el.style.transform = "translate3d(0, 0, 0)";
      }
    };

    const handleMouseLeave = () => {
      setIsActive(false);
      el.style.transition = inactiveTransition;
      el.style.transform = "translate3d(0, 0, 0)";
    };

    // Touch support
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = touch.clientX - centerX;
      const distY = touch.clientY - centerY;

      el.style.transition = activeTransition;
      el.style.transform = `translate3d(${distX / strength}px, ${distY / strength}px, 0)`;
    };

    const handleTouchEnd = () => {
      el.style.transition = inactiveTransition;
      el.style.transform = "translate3d(0, 0, 0)";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [padding, strength, activeTransition, inactiveTransition]);

  return (
    <div ref={ref} style={{ willChange: "transform", display: "inline-block" }}>
      {children}
    </div>
  );
}
