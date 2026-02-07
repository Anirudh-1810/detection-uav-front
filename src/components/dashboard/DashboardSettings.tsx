import ConfigurationPanel from "./ConfigurationPanel";

const DashboardSettings = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-light text-foreground">Configuration</h2>
        <p className="text-sm text-foreground-muted">System settings and preferences</p>
      </div>

      {/* Configuration panel */}
      <ConfigurationPanel />
    </div>
  );
};

export default DashboardSettings;