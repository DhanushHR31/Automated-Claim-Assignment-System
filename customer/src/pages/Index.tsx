import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SummaryCards } from "@/components/SummaryCards";
import { PoliciesTable } from "@/components/PoliciesTable";
import { QuickActions } from "@/components/QuickActions";
import { RecommendedPlans } from "@/components/RecommendedPlans";
import { ClaimTracker } from "@/components/ClaimTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useInsurancePolicies } from "@/hooks/useFastAPIData";
import { CreditCard, Calendar, IndianRupee } from "lucide-react";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

const Index = () => {
  const { user } = useAuth();
  const displayName = (user as any)?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const [payments, setPayments] = useState<{ name: string; premium: number; payment_method: string; created_at: string }[]>([]);
  const { data: policiesData } = useInsurancePolicies();
  
  useEffect(() => {
    if (policiesData) {
      const formatted = policiesData
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map((p: any) => ({
          name: p.name,
          premium: p.premium,
          payment_method: p.payment_method,
          created_at: p.created_at,
        }));
      setPayments(formatted);
    }
  }, [policiesData]);

  const totalPaid = payments.reduce((sum, p) => sum + (p.premium || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Welcome back, {displayName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's an overview of your insurance portfolio
          </p>
        </div>

        <SummaryCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <QuickActions />
          </div>
          <div>
            <ClaimTracker />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PoliciesTable />
          </div>
          <Card className="shadow-card border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" /> Payment History
                </CardTitle>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                  Total: {formatCurrency(totalPaid)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No payments yet</p>
              ) : (
                payments.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(p.premium)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{p.payment_method || "manual"}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <RecommendedPlans />
      </div>
    </DashboardLayout>
  );
};

export default Index;
