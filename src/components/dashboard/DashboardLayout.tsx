import { useState } from "react";
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sidebarItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  // "Live Feed" removed
  { id: "analytics", label: "Analytics & Reports", icon: BarChart3 },
  { id: "settings", label: "System", icon: Settings },
];

const DashboardLayout = ({ children, activeSection, onSectionChange }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-border-subtle bg-sidebar-background flex flex-col z-20"
          >
            <div className="p-6 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 flex items-center justify-center rounded-sm border border-primary/50">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h1 className="text-sm font-bold tracking-wider text-foreground">SENTINEL</h1>
                  <p className="text-[10px] text-foreground-subtle tracking-widest">AERIAL DEFENSE</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group ${
                    activeSection === item.id
                      ? "bg-primary/10 border border-primary/20 text-primary"
                      : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${
                    activeSection === item.id ? "text-primary" : "text-foreground-subtle group-hover:text-foreground"
                  }`} />
                  <span className="text-sm font-medium tracking-wide">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-border-subtle">
              <div className="bg-background-subtle rounded-md p-4 border border-border-subtle">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs font-medium text-foreground-muted">System Operational</span>
                </div>
                <p className="text-[10px] text-foreground-subtle font-mono">
                  v2.4.0-stable
                </p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden relative">
        {/* Top Bar */}
        <header className="h-16 border-b border-border-subtle bg-background/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-foreground-muted hover:text-foreground"
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background-elevated rounded-full border border-border-subtle">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs font-medium text-foreground-muted">
                US-EAST-4 // SECTOR 07
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 scrollbar-hide">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;