import React, { useState, useRef } from 'react';

interface Detection {
    class: string;
    confidence: number;
    bbox: number[]; // [x1, y1, x2, y2]
}

interface DetectionResponse {
    success: boolean;
    image_size: [number, number];
    detections: Detection[];
}

const Detection: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [detections, setDetections] = useState<Detection[]>([]);
    const [error, setError] = useState<string | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setImagePreview(URL.createObjectURL(selectedFile));
            setDetections([]); // Reset detections
            setError(null);
        }
    };

    const drawDetections = (detections: Detection[]) => {
        const canvas = canvasRef.current;
        const img = imgRef.current;

        if (canvas && img) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Match canvas size to image display size
                canvas.width = img.clientWidth;
                canvas.height = img.clientHeight;

                // Scaling factors (if image is resized by CSS)
                const scaleX = img.clientWidth / img.naturalWidth;
                const scaleY = img.clientHeight / img.naturalHeight;

                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings
                ctx.lineWidth = 2;
                ctx.font = '16px Arial';

                detections.forEach(det => {
                    const [x1, y1, x2, y2] = det.bbox;

                    // Scale coordinates
                    const sx1 = x1 * scaleX;
                    const sy1 = y1 * scaleY;
                    const sx2 = x2 * scaleX;
                    const sy2 = y2 * scaleY;

                    // Draw Box
                    ctx.strokeStyle = '#00FF00'; // Green box
                    ctx.strokeRect(sx1, sy1, sx2 - sx1, sy2 - sy1);

                    // Draw Label Background
                    const text = `${det.class} (${(det.confidence * 100).toFixed(1)}%)`;
                    const textWidth = ctx.measureText(text).width;
                    ctx.fillStyle = '#00FF00';
                    ctx.fillRect(sx1, sy1 - 20, textWidth + 10, 20);

                    // Draw Text
                    ctx.fillStyle = '#000000';
                    ctx.fillText(text, sx1 + 5, sy1 - 5);
                });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Point to Express Backend
            const response = await fetch('http://localhost:3000/api/detect', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server Error: ${response.statusText}`);
            }

            const data: DetectionResponse = await response.json();

            if (data.success) {
                setDetections(data.detections);
                drawDetections(data.detections);
            } else {
                setError('Detection failed: Unknown error');
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to connect to backend');
        } finally {
            setLoading(false);
        }
    };

    // Redraw if window resizes (optional optimization)
    // useEffect(() => { ... }, []);

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">You Only Look Once (MERN Integration)</h1>

            <form onSubmit={handleSubmit} className="mb-6 flex gap-4 items-center">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
                />
                <button
                    type="submit"
                    disabled={!file || loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Detect'}
                </button>
            </form>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="relative inline-block border rounded-lg overflow-hidden bg-gray-100">
                {imagePreview ? (
                    <>
                        <img
                            ref={imgRef}
                            src={imagePreview}
                            alt="Upload Preview"
                            className="max-w-full h-auto block"
                            onLoad={() => {
                                // Redraw if detections exist (e.g. if we had a previous result, though we clear it on new file)
                                if (detections.length > 0) drawDetections(detections);
                            }}
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute top-0 left-0 pointer-events-none"
                        />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-64 w-full text-gray-400">
                        No image selected
                    </div>
                )}
            </div>

            {/* JSON Results */}
            {detections.length > 0 && (
                <div className="mt-6 bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto">
                    <h3 className="font-mono text-sm mb-2 text-green-400">Detection Results ({detections.length})</h3>
                    <pre className="text-xs">
                        {JSON.stringify(detections, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default Detection;
