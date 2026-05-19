import { StatCard } from "@/components/StatCard";
import { ClaimCard } from "@/components/ClaimCard";
import { NotificationItem } from "@/components/NotificationItem";
import { notifications, earnings } from "@/data/mockData";
import { useClaims } from "@/hooks/useClaims";
import { useAuth } from '@/hooks/useAuth';
import {
  FileText, Clock, CheckCircle2, AlertTriangle, CloudRain,
  MapPin, TrendingUp, ChevronRight, Headphones
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { profile } = useAuth();
  const { claims, loading } = useClaims();
  const pendingClaims = claims.filter((c) => c.status !== "completed");
  const completedClaims = claims.filter((c) => c.status === "completed");
  const emergencyClaims = claims.filter((c) => c.priority === "Emergency");
  const assignedClaims = claims.filter((c) => c.status === "assigned");
  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div className="animate-slide-up">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-primary p-6 mb-6 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/70 text-sm">ನಮಸ್ಕಾರ (Namaskara)</p>
            <h1 className="text-2xl font-bold mt-1">{profile?.full_name || "Agent"}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className={`h-2 w-2 rounded-full ${profile?.is_online ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
              <span className="text-sm text-primary-foreground/80">
                {profile?.is_online ? "Online" : "Offline"} • {profile?.district || "Karnataka"}
              </span>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-3xl font-extrabold">₹{earnings.today.toLocaleString()}</p>
            <p className="text-sm text-primary-foreground/70">Today's Earnings</p>
          </div>
        </div>

        <div className="mt-4 bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
          <CloudRain className="h-8 w-8 text-primary-foreground shrink-0" />
          <div>
            <p className="text-xs font-semibold">⚠️ Weather Alert - Karnataka</p>
            <p className="text-[11px] text-primary-foreground/80">Heavy rain expected in Bengaluru Urban & Mysuru districts. Drive carefully on ORR.</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={<FileText className="h-5 w-5" />} label="Total Claims" value={claims.length} />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="New Assigned" value={assignedClaims.length} variant="info" />
        <StatCard icon={<Clock className="h-5 w-5" />} label="In Progress" value={pendingClaims.length - assignedClaims.length} variant="warning" />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Completed" value={completedClaims.length} variant="success" />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Emergency" value={emergencyClaims.length} variant="emergency" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Claims */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Active Claims</h2>
            <Link to="/claims" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : pendingClaims.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No active claims. New claims will appear here when assigned.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingClaims.slice(0, 4).map((claim) => (
                <ClaimCard key={claim.id} claim={claim} />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Earnings Overview</h3>
              <Link to="/earnings" className="text-xs text-primary font-medium hover:underline">Details</Link>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Today</span>
                <span className="text-sm font-semibold text-success">₹{earnings.today.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">This Month</span>
                <span className="text-sm font-semibold">₹{earnings.thisMonth.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="text-sm font-semibold text-warning">₹{earnings.pending.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Recent Notifications</h3>
              <span className="text-xs text-muted-foreground">{unreadNotifications.length} unread</span>
            </div>
            <div className="space-y-1">
              {notifications.slice(0, 4).map((n) => (
                <NotificationItem key={n.id} notification={n} />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/map" className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 text-primary hover:bg-primary/10 transition-colors text-sm font-medium">
                <MapPin className="h-4 w-4" /> Live Map
              </Link>
              <Link to="/messages" className="flex items-center gap-2 p-3 rounded-lg bg-info/5 text-info hover:bg-info/10 transition-colors text-sm font-medium">
                <TrendingUp className="h-4 w-4" /> Manager
              </Link>
              <Link to="/support" className="flex items-center gap-2 p-3 rounded-lg bg-warning/5 text-warning hover:bg-warning/10 transition-colors text-sm font-medium">
                <Headphones className="h-4 w-4" /> Support
              </Link>
              <Link to="/settings" className="flex items-center gap-2 p-3 rounded-lg bg-success/5 text-success hover:bg-success/10 transition-colors text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" /> Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
