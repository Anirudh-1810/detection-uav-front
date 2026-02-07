import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Maximize2 } from "lucide-react";

const VideoPanel = () => {
  const [isPlaying, setIsPlaying] = useState(true);

  const detections = [
    { x: 20, y: 25, w: 12, h: 10, label: "UAV-001", confidence: 96, threat: "LOW" },
    { x: 55, y: 40, w: 14, h: 11, label: "UAV-002", confidence: 89, threat: "MEDIUM" },
    { x: 75, y: 60, w: 16, h: 13, label: "UAV-003", confidence: 94, threat: "HIGH" },
  ];

  return (
    <div className="bg-background-elevated border border-border-subtle">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
        <div className="flex items-center gap-4">
          <p className="text-system-label">VIDEO FEED</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            <span className="text-xs text-foreground-muted">LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-foreground-subtle">
          <span className="text-xs font-mono">CAM-01</span>
          <span className="text-xs">|</span>
          <span className="text-xs font-mono">1920×1080</span>
          <span className="text-xs">|</span>
          <span className="text-xs font-mono">30 FPS</span>
        </div>
      </div>

      {/* Video display */}
      <div className="relative aspect-video bg-background-surface">
        {/* Placeholder video content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid-overlay absolute inset-0 opacity-20" />
          <p className="text-foreground-subtle text-sm">Live surveillance feed</p>
        </div>

        {/* Detection overlays */}
        {detections.map((det, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${det.x}%`,
              top: `${det.y}%`,
              width: `${det.w}%`,
              height: `${det.h}%`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.2 }}
          >
            <div 
              className={`absolute inset-0 border ${
                det.threat === 'HIGH' 
                  ? 'border-destructive' 
                  : det.threat === 'MEDIUM' 
                    ? 'border-warning' 
                    : 'border-primary'
              }`}
            />
            
            {/* Label */}
            <div 
              className={`absolute -top-5 left-0 px-1.5 py-0.5 text-[9px] font-medium ${
                det.threat === 'HIGH' 
                  ? 'bg-destructive/20 text-destructive' 
                  : det.threat === 'MEDIUM' 
                    ? 'bg-warning/20 text-warning' 
                    : 'bg-primary/20 text-primary'
              }`}
            >
              {det.label} • {det.confidence}%
            </div>
          </motion.div>
        ))}

        {/* Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <div className="w-16 h-[1px] bg-foreground-subtle" />
          <div className="absolute w-[1px] h-16 bg-foreground-subtle" />
        </div>

        {/* Timestamp */}
        <div className="absolute bottom-3 left-3 px-2 py-1 bg-background/80 text-xs font-mono text-foreground-muted">
          2024-01-15 14:32:08.234
        </div>

        {/* Fullscreen */}
        <button className="absolute bottom-3 right-3 p-2 bg-background/80 hover:bg-background transition-colors">
          <Maximize2 className="w-4 h-4 text-foreground-muted" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border-subtle">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-background-surface transition-colors">
            <SkipBack className="w-4 h-4 text-foreground-muted" />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 hover:bg-background-surface transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-foreground-muted" />
            ) : (
              <Play className="w-4 h-4 text-foreground-muted" />
            )}
          </button>
          <button className="p-2 hover:bg-background-surface transition-colors">
            <SkipForward className="w-4 h-4 text-foreground-muted" />
          </button>
        </div>

        {/* Timeline */}
        <div className="flex-1 mx-4">
          <div className="h-1 bg-background-surface relative">
            <div className="absolute left-0 top-0 h-full w-1/3 bg-primary" />
            <div className="absolute left-1/3 top-0 w-2 h-2 -mt-0.5 bg-primary rounded-full" />
          </div>
        </div>

        <span className="text-xs text-foreground-muted font-mono">
          00:12:34 / 01:00:00
        </span>
      </div>
    </div>
  );
};

export default VideoPanel;