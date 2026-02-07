import VideoPanel from "./VideoPanel";
import { Upload } from "lucide-react";

const DashboardVideo = () => {
  return (
    <div className="space-y-6">
      {/* Controls bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-light text-foreground">Video Intelligence</h2>
          <p className="text-sm text-foreground-muted">Real-time detection and analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-background-surface border border-border-subtle text-sm text-foreground-muted hover:text-foreground transition-colors">
            <Upload className="w-4 h-4" />
            Upload Video
          </button>
          <select className="px-4 py-2 bg-background-surface border border-border-subtle text-sm text-foreground">
            <option>CAM-01 - North Perimeter</option>
            <option>CAM-02 - East Sector</option>
            <option>CAM-03 - South Gate</option>
            <option>CAM-04 - West Corridor</option>
          </select>
        </div>
      </div>

      {/* Main video panel */}
      <VideoPanel />

      {/* Detection log */}
      <div className="bg-background-elevated border border-border-subtle p-5">
        <p className="text-system-label mb-4">DETECTION LOG</p>
        <div className="space-y-2 max-h-48 overflow-auto font-mono text-xs">
          <LogEntry time="14:32:08.234" message="[DETECT] UAV-003 acquired at coordinates (1245, 892)" type="info" />
          <LogEntry time="14:32:08.456" message="[TRACK] UAV-003 velocity: 12.4 m/s, heading: 045°" type="info" />
          <LogEntry time="14:32:09.012" message="[ALERT] UAV-003 threat score elevated: 78" type="warning" />
          <LogEntry time="14:32:09.234" message="[BEHAVIOR] Loitering pattern detected for UAV-002" type="warning" />
          <LogEntry time="14:32:10.567" message="[CLASSIFY] UAV-003 classified as: QUADCOPTER (94%)" type="info" />
          <LogEntry time="14:32:11.890" message="[ALERT] UAV-003 entering restricted zone" type="critical" />
        </div>
      </div>
    </div>
  );
};

interface LogEntryProps {
  time: string;
  message: string;
  type: "info" | "warning" | "critical";
}

const LogEntry = ({ time, message, type }: LogEntryProps) => {
  const typeStyles = {
    info: "text-foreground-muted",
    warning: "text-warning",
    critical: "text-destructive",
  };

  return (
    <div className={`flex gap-4 ${typeStyles[type]}`}>
      <span className="text-foreground-subtle">{time}</span>
      <span>{message}</span>
    </div>
  );
};

export default DashboardVideo;