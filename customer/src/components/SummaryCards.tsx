import { useEffect, useState } from "react";
import { FileText, CheckCircle, AlertCircle, IndianRupee } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useInsurancePolicies, useClaims } from "@/hooks/useFastAPIData";

interface SummaryData {
  title: string;
  value: string;
  change: string;
  icon: typeof FileText;
  variant: "primary" | "success" | "warning" | "info";
}

const variantStyles = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

export function SummaryCards() {
  const [data, setData] = useState<SummaryData[]>([]);
  const { data: policies } = useInsurancePolicies();
  const { data: claims } = useClaims();

  useEffect(() => {
    const total = policies?.length || 0;
    const active = policies?.filter((p: any) => p.status === "Active").length || 0;
    const expired = policies?.filter((p: any) => p.status === "Expired").length || 0;
    const totalCoverage = policies?.reduce((sum: number, p: any) => sum + Number(p.coverage || 0), 0) || 0;
    const pendingClaims = claims?.filter((c: any) => c.status !== "Approved" && c.status !== "Rejected").length || 0;

    const formatCoverage = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(totalCoverage);

    setData([
      { title: "Total Policies", value: String(total), change: total > 0 ? `${active} active` : "No policies yet", icon: FileText, variant: "primary" },
      { title: "Active Policies", value: String(active), change: active > 0 ? "All up to date" : "None active", icon: CheckCircle, variant: "success" },
      { title: "Expired Policies", value: String(expired), change: expired > 0 ? "Needs renewal" : "All good!", icon: AlertCircle, variant: "warning" },
      { title: "Total Coverage", value: formatCoverage, change: pendingClaims > 0 ? `${pendingClaims} pending claims` : "No pending claims", icon: IndianRupee, variant: "info" },
    ]);
  }, [policies, claims]);

  if (data.length === 0) {
    // Show skeleton/placeholder
    const placeholders: SummaryData[] = [
      { title: "Total Policies", value: "0", change: "Add your first policy", icon: FileText, variant: "primary" },
      { title: "Active Policies", value: "0", change: "None yet", icon: CheckCircle, variant: "success" },
      { title: "Expired Policies", value: "0", change: "All good!", icon: AlertCircle, variant: "warning" },
      { title: "Total Coverage", value: "₹0", change: "No coverage", icon: IndianRupee, variant: "info" },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {placeholders.map((item, i) => (
          <Card key={item.title} className="shadow-card border-0 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{item.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.change}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${variantStyles[item.variant]}`}>
                  <item.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((item, i) => (
        <Card key={item.title} className="shadow-card hover:shadow-card-hover transition-all duration-300 border-0 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{item.title}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.change}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${variantStyles[item.variant]}`}>
                <item.icon className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
