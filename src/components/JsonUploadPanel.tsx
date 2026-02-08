import { useState } from "react";
import { Upload, FileJson, CheckCircle, AlertCircle, Activity, Trophy, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

export const JsonUploadPanel = () => {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{ risk_score: number; analysis: string;[key: string]: any } | null>(null);
    const [inputData, setInputData] = useState<any>(null);

    // Alert States
    const [showWarning, setShowWarning] = useState(false);
    const [showDanger, setShowDanger] = useState(false);

    const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setAnalysisResult(null);
        setInputData(null);
        setShowWarning(false);
        setShowDanger(false);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const jsonContent = JSON.parse(event.target?.result as string);
                setInputData(jsonContent);

                const payload = {
                    data: jsonContent,
                    prompt: "Analyze the following RF signal data for UAV threats."
                };

                const response = await fetch("http://localhost:8000/analyze-json", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    const data = await response.json();

                    if (data.success) {
                        const score = data.data.output.risk_score;
                        setAnalysisResult(data.data.output);

                        // Threat Alert Logic
                        if (score > 0.95) {
                            setShowDanger(true);
                            // Auto-hide danger flash after animation
                            setTimeout(() => setShowDanger(false), 3000);
                        } else if (score > 0.50) {
                            setShowWarning(true);
                        }

                        toast({
                            title: "Analysis Complete",
                            description: `Risk Score: ${score}`,
                            action: <div className="h-8 w-8 bg-green-500/20 rounded-full flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-500" /></div>
                        });
                    } else {
                        throw new Error(data.error?.message || "Analysis failed");
                    }

                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || "Upload failed");
                }
            } catch (error) {
                console.error("JSON Analysis Error:", error);
                toast({
                    title: "Analysis Failed",
                    description: error instanceof Error ? error.message : "Could not analyze JSON file.",
                    variant: "destructive",
                    action: <div className="h-8 w-8 bg-red-500/20 rounded-full flex items-center justify-center"><AlertCircle className="w-5 h-5 text-red-500" /></div>
                });
            } finally {
                setIsUploading(false);
                if (e.target) e.target.value = "";
            }
        };

        reader.readAsText(file);
    };

    return (
        <>
            {/* DANGER FLASH OVERLAY (>95% Risk) */}
            <AnimatePresence>
                {showDanger && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.8, 0, 0.8, 0, 0.8, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2.5, times: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1] }}
                        className="fixed inset-0 z-[100] bg-red-600 pointer-events-none mix-blend-overlay"
                    >
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/80 px-12 py-8 rounded-xl border-4 border-red-500 flex flex-col items-center animate-pulse">
                                <ShieldAlert className="w-24 h-24 text-red-500 mb-4" />
                                <h1 className="text-6xl font-black text-red-500 tracking-tighter uppercase">CRITICAL THREAT IMPACT</h1>
                                <p className="text-2xl text-white font-mono mt-4 tracking-widest">IMMEDIATE ACTION REQUIRED</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* WARNING DIALOG (>50% Risk) */}
            <Dialog open={showWarning} onOpenChange={setShowWarning}>
                <DialogContent className="border-orange-500/50 bg-[#1a1410]">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-500/20 rounded-full">
                                <AlertCircle className="w-6 h-6 text-orange-500" />
                            </div>
                            <DialogTitle className="text-xl text-orange-500">Elevated Threat Detected</DialogTitle>
                        </div>
                        <DialogDescription className="text-foreground/90 text-base">
                            The analysis indicates a risk score of <strong>{(analysisResult?.risk_score || 0) * 100}%</strong>.
                            <br /><br />
                            This signal pattern matches known UAV signatures. Recommended to initiate secondary verification protocols.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end mt-4">
                        <Button
                            variant="outline"
                            className="border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-500"
                            onClick={() => setShowWarning(false)}
                        >
                            Acknowledge
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="rounded-lg border border-border-subtle bg-card overflow-hidden mt-8">
                <div className="p-4 border-b border-border-subtle flex items-center gap-2 bg-background-elevated/50">
                    <FileJson className="w-4 h-4 text-secondary" />
                    <h3 className="font-medium text-sm tracking-wide">RF SIGNAL DATA UPLOAD & ANALYTICS</h3>
                </div>

                <div className="p-6 space-y-8">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-border-subtle rounded-lg p-10 hover:bg-background-surface/50 transition-colors group">
                        <div className="w-12 h-12 rounded-full bg-background-elevated flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-border-subtle text-secondary">
                            <Upload className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-medium text-foreground mb-2">Upload Telemetry Data</h3>
                        <p className="text-foreground-muted text-sm max-w-sm text-center mb-6">
                            Select a .json file containing RF signal data for immediate AI analysis.
                        </p>

                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept=".json"
                                className="hidden"
                                onChange={handleJsonUpload}
                                disabled={isUploading}
                            />
                            <span className={`px-6 py-2.5 rounded-md text-sm font-medium transition-colors shadow-lg flex items-center gap-2 ${isUploading ? 'bg-secondary/50 cursor-not-allowed' : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'}`}>
                                {isUploading ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <FileJson className="w-4 h-4" />
                                        Select JSON File
                                    </>
                                )}
                            </span>
                        </label>
                    </div>

                    {/* Analysis Results Display */}
                    {analysisResult && inputData && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-light text-foreground">Mission Analytics</h3>
                            </div>

                            {/* Dynamic Dashboard */}
                            <AnalyticsDashboard data={inputData} riskScore={analysisResult.risk_score} />

                            {/* Text Analysis Block */}
                            <div className="bg-background-elevated rounded-lg p-6 border border-border-subtle mt-4">
                                <h4 className="font-medium text-foreground mb-2">AI Assessment</h4>
                                <p className="text-sm text-foreground-muted leading-relaxed whitespace-pre-line">
                                    {analysisResult.analysis}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
