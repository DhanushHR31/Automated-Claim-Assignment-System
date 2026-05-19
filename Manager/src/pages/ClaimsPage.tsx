import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { mockClaims as initialClaims, mockAgents } from "@/lib/mockData";
import { Filter, Eye, UserPlus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ClaimStatus = "all" | "pending" | "approved" | "rejected" | "in-progress";

const ClaimsPage = () => {
  const [filter, setFilter] = useState<ClaimStatus>("all");
  const [claims, setClaims] = useState(initialClaims);
  const [search, setSearch] = useState("");
  const [reassignDialog, setReassignDialog] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const filtered = claims
    .filter((c) => filter === "all" || c.status === filter)
    .filter(
      (c) =>
        search === "" ||
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.customer.toLowerCase().includes(search.toLowerCase()) ||
        c.agent.toLowerCase().includes(search.toLowerCase())
    );

  const handleApprove = (claimId: string) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, status: "approved" as const } : c))
    );
    toast({ title: "Claim Approved", description: `${claimId} has been approved successfully.` });
  };

  const handleReject = (claimId: string) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, status: "rejected" as const } : c))
    );
    toast({ title: "Claim Rejected", description: `${claimId} has been rejected.`, variant: "destructive" });
  };

  const handleReassign = () => {
    if (!reassignDialog || !selectedAgent) return;
    const agentName = mockAgents.find((a) => a.id === selectedAgent)?.name || "";
    setClaims((prev) =>
      prev.map((c) => (c.id === reassignDialog ? { ...c, agent: agentName } : c))
    );
    toast({ title: "Claim Reassigned", description: `${reassignDialog} assigned to ${agentName}.` });
    setReassignDialog(null);
    setSelectedAgent("");
  };

  const filters: { label: string; value: ClaimStatus; count: number }[] = [
    { label: "All", value: "all", count: claims.length },
    { label: "Pending", value: "pending", count: claims.filter((c) => c.status === "pending").length },
    { label: "Approved", value: "approved", count: claims.filter((c) => c.status === "approved").length },
    { label: "In Progress", value: "in-progress", count: claims.filter((c) => c.status === "in-progress").length },
    { label: "Rejected", value: "rejected", count: claims.filter((c) => c.status === "rejected").length },
  ];

  return (
    <DashboardLayout title="Claims Management">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {filters.map((f) => (
              <Button key={f.value} size="sm" variant={filter === f.value ? "default" : "outline"} onClick={() => setFilter(f.value)}>
                {f.label} ({f.count})
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search claims..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {["Claim ID", "Customer", "Agent", "Type", "Amount", "Status", "Date", "Docs", "Actions"].map((h) => (
                      <th key={h} className="text-left py-3 px-4 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={9} className="py-8 text-center text-muted-foreground">No claims found</td></tr>
                  ) : (
                    filtered.map((claim) => (
                      <tr key={claim.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 font-medium text-card-foreground">{claim.id}</td>
                        <td className="py-3 px-4 text-card-foreground">{claim.customer}</td>
                        <td className="py-3 px-4 text-card-foreground">{claim.agent}</td>
                        <td className="py-3 px-4 text-card-foreground">{claim.type}</td>
                        <td className="py-3 px-4 text-card-foreground">₹{claim.amount.toLocaleString()}</td>
                        <td className="py-3 px-4"><StatusBadge status={claim.status} /></td>
                        <td className="py-3 px-4 text-muted-foreground">{claim.date}</td>
                        <td className="py-3 px-4 text-card-foreground">{claim.documents}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            {claim.status === "pending" && (
                              <>
                                <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleApprove(claim.id)}>Approve</Button>
                                <Button size="sm" variant="outline" className="text-xs h-7 text-destructive" onClick={() => handleReject(claim.id)}>Reject</Button>
                              </>
                            )}
                            {claim.status === "in-progress" && (
                              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => navigate("/tracking")}>Track</Button>
                            )}
                            <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setReassignDialog(claim.id)}>
                              <UserPlus className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => navigate(`/claims/${claim.id}`)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!reassignDialog} onOpenChange={() => { setReassignDialog(null); setSelectedAgent(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Claim {reassignDialog}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
              <SelectContent>
                {mockAgents.filter((a) => a.status !== "offline").map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>{agent.name} — {agent.assignedClaims} active</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReassignDialog(null); setSelectedAgent(""); }}>Cancel</Button>
            <Button onClick={handleReassign} disabled={!selectedAgent}>Reassign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ClaimsPage;
