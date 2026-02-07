import { useState, useRef } from "react";
import { Upload, Play, Pause, RefreshCw, Activity, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyzeVideo, API_BASE_URL } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import AnalyticsCharts from "./dashboard/AnalyticsCharts";
import { JsonUploadPanel } from "./JsonUploadPanel";

export const Detector = () => {
    const { toast } = useToast();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Video Refs
    const inputVideoRef = useRef<HTMLVideoElement>(null);
    const outputVideoRef = useRef<HTMLVideoElement>(null);

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setVideoFile(file);
        setAnalysisResult(null);
        setIsAnalyzing(true);
        setIsPlaying(true);

        try {
            const result = await analyzeVideo(file);
            setAnalysisResult(result);
            toast({
                title: "Analysis Complete",
                description: "Video processed successfully.",
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Analysis Failed",
                description: "Failed to process video.",
                variant: "destructive",
            });
            setIsAnalyzing(false); // Stop loading state on error
        }
        setIsAnalyzing(false);
    };

    const togglePlayback = () => {
        if (inputVideoRef.current && outputVideoRef.current) {
            if (isPlaying) {
                inputVideoRef.current.pause();
                outputVideoRef.current.pause();
            } else {
                inputVideoRef.current.play();
                outputVideoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleReset = () => {
        setVideoFile(null);
        setAnalysisResult(null);
        setIsPlaying(false);
        setIsAnalyzing(false);
    };

    // Keep both videos in sync
    const syncVideos = () => {
        if (inputVideoRef.current && outputVideoRef.current) {
            if (Math.abs(inputVideoRef.current.currentTime - outputVideoRef.current.currentTime) > 0.1) {
                outputVideoRef.current.currentTime = inputVideoRef.current.currentTime;
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-light text-foreground mb-1">UAV Detector</h2>
                <p className="text-foreground-muted text-sm">Advanced real-time threat detection and tracking system</p>
            </div>

            <div className="rounded-lg border border-border-subtle bg-card overflow-hidden">
                {/* Section Header */}
                <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-background-elevated/50">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <h3 className="font-medium text-sm tracking-wide">VIDEO ANALYSIS ENGINE</h3>
                    </div>

                    <div className="flex items-center gap-2">
                        {videoFile && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={togglePlayback}
                                    className="h-8 gap-2 border-border-subtle hover:bg-background-elevated"
                                >
                                    {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                    {isPlaying ? "Pause" : "Play"}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleReset}
                                    className="h-8 gap-2 border-border-subtle hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    Reset
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6">
                    {!videoFile ? (
                        /* Upload State */
                        <div className="h-[400px] border-2 border-dashed border-border-subtle rounded-lg flex flex-col items-center justify-center bg-background-surface/50 transition-colors hover:bg-background-surface group">
                            <div className="w-16 h-16 rounded-full bg-background-elevated flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-border-subtle">
                                <Upload className="w-8 h-8 text-primary/70" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2">Upload Surveillance Footage</h3>
                            <p className="text-foreground-muted text-sm max-w-sm text-center mb-6">
                                Select a video file to run real-time threat detection and behavioral analysis.
                            </p>
                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={handleVideoUpload}
                                />
                                <span className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-md text-sm font-medium transition-colors shadow-lg hover:shadow-primary/20">
                                    Select Video Input
                                </span>
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Analysis State - Side by Side */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* Left: Input Feed */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-foreground-muted" />
                                            <span className="text-xs font-mono text-foreground-muted">RAW_INPUT</span>
                                        </div>
                                        <span className="text-[10px] bg-background-elevated px-2 py-0.5 rounded text-foreground-subtle border border-border-subtle">SOURCE: UPLOAD</span>
                                    </div>

                                    <div className="relative aspect-video bg-black rounded-md overflow-hidden border border-border-subtle shadow-lg group">
                                        <video
                                            ref={inputVideoRef}
                                            src={URL.createObjectURL(videoFile)}
                                            className="w-full h-full object-contain"
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            onTimeUpdate={syncVideos}
                                        />
                                        {/* Overlay Info */}
                                        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-mono text-white/80 border border-white/10">
                                            CAM_01 // RAW
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Output Feed */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${isAnalyzing ? 'bg-yellow-500 animate-pulse' : 'bg-primary'}`} />
                                            <span className="text-xs font-mono text-primary">ANALYSIS_OUTPUT</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-3 h-3 text-primary" />
                                            <span className="text-[10px] text-primary">STATUS: {isAnalyzing ? "PROCESSING..." : "ACTIVE"}</span>
                                        </div>
                                    </div>

                                    <div className="relative aspect-video bg-black rounded-md overflow-hidden border border-primary/30 shadow-[0_0_20px_-5px_rgba(var(--primary),0.15)]">
                                        {analysisResult ? (
                                            <video
                                                ref={outputVideoRef}
                                                src={`${API_BASE_URL}/videos/${encodeURIComponent(analysisResult.output_video_path)}`}
                                                className="w-full h-full object-contain opacity-90"
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                            />
                                        ) : (
                                            // Placeholder while analyzing
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                {/* Using input video as placeholder background */}
                                                <video
                                                    src={URL.createObjectURL(videoFile)}
                                                    className="w-full h-full object-contain opacity-30 grayscale"
                                                    autoPlay
                                                    loop
                                                    muted
                                                />
                                            </div>
                                        )}

                                        {/* HUD Overlay */}
                                        <div className="absolute inset-0 pointer-events-none">
                                            {/* Grid Lines */}
                                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

                                            {/* Corner Markers */}
                                            <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-primary/60" />
                                            <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-primary/60" />
                                            <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-primary/60" />
                                            <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-primary/60" />

                                            {/* Scanning Beam Animation */}
                                            <motion.div
                                                className="absolute left-0 right-0 h-[2px] bg-primary/50 shadow-[0_0_15px_2px_rgba(var(--primary),0.4)]"
                                                animate={{ top: ["0%", "100%"] }}
                                                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                            />

                                            {/* Loading/Processing State */}
                                            {isAnalyzing && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                                                        <div className="text-center">
                                                            <p className="text-xs font-mono text-primary font-bold tracking-widest">ANALYZING FOOTAGE</p>
                                                            <p className="text-[10px] text-primary/70 mt-1">YOLOv8 INFERENCE RUNNING...</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Badge */}
                                        <div className="absolute top-3 right-3 px-2 py-1 bg-primary/20 backdrop-blur-md rounded border border-primary/30 text-[10px] font-mono text-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]">
                                            AI_ENHANCED
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Analysis Results / Stats */}
                            <div className="pt-6 border-t border-border-subtle">
                                <h3 className="text-lg font-light text-foreground mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" />
                                    Live Mission Analytics
                                </h3>
                                {/* Pass initialStats from analysis result if checking a specific video */}
                                <AnalyticsCharts initialStats={analysisResult?.stats} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Separate JSON Upload Panel */}
            <JsonUploadPanel />
        </div>
    );
};
