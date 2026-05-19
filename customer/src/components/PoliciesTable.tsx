import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, RefreshCw, Download, Heart, Car, Shield, Home, Plane, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInsurancePolicies } from "@/hooks/useFastAPIData";

const iconMap: Record<string, typeof Heart> = {
  Health: Heart,
  Life: Shield,
  Vehicle: Car,
  Home: Home,
  Travel: Plane,
  Business: Briefcase,
};

const statusStyles: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  Expired: "bg-destructive/10 text-destructive border-destructive/20",
  Pending: "bg-warning/10 text-warning border-warning/20",
  Cancelled: "bg-muted text-muted-foreground border-border",
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

export function PoliciesTable() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<any[]>([]);
  const { data, isLoading: loading } = useInsurancePolicies();

  useEffect(() => {
    if (data) {
      setPolicies(data as any[]);
    }
  }, [data]);

  return (
    <Card className="shadow-card border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold">My Policies</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading policies...</p>
        ) : policies.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No policies yet. Buy your first insurance policy!</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <div className="min-w-[600px] px-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Policy</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Type</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Premium</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Expiry</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map((policy) => {
                    const Icon = iconMap[policy.type] || Shield;
                    return (
                      <tr key={policy.id} className="border-b last:border-0 hover:bg-secondary/50 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{policy.name}</p>
                              <p className="text-xs text-muted-foreground">{policy.policy_number}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 hidden sm:table-cell">
                          <span className="text-sm text-muted-foreground">{policy.type}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm font-medium text-foreground">{formatCurrency(Number(policy.premium))}/yr</span>
                        </td>
                        <td className="py-3 px-2 hidden md:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {new Date(policy.expiry_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className={statusStyles[policy.status] || ""}>
                            {policy.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary" onClick={() => navigate(`/policy/${policy.id}`)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary hidden sm:flex">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
