import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";

interface Alert {
  id: string;
  timestamp: string;
  type: "critical" | "warning" | "info";
  message: string;
  objectId: string;
}

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected">("disconnected");

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket(`${API_BASE_URL.replace("http", "ws")}/ws/alerts`);

    ws.onopen = () => {
      console.log("Connected to Alerts WebSocket");
      setConnectionStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        const newAlert = JSON.parse(event.data);
        // Ensure the alert fits our interface
        const formattedAlert: Alert = {
          id: newAlert.id || Math.random().toString(36).substr(2, 9),
          timestamp: newAlert.timestamp || new Date().toLocaleTimeString(),
          type: newAlert.type?.toLowerCase() || "info",
          message: newAlert.message || "Unknown Event",
          objectId: newAlert.objectId || "Unknown",
        };

        setAlerts((prev) => [formattedAlert, ...prev].slice(0, 50)); // Keep last 50
      } catch (e) {
        console.error("Failed to parse alert:", e);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from Alerts WebSocket");
      setConnectionStatus("disconnected");
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="bg-background-elevated border border-border-subtle h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle shrink-0">
        <p className="text-system-label">LIVE ALERTS</p>
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'} ${connectionStatus === 'connected' ? 'animate-pulse' : ''}`} />
          <span className="text-xs text-foreground-muted">
            {connectionStatus === 'connected' ? 'Live' : 'Offline'} • {alerts.filter(a => a.type === "critical").length} Critical
          </span>
        </div>
      </div>

      <div className="divide-y divide-border-subtle overflow-auto flex-1">
        {alerts.length === 0 ? (
          <div className="p-5 text-center text-foreground-muted text-sm">
            No alerts yet. System is monitoring...
          </div>
        ) : (
          alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="px-5 py-3 hover:bg-background-surface/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Status indicator */}
                <div
                  className={`w-1 h-full min-h-[40px] ${alert.type === "critical"
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
          ))
        )}
      </div>

      <div className="px-5 py-3 border-t border-border-subtle shrink-0">
        <button
          onClick={() => setAlerts([])}
          className="text-xs text-primary hover:text-primary/80 transition-colors"
        >
          Clear Alerts
        </button>
      </div>
    </div>
  );
};

export default AlertsPanel;