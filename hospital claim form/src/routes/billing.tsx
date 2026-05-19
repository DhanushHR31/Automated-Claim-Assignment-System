import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader, StatusBadge } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { billingApi, type BillingRow } from "@/lib/api";

export const Route = createFileRoute("/billing")({
  head: () => ({ meta: [{ title: "Billing — MediClaim" }] }),
  component: () => <AppShell><BillingPage /></AppShell>,
});

function BillingPage() {
  const [rows, setRows] = useState<BillingRow[]>([]);
  useEffect(() => { billingApi.list().then(setRows).catch(console.error); }, []);

  return (
    <>
      <PageHeader title="Billing" subtitle="All bills you've submitted to insurers." />
      <Card className="p-6 shadow-[var(--shadow-card)]">
        {rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No bills submitted yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                <th className="py-3 pr-4 font-medium">Claim #</th>
                <th className="py-3 pr-4 font-medium">Patient</th>
                <th className="py-3 pr-4 font-medium">Total</th>
                <th className="py-3 pr-4 font-medium">Pharmacy</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="py-3 pr-4 font-mono text-xs">{r.claim?.claim_number}</td>
                  <td className="py-3 pr-4">{r.claim?.patient_name ?? "—"}</td>
                  <td className="py-3 pr-4">₹{Number(r.total_bill).toLocaleString("en-IN")}</td>
                  <td className="py-3 pr-4">₹{Number(r.pharmacy_bill ?? 0).toLocaleString("en-IN")}</td>
                  <td className="py-3 pr-4">{r.claim && <StatusBadge status={r.claim.claim_status} />}</td>
                  <td className="py-3 pr-4 text-xs text-muted-foreground">{new Date(r.submitted_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
