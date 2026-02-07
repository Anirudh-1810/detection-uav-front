export const API_BASE_URL = "http://localhost:8000";

export interface Detection {
    bbox: [number, number, number, number];
    conf: number;
    class: number;
    label: string;
}

export interface PredictionResponse {
    detections: Detection[];
}

export async function detectUAV(imageFile: File): Promise<PredictionResponse> {
    const formData = new FormData();
    formData.append("file", imageFile);

    try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Detection failed:", error);
        throw error;
    }
}

export interface Stats {
    total_detections: number;
    current_occupancy: number;
    hourly_breakdown: number[];
    total_alerts: number;
    high_alerts: number;
    medium_alerts: number;
    low_alerts: number;
    speed_violations: number;
    hover_detections: number;
    zone_violations: number;
    recent_alerts: any[];
}

export async function getStats(): Promise<Stats> {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (!response.ok) throw new Error("Failed to fetch stats");
        return await response.json();
    } catch (error) {
        console.error("Stats fetch failed:", error);
        throw error;
    }
}

export async function updateZones(zones: any[]): Promise<any> {
    try {
        const response = await fetch(`${API_BASE_URL}/config/zones`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(zones)
        });
        if (!response.ok) throw new Error("Failed to update zones");
        return await response.json();
    } catch (error) {
        console.error("Update zones failed:", error);
        throw error;
    }
}

export interface VideoAnalysisResponse {
    message: string;
    job_id: string;
    output_video_path: string;
}

export async function analyzeVideo(videoFile: File): Promise<VideoAnalysisResponse> {
    const formData = new FormData();
    formData.append("file", videoFile);

    try {
        const response = await fetch(`${API_BASE_URL}/analyze-video`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Video analysis failed:", error);
        throw error;
    }
}
