import AnalyticsCharts from "./AnalyticsCharts";
import DashboardHistory from "./DashboardHistory";
import DashboardAlerts from "./DashboardAlerts";

const DashboardAnalytics = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-light text-foreground mb-1">Analytics & Intelligence</h2>
        <p className="text-foreground-muted text-sm">Comprehensive system reporting and historical data</p>
      </div>

      {/* Metrics Section */}
      <div className="space-y-4">
        <AnalyticsCharts />
      </div>

      {/* History and Alerts Section - Stacked Vertical */}
      <div className="flex flex-col gap-8">
        <div className="space-y-4">
          <DashboardHistory />
        </div>

        <div className="space-y-4">
          <DashboardAlerts />
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;