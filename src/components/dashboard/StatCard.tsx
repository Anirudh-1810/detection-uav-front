import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: ReactNode;
  variant?: "default" | "primary" | "warning" | "critical";
}

const StatCard = ({ 
  label, 
  value, 
  change, 
  trend = "neutral", 
  icon,
  variant = "default" 
}: StatCardProps) => {
  const variantStyles = {
    default: "border-border-subtle",
    primary: "border-primary/30",
    warning: "border-warning/30",
    critical: "border-destructive/30",
  };

  const valueStyles = {
    default: "text-foreground",
    primary: "text-primary",
    warning: "text-warning",
    critical: "text-destructive",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-background-elevated border ${variantStyles[variant]} p-5`}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-system-label">{label}</p>
        {icon && (
          <div className="text-foreground-subtle">{icon}</div>
        )}
      </div>
      
      <p className={`text-3xl font-light ${valueStyles[variant]} mb-2`}>
        {value}
      </p>
      
      {change && (
        <p className={`text-xs ${
          trend === "up" 
            ? "text-success" 
            : trend === "down" 
              ? "text-destructive" 
              : "text-foreground-muted"
        }`}>
          {trend === "up" && "↑ "}
          {trend === "down" && "↓ "}
          {change}
        </p>
      )}
    </motion.div>
  );
};

export default StatCard;