import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  variant?: "default" | "success" | "warning" | "emergency" | "info";
}

const variantStyles = {
  default: "bg-card border-border",
  success: "bg-success/5 border-success/20",
  warning: "bg-warning/5 border-warning/20",
  emergency: "bg-emergency/5 border-emergency/20 animate-pulse-emergency",
  info: "bg-info/5 border-info/20",
};

const iconStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  emergency: "bg-emergency/15 text-emergency",
  info: "bg-info/15 text-info",
};

export function StatCard({ icon, label, value, variant = "default" }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-4 ${variantStyles[variant]}`}>
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${iconStyles[variant]}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
