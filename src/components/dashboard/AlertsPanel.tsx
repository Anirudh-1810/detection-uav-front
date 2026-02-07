import { motion } from "framer-motion";

interface Alert {
  id: string;
  timestamp: string;
  type: "critical" | "warning" | "info";
  message: string;
  objectId: string;
}

const mockAlerts: Alert[] = [
  {
    id: "ALT-001",
    timestamp: "14:32:08",
    type: "critical",
    message: "High-speed approach detected in restricted zone",
    objectId: "UAV-003",
  },
  {
    id: "ALT-002",
    timestamp: "14:28:45",
    type: "warning",
    message: "Loitering pattern identified",
    objectId: "UAV-007",
  },
  {
    id: "ALT-003",
    timestamp: "14:25:12",
    type: "warning",
    message: "Altitude deviation from expected profile",
    objectId: "UAV-012",
  },
  {
    id: "ALT-004",
    timestamp: "14:21:33",
    type: "info",
    message: "New object acquired and tracking initiated",
    objectId: "UAV-015",
  },
  {
    id: "ALT-005",
    timestamp: "14:18:07",
    type: "info",
    message: "Object classification updated",
    objectId: "UAV-002",
  },
];

const AlertsPanel = () => {
  return (
    <div className="bg-background-elevated border border-border-subtle">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
        <p className="text-system-label">LIVE ALERTS</p>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
          <span className="text-xs text-foreground-muted">
            {mockAlerts.filter(a => a.type === "critical").length} Critical
          </span>
        </div>
      </div>

      <div className="divide-y divide-border-subtle max-h-80 overflow-auto">
        {mockAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="px-5 py-3 hover:bg-background-surface/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Status indicator */}
              <div 
                className={`w-1 h-full min-h-[40px] ${
                  alert.type === "critical" 
                    ? "bg-destructive" 
                    : alert.type === "warning" 
                      ? "bg-warning" 
                      : "bg-primary"
                }`} 
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground-subtle font-mono">
                    {alert.timestamp}
                  </span>
                  <span className="text-[10px] text-foreground-subtle">
                    {alert.objectId}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-snug">
                  {alert.message}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="px-5 py-3 border-t border-border-subtle">
        <button className="text-xs text-primary hover:text-primary/80 transition-colors">
          View all alerts →
        </button>
      </div>
    </div>
  );
};

export default AlertsPanel;