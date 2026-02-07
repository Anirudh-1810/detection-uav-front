import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// Using placeholder since the specific asset was not available
const surveillanceFeed = "/surveillance-feed.jpg";

interface BoundingBoxProps {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  confidence: number;
}

const BoundingBox = ({ x, y, w, h, label, confidence }: BoundingBoxProps) => (
  <div
    className="absolute border border-primary/40"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: `${w}%`,
      height: `${h}%`,
    }}
  >
    <div className="absolute -top-5 left-0 flex items-center gap-2">
      <span className="font-mono text-[9px] text-primary/70">{label}</span>
      <span className="font-mono text-[8px] text-muted-foreground">
        {confidence}%
      </span>
    </div>
    {/* Corner marks */}
    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/60" />
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/60" />
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/60" />
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/60" />
  </div>
);

const VideoIntelligenceSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const box1Opacity = useTransform(scrollYProgress, [0.1, 0.25], [0, 1]);
  const box2Opacity = useTransform(scrollYProgress, [0.2, 0.35], [0, 1]);
  const box3Opacity = useTransform(scrollYProgress, [0.3, 0.45], [0, 1]);
  const overlayOpacity = useTransform(scrollYProgress, [0.4, 0.55], [0, 1]);

  return (
    <section ref={containerRef} className="relative" style={{ height: "250vh" }}>
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-8 py-12">
        {/* Section label */}
        <div className="mb-6">
          <span className="data-label text-primary/60">
            Section 02 — Video Intelligence
          </span>
        </div>

        <div className="relative w-full max-w-5xl aspect-video bg-card overflow-hidden">
          {/* Feed image */}
          <img
            src={surveillanceFeed}
            alt="Surveillance feed"
            className="w-full h-full object-cover opacity-70"
          />

          {/* Scanlines overlay */}
          <div className="absolute inset-0 scanlines pointer-events-none" />

          {/* Sweep line */}
          <div className="absolute inset-0 scanline-sweep pointer-events-none" />

          {/* Camera info */}
          <div className="absolute top-4 left-5 flex items-center gap-4">
            <span className="font-mono text-[10px] text-foreground/50">
              CAM-07 // SECTOR 4-NORTH
            </span>
          </div>

          {/* Timestamp */}
          <div className="absolute top-4 right-5">
            <span className="font-mono text-[10px] text-foreground/50">
              2025.02.07 // 14:32:07 UTC
            </span>
          </div>

          {/* Bounding boxes — appear on scroll */}
          <motion.div style={{ opacity: box1Opacity }}>
            <BoundingBox x={22} y={55} w={6} h={20} label="SUBJ-01" confidence={94} />
          </motion.div>
          <motion.div style={{ opacity: box2Opacity }}>
            <BoundingBox x={58} y={50} w={8} h={22} label="SUBJ-02" confidence={87} />
          </motion.div>
          <motion.div style={{ opacity: box3Opacity }}>
            <BoundingBox x={72} y={48} w={5} h={16} label="VEH-03" confidence={91} />
          </motion.div>

          {/* REC indicator */}
          <div className="absolute bottom-4 left-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive status-pulse" />
            <span className="font-mono text-[10px] text-destructive/80">
              REC
            </span>
          </div>

          {/* Detection count overlay */}
          <motion.div
            className="absolute bottom-4 right-5"
            style={{ opacity: overlayOpacity }}
          >
            <span className="font-mono text-[10px] text-primary/60">
              3 DETECTIONS ACTIVE
            </span>
          </motion.div>

          {/* Frame border */}
          <div className="absolute inset-0 border border-border/30 pointer-events-none" />
        </div>

        {/* Feed metadata */}
        <motion.div
          className="mt-6 flex items-center gap-10"
          style={{ opacity: overlayOpacity }}
        >
          {[
            { label: "Resolution", value: "4K UHD" },
            { label: "Frame Rate", value: "30 FPS" },
            { label: "Latency", value: "12ms" },
            { label: "Model", value: "YOLOv9-S" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="font-mono text-xs font-light text-foreground/60 mb-1">
                {item.value}
              </p>
              <p className="data-label">{item.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default VideoIntelligenceSection;