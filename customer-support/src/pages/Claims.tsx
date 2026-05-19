import { useState } from "react";
import { Plus, Search, MapPin, Zap, UserCheck, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/StatusBadge";
import { useClaims, useAgents, useCreateClaim, useCreateAssignment, useCreateAuditLog, useUpdateClaim, getBestAgents, calculateDistance } from "@/hooks/useFastAPIData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { calculateTravelCost, getTravelCostSettings } from "@/lib/travelCost";

export default function Claims() {
  const { data: claims = [], isLoading } = useClaims();
  const { data: agents = [] } = useAgents();
  const createClaim = useCreateClaim();
  const createAssignment = useCreateAssignment();
  const updateClaim = useUpdateClaim();
  const createAuditLog = useCreateAuditLog();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);

  const filtered = claims.filter((c) => {
    const matchesSearch = c.claim_code.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const selectedClaim = claims.find((c) => c.id === selectedClaimId);
  const rankedAgents = selectedClaim ? getBestAgents(selectedClaim, agents) : [];

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const newClaim = await createClaim.mutateAsync({
        claim_code: "",
        address: fd.get("address") as string,
        city: fd.get("city") as string,
        state: fd.get("state") as string,
        latitude: Number(fd.get("latitude")) || 12.9 + Math.random() * 0.2,
        longitude: Number(fd.get("longitude")) || 77.5 + Math.random() * 0.2,
        claim_type: fd.get("claimType") as "accident",
        urgency: fd.get("urgency") as "medium",
        description: fd.get("description") as string,
        estimated_value: Number(fd.get("estimatedValue")),
        created_by: user?.id,
      });
      await createAuditLog.mutateAsync({
        action: "claim_created",
        claim_id: newClaim.id,
        performed_by: user?.email || "System",
        details: `New claim submitted: ${newClaim.claim_code}`,
      });
      setOpen(false);
      toast.success("Claim created successfully", { description: `${newClaim.claim_code} has been submitted` });
    } catch (err: any) {
      toast.error("Failed to create claim", { description: err.message });
    }
  };

  const handleAssign = async (agentId: string) => {
    if (!selectedClaim) return;
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;
    const distance = calculateDistance(agent.latitude, agent.longitude, selectedClaim.latitude, selectedClaim.longitude);
    const settings = getTravelCostSettings();
    const costs = calculateTravelCost(distance, settings);
    try {
      await createAssignment.mutateAsync({
        claim_id: selectedClaim.id,
        agent_id: agentId,
        assignment_code: "",
        distance: costs.distance,
        travel_cost: costs.travelCost,
        hotel_cost: costs.hotelCost,
        total_cost: costs.totalCost,
      });
      await updateClaim.mutateAsync({ id: selectedClaim.id, status: "assigned", assigned_agent_id: agentId });
      await createAuditLog.mutateAsync({
        action: "ai_auto_assigned",
        claim_id: selectedClaim.id,
        agent_id: agentId,
        performed_by: user?.email || "System",
        details: `AI assigned ${agent.name} (${agent.agent_code}). Distance: ${distance} km, km rate: ₹${settings.costPerKm}, stay: ₹${costs.hotelCost}, total: ₹${costs.totalCost}`,
      });
      setAssignOpen(false);
      setSelectedClaimId(null);
      toast.success("Agent assigned successfully", { description: `${agent.name} assigned to ${selectedClaim.claim_code}` });
    } catch (err: any) {
      toast.error("Failed to assign agent", { description: err.message });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading claims...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Claims</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and track insurance claims</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> New Claim</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create New Claim</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label htmlFor="address">Address</Label><Input id="address" name="address" required /></div>
                  <div><Label htmlFor="city">City</Label><Input id="city" name="city" required /></div>
                  <div><Label htmlFor="state">State</Label><Input id="state" name="state" required /></div>
                  <div><Label htmlFor="latitude">Latitude</Label><Input id="latitude" name="latitude" type="number" step="any" placeholder="12.97" /></div>
                  <div><Label htmlFor="longitude">Longitude</Label><Input id="longitude" name="longitude" type="number" step="any" placeholder="77.59" /></div>
                  <div>
                    <Label>Claim Type</Label>
                    <Select name="claimType" defaultValue="accident">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accident">Accident</SelectItem>
                        <SelectItem value="property">Property</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="natural_disaster">Natural Disaster</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Urgency</Label>
                    <Select name="urgency" defaultValue="medium">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label htmlFor="estimatedValue">Est. Value (₹)</Label><Input id="estimatedValue" name="estimatedValue" type="number" required /></div>
                </div>
                <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" required /></div>
                <Button type="submit" className="w-full" disabled={createClaim.isPending}>
                  {createClaim.isPending ? "Submitting..." : "Submit Claim"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search claims..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* AI Agent Assignment Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              AI Agent Recommendation — {selectedClaim?.claim_code}
            </DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-3 text-sm">
                <p className="font-medium text-card-foreground">{selectedClaim.description}</p>
                <p className="text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {selectedClaim.city}, {selectedClaim.state} · {selectedClaim.claim_type.replace(/_/g, " ")} · ₹{Number(selectedClaim.estimated_value).toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">AI ranked agents by distance, performance, availability, workload & travel preference:</p>
              <div className="space-y-2">
                {rankedAgents.map((agent, i) => (
                  <div key={agent.id} className={`border rounded-lg p-3 flex items-center justify-between ${i === 0 ? "border-primary bg-primary/5" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        #{i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-card-foreground">{agent.name} <span className="font-mono text-xs text-muted-foreground">({agent.agent_code})</span></p>
                        <p className="text-xs text-muted-foreground">
                          {agent.home_city} · {agent.distance} km · Score: {agent.score} · ₹{(agent.travelCost + agent.hotelCost).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={agent.availability} />
                      {agent.availability === "available" && (
                        <Button size="sm" onClick={() => handleAssign(agent.id)} disabled={createAssignment.isPending}>
                          <UserCheck className="h-3 w-3 mr-1" /> Assign
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {rankedAgents.length === 0 && <p className="text-center text-muted-foreground py-4">No agents available</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {filtered.map((claim) => {
          const assignedAgent = claim.assigned_agent_id ? agents.find((a) => a.id === claim.assigned_agent_id) : null;
          return (
            <div key={claim.id} className="bg-card border rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow animate-fade-in">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono font-semibold text-card-foreground">{claim.claim_code}</span>
                    <StatusBadge status={claim.urgency} />
                    <StatusBadge status={claim.status} />
                  </div>
                  <p className="text-sm text-card-foreground font-medium">{claim.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{claim.city}, {claim.state}</span>
                    <span>{claim.claim_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                    <span>₹{Number(claim.estimated_value).toLocaleString()}</span>
                    <span>{new Date(claim.created_at).toLocaleDateString()}</span>
                  </div>
                  {assignedAgent && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <UserCheck className="h-3 w-3 text-primary" />
                      <span className="text-primary font-medium">Assigned to {assignedAgent.name} ({assignedAgent.agent_code})</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  {claim.status === "pending" && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        setSelectedClaimId(claim.id);
                        setAssignOpen(true);
                      }}
                    >
                      <Zap className="h-3.5 w-3.5 mr-1" /> AI Assign
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No claims found</p>}
      </div>
    </div>
  );
}
