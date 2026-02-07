import AnalyticsCharts from "./AnalyticsCharts";

const DashboardAnalytics = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-light text-foreground">Analytics</h2>
          <p className="text-sm text-foreground-muted">Detection patterns and threat analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 bg-background-surface border border-border-subtle text-sm text-foreground">
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Custom Range</option>
          </select>
          <button className="px-4 py-2 bg-background-surface border border-border-subtle text-sm text-foreground-muted hover:text-foreground transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Charts */}
      <AnalyticsCharts />
    </div>
  );
};

export default DashboardAnalytics;