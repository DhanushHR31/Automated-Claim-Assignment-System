import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader, StatusBadge } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { paymentApi, type PaymentRow } from "@/lib/api";

export const Route = createFileRoute("/payments")({
  head: () => ({ meta: [{ title: "Payments — MediClaim" }] }),
  component: () => <AppShell><PaymentsPage /></AppShell>,
});

function PaymentsPage() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  useEffect(() => { paymentApi.list().then(setRows).catch(console.error); }, []);

  const total = rows.filter((r) => r.payment_status === "completed").reduce((s, r) => s + Number(r.amount_paid), 0);

  return (
    <>
      <PageHeader title="Payments" subtitle="Money received from insurers against your claims." />
      <Card className="p-6 mb-6 shadow-[var(--shadow-card)]" style={{ background: "var(--gradient-primary)" }}>
        <p className="text-sm text-primary-foreground/80">Total received</p>
        <p className="text-3xl font-bold text-primary-foreground mt-1">₹{total.toLocaleString("en-IN")}</p>
      </Card>
      <Card className="p-6 shadow-[var(--shadow-card)]">
        {rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No payments yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                <th className="py-3 pr-4 font-medium">Claim #</th>
                <th className="py-3 pr-4 font-medium">Patient</th>
                <th className="py-3 pr-4 font-medium">Insurer</th>
                <th className="py-3 pr-4 font-medium">Amount</th>
                <th className="py-3 pr-4 font-medium">Txn ID</th>
                <th className="py-3 pr-4 font-medium">Date</th>
                <th className="py-3 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="py-3 pr-4 font-mono text-xs">{r.claim?.claim_number}</td>
                  <td className="py-3 pr-4">{r.claim?.patient_name ?? "—"}</td>
                  <td className="py-3 pr-4">{r.claim?.company_name ?? "—"}</td>
                  <td className="py-3 pr-4 font-medium">₹{Number(r.amount_paid).toLocaleString("en-IN")}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{r.transaction_id}</td>
                  <td className="py-3 pr-4 text-xs text-muted-foreground">{r.payment_date}</td>
                  <td className="py-3 pr-4"><StatusBadge status={r.payment_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
