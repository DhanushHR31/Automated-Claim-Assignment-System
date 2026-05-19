import { Heart, Shield, Car, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Health Insurance",
    provider: "Star Health",
    price: "₹599/month",
    coverage: "₹10 Lakh",
    icon: Heart,
    tag: "Best Seller",
    features: ["Cashless hospitals", "No waiting period", "Free health checkup"],
  },
  {
    name: "Term Life Plan",
    provider: "HDFC Life",
    price: "₹490/month",
    coverage: "₹1 Crore",
    icon: Shield,
    tag: "Recommended",
    features: ["99.1% claim settlement", "Tax benefits", "Flexible tenure"],
  },
  {
    name: "Car Insurance",
    provider: "ICICI Lombard",
    price: "₹4,999/year",
    coverage: "Comprehensive",
    icon: Car,
    tag: "Popular",
    features: ["Roadside assistance", "Zero depreciation", "Quick claims"],
  },
];

export function RecommendedPlans() {
  return (
    <Card className="shadow-card border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Recommended For You</CardTitle>
        </div>
        <Badge variant="secondary" className="text-xs font-medium">AI Powered</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-xl border border-border p-5 hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <plan.icon className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                  {plan.tag}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground">{plan.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{plan.provider}</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-xl font-bold text-foreground">{plan.price}</span>
              </div>
              <p className="text-xs text-muted-foreground">Coverage: {plan.coverage}</p>
              <ul className="mt-3 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full mt-4 gradient-primary text-primary-foreground hover:opacity-90"
                size="sm"
              >
                View Plan
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
