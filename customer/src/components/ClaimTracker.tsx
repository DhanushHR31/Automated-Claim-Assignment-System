import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useClaims, useInsurancePolicies } from "@/hooks/useFastAPIData";

const statusStyles: Record<string, string> = {
  Submitted: "bg-info/10 text-info border-info/20",
  Processing: "bg-warning/10 text-warning border-warning/20",
  Approved: "bg-success/10 text-success border-success/20",
  Rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

export function ClaimTracker() {
  const [claims, setClaims] = useState<any[]>([]);
  const { data: claimsData } = useClaims();
  const { data: policiesData } = useInsurancePolicies();

  useEffect(() => {
    if (claimsData && policiesData) {
      const formatted = claimsData
        .sort((a: any, b: any) => new Date(b.created_at || b.submitted_at).getTime() - new Date(a.created_at || a.submitted_at).getTime())
        .slice(0, 3)
        .map((c: any) => {
          const policy = policiesData.find((p: any) => p.id === c.policy_id);
          return {
            ...c,
            policy_name: policy?.name || "Unknown Policy",
          };
        });
      setClaims(formatted);
    }
  }, [claimsData, policiesData]);

  return (
    <Card className="shadow-card border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Recent Claims</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {claims.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No claims yet</p>
        ) : (
          claims.map((claim) => (
            <div key={claim.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-sm font-medium text-foreground truncate">{claim.policy_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(claim.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(Number(claim.amount))}</p>
                  <Badge variant="outline" className={`text-xs mt-1 ${statusStyles[claim.status]}`}>
                    {claim.status}
                  </Badge>
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5 mt-3">
                <div
                  className="h-1.5 rounded-full gradient-primary transition-all duration-500"
                  style={{ width: `${claim.progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-muted-foreground">Submitted</span>
                <span className="text-[10px] text-muted-foreground">Processing</span>
                <span className="text-[10px] text-muted-foreground">Approved</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
