import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Check, ArrowLeft, CreditCard, Smartphone, Building, Clock, Gift, Star, Search } from "lucide-react";
import { plans, iconMap, formatCurrency, type InsurancePlan } from "@/data/insurancePlans";
import { useCreateInsurancePolicy } from "@/hooks/useFastAPIData";

const paymentMethods = [
  { id: "upi", label: "UPI", icon: Smartphone, desc: "Google Pay, PhonePe, Paytm" },
  { id: "card", label: "Credit/Debit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
  { id: "netbanking", label: "Net Banking", icon: Building, desc: "All major banks" },
];

const InsuranceDetails = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "Health";
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const createPolicy = useCreateInsurancePolicy();

  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [step, setStep] = useState<"plans" | "duration" | "terms" | "payment">("plans");
  const [agreed, setAgreed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [autoPayment, setAutoPayment] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "coverage" | "rating">("price");

  const categoryPlans = plans[category] || plans.Health;
  const Icon = iconMap[category] || iconMap.Health;

  const filteredPlans = categoryPlans
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.provider.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => sortBy === "price" ? a.premiumMonthly - b.premiumMonthly : sortBy === "coverage" ? b.coverage - a.coverage : b.rating - a.rating);

  const plan = selectedPlan !== null ? categoryPlans[selectedPlan] : null;
  const duration = plan && selectedDuration !== null ? plan.durations[selectedDuration] : null;

  const calcTotal = () => {
    if (!plan || !duration) return { monthly: 0, total: 0, saved: 0 };
    const discounted = plan.premiumMonthly * (1 - duration.discount / 100);
    const total = discounted * duration.months;
    const original = plan.premiumMonthly * duration.months;
    return { monthly: Math.round(discounted), total: Math.round(total), saved: Math.round(original - total) };
  };

  const pricing = calcTotal();

  const handlePurchase = async () => {
    if (!user || !plan || !duration) return;

    const policyNumber = `POL-${category.toUpperCase().slice(0, 3)}-${Date.now().toString(36).toUpperCase()}`;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + duration.months);

    try {
      await createPolicy.mutateAsync({
        name: plan.name,
        type: category,
        premium: pricing.monthly,
        coverage: plan.coverage,
        expiry_date: expiryDate.toISOString().split("T")[0],
        policy_number: policyNumber,
        provider: plan.provider,
        status: "Active",
        payment_method: paymentMethod,
        auto_payment: autoPayment,
      });

      toast({ title: "Policy Purchased!", description: `${plan.name} (${duration.label}) is now active. Policy: ${policyNumber}` });
      navigate("/policies");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const stepsArr = ["plans", "duration", "terms", "payment"];
  const stepLabels = ["Select Plan", "Duration", "Terms", "Payment"];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => {
            const idx = stepsArr.indexOf(step);
            if (idx === 0) navigate("/buy-insurance");
            else { setStep(stepsArr[idx - 1] as any); }
          }}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{category} Insurance</h1>
            <p className="text-sm text-muted-foreground">{stepLabels[stepsArr.indexOf(step)]} — {filteredPlans.length} plans available</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {stepsArr.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === s ? "gradient-primary text-primary-foreground" : i < stepsArr.indexOf(step) ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>
                {i < stepsArr.indexOf(step) ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:inline ${step === s ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{stepLabels[i]}</span>
              {i < stepsArr.length - 1 && <div className="w-6 sm:w-12 h-0.5 bg-border" />}
            </div>
          ))}
        </div>

        {/* Plans Step */}
        {step === "plans" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search plans or providers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <div className="flex gap-2">
                {(["price", "coverage", "rating"] as const).map((s) => (
                  <Button key={s} size="sm" variant={sortBy === s ? "default" : "outline"} onClick={() => setSortBy(s)} className={sortBy === s ? "gradient-primary text-primary-foreground" : ""}>
                    {s === "price" ? "Price" : s === "coverage" ? "Coverage" : "Rating"}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {filteredPlans.map((p) => {
                const origIdx = categoryPlans.indexOf(p);
                return (
                  <Card key={p.name} className={`shadow-card border-2 cursor-pointer transition-all ${selectedPlan === origIdx ? "border-primary" : "border-transparent hover:border-primary/30"}`} onClick={() => setSelectedPlan(origIdx)}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-foreground text-sm">{p.name}</h3>
                              <div className="flex items-center gap-1 text-xs text-amber-500">
                                <Star className="w-3 h-3 fill-amber-500" /> {p.rating}
                              </div>
                              <Badge variant="outline" className="text-[10px]">{p.claimSettlement}% claim settled</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{p.provider}</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {p.features.slice(0, 4).map((f) => (
                                <span key={f} className="text-[11px] bg-muted px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <Check className="w-2.5 h-2.5 text-success" /> {f}
                                </span>
                              ))}
                              {p.features.length > 4 && <span className="text-[11px] text-primary">+{p.features.length - 4} more</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xl font-bold text-primary">{formatCurrency(p.premiumMonthly)}</p>
                          <p className="text-xs text-muted-foreground">/month</p>
                          <p className="text-xs text-muted-foreground mt-1">Cover: {formatCurrency(p.coverage)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Button className="w-full gradient-primary text-primary-foreground" disabled={selectedPlan === null} onClick={() => { setSelectedDuration(null); setStep("duration"); }}>
              Continue with Selected Plan
            </Button>
          </div>
        )}

        {/* Duration Step */}
        {step === "duration" && plan && (
          <div className="space-y-4">
            <Card className="shadow-card border-0">
              <CardHeader className="pb-2"><CardTitle className="text-base">Selected: {plan.name} — {plan.provider}</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">Coverage: {formatCurrency(plan.coverage)} • Base: {formatCurrency(plan.premiumMonthly)}/mo</CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {plan.durations.map((d, idx) => {
                const discounted = Math.round(plan.premiumMonthly * (1 - d.discount / 100));
                const total = discounted * d.months;
                return (
                  <Card key={d.label} className={`shadow-card border-2 cursor-pointer transition-all ${selectedDuration === idx ? "border-primary" : "border-transparent hover:border-primary/30"}`} onClick={() => setSelectedDuration(idx)}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                          <Clock className="w-4 h-4 text-primary" /> {d.label}
                        </h3>
                        {d.offer && <Badge className="bg-success/10 text-success border-success/20 text-[10px]"><Gift className="w-3 h-3 mr-1" />{d.offer}</Badge>}
                        {d.discount > 0 && <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">{d.discount}% OFF</Badge>}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-primary">{formatCurrency(discounted)}<span className="text-xs text-muted-foreground font-normal">/mo</span></p>
                        {d.discount > 0 && <p className="text-xs text-muted-foreground line-through">{formatCurrency(plan.premiumMonthly)}/mo</p>}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{d.months} payments</span>
                        <span>Total: {formatCurrency(total)}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <Button className="w-full gradient-primary text-primary-foreground" disabled={selectedDuration === null} onClick={() => setStep("terms")}>
              Continue — {selectedDuration !== null ? plan.durations[selectedDuration].label : ""}
            </Button>
          </div>
        )}

        {/* Terms Step */}
        {step === "terms" && plan && duration && (
          <div className="space-y-4">
            <Card className="shadow-card border-0">
              <CardHeader><CardTitle className="text-base">Plan Summary</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  ["Plan", plan.name],
                  ["Provider", plan.provider],
                  ["Duration", `${duration.label} (${duration.months} months)`],
                  ["Monthly Premium", formatCurrency(pricing.monthly)],
                  ["Total Payable", formatCurrency(pricing.total)],
                  ["Coverage", formatCurrency(plan.coverage)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>
                ))}
                {pricing.saved > 0 && <div className="flex justify-between text-success"><span>You Save</span><span className="font-medium">{formatCurrency(pricing.saved)}</span></div>}
              </CardContent>
            </Card>
            <Card className="shadow-card border-0">
              <CardHeader><CardTitle className="text-base">Terms & Conditions</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground max-h-48 overflow-y-auto">
                {[
                  `The policy is valid for ${duration.label} from purchase and must be renewed before expiry.`,
                  "Pre-existing conditions may be subject to a waiting period as defined by the insurer.",
                  "Claims must be filed within 30 days of the incident with all required documentation.",
                  "Premium payments must be made on time to maintain active coverage status.",
                  "The policyholder agrees to provide accurate information during purchase and claim filing.",
                  "The insurer reserves the right to deny claims if fraudulent activity is found.",
                  "Cancellation within 15 days qualifies for a full refund (free-look period).",
                  "All disputes shall be subject to the jurisdiction of Indian courts.",
                ].map((t, i) => <p key={i}>{i + 1}. {t}</p>)}
              </CardContent>
            </Card>
            <div className="flex items-center gap-2">
              <Checkbox id="terms" checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />
              <Label htmlFor="terms" className="text-sm">I agree to the Terms & Conditions and Privacy Policy</Label>
            </div>
            <Button className="w-full gradient-primary text-primary-foreground" disabled={!agreed} onClick={() => setStep("payment")}>Proceed to Payment</Button>
          </div>
        )}

        {/* Payment Step */}
        {step === "payment" && plan && duration && (
          <div className="space-y-4">
            <Card className="shadow-card border-0">
              <CardHeader><CardTitle className="text-base">Select Payment Method</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {paymentMethods.map((pm) => (
                  <label key={pm.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === pm.id ? "border-primary bg-primary/5" : "border-input hover:border-primary/30"}`}>
                    <input type="radio" name="payment" className="hidden" checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} />
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <pm.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{pm.label}</p>
                      <p className="text-xs text-muted-foreground">{pm.desc}</p>
                    </div>
                    {paymentMethod === pm.id && <Check className="w-5 h-5 text-primary ml-auto" />}
                  </label>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-card border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Enable Auto-Payment</p>
                    <p className="text-xs text-muted-foreground">Automatically pay premium each month</p>
                  </div>
                  <Checkbox checked={autoPayment} onCheckedChange={(v) => setAutoPayment(v === true)} />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card border-0">
              <CardContent className="p-4 space-y-2">
                {[
                  ["Monthly Premium", formatCurrency(pricing.monthly)],
                  ["Duration", `${duration.label} (${duration.months} months)`],
                  ["Subtotal", formatCurrency(pricing.total)],
                  ["GST (18%)", formatCurrency(Math.round(pricing.total * 0.18))],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>
                ))}
                {pricing.saved > 0 && <div className="flex justify-between text-sm text-success"><span>Discount</span><span className="font-medium">-{formatCurrency(pricing.saved)}</span></div>}
                <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span className="text-primary">{formatCurrency(Math.round(pricing.total * 1.18))}</span></div>
              </CardContent>
            </Card>

            <Button className="w-full gradient-primary text-primary-foreground" disabled={!paymentMethod || createPolicy.isPending} onClick={handlePurchase}>
              {createPolicy.isPending ? "Processing..." : `Pay ${formatCurrency(Math.round(pricing.total * 1.18))}`}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InsuranceDetails;
