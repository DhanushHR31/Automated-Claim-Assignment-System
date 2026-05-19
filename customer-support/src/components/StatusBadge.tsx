import { cn } from "@/lib/utils";

type StatusType = "available" | "on_assignment" | "on_leave" | "pending" | "assigned" | "in_progress" | "completed" | "closed" | "emergency" | "high" | "medium" | "low" | "accepted" | "in_transit" | "inspecting";

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  available: { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  on_assignment: { bg: "bg-info/10", text: "text-info", dot: "bg-info" },
  on_leave: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
  pending: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
  assigned: { bg: "bg-info/10", text: "text-info", dot: "bg-info" },
  in_progress: { bg: "bg-primary/10", text: "text-primary", dot: "bg-primary" },
  completed: { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  closed: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
  emergency: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive" },
  high: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive" },
  medium: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
  low: { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  accepted: { bg: "bg-info/10", text: "text-info", dot: "bg-info" },
  in_transit: { bg: "bg-primary/10", text: "text-primary", dot: "bg-primary" },
  inspecting: { bg: "bg-accent/10", text: "text-accent", dot: "bg-accent" },
};

export default function StatusBadge({ status, className }: { status: StatusType; className?: string }) {
  const config = statusConfig[status] || statusConfig.pending;
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", config.bg, config.text, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse-dot", config.dot)} />
      {label}
    </span>
  );
}
