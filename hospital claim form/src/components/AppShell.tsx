import type { ReactNode } from "react";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/login" });
    }
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AppSidebar />
      <main className="flex-1 min-w-0">
        <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    initiated: { bg: "bg-muted", text: "text-muted-foreground", label: "Initiated" },
    pending_approval: { bg: "bg-warning/15", text: "text-warning-foreground", label: "Pending Approval" },
    approved: { bg: "bg-success/15", text: "text-success", label: "Approved" },
    rejected: { bg: "bg-destructive/15", text: "text-destructive", label: "Rejected" },
    under_verification: { bg: "bg-info/15", text: "text-info", label: "Under Verification" },
    paid: { bg: "bg-success/20", text: "text-success", label: "Paid" },
    pending: { bg: "bg-warning/15", text: "text-warning-foreground", label: "Pending" },
    completed: { bg: "bg-success/15", text: "text-success", label: "Completed" },
    open: { bg: "bg-info/15", text: "text-info", label: "Open" },
    in_progress: { bg: "bg-warning/15", text: "text-warning-foreground", label: "In Progress" },
    closed: { bg: "bg-muted", text: "text-muted-foreground", label: "Closed" },
    active: { bg: "bg-success/15", text: "text-success", label: "Active" },
    expired: { bg: "bg-destructive/15", text: "text-destructive", label: "Expired" },
    individual: { bg: "bg-info/15", text: "text-info", label: "Individual" },
    corporate: { bg: "bg-primary/15", text: "text-primary", label: "Corporate" },
  };
  const v = map[status] ?? { bg: "bg-muted", text: "text-muted-foreground", label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${v.bg} ${v.text}`}>
      {v.label}
    </span>
  );
}
