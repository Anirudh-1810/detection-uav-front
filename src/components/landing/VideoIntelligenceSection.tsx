import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import { Upload } from "lucide-react";

const analysisSteps = [
  {
    title: "Detection",
    description: "Multi-scale object detection algorithms identify aerial objects across varying altitudes and distances.",
  },
  {
    title: "Tracking",
    description: "Persistent tracking maintains object identity through occlusions, maneuvers, and environmental conditions.",
  },
  {
    title: "Behavioral Analysis",
    description: "Flight pattern analysis detects anomalous behavior indicative of surveillance, reconnaissance, or hostile intent.",
  },
  {
    title: "Threat Scoring",
    description: "Composite threat assessment integrates object classification, trajectory prediction, and proximity analysis.",
  },
];

const VideoIntelligenceSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setIsAnalyzing(true);
      // Simulate analysis delay
      setTimeout(() => setIsAnalyzing(false), 2000);
    }
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-[300vh] bg-background">
      {/* Sticky video panels */}
      <div className="sticky top-0 h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border-subtle">
          <div>
            <p className="text-system-label">VIDEO INTELLIGENCE</p>
            <p className="text-foreground-subtle text-sm mt-1">
              Real-time detection and analysis pipeline
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isAnalyzing ? 'bg-warning animate-pulse' : 'bg-success'}`} />
              <p className="text-foreground-subtle text-xs">
                {isAnalyzing ? 'PROCESSING' : 'READY'}
              </p>
            </div>
          </div>
        </div>

        {/* Video panels */}
        <div className="flex-1 flex">
          {/* Left: Raw Feed */}
          <div className="flex-1 border-r border-border-subtle p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-system-label">RAW FEED</p>
              <label className="flex items-center gap-2 px-3 py-1.5 bg-background-surface border border-border-subtle cursor-pointer hover:bg-background-subtle transition-colors">
                <Upload className="w-3.5 h-3.5 text-foreground-muted" />
                <span className="text-xs text-foreground-muted">Upload</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            
            <div className="flex-1 bg-background-surface border border-border-subtle flex items-center justify-center relative overflow-hidden">
              {videoFile ? (
                <video
                  src={URL.createObjectURL(videoFile)}
                  className="w-full h-full object-contain"
                  autoPlay
                  loop
                  muted
                />
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 border border-border-subtle flex items-center justify-center">
                    <Upload className="w-6 h-6 text-foreground-subtle" />
                  </div>
                  <p className="text-foreground-subtle text-sm">
                    Upload surveillance footage
                  </p>
                  <p className="text-foreground-subtle text-xs mt-1 opacity-60">
                    MP4, WebM, or MOV
                  </p>
                </div>
              )}
              
              {/* Grid overlay */}
              <div className="absolute inset-0 grid-overlay opacity-10 pointer-events-none" />
            </div>
          </div>

          {/* Right: Analyzed Feed */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-system-label">ANALYZED FEED</p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-xs text-primary">LIVE</span>
              </div>
            </div>
            
            <div className="flex-1 bg-background-surface border border-border-subtle relative overflow-hidden">
              {videoFile ? (
                <>
                  <video
                    src={URL.createObjectURL(videoFile)}
                    className="w-full h-full object-contain"
                    autoPlay
                    loop
                    muted
                  />
                  {/* Detection overlays */}
                  <DetectionOverlays isAnalyzing={isAnalyzing} />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-foreground-subtle text-sm">
                    Awaiting input stream
                  </p>
                </div>
              )}
              
              {/* Scanline effect */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                  className="absolute left-0 right-0 h-[1px] bg-primary/20"
                  animate={{ top: ["0%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Analysis steps - scroll-driven */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </div>

      {/* Scrolling analysis explanations */}
      <div className="relative z-10 pt-[100vh]">
        {analysisSteps.map((step, index) => (
          <AnalysisStep
            key={index}
            step={step}
            index={index}
            scrollProgress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
};

interface DetectionOverlaysProps {
  isAnalyzing: boolean;
}

const DetectionOverlays = ({ isAnalyzing }: DetectionOverlaysProps) => {
  if (isAnalyzing) return null;

  const detections = [
    { x: 25, y: 30, w: 15, h: 12, label: "UAV-01", confidence: 94, threat: "MEDIUM" },
    { x: 60, y: 45, w: 12, h: 10, label: "UAV-02", confidence: 87, threat: "LOW" },
    { x: 40, y: 65, w: 18, h: 14, label: "UAV-03", confidence: 91, threat: "HIGH" },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
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
          transition={{ delay: i * 0.3 + 0.5 }}
        >
          {/* Bounding box */}
          <div 
            className={`absolute inset-0 border ${
              det.threat === 'HIGH' 
                ? 'border-destructive' 
                : det.threat === 'MEDIUM' 
                  ? 'border-warning' 
                  : 'border-primary'
            }`}
          />
          
          {/* Corner markers */}
          <div className={`absolute -top-0.5 -left-0.5 w-2 h-2 border-t border-l ${
            det.threat === 'HIGH' 
              ? 'border-destructive' 
              : det.threat === 'MEDIUM' 
                ? 'border-warning' 
                : 'border-primary'
          }`} />
          <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 border-t border-r ${
            det.threat === 'HIGH' 
              ? 'border-destructive' 
              : det.threat === 'MEDIUM' 
                ? 'border-warning' 
                : 'border-primary'
          }`} />
          <div className={`absolute -bottom-0.5 -left-0.5 w-2 h-2 border-b border-l ${
            det.threat === 'HIGH' 
              ? 'border-destructive' 
              : det.threat === 'MEDIUM' 
                ? 'border-warning' 
                : 'border-primary'
          }`} />
          <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b border-r ${
            det.threat === 'HIGH' 
              ? 'border-destructive' 
              : det.threat === 'MEDIUM' 
                ? 'border-warning' 
                : 'border-primary'
          }`} />
          
          {/* Label */}
          <div className="absolute -top-6 left-0 flex items-center gap-2">
            <span className="text-[10px] text-foreground font-medium">{det.label}</span>
            <span className="text-[9px] text-foreground-muted">{det.confidence}%</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

interface AnalysisStepProps {
  step: { title: string; description: string };
  index: number;
  scrollProgress: any;
}

const AnalysisStep = ({ step, index, scrollProgress }: AnalysisStepProps) => {
  const start = 0.25 + index * 0.15;
  const end = start + 0.1;
  
  const opacity = useTransform(scrollProgress, [start, end, end + 0.1], [0, 1, 0]);
  const y = useTransform(scrollProgress, [start, end], [30, 0]);

  return (
    <motion.div
      className="h-[50vh] flex items-center justify-center px-8"
      style={{ opacity, y }}
    >
      <div className="max-w-md text-center">
        <p className="text-system-label text-primary mb-2">
          PHASE {String(index + 1).padStart(2, '0')}
        </p>
        <h3 className="text-2xl font-light text-foreground mb-4">{step.title}</h3>
        <p className="text-foreground-muted text-sm leading-relaxed">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
};

export default VideoIntelligenceSection;