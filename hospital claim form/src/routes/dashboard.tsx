import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { dashboardApi, type DashboardStats } from "@/lib/api";
import { FilePlus2, Search, FileCheck2, Clock, CheckCircle2, XCircle, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MediClaim" }] }),
  component: () => <AppShell><Dashboard /></AppShell>,
});

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    dashboardApi.stats().then(setStats).catch(console.error);
  }, []);

  const statCards = [
    { label: "Total Claims", value: stats?.total ?? 0, icon: FileCheck2, tone: "text-primary bg-primary-soft" },
    { label: "Pending", value: stats?.pending ?? 0, icon: Clock, tone: "text-warning-foreground bg-warning/15" },
    { label: "Approved", value: stats?.approved ?? 0, icon: CheckCircle2, tone: "text-success bg-success/15" },
    { label: "Rejected", value: stats?.rejected ?? 0, icon: XCircle, tone: "text-destructive bg-destructive/15" },
    { label: "Paid", value: stats?.paid ?? 0, icon: Wallet, tone: "text-info bg-info/15" },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome${stats?.hospital_name ? `, ${stats.hospital_name}` : ""}`}
        subtitle="Here's a snapshot of your insurance claims activity."
        actions={
          <>
            <Button asChild variant="outline"><Link to="/claims"><Search className="h-4 w-4 mr-2" />Track claim</Link></Button>
            <Button asChild><Link to="/claims/new"><FilePlus2 className="h-4 w-4 mr-2" />New claim</Link></Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4 shadow-[var(--shadow-card)]">
              <div className={`h-9 w-9 rounded-lg grid place-items-center mb-3 ${s.tone}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-sm font-semibold mb-4">Monthly claims activity</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats?.monthly ?? []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="claims" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </>
  );
}
