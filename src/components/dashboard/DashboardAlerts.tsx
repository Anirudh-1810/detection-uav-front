import AlertsPanel from "./AlertsPanel";
import { motion } from "framer-motion";

const DashboardAlerts = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-light text-foreground">Alert Management</h2>
          <p className="text-sm text-foreground-muted">Real-time threat notifications</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 bg-background-surface border border-border-subtle text-sm text-foreground">
            <option>All Priorities</option>
            <option>Critical Only</option>
            <option>High & Above</option>
            <option>Medium & Above</option>
          </select>
          <button className="px-4 py-2 bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors">
            Export Alerts
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <AlertStatCard label="Critical" count={2} color="destructive" />
        <AlertStatCard label="High" count={5} color="destructive" />
        <AlertStatCard label="Medium" count={12} color="warning" />
        <AlertStatCard label="Low" count={28} color="primary" />
      </div>

      {/* Main alerts panel */}
      <div className="grid grid-cols-2 gap-6">
        <AlertsPanel />
        
        {/* Alert details */}
        <div className="bg-background-elevated border border-border-subtle p-6">
          <p className="text-system-label mb-4">ALERT DETAILS</p>
          <div className="text-center py-12">
            <p className="text-foreground-muted text-sm">Select an alert to view details</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AlertStatCardProps {
  label: string;
  count: number;
  color: "destructive" | "warning" | "primary";
}

const AlertStatCard = ({ label, count, color }: AlertStatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background-elevated border border-border-subtle p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-system-label">{label.toUpperCase()}</p>
        <div className={`w-2 h-2 rounded-full bg-${color}`} />
      </div>
      <p className={`text-2xl font-light mt-2 text-${color}`}>{count}</p>
    </motion.div>
  );
};

export default DashboardAlerts;