import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Heart, Shield, Car, Home, History, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/data/insurancePlans";
import { useInsurancePolicies } from "@/hooks/useFastAPIData";

interface PlanResult {
  name: string;
  provider: string;
  monthly: number;
  yearly: number;
  coverage: number;
  icon: typeof Heart;
}

const PremiumCalculator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [age, setAge] = useState("");
  const [income, setIncome] = useState("");
  const [coverage, setCoverage] = useState("");
  const [insuranceType, setInsuranceType] = useState("");
  const [results, setResults] = useState<PlanResult[] | null>(null);

  const { data: policiesList } = useInsurancePolicies();
  const policies = policiesList || [];

  const calculatePremium = () => {
    const ageNum = parseInt(age);
    const incomeNum = parseInt(income);
    const coverageNum = parseInt(coverage);
    if (!ageNum || !incomeNum || !coverageNum || !insuranceType) return;

    let baseFactor = 0;
    let icon: typeof Heart = Heart;
    switch (insuranceType) {
      case "Health": baseFactor = 0.015; icon = Heart; break;
      case "Life": baseFactor = 0.008; icon = Shield; break;
      case "Vehicle": baseFactor = 0.025; icon = Car; break;
      case "Home": baseFactor = 0.005; icon = Home; break;
    }

    const ageFactor = ageNum > 45 ? 1.5 : ageNum > 35 ? 1.2 : 1.0;
    const incomeFactor = incomeNum > 1500000 ? 0.9 : incomeNum > 800000 ? 1.0 : 1.1;
    const base = coverageNum * baseFactor * ageFactor * incomeFactor;

    setResults([
      { name: `${insuranceType} Basic`, provider: "Star Insurance", monthly: Math.round(base / 12), yearly: Math.round(base), coverage: coverageNum, icon },
      { name: `${insuranceType} Gold`, provider: "HDFC Ergo", monthly: Math.round((base * 1.3) / 12), yearly: Math.round(base * 1.3), coverage: Math.round(coverageNum * 1.5), icon },
      { name: `${insuranceType} Platinum`, provider: "ICICI Lombard", monthly: Math.round((base * 1.6) / 12), yearly: Math.round(base * 1.6), coverage: coverageNum * 2, icon },
    ]);
  };

  const statusStyles: Record<string, string> = {
    Active: "bg-success/10 text-success border-success/20",
    Expired: "bg-destructive/10 text-destructive border-destructive/20",
    Pending: "bg-warning/10 text-warning border-warning/20",
    Cancelled: "bg-muted text-muted-foreground border-border",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Premium Calculator</h1>
          <p className="text-sm text-muted-foreground mt-1">Get instant price estimates for insurance plans</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="shadow-card border-0 lg:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Enter Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" placeholder="e.g. 30" value={age} onChange={(e) => setAge(e.target.value)} min={18} max={80} />
              </div>
              <div className="space-y-2">
                <Label>Annual Income (₹)</Label>
                <Input type="number" placeholder="e.g. 1000000" value={income} onChange={(e) => setIncome(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Coverage Amount (₹)</Label>
                <Input type="number" placeholder="e.g. 500000" value={coverage} onChange={(e) => setCoverage(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Insurance Type</Label>
                <Select value={insuranceType} onValueChange={setInsuranceType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Health">Health Insurance</SelectItem>
                    <SelectItem value="Life">Term Life Insurance</SelectItem>
                    <SelectItem value="Vehicle">Vehicle Insurance</SelectItem>
                    <SelectItem value="Home">Home Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={calculatePremium} className="w-full gradient-primary text-primary-foreground" disabled={!age || !income || !coverage || !insuranceType}>
                Calculate Premium
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-4">
            {results ? (
              results.map((plan) => (
                <Card key={plan.name} className="shadow-card border-0 hover:shadow-card-hover transition-all">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <plan.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{plan.name}</h3>
                          <p className="text-xs text-muted-foreground">{plan.provider}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 flex-wrap">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Monthly</p>
                          <p className="text-lg font-bold text-primary">{formatCurrency(plan.monthly)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Yearly</p>
                          <p className="text-sm font-semibold text-foreground">{formatCurrency(plan.yearly)}</p>
                        </div>
                        <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => navigate(`/buy-insurance`)}>
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="shadow-card border-0">
                <CardContent className="p-12 text-center">
                  <Calculator className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Enter your details and click "Calculate Premium" to see plan estimates</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Purchase History */}
        {policies.length > 0 && (
          <Card className="shadow-card border-0">
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Purchase History</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {policies.map((p: any) => {
                  const start = new Date(p.created_at);
                  const expiry = new Date(p.expiry_date);
                  const totalMonths = Math.max(1, Math.round((expiry.getTime() - start.getTime()) / (30.44 * 24 * 60 * 60 * 1000)));
                  const monthsPaid = Math.min(totalMonths, Math.max(1, Math.round((Date.now() - start.getTime()) / (30.44 * 24 * 60 * 60 * 1000))));
                  const totalPaid = monthsPaid * p.premium;

                  return (
                    <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm text-foreground">{p.name}</p>
                          <Badge className={(statusStyles[p.status] || "bg-muted") + " text-[10px]"}>{p.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{p.provider} • {p.type} • {p.policy_number}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Paid</p>
                          <p className="font-semibold text-foreground">{formatCurrency(totalPaid)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Months</p>
                          <p className="font-semibold text-foreground">{monthsPaid}/{totalMonths}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Premium</p>
                          <p className="font-semibold text-primary">{formatCurrency(p.premium)}/mo</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/policy/${p.id}`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PremiumCalculator;
