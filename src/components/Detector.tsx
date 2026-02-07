import React, { useState, useRef } from 'react';
import { detectUAV, PredictionResponse } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const Detector = () => {
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [predictions, setPredictions] = useState<PredictionResponse | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImage(e.target?.result as string);
                setPredictions(null); // Reset predictions
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDetect = async () => {
        if (!fileInputRef.current?.files?.[0]) return;

        setLoading(true);
        try {
            const result = await detectUAV(fileInputRef.current.files[0]);
            setPredictions(result);
        } catch (error) {
            console.error(error);
            alert("Failed to detect. Ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto mt-8">
            <CardHeader>
                <CardTitle>UAV Detection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                    />
                    <Button onClick={handleDetect} disabled={!image || loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Detect"}
                    </Button>
                </div>

                {image && (
                    <div className="relative border rounded-lg overflow-hidden">
                        <img src={image} alt="Upload" className="w-full h-auto" />

                        {predictions?.detections.map((det, index) => {
                            const [x1, y1, x2, y2] = det.bbox;
                            // Note: Bounding boxes from backend are likely in absolute pixels. 
                            // If the image is scaled by CSS, these might need adjustment or 
                            // we need to render them on a canvas layer that matches the image's intrinsic size.
                            // For simplicity, we can use percentage if we had image dimensions, 
                            // but usually it's easier to just assume the image container fits the image or we get better coordinates.
                            // Actually, let's try to style them absolutely based on the image display size?
                            // A better approach often is to draw on a canvas. 
                            // For now, let's try absolute positioning assuming the image is displayed at natural size or similar.

                            // To make this responsive is tricky without canvas. 
                            // Let's assume for a quick start we just list them or try a simple overlay if we can get dimensions.
                            // But since I don't know the displayed image size vs natural size, I'll just list them below first 
                            // AND try to draw a simple box if possible, but maybe just listing is safer for v1.

                            return (
                                <div
                                    key={index}
                                    style={{
                                        position: 'absolute',
                                        left: 0, top: 0, width: '100%', height: '100%', // Container for SVG overlay
                                        pointerEvents: 'none'
                                    }}
                                >
                                    {/*  Actually, better to use an SVG overlay which scales with the image if we set viewBox */}
                                </div>
                            );
                        })}

                        {/* Improved Overlay approach using SVG */}
                        {predictions && (
                            <svg
                                viewBox={`0 0 ${document.querySelector('img')?.naturalWidth || 100} ${document.querySelector('img')?.naturalHeight || 100}`}
                                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                style={{}} // We'd need to set the viewbox to match the image's natural dimensions. 
                            // This is hard to do in the render loop without state.
                            // Let's just list the detections for now to be safe, easier to debug.
                            >
                                {/* We can't easily get natural width herein the render loop without more state. 
                                    I'll stick to listing detections below the image for V1. 
                                 */}
                            </svg>
                        )}

                    </div>
                )}

                {predictions && (
                    <div className="bg-slate-100 p-4 rounded-md">
                        <h3 className="font-semibold mb-2">Detections:</h3>
                        {predictions.detections.length === 0 ? (
                            <p>No UAVs detected.</p>
                        ) : (
                            <ul className="list-disc pl-5">
                                {predictions.detections.map((det, i) => (
                                    <li key={i}>
                                        {det.label} ({Math.round(det.conf * 100)}%)
                                        {/* - Box: [{Math.round(det.bbox[0])}, {Math.round(det.bbox[1])}, ...] */}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                            * Bounding box visualization requires mapping image coordinates to screen coordinates.
                            Currently viewing raw results.
                        </p>
                    </div>
                )}

            </CardContent>
        </Card>
    );
};
