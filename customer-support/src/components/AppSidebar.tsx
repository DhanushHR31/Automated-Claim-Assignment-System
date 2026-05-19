import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Users, GitBranch, Shield, LogOut, ChevronLeft, ChevronRight, Settings, UserCircle, Building2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/claims", icon: FileText, label: "Claims" },
  { to: "/agents", icon: Users, label: "Agents" },
  { to: "/managers", icon: Shield, label: "Managers" },
  { to: "/assignments", icon: GitBranch, label: "Assignments" },
  { to: "/customers", icon: UserCircle, label: "Customers" },
  { to: "/hospitals", icon: Building2, label: "Hospitals" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { displayName, role, signOut } = useAuth();

  return (
    <aside className={cn("gradient-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300 shrink-0", collapsed ? "w-16" : "w-60")}>
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground font-bold text-sm">CA</span>
        </div>
        {!collapsed && <span className="text-sidebar-foreground font-semibold text-sm truncate">Claim & Agent Support</span>}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive ? "bg-sidebar-accent text-sidebar-primary-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {!collapsed && displayName && (
        <div className="px-3 py-2 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground font-medium truncate">{displayName}</p>
          <p className="text-xs text-sidebar-foreground/60 capitalize">{role || "user"}</p>
        </div>
      )}

      <div className="flex border-t border-sidebar-border">
        <button onClick={signOut} className="flex items-center justify-center gap-2 flex-1 h-10 text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors text-xs">
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        <button onClick={() => setCollapsed(!collapsed)} className="flex items-center justify-center h-10 w-10 text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors border-l border-sidebar-border">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
