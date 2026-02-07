import { motion } from "framer-motion";

interface HistoryItem {
  id: string;
  date: string;
  video: string;
  threatLevel: "low" | "medium" | "high" | "critical";
  status: "completed" | "processing" | "flagged";
  detections: number;
}

const mockHistory: HistoryItem[] = [
  { id: "JOB-2024-0147", date: "2024-01-15 14:32", video: "sector_a_feed_01.mp4", threatLevel: "medium", status: "completed", detections: 28 },
  { id: "JOB-2024-0146", date: "2024-01-15 12:15", video: "perimeter_scan.mp4", threatLevel: "high", status: "flagged", detections: 45 },
  { id: "JOB-2024-0145", date: "2024-01-15 09:48", video: "north_corridor.mp4", threatLevel: "low", status: "completed", detections: 12 },
  { id: "JOB-2024-0144", date: "2024-01-14 22:30", video: "night_patrol_03.mp4", threatLevel: "low", status: "completed", detections: 8 },
  { id: "JOB-2024-0143", date: "2024-01-14 18:15", video: "approach_zone.mp4", threatLevel: "critical", status: "flagged", detections: 67 },
  { id: "JOB-2024-0142", date: "2024-01-14 14:00", video: "sector_b_sweep.mp4", threatLevel: "medium", status: "processing", detections: 34 },
  { id: "JOB-2024-0141", date: "2024-01-14 10:30", video: "morning_recon.mp4", threatLevel: "low", status: "completed", detections: 15 },
];

const HistoryTable = () => {
  const getThreatLevelStyles = (level: string) => {
    switch (level) {
      case "critical":
        return "text-destructive bg-destructive/10";
      case "high":
        return "text-destructive bg-destructive/10";
      case "medium":
        return "text-warning bg-warning/10";
      default:
        return "text-primary bg-primary/10";
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "flagged":
        return "text-destructive";
      case "processing":
        return "text-warning";
      default:
        return "text-success";
    }
  };

  return (
    <div className="bg-background-elevated border border-border-subtle">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
        <p className="text-system-label">ANALYSIS HISTORY</p>
        <div className="flex items-center gap-4">
          <span className="text-xs text-foreground-muted">
            {mockHistory.length} records
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="px-5 py-3 text-left text-system-label font-normal">Job ID</th>
              <th className="px-5 py-3 text-left text-system-label font-normal">Date</th>
              <th className="px-5 py-3 text-left text-system-label font-normal">Video</th>
              <th className="px-5 py-3 text-left text-system-label font-normal">Detections</th>
              <th className="px-5 py-3 text-left text-system-label font-normal">Threat Level</th>
              <th className="px-5 py-3 text-left text-system-label font-normal">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {mockHistory.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-background-surface/50 transition-colors"
              >
                <td className="px-5 py-3 text-sm font-mono text-foreground-muted">
                  {item.id}
                </td>
                <td className="px-5 py-3 text-sm text-foreground-muted">
                  {item.date}
                </td>
                <td className="px-5 py-3 text-sm text-foreground">
                  {item.video}
                </td>
                <td className="px-5 py-3 text-sm text-foreground">
                  {item.detections}
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wide ${getThreatLevelStyles(item.threatLevel)}`}>
                    {item.threatLevel}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`flex items-center gap-2 text-xs ${getStatusStyles(item.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      item.status === "flagged" 
                        ? "bg-destructive" 
                        : item.status === "processing"
                          ? "bg-warning animate-pulse"
                          : "bg-success"
                    }`} />
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-border-subtle">
        <button className="text-xs text-foreground-muted hover:text-foreground transition-colors">
          ← Previous
        </button>
        <span className="text-xs text-foreground-subtle">Page 1 of 12</span>
        <button className="text-xs text-foreground-muted hover:text-foreground transition-colors">
          Next →
        </button>
      </div>
    </div>
  );
};

export default HistoryTable;