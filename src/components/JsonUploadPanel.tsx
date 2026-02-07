import { useState } from "react";
import { Upload, FileJson, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export const JsonUploadPanel = () => {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);

    const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:8000/upload-json", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                toast({
                    title: "Upload Successful",
                    description: `JSON file ${data.filename} uploaded to MongoDB.`,
                    action: <div className="h-8 w-8 bg-green-500/20 rounded-full flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-500" /></div>
                });
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            console.error("JSON Upload Error:", error);
            toast({
                title: "Upload Failed",
                description: "Could not upload JSON file.",
                variant: "destructive",
                action: <div className="h-8 w-8 bg-red-500/20 rounded-full flex items-center justify-center"><AlertCircle className="w-5 h-5 text-red-500" /></div>
            });
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = "";
        }
    };

    return (
        <div className="rounded-lg border border-border-subtle bg-card overflow-hidden mt-8">
            <div className="p-4 border-b border-border-subtle flex items-center gap-2 bg-background-elevated/50">
                <FileJson className="w-4 h-4 text-secondary" />
                <h3 className="font-medium text-sm tracking-wide">RF SIGNAL DATA UPLOAD</h3>
            </div>

            <div className="p-6">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-border-subtle rounded-lg p-10 hover:bg-background-surface/50 transition-colors group">
                    <div className="w-12 h-12 rounded-full bg-background-elevated flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-border-subtle text-secondary">
                        <Upload className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-medium text-foreground mb-2">Upload Telemetry Data</h3>
                    <p className="text-foreground-muted text-sm max-w-sm text-center mb-6">
                        Select a .json file containing RF signal data for backend processing and storage in the mission database.
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
            </div>
        </div>
    );
};
