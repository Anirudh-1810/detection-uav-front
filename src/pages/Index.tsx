import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroSection from "@/components/landing/HeroSection";
import VideoIntelligenceSection from "@/components/landing/VideoIntelligenceSection";
import CTASection from "@/components/landing/CTASection";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Detector } from "@/components/Detector";

const Index = () => {
  const [view, setView] = useState<"landing" | "dashboard">("landing");
  const [activeSection, setActiveSection] = useState("detector");

  const handleStart = () => {
    setView("dashboard");
  };

  return (
    <AnimatePresence mode="wait">
      {view === "landing" ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-background"
        >
          <HeroSection />
          <VideoIntelligenceSection />
          <CTASection onStart={handleStart} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <DashboardLayout
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          >
            {/* Always render Detector as other sections are deprecated */}
            <Detector />
          </DashboardLayout>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Index;