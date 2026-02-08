import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import RadarLogo from "./RadarLogo";

const narrativeLines = [
  "Low-altitude unmanned aerial systems pose an evolving threat to national security infrastructure.",
  "Conventional radar systems fail to detect small, slow-moving objects in complex urban environments.",
  "Visual intelligence enables real-time detection, tracking, and behavioral analysis of aerial threats.",
  "Advanced computer vision algorithms process surveillance feeds to identify anomalous flight patterns.",
  "Automated threat assessment provides actionable intelligence for rapid response coordination.",
];

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[150vh] bg-background"
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay opacity-30" />

      {/* Sticky hero content */}
      <motion.div
        className="sticky top-0 h-screen flex flex-col items-center justify-center px-6"
        style={{ opacity, y }}
      >
        {/* Header */}
        <div className="absolute top-8 left-8 flex items-center gap-4">
          <RadarLogo />
          <div>
            <p className="text-system-label font-bold tracking-wider">SENTINEL</p>
            <p className="text-xs text-foreground-subtle font-mono">
              Aerial Surveillance System
            </p>
          </div>
        </div>

        {/* Classification badge */}
        <div className="absolute top-8 right-8">
          <div className="px-3 py-1.5 border border-primary/20 bg-primary/5">
            <p className="text-system-label text-[10px] text-primary font-bold tracking-widest">CLASSIFIED // INTERNAL USE ONLY</p>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-system-label mb-6 text-primary tracking-[0.2em] font-bold">THREAT DETECTION SYSTEM</p>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-foreground tracking-tighter mb-8 leading-none">
              Visual Intelligence for
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Aerial Surveillance</span>
            </h1>
          </motion.div>

          {/* Narrative text - reveals on scroll */}
          <div className="mt-16 space-y-6">
            {narrativeLines.map((line, index) => (
              <NarrativeLine
                key={index}
                text={line}
                index={index}
                scrollProgress={scrollYProgress}
              />
            ))}
          </div>
        </div>

        {/* Coordinates decoration */}
        <div className="absolute bottom-8 left-8 text-foreground-subtle text-xs font-mono">
          <p>LAT 38.8977° N</p>
          <p>LON 77.0365° W</p>
        </div>

        {/* System status */}
        <div className="absolute bottom-8 right-8 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <p className="text-foreground-subtle text-xs">SYSTEM ACTIVE</p>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-foreground-subtle text-xs uppercase tracking-widest">Scroll</p>
          <div className="w-[1px] h-8 bg-gradient-to-b from-foreground-subtle to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
};

interface NarrativeLineProps {
  text: string;
  index: number;
  scrollProgress: any;
}

const NarrativeLine = ({ text, index, scrollProgress }: NarrativeLineProps) => {
  const start = 0.1 + index * 0.08;
  const end = start + 0.15;

  const opacity = useTransform(scrollProgress, [start, end], [0, 1]);
  const y = useTransform(scrollProgress, [start, end], [20, 0]);

  return (
    <motion.p
      className="text-narrative"
      style={{ opacity, y }}
    >
      {text}
    </motion.p>
  );
};

export default HeroSection;