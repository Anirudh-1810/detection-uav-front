import { motion } from "framer-motion";

interface ThreatScoreCardProps {
  score: number;
}

const ThreatScoreCard = ({ score }: ThreatScoreCardProps) => {
  const getScoreColor = () => {
    if (score >= 70) return "destructive";
    if (score >= 40) return "warning";
    return "primary";
  };

  const getScoreLabel = () => {
    if (score >= 70) return "ELEVATED";
    if (score >= 40) return "MODERATE";
    return "LOW";
  };

  const color = getScoreColor();

  return (
    <div className="bg-background-elevated border border-border-subtle p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-system-label">THREAT INDEX</p>
        <span className={`text-xs px-2 py-1 bg-${color}/10 text-${color}`}>
          {getScoreLabel()}
        </span>
      </div>

      {/* Score display */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--border-subtle))"
              strokeWidth="2"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={`hsl(var(--${color}))`}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${score * 2.83} 283`}
              initial={{ strokeDasharray: "0 283" }}
              animate={{ strokeDasharray: `${score * 2.83} 283` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          
          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={`text-3xl font-light text-${color}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {score}
            </motion.span>
            <span className="text-xs text-foreground-subtle">/100</span>
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="space-y-3">
        <ScoreRow label="Object Density" value={72} />
        <ScoreRow label="Proximity Risk" value={45} />
        <ScoreRow label="Behavioral Anomaly" value={28} />
      </div>
    </div>
  );
};

interface ScoreRowProps {
  label: string;
  value: number;
}

const ScoreRow = ({ label, value }: ScoreRowProps) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-foreground-muted">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-16 h-1 bg-background-surface overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs text-foreground-subtle w-8 text-right">{value}</span>
      </div>
    </div>
  );
};

export default ThreatScoreCard;