import { FileText, Users, GitBranch, DollarSign, AlertTriangle, CheckCircle, Map } from "lucide-react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import ClaimMap from "@/components/ClaimMap";
import { useClaims, useAgents, useAssignments, useAuditLogs } from "@/hooks/useFastAPIData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";

export default function Dashboard() {
  const { data: claims = [] } = useClaims();
  const { data: agents = [] } = useAgents();
  const { data: assignments = [] } = useAssignments();
  const { data: auditLogs = [] } = useAuditLogs();

  const pendingClaims = claims.filter((c) => c.status === "pending").length;
  const activeClaims = claims.filter((c) => c.status === "assigned" || c.status === "in_progress").length;
  const availableAgents = agents.filter((a) => a.availability === "available").length;
  const totalCost = assignments.reduce((sum, a) => sum + Number(a.total_cost), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time overview of claim assignments</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending Claims" value={pendingClaims} icon={AlertTriangle} variant="warning" trend={{ value: 12, positive: false }} />
        <StatCard title="Active Claims" value={activeClaims} icon={FileText} variant="primary" />
        <StatCard title="Available Agents" value={`${availableAgents}/${agents.length}`} icon={Users} variant="accent" />
        <StatCard title="Travel Cost (This Week)" value={`₹${totalCost.toLocaleString()}`} icon={DollarSign} trend={{ value: 8, positive: true }} />
      </div>

      <div className="bg-card rounded-xl border shadow-card p-5 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-card-foreground">Live Agent & Claim Map</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="inline-flex items-center gap-1 mr-3"><span className="h-2 w-2 rounded-full bg-success inline-block" /> Agents</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive inline-block" /> Claims</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2">
                  <Maximize2 className="h-3.5 w-3.5" />
                  Live Tracking
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 overflow-hidden">
                <DialogHeader className="p-4 border-b">
                  <DialogTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-primary" />
                    Live Agent & Claim Tracking (Full View)
                  </DialogTitle>
                </DialogHeader>
                <div className="flex-1 relative h-full">
                  <ClaimMap agents={agents} claims={claims} className="absolute inset-0 h-full w-full" />
                </div>
              </DialogContent>
            </Dialog>
            <Map className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <ClaimMap agents={agents} claims={claims} className="h-[400px] rounded-lg overflow-hidden" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-card-foreground">Recent Claims</h2>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {claims.slice(0, 5).map((claim) => (
              <div key={claim.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium font-mono text-card-foreground">{claim.claim_code}</span>
                    <StatusBadge status={claim.urgency} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{claim.description}</p>
                </div>
                <StatusBadge status={claim.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-card-foreground">Audit Trail</h2>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex gap-3 py-2 border-b last:border-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  {log.action === "claim_completed" ? <CheckCircle className="h-4 w-4 text-success" /> : <GitBranch className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-card-foreground">{log.details}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{log.performed_by}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-card p-5">
        <h2 className="font-semibold text-card-foreground mb-4">Agent Performance Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-muted-foreground font-medium">Agent</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Location</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Status</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Active Claims</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Performance</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Travel</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-3">
                    <div>
                      <p className="font-medium text-card-foreground">{agent.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{agent.agent_code}</p>
                    </div>
                  </td>
                  <td className="py-3 text-muted-foreground">{agent.home_city}, {agent.home_state}</td>
                  <td className="py-3"><StatusBadge status={agent.availability} /></td>
                  <td className="py-3 text-card-foreground">{agent.active_claims}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full gradient-primary" style={{ width: `${agent.performance_score}%` }} />
                      </div>
                      <span className="text-xs font-medium text-card-foreground">{agent.performance_score}%</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={agent.travel_allowed ? "text-success text-xs font-medium" : "text-destructive text-xs font-medium"}>
                      {agent.travel_allowed ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
