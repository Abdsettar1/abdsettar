import { useRef, useEffect, useState } from "react";

const images = [
  "https://k.top4top.io/p_3823p1h11.jpg",
  "https://l.top4top.io/p_3823gob652.jpg",
  "https://j.top4top.io/p_3823ymwwq1.jpg",
  "https://k.top4top.io/p_38239ojki2.jpg",
  "https://k.top4top.io/p_38231dmuk1.jpg",
  "https://l.top4top.io/p_3823h10gy2.jpg",
  "https://a.top4top.io/p_38234m4k53.jpg",
  "https://k.top4top.io/p_3823t4cuc1.jpg",
  "https://l.top4top.io/p_3823au8tb2.jpg",
];

const row1 = images.slice(0, 5);
const row2 = images.slice(5);

function triple(arr: string[]) {
  return [...arr, ...arr, ...arr];
}

export default function MarqueeSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const scrollOffset =
        (window.scrollY - sectionTop + window.innerHeight) * 0.3;
      setOffset(scrollOffset);
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
      className="bg-[#0C0C0C] pt-24 sm:pt-28 md:pt-32 pb-10 overflow-x-clip"
    >
      <div className="flex flex-col gap-3">
        {/* Row 1 — moves RIGHT */}
        <div
          className="flex gap-3"
          style={{
            transform: `translateX(${offset - 200}px)`,
            willChange: "transform",
          }}
        >
          {row1Images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="rounded-2xl object-cover flex-shrink-0"
              style={{ width: 420, height: 270 }}
              loading="lazy"
            />
          ))}
        </div>

        {/* Row 2 — moves LEFT */}
        <div
          className="flex gap-3"
          style={{
            transform: `translateX(-${offset - 200}px)`,
            willChange: "transform",
          }}
        >
          {row2Images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="rounded-2xl object-cover flex-shrink-0"
              style={{ width: 420, height: 270 }}
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
