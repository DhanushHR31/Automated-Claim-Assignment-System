import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import { BottomNav } from "./BottomNav";
import {
  LayoutDashboard, FileText, MapPin, MessageSquare, User, Bell, Settings,
  LogOut, ChevronLeft, ChevronRight, Shield, IndianRupee, Headphones,
  Menu, X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";

const navSections = [
  {
    title: "Main",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/claims", label: "Claims", icon: FileText },
      { path: "/map", label: "Live Map", icon: MapPin },
      { path: "/earnings", label: "Earnings", icon: IndianRupee },
    ],
  },
  {
    title: "Communication",
    items: [
      { path: "/messages", label: "Manager Chat", icon: MessageSquare },
      { path: "/support", label: "Support Team", icon: Headphones },
    ],
  },
  {
    title: "Account",
    items: [
      { path: "/profile", label: "My Profile", icon: User },
      { path: "/settings", label: "Settings", icon: Settings },
      { path: "/notifications", label: "Notifications", icon: Bell },
    ],
  },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const { profile, logout, updateProfile } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = profile?.full_name || "Agent";
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold text-sm">InsureAgent KA</span>
            </div>
          </div>
          <Link to="/notifications" className="relative p-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emergency" />
          </Link>
        </header>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100]">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border p-4 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <span className="font-bold">InsureAgent KA</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-primary/5 border border-border mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground">{profile?.district || "Karnataka"}</p>
                  </div>
                </div>
              </div>

              <nav className="space-y-4">
                {navSections.map((section) => (
                  <div key={section.title}>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">{section.title}</p>
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                          <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                          >
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="absolute bottom-4 left-4 right-4">
                <button onClick={() => logout()} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 w-full transition-colors">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="pt-14 pb-20 min-h-screen">{children}</main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={`fixed left-0 top-0 bottom-0 z-40 bg-card border-r border-border flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Shield className="h-7 w-7 text-primary" />
              <span className="font-extrabold text-lg">InsureAgent</span>
            </div>
          )}
          {collapsed && <Shield className="h-7 w-7 text-primary mx-auto" />}
          <button onClick={() => setCollapsed(!collapsed)} className={`p-1 rounded hover:bg-muted text-muted-foreground ${collapsed ? "mx-auto mt-2" : ""}`}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {!collapsed && (
          <div className="p-3 mx-3 mt-3 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{displayName}</p>
                <p className="text-[10px] text-muted-foreground">{profile?.district || "Karnataka"}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${profile?.is_online ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
                <span className="text-xs">{profile?.is_online ? "Online" : "Offline"}</span>
              </div>
              <Switch
                checked={profile?.is_online || false}
                onCheckedChange={(v) => updateProfile({ is_online: v })}
                className="scale-75"
              />
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navSections.map((section) => (
            <div key={section.title} className="mb-4">
              {!collapsed && <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-3 mb-1.5">{section.title}</p>}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path} title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"} ${collapsed ? "justify-center" : ""}`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                      {!collapsed && item.path === "/notifications" && (
                        <Badge className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-emergency text-emergency-foreground">3</Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <button onClick={() => logout()} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 w-full transition-colors ${collapsed ? "justify-center" : ""}`}>
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${collapsed ? "ml-16" : "ml-64"}`}>
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border px-6 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold capitalize">
            {location.pathname === "/" ? "Dashboard" : location.pathname.slice(1).split("/")[0].replace(/-/g, " ")}
          </h1>
          <div className="flex items-center gap-4">
            <Link to="/notifications" className="relative p-2 hover:bg-muted rounded-lg transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emergency" />
            </Link>
            <Link to="/profile" className="flex items-center gap-2 hover:bg-muted px-3 py-1.5 rounded-lg transition-colors">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                {initials}
              </div>
              <span className="text-sm font-medium">{displayName}</span>
            </Link>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
