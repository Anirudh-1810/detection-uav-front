import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  onStart: () => void;
}

const CTASection = ({ onStart }: CTASectionProps) => {
  return (
    <section className="h-screen flex flex-col items-center justify-center bg-background relative">
      {/* Subtle grid */}
      <div className="absolute inset-0 grid-overlay opacity-20" />
      
      <motion.div
        className="text-center relative z-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-system-label mb-4">OPERATIONAL ACCESS</p>
        <h2 className="text-3xl md:text-4xl font-light text-foreground mb-8">
          Enter the Operational Dashboard
        </h2>
        
        <Button
          onClick={onStart}
          className="px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors border-0 text-sm tracking-wide uppercase font-medium"
        >
          Let's Start
        </Button>
      </motion.div>

      {/* Bottom decoration */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
          <div className="w-16 h-[1px] bg-border-subtle" />
          <p className="text-foreground-subtle text-xs uppercase tracking-widest">
            Authorized Personnel Only
          </p>
          <div className="w-16 h-[1px] bg-border-subtle" />
        </div>
      </div>
    </section>
  );
};

export default CTASection;