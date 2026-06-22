import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  className?: string;
}

export default function AnimatedText({ text, className = "" }: AnimatedTextProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.2"],
  });

  const words = text.split(" ");

  return (
    <p ref={containerRef} className={className}>
      {words.map((word, wordIndex) => {
        const start = wordIndex / words.length;
        const end = (wordIndex + 1) / words.length;
        return (
          <span key={wordIndex} className="inline-block mr-[0.25em]">
            {word.split("").map((char, charIndex) => {
              const charStart = start + (charIndex / word.length) * (end - start);
              const charEnd = start + ((charIndex + 1) / word.length) * (end - start);
              return (
                <Character
                  key={charIndex}
                  char={char}
                  progress={scrollYProgress}
                  start={charStart}
                  end={charEnd}
                />
              );
            })}
          </span>
        );
      })}
    </p>
  );
}

function Character({
  char,
  progress,
  start,
  end,
}: {
  char: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  start: number;
  end: number;
  key?: any;
}) {
  const opacity = useTransform(progress, [start, end], [0.2, 1]);

  return (
    <span className="relative inline-block">
      <span className="invisible">{char}</span>
      <motion.span
        className="absolute left-0 top-0"
        style={{ opacity }}
      >
        {char}
      </motion.span>
    </span>
  );
}
