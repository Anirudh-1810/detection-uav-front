import { motion } from "framer-motion";

const RadarLogo = () => {
  return (
    <div className="relative w-20 h-20">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border border-border-subtle" />
      
      {/* Middle ring */}
      <div className="absolute inset-2 rounded-full border border-border-subtle opacity-60" />
      
      {/* Inner ring */}
      <div className="absolute inset-4 rounded-full border border-border-subtle opacity-40" />
      
      {/* Center dot */}
      <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
      
      {/* Radar sweep */}
      <motion.div
        className="absolute inset-0 origin-center"
        animate={{ rotate: 360 }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div 
          className="absolute top-1/2 left-1/2 w-1/2 h-[1px] origin-left"
          style={{
            background: "linear-gradient(90deg, hsl(var(--primary)), transparent)",
          }}
        />
        {/* Sweep trail */}
        <div 
          className="absolute top-1/2 left-1/2 w-1/2 origin-left"
          style={{
            height: "1px",
            background: "linear-gradient(90deg, hsl(var(--primary) / 0.5), transparent)",
            transform: "rotate(-15deg)",
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 w-1/2 origin-left"
          style={{
            height: "1px",
            background: "linear-gradient(90deg, hsl(var(--primary) / 0.3), transparent)",
            transform: "rotate(-30deg)",
          }}
        />
      </motion.div>
      
      {/* Pulse effect */}
      <motion.div
        className="absolute inset-0 rounded-full border border-primary/20"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default RadarLogo;