import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ClaimTracker } from "@/components/ClaimTracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Upload, FileText, Clock, MapPin, User, MessageCircle, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useInsurancePolicies, useClaims, useCreateClaim } from "@/hooks/useFastAPIData";

interface Policy {
  id: string;
  name: string;
  policy_number: string;
}

const agents = [
  { name: "Rajesh Kumar", phone: "+91 98765 00001", speciality: "Health Claims", avatar: "RK" },
  { name: "Priya Sharma", phone: "+91 98765 00002", speciality: "Vehicle Claims", avatar: "PS" },
  { name: "Amit Patel", phone: "+91 98765 00003", speciality: "Life Claims", avatar: "AP" },
];

const Claims = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: policiesData } = useInsurancePolicies();
  const { data: claimsData } = useClaims();
  const createClaim = useCreateClaim();

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState("");
  const [claimAmount, setClaimAmount] = useState("");
  const [description, setDescription] = useState("");
  const [claimCount, setClaimCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (policiesData) {
      setPolicies(policiesData.filter((p: any) => p.status === "Active"));
    }
  }, [policiesData]);

  useEffect(() => {
    if (claimsData) {
      setClaimCount(claimsData.length);
      setPendingCount(claimsData.filter((c: any) => c.status === "Submitted" || c.status === "Processing").length);
    }
  }, [claimsData]);

  const handleFileClaim = async () => {
    if (!user || !selectedPolicy || !claimAmount) return;

    try {
      await createClaim.mutateAsync({
        policy_id: selectedPolicy,
        amount: parseFloat(claimAmount),
        description: description || null,
        status: "Submitted",
        progress: 10,
      });

      toast({ title: "Claim Filed!", description: "Your claim has been submitted. An agent will be assigned shortly." });
      setDialogOpen(false);
      setSelectedPolicy("");
      setClaimAmount("");
      setDescription("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const assignedAgent = agents[0]; // Just picking first for demo

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Claims</h1>
            <p className="text-sm text-muted-foreground mt-1">Track and file insurance claims</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> File New Claim
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>File New Claim</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Select Policy</Label>
                  <Select value={selectedPolicy} onValueChange={setSelectedPolicy}>
                    <SelectTrigger><SelectValue placeholder="Choose a policy" /></SelectTrigger>
                    <SelectContent>
                      {policies.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.policy_number})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Claim Amount (₹)</Label>
                  <Input type="number" placeholder="e.g. 50000" value={claimAmount} onChange={(e) => setClaimAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="Describe the reason for claim" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <Button className="w-full gradient-primary text-primary-foreground" onClick={handleFileClaim} disabled={createClaim.isPending || !selectedPolicy || !claimAmount}>
                  {createClaim.isPending ? "Submitting..." : "Submit Claim"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Claims", value: String(claimCount), icon: FileText, color: "bg-primary/10 text-primary" },
            { label: "Pending", value: String(pendingCount), icon: Clock, color: "bg-warning/10 text-warning" },
            { label: "Documents", value: "12", icon: Upload, color: "bg-info/10 text-info" },
          ].map((s) => (
            <Card key={s.label} className="shadow-card border-0">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ClaimTracker />
          </div>

          {/* Assigned Agent */}
          <Card className="shadow-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><User className="w-4 h-4" /> Assigned Agent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {assignedAgent.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{assignedAgent.name}</p>
                  <p className="text-xs text-muted-foreground">{assignedAgent.speciality}</p>
                  <p className="text-xs text-muted-foreground">{assignedAgent.phone}</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-success mr-1" /> Available
              </Badge>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <MessageCircle className="w-4 h-4" /> Chat with Agent
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <MapPin className="w-4 h-4" /> Share Location
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Claims;
