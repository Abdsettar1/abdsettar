import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import FadeIn from "../components/FadeIn";
import LiveProjectButton from "../components/LiveProjectButton";

const projects = [
  {
    number: "01",
    category: "Client",
    name: "Nextlevel Studio",
    col1: [
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png&w=1280&q=85",
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png&w=1280&q=85",
    ],
    col2: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png&w=1280&q=85",
  },
  {
    number: "02",
    category: "Personal",
    name: "Aura Brand Identity",
    col1: [
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png&w=1280&q=85",
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png&w=1280&q=85",
    ],
    col2: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png&w=1280&q=85",
  },
  {
    number: "03",
    category: "Client",
    name: "Solaris Digital",
    col1: [
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png&w=1280&q=85",
      "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png&w=1280&q=85",
    ],
    col2: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png&w=1280&q=85",
  },
];

export default function ProjectsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      id="projects"
      className="bg-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 relative z-10 px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-28"
    >
      <FadeIn delay={0} y={40}>
        <h2
          className="hero-heading font-black uppercase text-center mb-16 sm:mb-20 md:mb-24 text-white"
          style={{ fontSize: "clamp(3rem, 8vw, 100px)" }}
        >
          Projects
        </h2>
      </FadeIn>

      <div ref={containerRef} className="relative">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.number}
            project={project}
            index={index}
            totalCards={projects.length}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  index,
  totalCards,
  scrollYProgress,
}: {
  project: (typeof projects)[0];
  index: number;
  totalCards: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  key?: any;
}) {
  const targetScale = 1 - (totalCards - 1 - index) * 0.03;
  const cardStart = index / totalCards;
  const cardEnd = (index + 1) / totalCards;

  const scale = useTransform(
    scrollYProgress,
    [cardStart, cardEnd],
    [1, targetScale]
  );

  return (
    <div
      className="sticky top-24 md:top-28 h-[85vh]"
      style={{ top: `${index * 28}px` }}
    >
      <motion.div
        className="h-[80vh] rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:p-5 md:p-6 flex flex-col"
        style={{ scale }}
      >
        {/* Top row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-[#D7E2EA] font-black text-lg sm:text-xl md:text-2xl">
              {project.number}
            </span>
            <span className="text-[#D7E2EA]/60 text-xs sm:text-sm uppercase tracking-wider">
              {project.category}
            </span>
          </div>
          <h3 className="text-[#D7E2EA] font-medium uppercase text-sm sm:text-base md:text-lg tracking-wide">
            {project.name}
          </h3>
          <LiveProjectButton className="px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm" />
        </div>

        {/* Image grid */}
        <div className="flex-1 flex gap-3 sm:gap-4 min-h-0">
          <div className="flex flex-col gap-3 sm:gap-4 w-[40%] min-h-0">
            <img
              src={project.col1[0]}
              alt=""
              className="flex-1 rounded-[40px] sm:rounded-[50px] md:rounded-[60px] object-cover min-h-0(f)"
              style={{ minHeight: "0px", height: "100%", width: "100%" }}
              loading="lazy"
            />
            <img
              src={project.col1[1]}
              alt=""
              className="flex-1 rounded-[40px] sm:rounded-[50px] md:rounded-[60px] object-cover min-h-0(f)"
              style={{ minHeight: "0px", height: "100%", width: "100%" }}
              loading="lazy"
            />
          </div>
          <div className="w-[60%] min-h-0">
            <img
              src={project.col2}
              alt=""
              className="w-full h-full rounded-[40px] sm:rounded-[50px] md:rounded-[60px] object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
