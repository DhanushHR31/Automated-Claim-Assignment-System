import { useState } from "react";
import { Plus, Search, Users, Shield, Mail, Phone, UserCheck, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/StatusBadge";
import { useAgents, useUpdateAgent } from "@/hooks/useFastAPIData";
import { useManagers, useCreateManager } from "@/hooks/useManagerData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Managers() {
  const { data: managers = [], isLoading } = useManagers();
  const { data: agents = [] } = useAgents();
  const createManager = useCreateManager();
  const updateAgent = useUpdateAgent();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);

  const filtered = managers.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.department || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createManager.mutateAsync({
        user_id: user?.id || "",
        name: fd.get("name") as string,
        email: fd.get("email") as string,
        phone: fd.get("phone") as string,
        department: fd.get("department") as string || "Claims",
        max_agents: Number(fd.get("maxAgents")) || 10,
      });
      setOpen(false);
      toast.success("Manager added successfully");
    } catch (err: any) {
      toast.error("Failed to add manager", { description: err.message });
    }
  };

  const handleAssignAgent = async (agentId: string, managerId: string) => {
    try {
      await updateAgent.mutateAsync({ id: agentId, manager_id: managerId } as any);
      toast.success("Agent assigned to manager");
    } catch (err: any) {
      toast.error("Failed to assign agent", { description: err.message });
    }
  };

  const handleUnassignAgent = async (agentId: string) => {
    try {
      await updateAgent.mutateAsync({ id: agentId, manager_id: null } as any);
      toast.success("Agent unassigned from manager");
    } catch (err: any) {
      toast.error("Failed to unassign agent", { description: err.message });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading managers...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Managers</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage team leads and assign agents to managers</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Add Manager</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add New Manager</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-3">
                <div><Label htmlFor="name">Full Name</Label><Input id="name" name="name" placeholder="Priya Sharma" required /></div>
                <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" placeholder="priya@company.com" required /></div>
                <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" placeholder="+91-9876543210" /></div>
                <div><Label htmlFor="department">Department</Label><Input id="department" name="department" placeholder="Claims" defaultValue="Claims" /></div>
                <div><Label htmlFor="maxAgents">Max Agents Capacity</Label><Input id="maxAgents" name="maxAgents" type="number" defaultValue={10} min={1} max={50} /></div>
              </div>
              <Button type="submit" className="w-full" disabled={createManager.isPending}>
                {createManager.isPending ? "Adding..." : "Add Manager"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border rounded-xl p-4 text-center shadow-card">
          <p className="text-2xl font-bold text-primary">{managers.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Managers</p>
        </div>
        <div className="bg-card border rounded-xl p-4 text-center shadow-card">
          <p className="text-2xl font-bold text-foreground">{agents.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Agents</p>
        </div>
        <div className="bg-card border rounded-xl p-4 text-center shadow-card">
          <p className="text-2xl font-bold text-warning">{agents.filter(a => !(a as any).manager_id).length}</p>
          <p className="text-xs text-muted-foreground mt-1">Unassigned Agents</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search managers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Manager Cards */}
      <div className="space-y-4">
        {filtered.map((manager) => {
          const assignedAgents = agents.filter((a) => (a as any).manager_id === manager.id);
          const unassigned = agents.filter((a) => !(a as any).manager_id);

          return (
            <div key={manager.id} className="bg-card border rounded-xl shadow-card overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                      {manager.name.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground text-lg">{manager.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" />{manager.department || "Claims"}</span>
                        {manager.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{manager.email}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={manager.active ? "default" : "secondary"}>
                      {manager.active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">
                      {assignedAgents.length}/{manager.max_agents} agents
                    </Badge>
                  </div>
                </div>

                {/* Assigned Agents */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-card-foreground flex items-center gap-1.5">
                      <Users className="h-4 w-4" /> Assigned Agents ({assignedAgents.length})
                    </h4>
                    {unassigned.length > 0 && assignedAgents.length < manager.max_agents && (
                      <Dialog open={assignOpen && selectedManagerId === manager.id} onOpenChange={(v) => { setAssignOpen(v); if (!v) setSelectedManagerId(null); }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedManagerId(manager.id)}>
                            <UserCheck className="h-3.5 w-3.5 mr-1" /> Assign Agent
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Assign Agent to {manager.name}</DialogTitle></DialogHeader>
                          <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {unassigned.map((agent) => (
                              <div key={agent.id} className="flex items-center justify-between border rounded-lg p-3">
                                <div>
                                  <p className="font-medium text-sm text-card-foreground">{agent.name}</p>
                                  <p className="text-xs text-muted-foreground">{agent.agent_code} · {agent.home_city}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <StatusBadge status={agent.availability} />
                                  <Button size="sm" onClick={() => { handleAssignAgent(agent.id, manager.id); setAssignOpen(false); }}>
                                    Assign
                                  </Button>
                                </div>
                              </div>
                            ))}
                            {unassigned.length === 0 && <p className="text-center text-muted-foreground py-4">All agents are assigned</p>}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  {assignedAgents.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-3 text-center border rounded-lg bg-muted/30">No agents assigned yet</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {assignedAgents.map((agent) => (
                        <div key={agent.id} className="flex items-center justify-between border rounded-lg p-3 hover:border-primary/30 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-xs">
                              {agent.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-card-foreground">{agent.name}</p>
                              <p className="text-xs text-muted-foreground">{agent.agent_code} · {agent.home_city}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={agent.availability} />
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => handleUnassignAgent(agent.id)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No managers found. Add a manager to get started.</p>}
      </div>
    </div>
  );
}
