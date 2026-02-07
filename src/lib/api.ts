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
        const response = await fetch("http://localhost:8080/predict", {
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
