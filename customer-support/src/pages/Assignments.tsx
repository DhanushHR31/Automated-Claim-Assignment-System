import { useState } from "react";
import { Zap, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import StatusBadge from "@/components/StatusBadge";
import { useClaims, useAgents, useAssignments, useCreateAssignment, useUpdateAssignment, useCreateAuditLog, getBestAgents, calculateDistance } from "@/hooks/useFastAPIData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { calculateTravelCost, getTravelCostSettings } from "@/lib/travelCost";

export default function Assignments() {
  const { data: claims = [] } = useClaims();
  const { data: agents = [] } = useAgents();
  const { data: assignments = [] } = useAssignments();
  const createAssignment = useCreateAssignment();
  const updateAssignment = useUpdateAssignment();
  const createAuditLog = useCreateAuditLog();
  const { user } = useAuth();

  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideAssignmentId, setOverrideAssignmentId] = useState<string | null>(null);

  const pendingClaims = claims.filter((c) => c.status === "pending");
  const selectedClaim = claims.find((c) => c.id === selectedClaimId);
  const rankedAgents = selectedClaim ? getBestAgents(selectedClaim, agents) : [];

  const handleAutoAssign = async (agentId: string) => {
    if (!selectedClaim) return;
    const agent = rankedAgents.find((a) => a.id === agentId);
    if (!agent) return;
    try {
      await createAssignment.mutateAsync({
        assignment_code: "",
        claim_id: selectedClaim.id,
        agent_id: agent.id,
        distance: agent.distance,
        travel_cost: agent.travelCost,
        hotel_cost: agent.hotelCost,
        total_cost: agent.travelCost + agent.hotelCost,
      });
      await createAuditLog.mutateAsync({
        action: "auto_assigned",
        claim_id: selectedClaim.id,
        agent_id: agent.id,
        performed_by: user?.email || "Assignment Engine",
        details: `Auto-assigned ${selectedClaim.claim_code} to ${agent.name} (Score: ${agent.score})`,
      });
      setAssignOpen(false);
      toast.success("Claim assigned", { description: `${selectedClaim.claim_code} → ${agent.name} (Score: ${agent.score})` });
    } catch (err: any) {
      toast.error("Failed to assign", { description: err.message });
    }
  };

  const handleOverride = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!overrideAssignmentId) return;
    const fd = new FormData(e.currentTarget);
    const newAgentId = fd.get("newAgent") as string;
    const reason = fd.get("reason") as string;
    try {
      const assignment = assignments.find(a => a.id === overrideAssignmentId);
      const claim = assignment ? claims.find((c) => c.id === assignment.claim_id) : null;
      const newAgent = agents.find((a) => a.id === newAgentId);
      const costUpdates: any = {};
      if (claim && newAgent) {
        const distance = calculateDistance(newAgent.latitude, newAgent.longitude, claim.latitude, claim.longitude);
        const costs = calculateTravelCost(distance, getTravelCostSettings());
        costUpdates.distance = costs.distance;
        costUpdates.travel_cost = costs.travelCost;
        costUpdates.hotel_cost = costs.hotelCost;
        costUpdates.total_cost = costs.totalCost;
      }
      await updateAssignment.mutateAsync({
        id: overrideAssignmentId,
        agent_id: newAgentId,
        overridden: true,
        override_reason: reason,
        overridden_by: user?.email || "Manager",
        ...costUpdates,
      });
      if (assignment) {
        await createAuditLog.mutateAsync({
          action: "manual_override",
          claim_id: assignment.claim_id,
          agent_id: newAgentId,
          performed_by: user?.email || "Manager",
          details: `Override: ${reason}`,
        });
      }
      setOverrideOpen(false);
      toast.info("Assignment overridden", { description: reason });
    } catch (err: any) {
      toast.error("Failed to override", { description: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-muted-foreground text-sm mt-1">Automated and manual claim-to-agent assignments</p>
        </div>
        <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
          <DialogTrigger asChild>
            <Button><Zap className="h-4 w-4 mr-1" /> Auto-Assign</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Auto-Assign Claim</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Pending Claim</Label>
                <Select value={selectedClaimId || ""} onValueChange={setSelectedClaimId}>
                  <SelectTrigger><SelectValue placeholder="Choose a claim" /></SelectTrigger>
                  <SelectContent>
                    {pendingClaims.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.claim_code} – {c.description.slice(0, 40)}...</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedClaim && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-semibold">{selectedClaim.claim_code}</span>
                    <StatusBadge status={selectedClaim.urgency} />
                  </div>
                  <p className="text-muted-foreground">{selectedClaim.city}, {selectedClaim.state}</p>
                </div>
              )}

              {rankedAgents.length > 0 && (
                <div>
                  <Label className="mb-2 block">Ranked Agents (by score)</Label>
                  <div className="space-y-2">
                    {rankedAgents.map((agent, i) => (
                      <div key={agent.id} className={`border rounded-lg p-3 flex items-center justify-between transition-colors ${agent.score > 0 ? "hover:border-primary/40 cursor-pointer" : "opacity-50"}`}>
                        <div className="flex items-center gap-3">
                          <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 && agent.score > 0 ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {i + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium">{agent.name}</p>
                            <p className="text-xs text-muted-foreground">{agent.home_city} · {agent.distance} km · ₹{(agent.travelCost + agent.hotelCost).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={agent.availability} />
                          <span className="text-sm font-mono font-semibold">{agent.score}</span>
                          {agent.score > 0 && (
                            <Button size="sm" variant="outline" onClick={() => handleAutoAssign(agent.id)} disabled={createAssignment.isPending}>
                              Assign <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={overrideOpen} onOpenChange={setOverrideOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manual Override</DialogTitle></DialogHeader>
          <form onSubmit={handleOverride} className="space-y-4">
            <div>
              <Label>New Agent</Label>
              <Select name="newAgent" required>
                <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
                <SelectContent>
                  {agents.filter((a) => a.availability === "available").map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name} ({a.home_city})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Override Reason</Label>
              <Textarea name="reason" required placeholder="Explain why you're overriding..." />
            </div>
            <Button type="submit" className="w-full" disabled={updateAssignment.isPending}>
              {updateAssignment.isPending ? "Updating..." : "Confirm Override"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        {assignments.map((assignment) => {
          const claim = claims.find((c) => c.id === assignment.claim_id);
          const agent = agents.find((a) => a.id === assignment.agent_id);
          return (
            <div key={assignment.id} className="bg-card border rounded-xl p-5 shadow-card animate-fade-in">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono font-semibold text-card-foreground">{assignment.assignment_code}</span>
                    <StatusBadge status={assignment.status} />
                    {assignment.overridden && (
                      <span className="inline-flex items-center gap-1 text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full">
                        <AlertCircle className="h-3 w-3" /> Overridden
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-muted-foreground">{claim?.claim_code || assignment.claim_id}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-card-foreground">{agent?.name || assignment.agent_id}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{assignment.distance} km</span>
                    <span>Travel: ₹{Number(assignment.travel_cost).toLocaleString()}</span>
                    {Number(assignment.hotel_cost) > 0 && <span>Hotel: ₹{Number(assignment.hotel_cost).toLocaleString()}</span>}
                    <span className="font-medium">Total: ₹{Number(assignment.total_cost).toLocaleString()}</span>
                    <span>{new Date(assignment.assigned_time).toLocaleString()}</span>
                  </div>
                  {assignment.override_reason && (
                    <p className="text-xs text-warning mt-1">Reason: {assignment.override_reason}</p>
                  )}
                </div>
                <Button size="sm" variant="outline" onClick={() => { setOverrideAssignmentId(assignment.id); setOverrideOpen(true); }}>
                  Override
                </Button>
              </div>
            </div>
          );
        })}
        {assignments.length === 0 && <p className="text-center text-muted-foreground py-12">No assignments yet</p>}
      </div>
    </div>
  );
}
