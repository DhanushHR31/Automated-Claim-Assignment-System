import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
  gradient?: string;
}

const StatCard = ({ title, value, icon, trend, gradient = "gradient-primary" }: StatCardProps) => (
  <div className="rounded-xl bg-card p-6 shadow-sm border border-border/50 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-card-foreground">{value}</p>
        {trend && (
          <p className={cn("text-xs font-medium", trend.positive ? "text-success" : "text-destructive")}>
            {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}% from last month
          </p>
        )}
      </div>
      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-primary-foreground", gradient)}>
        {icon}
      </div>
    </div>
  </div>
);

export default StatCard;
