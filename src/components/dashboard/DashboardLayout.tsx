import { ReactNode } from "react";
import RadarLogo from "../landing/RadarLogo";
import { 
  LayoutDashboard, 
  Video, 
  AlertTriangle, 
  BarChart3, 
  History, 
  Settings,
  Bell
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "video", label: "Video Intelligence", icon: Video },
  { id: "alerts", label: "Alerts", icon: AlertTriangle },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "history", label: "History", icon: History },
  { id: "settings", label: "Configuration", icon: Settings },
];

const DashboardLayout = ({ children, activeSection, onSectionChange }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-background-elevated border-r border-border-subtle flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <RadarLogo />
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-foreground">SENTINEL</p>
              <p className="text-[10px] text-foreground-subtle">v2.4.1</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                    activeSection === item.id
                      ? "bg-background-surface text-primary"
                      : "text-foreground-muted hover:text-foreground hover:bg-background-surface/50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* System status */}
        <div className="p-4 border-t border-border-subtle">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-xs text-foreground-muted">All systems operational</span>
          </div>
          <div className="text-[10px] text-foreground-subtle">
            <p>Last sync: 2 min ago</p>
            <p>Uptime: 99.97%</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-14 bg-background-elevated border-b border-border-subtle flex items-center justify-between px-6">
          <div>
            <p className="text-sm text-foreground-muted">
              {navItems.find(i => i.id === activeSection)?.label || "Dashboard"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-background-surface transition-colors">
              <Bell className="w-4 h-4 text-foreground-muted" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>
            
            {/* User */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-foreground">Operator-01</p>
                <p className="text-[10px] text-foreground-subtle">Level 4 Access</p>
              </div>
              <div className="w-8 h-8 bg-background-surface border border-border-subtle flex items-center justify-center">
                <span className="text-xs text-foreground-muted">OP</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;