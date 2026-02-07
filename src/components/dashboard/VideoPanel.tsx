import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/api";

const VideoPanel: React.FC = () => {
  return (
    <Card className="col-span-1 lg:col-span-2 h-[500px]">
      <CardHeader>
        <CardTitle>Live Surveillance Feed</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex items-center justify-center h-[calc(100%-4rem)] bg-black overflow-hidden relative">
        <img
          src={`${API_BASE_URL}/video_feed`}
          alt="Live Stream"
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            // Show error state
          }}
        />
        <div className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 rounded text-xs animate-pulse font-bold">
          LIVE
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoPanel;