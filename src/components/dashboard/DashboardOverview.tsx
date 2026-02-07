import { Target, AlertTriangle, Activity, Radar } from "lucide-react";
import StatCard from "./StatCard";
import ThreatScoreCard from "./ThreatScoreCard";
import AlertsPanel from "./AlertsPanel";
import VideoPanel from "./VideoPanel";

const DashboardOverview = () => {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="TOTAL DETECTIONS"
          value="1,247"
          change="+12% from yesterday"
          trend="up"
          icon={<Target className="w-4 h-4" />}
        />
        <StatCard
          label="ACTIVE THREATS"
          value="3"
          change="2 new in last hour"
          trend="up"
          icon={<AlertTriangle className="w-4 h-4" />}
          variant="warning"
        />
        <StatCard
          label="RISK INDEX"
          value="47"
          change="Moderate level"
          trend="neutral"
          icon={<Activity className="w-4 h-4" />}
        />
        <StatCard
          label="OBJECTS TRACKED"
          value="18"
          change="5 in restricted zone"
          trend="neutral"
          icon={<Radar className="w-4 h-4" />}
          variant="primary"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Video panel - spans 2 columns */}
        <div className="col-span-2">
          <VideoPanel />
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <ThreatScoreCard score={47} />
          <AlertsPanel />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;