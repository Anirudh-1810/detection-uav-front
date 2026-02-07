import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const timelineData = [
  { time: "00:00", detections: 12, threats: 2 },
  { time: "04:00", detections: 8, threats: 1 },
  { time: "08:00", detections: 24, threats: 5 },
  { time: "12:00", detections: 45, threats: 8 },
  { time: "16:00", detections: 38, threats: 6 },
  { time: "20:00", detections: 28, threats: 4 },
  { time: "24:00", detections: 15, threats: 2 },
];

const threatDistribution = [
  { name: "Low", value: 45, color: "hsl(199, 89%, 48%)" },
  { name: "Medium", value: 32, color: "hsl(38, 92%, 50%)" },
  { name: "High", value: 18, color: "hsl(0, 72%, 51%)" },
  { name: "Critical", value: 5, color: "hsl(0, 84%, 40%)" },
];

const behaviorData = [
  { pattern: "Transit", count: 156 },
  { pattern: "Loitering", count: 42 },
  { pattern: "Surveillance", count: 28 },
  { pattern: "Approach", count: 18 },
  { pattern: "Evasive", count: 8 },
];

const AnalyticsCharts = () => {
  return (
    <div className="space-y-6">
      {/* Timeline chart */}
      <div className="bg-background-elevated border border-border-subtle p-5">
        <p className="text-system-label mb-4">DETECTION TIMELINE</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid 
                stroke="hsl(220, 8%, 15%)" 
                strokeDasharray="3 3" 
                vertical={false}
              />
              <XAxis 
                dataKey="time" 
                stroke="hsl(220, 8%, 40%)"
                tick={{ fill: "hsl(220, 8%, 50%)", fontSize: 11 }}
                axisLine={{ stroke: "hsl(220, 8%, 15%)" }}
              />
              <YAxis 
                stroke="hsl(220, 8%, 40%)"
                tick={{ fill: "hsl(220, 8%, 50%)", fontSize: 11 }}
                axisLine={{ stroke: "hsl(220, 8%, 15%)" }}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(220, 8%, 7%)",
                  border: "1px solid hsl(220, 8%, 15%)",
                  borderRadius: "4px",
                }}
                labelStyle={{ color: "hsl(220, 10%, 92%)" }}
              />
              <Line 
                type="monotone" 
                dataKey="detections" 
                stroke="hsl(199, 89%, 48%)" 
                strokeWidth={1.5}
                dot={{ fill: "hsl(199, 89%, 48%)", r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="threats" 
                stroke="hsl(0, 72%, 51%)" 
                strokeWidth={1.5}
                dot={{ fill: "hsl(0, 72%, 51%)", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-[2px] bg-primary" />
            <span className="text-xs text-foreground-muted">Total Detections</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-[2px] bg-destructive" />
            <span className="text-xs text-foreground-muted">Threat Events</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Threat distribution */}
        <div className="bg-background-elevated border border-border-subtle p-5">
          <p className="text-system-label mb-4">THREAT DISTRIBUTION</p>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={threatDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  dataKey="value"
                  stroke="none"
                >
                  {threatDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(220, 8%, 7%)",
                    border: "1px solid hsl(220, 8%, 15%)",
                    borderRadius: "4px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {threatDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ background: item.color }}
                />
                <span className="text-xs text-foreground-muted">
                  {item.name}: {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Behavior patterns */}
        <div className="bg-background-elevated border border-border-subtle p-5">
          <p className="text-system-label mb-4">BEHAVIOR PATTERNS</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={behaviorData} layout="vertical">
                <CartesianGrid 
                  stroke="hsl(220, 8%, 15%)" 
                  strokeDasharray="3 3" 
                  horizontal={false}
                />
                <XAxis 
                  type="number"
                  stroke="hsl(220, 8%, 40%)"
                  tick={{ fill: "hsl(220, 8%, 50%)", fontSize: 11 }}
                  axisLine={{ stroke: "hsl(220, 8%, 15%)" }}
                />
                <YAxis 
                  type="category"
                  dataKey="pattern"
                  stroke="hsl(220, 8%, 40%)"
                  tick={{ fill: "hsl(220, 8%, 50%)", fontSize: 11 }}
                  axisLine={{ stroke: "hsl(220, 8%, 15%)" }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(220, 8%, 7%)",
                    border: "1px solid hsl(220, 8%, 15%)",
                    borderRadius: "4px",
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(199, 89%, 48%)"
                  radius={[0, 2, 2, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;