import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, CreditCard, IndianRupee, Shield, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/data/insurancePlans";
import { useInsurancePolicy, useUpdateInsurancePolicy } from "@/hooks/useFastAPIData";

const statusStyles: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  Expired: "bg-destructive/10 text-destructive border-destructive/20",
  Pending: "bg-warning/10 text-warning border-warning/20",
  Cancelled: "bg-muted text-muted-foreground border-border",
};

const PolicyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: policyData, isLoading: loading } = useInsurancePolicy(id || "");
  const updatePolicy = useUpdateInsurancePolicy();
  const [policy, setPolicy] = useState<any>(null);

  useEffect(() => {
    if (policyData) {
      setPolicy(policyData);
    }
  }, [policyData]);

  if (loading) return <DashboardLayout><p className="text-muted-foreground p-6">Loading...</p></DashboardLayout>;
  if (!policy) return <DashboardLayout><p className="text-muted-foreground p-6">Policy not found.</p></DashboardLayout>;

  const startDate = new Date(policy.created_at);
  const expiryDate = new Date(policy.expiry_date);
  const now = new Date();
  const totalMonths = Math.max(1, Math.round((expiryDate.getTime() - startDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000)));
  const monthsPaid = Math.min(totalMonths, Math.max(1, Math.round((now.getTime() - startDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000))));
  const monthsRemaining = Math.max(0, totalMonths - monthsPaid);
  const totalPaid = monthsPaid * policy.premium;
  const totalRemaining = monthsRemaining * policy.premium;
  const totalAmount = totalMonths * policy.premium;

  const handleCancel = async () => {
    try {
      await updatePolicy.mutateAsync({ id: policy.id, status: "Cancelled" });
      toast({ title: "Policy Cancelled", description: "Your policy has been cancelled successfully." });
      setPolicy({ ...policy, status: "Cancelled" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Generate payment history timeline
  const payments = Array.from({ length: monthsPaid }, (_, i) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    return {
      month: i + 1,
      date: date.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      amount: policy.premium,
      status: "Paid" as const,
    };
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/policies")}><ArrowLeft className="w-5 h-5" /></Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{policy.name}</h1>
            <p className="text-sm text-muted-foreground">{policy.policy_number}</p>
          </div>
          <Badge className={statusStyles[policy.status]}>{policy.status}</Badge>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: IndianRupee, label: "Premium", value: `${formatCurrency(policy.premium)}/mo` },
            { icon: Shield, label: "Coverage", value: formatCurrency(policy.coverage) },
            { icon: Clock, label: "Duration", value: `${totalMonths} months` },
            { icon: Calendar, label: "Expires", value: expiryDate.toLocaleDateString("en-IN") },
          ].map((c) => (
            <Card key={c.label} className="shadow-card border-0">
              <CardContent className="p-4 text-center">
                <c.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="text-sm font-semibold text-foreground">{c.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Policy Details */}
        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="text-base">Policy Information</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              ["Provider", policy.provider || "N/A"],
              ["Type", policy.type],
              ["Policy Number", policy.policy_number],
              ["Start Date", startDate.toLocaleDateString("en-IN")],
              ["Expiry Date", expiryDate.toLocaleDateString("en-IN")],
              ["Payment Method", (policy.payment_method || "manual").toUpperCase()],
              ["Auto Payment", policy.auto_payment ? "Enabled" : "Disabled"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="text-base">Payment Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-success/5">
                <p className="text-xs text-muted-foreground">Paid ({monthsPaid} mo)</p>
                <p className="text-lg font-bold text-success">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-primary/5">
                <p className="text-xs text-muted-foreground">Remaining ({monthsRemaining} mo)</p>
                <p className="text-lg font-bold text-primary">{formatCurrency(totalRemaining)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(totalAmount)}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round((monthsPaid / totalMonths) * 100)}% completed</span>
                <span>{monthsPaid}/{totalMonths} months</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(monthsPaid / totalMonths) * 100}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="text-base">Payment History</CardTitle></CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {payments.map((p) => (
                <div key={p.month} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span className="text-muted-foreground">Month {p.month}</span>
                  </div>
                  <span className="text-muted-foreground">{p.date}</span>
                  <span className="font-medium">{formatCurrency(p.amount)}</span>
                </div>
              ))}
              {monthsRemaining > 0 && (
                <div className="flex items-center justify-between p-2 rounded-lg text-sm opacity-50">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{monthsRemaining} upcoming payments</span>
                  </div>
                  <span className="font-medium">{formatCurrency(totalRemaining)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {policy.status === "Active" && (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/claims")}>
              File a Claim
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleCancel}>
              <XCircle className="w-4 h-4 mr-2" /> Cancel Policy
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PolicyDetail;
