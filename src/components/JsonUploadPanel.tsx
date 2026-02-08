import { useState } from "react";
import { Upload, FileJson, CheckCircle, AlertCircle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export const JsonUploadPanel = () => {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{ risk_score: number; analysis: string } | null>(null);

    const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setAnalysisResult(null); // Clear previous results

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const jsonContent = JSON.parse(event.target?.result as string);

                // Construct the payload as expected by the backend
                const payload = {
                    data: jsonContent,
                    prompt: "Analyze the following RF signal data for UAV threats."
                };

                const response = await fetch("http://localhost:8000/analyze-json", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    const data = await response.json();

                    if (data.success) {
                        setAnalysisResult(data.data.output);
                        toast({
                            title: "Analysis Complete",
                            description: `Risk Score: ${data.data.output.risk_score}`,
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
                if (e.target) e.target.value = ""; // Reset input
            }
        };

        reader.readAsText(file);
    };

    return (
        <div className="rounded-lg border border-border-subtle bg-card overflow-hidden mt-8">
            <div className="p-4 border-b border-border-subtle flex items-center gap-2 bg-background-elevated/50">
                <FileJson className="w-4 h-4 text-secondary" />
                <h3 className="font-medium text-sm tracking-wide">RF SIGNAL DATA UPLOAD</h3>
            </div>

            <div className="p-6 space-y-6">
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
                {analysisResult && (
                    <div className="bg-background-elevated rounded-lg p-4 border border-border-subtle animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full ${analysisResult.risk_score > 0.7 ? 'bg-red-500/20 text-red-500' : analysisResult.risk_score > 0.3 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                                <Activity className="w-6 h-6" />
                            </div>
                            <div className="space-y-1 flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-foreground">Analysis Result</h4>
                                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${analysisResult.risk_score > 0.7 ? 'bg-red-500/20 text-red-500 border-red-500/30' : analysisResult.risk_score > 0.3 ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' : 'bg-green-500/20 text-green-500 border-green-500/30'} border`}>
                                        RISK SCORE: {analysisResult.risk_score}
                                    </span>
                                </div>
                                <p className="text-sm text-foreground-muted leading-relaxed">
                                    {analysisResult.analysis}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
