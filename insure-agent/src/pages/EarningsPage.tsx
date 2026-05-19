import { earnings } from "@/data/mockData";
import { IndianRupee, TrendingUp, FileText, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EarningsPage() {
  return (
    <div className="animate-slide-up max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Earnings & Payments</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground mb-1">Total This Month</p>
          <div className="flex items-baseline gap-1">
            <IndianRupee className="h-5 w-5 text-success" />
            <span className="text-3xl font-bold text-success">{earnings.thisMonth.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-success">
            <TrendingUp className="h-3 w-3" /> +12% from last month
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="text-xs text-muted-foreground mb-1">Claims Done</p>
          <p className="text-3xl font-bold">{earnings.completedClaims}</p>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" /> of {earnings.totalClaims} total
          </div>
        </div>
        <div className="rounded-xl border border-warning/20 bg-warning/5 p-5 text-center">
          <p className="text-xs text-muted-foreground mb-1">Pending</p>
          <p className="text-3xl font-bold text-warning">₹{earnings.pending.toLocaleString()}</p>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> Processing
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-4">Payment History</h2>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 font-semibold text-muted-foreground">Transaction ID</th>
              <th className="text-left p-4 font-semibold text-muted-foreground">Claim ID</th>
              <th className="text-left p-4 font-semibold text-muted-foreground">Date</th>
              <th className="text-right p-4 font-semibold text-muted-foreground">Amount</th>
              <th className="text-right p-4 font-semibold text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {earnings.paymentHistory.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium">{p.id}</td>
                <td className="p-4 text-primary font-medium">{p.claimId}</td>
                <td className="p-4 text-muted-foreground">{p.date}</td>
                <td className="p-4 text-right font-semibold">₹{p.amount.toLocaleString()}</td>
                <td className="p-4 text-right">
                  <Badge variant="outline" className={`text-[10px] ${
                    p.status === "Credited" ? "text-success border-success/30" : "text-warning border-warning/30"
                  }`}>{p.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
