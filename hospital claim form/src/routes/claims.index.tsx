import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader, StatusBadge } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { claimApi, type ClaimListItem } from "@/lib/api";
import { FilePlus2, Search } from "lucide-react";

export const Route = createFileRoute("/claims/")({
  head: () => ({ meta: [{ title: "All Claims — MediClaim" }] }),
  component: () => <AppShell><ClaimsList /></AppShell>,
});

function ClaimsList() {
  const [rows, setRows] = useState<ClaimListItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    claimApi.list().then(setRows).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter((r) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return (
      r.claim_number.toLowerCase().includes(s) ||
      r.policy?.policy_number?.toLowerCase().includes(s) ||
      r.policy?.customer_name?.toLowerCase().includes(s)
    );
  });

  return (
    <>
      <PageHeader
        title="All claims"
        subtitle="Track every claim you've filed."
        actions={<Button asChild><Link to="/claims/new"><FilePlus2 className="h-4 w-4 mr-2" />New claim</Link></Button>}
      />
      <Card className="p-6 shadow-[var(--shadow-card)]">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by claim no, policy no, or patient" className="pl-9" />
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No claims yet.</p>
            <Button asChild className="mt-4"><Link to="/claims/new">File your first claim</Link></Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                  <th className="py-3 pr-4 font-medium">Claim #</th>
                  <th className="py-3 pr-4 font-medium">Policy</th>
                  <th className="py-3 pr-4 font-medium">Patient</th>
                  <th className="py-3 pr-4 font-medium">Amount</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 hover:bg-muted/40">
                    <td className="py-3 pr-4 font-mono text-xs">{r.claim_number}</td>
                    <td className="py-3 pr-4">{r.policy?.policy_number ?? "—"}</td>
                    <td className="py-3 pr-4">{r.policy?.customer_name ?? "—"}</td>
                    <td className="py-3 pr-4">₹{Number(r.estimated_amount ?? 0).toLocaleString("en-IN")}</td>
                    <td className="py-3 pr-4"><StatusBadge status={r.claim_status} /></td>
                    <td className="py-3 pr-4 text-muted-foreground text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="py-3 pr-4 text-right">
                      <Link to="/claims/$claimId" params={{ claimId: r.id }} className="text-primary text-xs font-medium hover:underline">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
