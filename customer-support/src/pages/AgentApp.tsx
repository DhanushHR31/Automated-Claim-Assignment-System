import { useState } from "react";
import { Smartphone, ExternalLink, Copy, Download, MapPin, Camera, FileText, Bell, CheckCircle, Navigation, Upload, MessageSquare, Star, Clock, TrendingUp, Settings, User, ToggleLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/StatusBadge";
import { useAgents, useAssignments, useClaims, useUpdateAgent, useUpdateAssignment, useCreateAuditLog, calculateDistance } from "@/hooks/useFastAPIData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AgentApp() {
  const { data: agents = [] } = useAgents();
  const { data: assignments = [] } = useAssignments();
  const { data: claims = [] } = useClaims();
  const updateAgent = useUpdateAgent();
  const updateAssignment = useUpdateAssignment();
  const createAuditLog = useCreateAuditLog();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");

  const agentUser = agents.find((a) => a.id === selectedAgentId) || agents[0];
  const agentAssignments = agentUser ? assignments.filter((a) => a.agent_id === agentUser.id) : [];
  const completedCount = agentAssignments.filter((a) => a.status === "completed").length;
  const pendingCount = agentAssignments.filter((a) => a.status !== "completed").length;
  const completionRate = agentAssignments.length > 0 ? Math.round((completedCount / agentAssignments.length) * 100) : 0;

  const agentAppUrl = `${window.location.origin}/agent`;

  const copyLink = () => {
    navigator.clipboard.writeText(agentAppUrl);
    toast.success("Agent app link copied to clipboard!");
  };

  if (agents.length === 0) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading agent data...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Agent Mobile App</h1>
          <p className="text-muted-foreground text-sm mt-1">Share the agent app link with your field agents</p>
        </div>
        <Select value={selectedAgentId || agentUser?.id || ""} onValueChange={setSelectedAgentId}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Select agent" /></SelectTrigger>
          <SelectContent>
            {agents.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name} ({a.agent_code})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent App Link Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border rounded-xl p-6 shadow-card text-center">
            <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="font-semibold text-lg text-card-foreground">ClaimAssign Agent</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-6">Field inspection & claim management</p>

            <div className="space-y-3">
              <Button className="w-full" onClick={() => window.open(agentAppUrl, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" /> Open Agent App
              </Button>
              <div className="flex gap-2">
                <Input readOnly value={agentAppUrl} className="text-xs" />
                <Button variant="outline" size="icon" onClick={copyLink}><Copy className="h-4 w-4" /></Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.info("Android APK will be available after native build setup")}>
                  <Download className="h-3.5 w-3.5 mr-1" /> Android APK
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast.info("iOS build will be available after App Store submission")}>
                  <Download className="h-3.5 w-3.5 mr-1" /> iOS App
                </Button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg text-left text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-card-foreground text-sm mb-2">How to share:</p>
              <p>1. Copy the link above</p>
              <p>2. Send to agent via email or SMS</p>
              <p>3. Agent opens link in browser</p>
              <p>4. Agent logs in with their credentials</p>
              <p>5. Works on any phone or desktop</p>
            </div>
          </div>

          {/* Features List */}
          <div className="bg-card border rounded-xl p-5 shadow-card">
            <h3 className="font-semibold text-card-foreground mb-3">App Features</h3>
            <div className="space-y-2.5">
              {[
                { icon: Bell, label: "Real-time claim assignment notifications" },
                { icon: Navigation, label: "GPS navigation to claim location" },
                { icon: Camera, label: "Photo & video capture for inspections" },
                { icon: FileText, label: "Digital inspection report submission" },
                { icon: Upload, label: "Document upload & evidence collection" },
                { icon: MapPin, label: "Real-time location sharing" },
                { icon: MessageSquare, label: "In-app messaging with managers" },
                { icon: CheckCircle, label: "Assignment status updates" },
                { icon: Star, label: "Performance tracking & ratings" },
                { icon: Settings, label: "Profile & preference management" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 text-sm">
                  <Icon className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Preview */}
        <div className="lg:col-span-2">
          <div className="bg-card border rounded-xl shadow-card overflow-hidden">
            {agentUser && (
              <div className="gradient-primary px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {agentUser.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-primary-foreground font-medium text-sm">{agentUser.name}</p>
                    <p className="text-primary-foreground/70 text-xs">{agentUser.agent_code} · {agentUser.home_city}</p>
                  </div>
                </div>
                <StatusBadge status={agentUser.availability} />
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start rounded-none border-b bg-card px-4 overflow-x-auto">
                <TabsTrigger value="overview">Dashboard</TabsTrigger>
                <TabsTrigger value="assignments">Claims</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <div className="p-5">
                <TabsContent value="overview" className="mt-0 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-card-foreground">{agentAssignments.length}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-card-foreground">{completedCount}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-card-foreground">{pendingCount}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-card-foreground">{completionRate}%</p>
                      <p className="text-xs text-muted-foreground">Rate</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="assignments" className="mt-0 space-y-3">
                  {agentAssignments.length === 0 && <p className="text-center text-muted-foreground py-8">No assignments</p>}
                  {agentAssignments.map((asg) => {
                    const claim = claims.find((c) => c.id === asg.claim_id);
                    return (
                      <div key={asg.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm font-medium">{asg.assignment_code}</span>
                          <StatusBadge status={asg.status} />
                        </div>
                        {claim && (
                          <p className="text-sm text-muted-foreground">{claim.description} — {claim.city}, {claim.state}</p>
                        )}
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="performance" className="mt-0 space-y-4">
                  {agentUser && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted rounded-lg p-4 text-center">
                        <Star className="h-5 w-5 text-warning mx-auto mb-1" />
                        <p className="text-2xl font-bold text-card-foreground">{agentUser.performance_score}%</p>
                        <p className="text-xs text-muted-foreground">Performance</p>
                      </div>
                      <div className="bg-muted rounded-lg p-4 text-center">
                        <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
                        <p className="text-2xl font-bold text-card-foreground">{completionRate}%</p>
                        <p className="text-xs text-muted-foreground">Completion</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
