import React, { useState, useRef } from 'react';
import { detectUAV, PredictionResponse, analyzeVideo, VideoAnalysisResponse } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Video, Image as ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const Detector = () => {
    // Image State
    const [image, setImage] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [predictions, setPredictions] = useState<PredictionResponse | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Video State
    const [video, setVideo] = useState<string | null>(null);
    const [videoLoading, setVideoLoading] = useState(false);
    const [videoResult, setVideoResult] = useState<VideoAnalysisResponse | null>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    // Image Handlers
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    const handleDetectImage = async () => {
        if (!imageInputRef.current?.files?.[0]) return;

        setImageLoading(true);
        try {
            const result = await detectUAV(imageInputRef.current.files[0]);
            setPredictions(result);
        } catch (error) {
            console.error(error);
            alert("Failed to detect. Ensure backend is running.");
        } finally {
            setImageLoading(false);
        }
    };

    // Video Handlers
    const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setVideo(url);
            setVideoResult(null);
        }
    };

    const handleAnalyzeVideo = async () => {
        if (!videoInputRef.current?.files?.[0]) return;

        setVideoLoading(true);
        try {
            const result = await analyzeVideo(videoInputRef.current.files[0]);
            setVideoResult(result);
        } catch (error) {
            console.error(error);
            alert("Failed to analyze video. Ensure backend is running.");
        } finally {
            setVideoLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-3xl mx-auto mt-8">
            <CardHeader>
                <CardTitle>UAV Detection & Analysis</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="image" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="image"><ImageIcon className="mr-2 h-4 w-4" /> Image Detection</TabsTrigger>
                        <TabsTrigger value="video"><Video className="mr-2 h-4 w-4" /> Video Analysis</TabsTrigger>
                    </TabsList>

                    <TabsContent value="image" className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                ref={imageInputRef}
                            />
                            <Button onClick={handleDetectImage} disabled={!image || imageLoading}>
                                {imageLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Detect"}
                            </Button>
                        </div>

                        {image && (
                            <div className="relative border rounded-lg overflow-hidden bg-black/5">
                                <img src={image} alt="Upload" className="w-full h-auto object-contain max-h-[500px]" />
                                {/* Overlay logic can be improved here with canvas if needed */}
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
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="video" className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Input
                                type="file"
                                accept="video/*"
                                onChange={handleVideoChange}
                                ref={videoInputRef}
                            />
                            <Button onClick={handleAnalyzeVideo} disabled={!video || videoLoading}>
                                {videoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Analyze Video"}
                            </Button>
                        </div>

                        {video && (
                            <div className="relative border rounded-lg overflow-hidden bg-black">
                                <video src={video} controls className="w-full h-auto max-h-[500px]" />
                            </div>
                        )}

                        {videoResult && (
                            <Alert className="bg-green-50 border-green-200">
                                <Video className="h-4 w-4 text-green-600" />
                                <AlertTitle className="text-green-800">Analysis Started</AlertTitle>
                                <AlertDescription className="text-green-700">
                                    <p>{videoResult.message}</p>
                                    <p className="text-xs mt-1 text-green-600/80">Job ID: {videoResult.job_id}</p>

                                    <div className="mt-4 pt-4 border-t border-green-200">
                                        <p className="font-semibold mb-2">Processed Video:</p>
                                        <div className="relative border rounded-lg overflow-hidden bg-black mt-2">
                                            <video
                                                src={`http://localhost:8000/videos/${encodeURIComponent(videoResult.output_video_path)}`}
                                                controls
                                                autoPlay
                                                className="w-full h-auto max-h-[500px]"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            * Note: Processing takes time. If the link returns 404, please wait a moment and try again.
                                        </p>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

