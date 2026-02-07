import HistoryTable from "./HistoryTable";

const DashboardHistory = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-light text-foreground">Analysis History</h2>
          <p className="text-sm text-foreground-muted">Past detection jobs and results</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="text"
            placeholder="Search by Job ID..."
            className="px-4 py-2 bg-background-surface border border-border-subtle text-sm text-foreground placeholder:text-foreground-subtle w-64"
          />
          <select className="px-4 py-2 bg-background-surface border border-border-subtle text-sm text-foreground">
            <option>All Status</option>
            <option>Completed</option>
            <option>Processing</option>
            <option>Flagged</option>
          </select>
        </div>
      </div>

      {/* History table */}
      <HistoryTable />
    </div>
  );
};

export default DashboardHistory;