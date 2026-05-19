import { cn } from "@/lib/utils";

const statusStyles = {
  active: "bg-success/10 text-success",
  busy: "bg-warning/10 text-warning",
  offline: "bg-muted text-muted-foreground",
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  "in-progress": "bg-info/10 text-info",
};

interface StatusBadgeProps {
  status: keyof typeof statusStyles;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => (
  <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", statusStyles[status], className)}>
    {status === "in-progress" ? "In Progress" : status}
  </span>
);

export default StatusBadge;
