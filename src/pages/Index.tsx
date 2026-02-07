import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroSection from "@/components/landing/HeroSection";
import VideoIntelligenceSection from "@/components/landing/VideoIntelligenceSection";
import CTASection from "@/components/landing/CTASection";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import DashboardVideo from "@/components/dashboard/DashboardVideo";
import DashboardAlerts from "@/components/dashboard/DashboardAlerts";
import DashboardAnalytics from "@/components/dashboard/DashboardAnalytics";
import DashboardHistory from "@/components/dashboard/DashboardHistory";
import DashboardSettings from "@/components/dashboard/DashboardSettings";

const Index = () => {
  const [view, setView] = useState<"landing" | "dashboard">("landing");
  const [activeSection, setActiveSection] = useState("overview");

  const handleStart = () => {
    setView("dashboard");
  };

  const renderDashboardContent = () => {
    switch (activeSection) {
      case "video":
        return <DashboardVideo />;
      case "alerts":
        return <DashboardAlerts />;
      case "analytics":
        return <DashboardAnalytics />;
      case "history":
        return <DashboardHistory />;
      case "settings":
        return <DashboardSettings />;
      default:
        return <DashboardOverview />;
    }
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
            {renderDashboardContent()}
          </DashboardLayout>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Index;