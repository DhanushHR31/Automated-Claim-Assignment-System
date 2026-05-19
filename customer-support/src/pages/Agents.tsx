import { useState, useEffect, useRef } from "react";
import {
  Search, MapPin, Phone, Mail, Star, UserPlus, Eye, MessageSquare,
  Navigation, CheckCircle, Clock, FileText, Send, Activity, Map,
  Radio, TrendingUp, User, ExternalLink, IndianRupee, Route, Maximize2, ShieldCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/StatusBadge";
import { useAgents, useCreateAgent, useCreateAuditLog, useAssignments, useClaims, useAuditLogs, API_BASE } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ClaimMap from "@/components/ClaimMap";
import { getTravelCostSettings } from "@/lib/travelCost";

type Agent = any;

// ── Manager ↔ Agent Chat ────────────────────────────────────────────
function ManagerChat({ agent, managerId }: { agent: Agent; managerId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem("manager_token");

  useEffect(() => {
    if (!agent.user_id || !managerId || !token) return;
    const loadMessages = async () => {
      try {
        const resp = await fetch(`${API_BASE}/messages?user_id=${agent.user_id}&peer_id=${managerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.ok) {
          const data = await resp.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Message load error:", err);
      }
    };
    loadMessages();
  }, [agent.user_id, managerId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const content = input.trim();
    
    const newMsg = {
      id: Date.now().toString(),
      sender_id: managerId,
      receiver_id: agent.user_id,
      content,
      sent_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInput("");

    if (!agent.user_id || !token) {
      return;
    }

    try {
      const resp = await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiver_id: agent.user_id, content }),
      });
      if (resp.ok) {
        const saved = await resp.json();
        setMessages((prev) => prev.map((msg) => (msg.id === newMsg.id ? saved : msg)));
      }
    } catch (err) {
      console.error("Message send error:", err);
    }
  };

  return (
    <div className="flex flex-col h-[320px]">
      <div className="flex-1 overflow-y-auto space-y-2 p-3">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">
            No messages yet. Start a conversation with {agent.name}.
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === managerId;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-xl px-3 py-2 ${isMine ? "bg-primary text-primary-foreground" : "bg-muted text-card-foreground"}`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {new Date(msg.sent_at || msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 p-3 border-t">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Message ${agent.name.split(" ")[0]}...`} onKeyDown={(e) => e.key === "Enter" && sendMessage()} className="text-sm" />
        <Button size="icon" onClick={sendMessage}><Send className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────
export default function Agents() {
  const { data: agents = [], isLoading } = useAgents();
  const { data: assignments = [] } = useAssignments();
  const { data: claims = [] } = useClaims();
  const { data: auditLogs = [] } = useAuditLogs();
  const createAgent = useCreateAgent();
  const createAuditLog = useCreateAuditLog();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [travelAllowed, setTravelAllowed] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [detailTab, setDetailTab] = useState("overview");

  const [searchId, setSearchId] = useState("");
  const [isSearchingId, setIsSearchingId] = useState(false);
  const [mapAgent, setMapAgent] = useState<Agent | null>(null);

  const filtered = agents.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || 
                          a.home_city.toLowerCase().includes(search.toLowerCase()) || 
                          a.agent_code.toLowerCase().includes(search.toLowerCase()) ||
                          (a.agent_id_8 && a.agent_id_8.includes(search));
    const matchesStatus = filterStatus === "all" || a.availability === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleIdSearch = async () => {
    if (!searchId.trim()) return;
    setIsSearchingId(true);
    const token = localStorage.getItem("manager_token");
    try {
      const resp = await fetch(`${API_BASE}/support/search/agent/${searchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setSelectedAgent(data);
        setDetailTab("overview");
        toast.success("Agent found");
      } else {
        toast.error("Agent not found", { description: "No agent with this 8-digit ID exists." });
      }
    } catch (err) {
      console.error(err);
      toast.error("Search failed");
    } finally {
      setIsSearchingId(false);
    }
  };

  const availableCount = agents.filter(a => a.availability === "available").length;
  const onAssignmentCount = agents.filter(a => a.availability === "on_assignment").length;
  const onLeaveCount = agents.filter(a => a.availability === "on_leave").length;

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string).trim().toLowerCase();
    if (agents.some((a) => a.email?.toLowerCase() === email)) {
      toast.error("Duplicate email", { description: "An agent with this email already exists." });
      return;
    }
    try {
      const agentCode = "AGT-" + String(agents.length + 1).padStart(4, "0");
      const newAgent = await createAgent.mutateAsync({
        name: fd.get("name") as string,
        agent_code: agentCode,
        phone: fd.get("phone") as string,
        email,
        home_city: fd.get("homeCity") as string,
        home_state: fd.get("homeState") as string,
        latitude: Number(fd.get("latitude")) || 12.97,
        longitude: Number(fd.get("longitude")) || 77.59,
        travel_allowed: travelAllowed,
        working_hours_start: fd.get("workStart") as string || "07:00",
        working_hours_end: fd.get("workEnd") as string || "17:00",
      });
      await createAuditLog.mutateAsync({
        action: "agent_created",
        agent_id: newAgent.id,
        performed_by: user?.email || "System",
        details: `New agent registered: ${newAgent.name} (${newAgent.agent_code})`,
      });
      setOpen(false);
      toast.success("Agent created successfully", { description: `${newAgent.name} (${newAgent.agent_code}) has been registered` });
    } catch (err: any) {
      toast.error("Failed to create agent", { description: err.message });
    }
  };

  const agentAssignments = selectedAgent ? assignments.filter((a) => a.agent_id === selectedAgent.id) : [];
  const completedAssignments = agentAssignments.filter((a) => a.status === "completed");
  const activeAssignments = agentAssignments.filter((a) => a.status !== "completed");
  const agentLogs = selectedAgent ? auditLogs.filter((l) => l.agent_id === selectedAgent.id).slice(0, 20) : [];
  const travelSettings = getTravelCostSettings();
  const totalDistance = agentAssignments.reduce((sum, a) => sum + Number(a.distance || 0), 0);
  const totalTravelCost = agentAssignments.reduce((sum, a) => sum + Number(a.travel_cost || 0), 0);
  const totalStayCost = agentAssignments.reduce((sum, a) => sum + Number(a.hotel_cost || 0), 0);
  const totalAssignmentCost = agentAssignments.reduce((sum, a) => sum + Number(a.total_cost || 0), 0);

  if (isLoading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading agents...</p></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Field Agents</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage agent profiles, track locations & communicate</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="h-4 w-4 mr-1" /> Add Agent</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Register New Agent</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label htmlFor="name">Full Name</Label><Input id="name" name="name" placeholder="Ravi Kumar" required /></div>
                <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" placeholder="ravi@company.com" required /></div>
                <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" placeholder="+91-9876543210" required /></div>
                <div><Label htmlFor="homeCity">Home City</Label><Input id="homeCity" name="homeCity" placeholder="Bangalore" required /></div>
                <div><Label htmlFor="homeState">Home State</Label><Input id="homeState" name="homeState" placeholder="Karnataka" required /></div>
                <div><Label htmlFor="latitude">Latitude</Label><Input id="latitude" name="latitude" type="number" step="any" placeholder="12.97" required /></div>
                <div><Label htmlFor="longitude">Longitude</Label><Input id="longitude" name="longitude" type="number" step="any" placeholder="77.59" required /></div>
                <div><Label htmlFor="workStart">Work Start</Label><Input id="workStart" name="workStart" type="time" defaultValue="07:00" /></div>
                <div><Label htmlFor="workEnd">Work End</Label><Input id="workEnd" name="workEnd" type="time" defaultValue="17:00" /></div>
                <div className="flex items-center gap-2 pt-5">
                  <Switch checked={travelAllowed} onCheckedChange={setTravelAllowed} />
                  <Label>Travel Allowed</Label>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createAgent.isPending}>
                {createAgent.isPending ? "Registering..." : "Register Agent"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Agents", value: agents.length, color: "bg-primary/10 text-primary" },
          { label: "Available", value: availableCount, color: "bg-success/10 text-success" },
          { label: "On Assignment", value: onAssignmentCount, color: "bg-warning/10 text-warning" },
          { label: "On Leave", value: onLeaveCount, color: "bg-muted text-muted-foreground" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border rounded-xl p-4 text-center shadow-card">
            <p className={`text-2xl font-bold ${color.split(" ")[1]}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, city or code..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Input 
            placeholder="8-digit ID..." 
            value={searchId} 
            onChange={(e) => setSearchId(e.target.value)} 
            className="w-32"
            maxLength={8}
          />
          <Button variant="secondary" onClick={handleIdSearch} disabled={isSearchingId}>
            {isSearchingId ? "..." : "Fetch"}
          </Button>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="on_assignment">On Assignment</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((agent) => {
          const agentAsg = assignments.filter(a => a.agent_id === agent.id);
          const completedCount = agentAsg.filter(a => a.status === "completed").length;
          const activeCount = agentAsg.filter(a => a.status !== "completed").length;
          const registeredViaApp = !!agent.user_id;

          return (
            <div
              key={agent.id}
              className="bg-card border rounded-xl p-5 shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all animate-fade-in cursor-pointer group"
              onClick={() => { setSelectedAgent(agent); setDetailTab("overview"); }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-11 w-11 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      {agent.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${agent.availability === "available" ? "bg-success" : agent.availability === "on_assignment" ? "bg-warning" : "bg-muted-foreground"}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">{agent.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground font-mono">{agent.agent_code}</span>
                      {agent.agent_id_8 && <Badge variant="secondary" className="text-[9px] h-4 px-1">ID: {agent.agent_id_8}</Badge>}
                      {registeredViaApp && (
                        <Badge variant="outline" className="text-[9px] h-4 px-1 border-primary/40 text-primary">App</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <StatusBadge status={agent.availability} />
              </div>

              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" />{agent.home_city}, {agent.home_state}</div>
                {agent.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0" />{agent.phone}</div>}
                {agent.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{agent.email}</span></div>}
              </div>

              <div className="mt-4 pt-3 border-t grid grid-cols-4 gap-1 text-center">
                <div>
                  <div className="flex items-center justify-center gap-0.5">
                    <Star className="h-3 w-3 text-warning" />
                    <span className="text-sm font-semibold text-card-foreground">{agent.performance_score}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Score</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-card-foreground">{activeCount}</span>
                  <p className="text-[10px] text-muted-foreground">Active</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-success">{completedCount}</span>
                  <p className="text-[10px] text-muted-foreground">Done</p>
                </div>
                <div>
                  <span className={`text-sm font-semibold ${agent.travel_allowed ? "text-success" : "text-destructive"}`}>
                    {agent.travel_allowed ? "✓" : "✗"}
                  </span>
                  <p className="text-[10px] text-muted-foreground">Travel</p>
                </div>
              </div>

              <div className="mt-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={(e) => { e.stopPropagation(); setMapAgent(agent); }}>
                  <MapPin className="h-3 w-3 mr-1" /> See Agent
                </Button>
                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={(e) => { e.stopPropagation(); setSelectedAgent(agent); setDetailTab("communicate"); }}>
                  <MessageSquare className="h-3 w-3 mr-1" /> Chat
                </Button>
                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={(e) => { e.stopPropagation(); setSelectedAgent(agent); setDetailTab("overview"); }}>
                  <Eye className="h-3 w-3 mr-1" /> Details
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Agent Detail Dialog ─────────────────────────────────────── */}
      <Dialog open={!!selectedAgent} onOpenChange={(v) => !v && setSelectedAgent(null)}>
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
          {selectedAgent && (() => {
            const sa = selectedAgent;
            const registeredViaApp = !!sa.user_id;
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                        {sa.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-card ${sa.availability === "available" ? "bg-success" : sa.availability === "on_assignment" ? "bg-warning" : "bg-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <DialogTitle className="text-xl">{sa.name}</DialogTitle>
                        {registeredViaApp && <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">Registered via App</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground font-mono">{sa.agent_code}</p>
                    </div>
                    <StatusBadge status={sa.availability} />
                  </div>
                </DialogHeader>

                <Tabs value={detailTab} onValueChange={setDetailTab}>
                  <TabsList className="w-full grid grid-cols-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="assigned">Active ({activeAssignments.length})</TabsTrigger>
                    <TabsTrigger value="completed">Done ({completedAssignments.length})</TabsTrigger>
                    <TabsTrigger value="travel">Travel</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="communicate">Chat</TabsTrigger>
                  </TabsList>

                  {/* Overview */}
                  <TabsContent value="overview" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Location", value: `${sa.home_city}, ${sa.home_state}`, icon: MapPin },
                        { label: "Agent Code", value: sa.agent_code, icon: User },
                        { label: "Agent ID (8-digit)", value: sa.agent_id_8 || "N/A", icon: ShieldCheck },
                        { label: "Performance", value: `${sa.performance_score}%`, icon: Star },
                        { label: "Phone", value: sa.phone || "N/A", icon: Phone },
                        { label: "Email", value: sa.email || "N/A", icon: Mail },
                        { label: "Login User", value: sa.user_id || "Not linked", icon: User },
                        { label: "Working Hours", value: `${sa.working_hours_start} – ${sa.working_hours_end}`, icon: Clock },
                        { label: "Travel", value: sa.travel_allowed ? "Allowed" : "Not Allowed", icon: Navigation },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="bg-muted/50 rounded-lg p-3">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                          <p className="text-sm font-medium text-card-foreground flex items-center gap-1 mt-0.5">
                            <Icon className="h-3 w-3 shrink-0" /><span className="truncate">{value}</span>
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Live Status & Location */}
                    <div className="bg-muted/30 border rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-card-foreground flex items-center gap-1.5">
                          <Radio className="h-3.5 w-3.5 text-success animate-pulse" /> Live Status
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className={`h-2.5 w-2.5 rounded-full ${sa.availability === "available" ? "bg-success animate-pulse" : sa.availability === "on_assignment" ? "bg-warning" : "bg-muted-foreground"}`} />
                          <span className="text-sm text-card-foreground capitalize">{sa.availability.replace(/_/g, " ")}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Current coordinates: {sa.latitude.toFixed(4)}, {sa.longitude.toFixed(4)}
                      </p>
                      <ClaimMap agents={[sa]} claims={[]} showAgents={true} showClaims={false} className="h-[180px] rounded-lg overflow-hidden" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                        <p className="text-2xl font-bold text-primary">{agentAssignments.length}</p>
                        <p className="text-xs text-muted-foreground">Total Claims</p>
                      </div>
                      <div className="bg-success/5 border border-success/20 rounded-xl p-3">
                        <p className="text-2xl font-bold text-success">{completedAssignments.length}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                      <div className="bg-warning/5 border border-warning/20 rounded-xl p-3">
                        <p className="text-2xl font-bold text-warning">{activeAssignments.length}</p>
                        <p className="text-xs text-muted-foreground">Active</p>
                      </div>
                      <div className="bg-info/5 border border-info/20 rounded-xl p-3">
                        <p className="text-2xl font-bold text-info">₹{totalAssignmentCost.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Travel Total</p>
                      </div>
                    </div>

                    {/* Quick Contact */}
                    <div className="flex gap-2">
                      {sa.phone && (
                        <a href={`tel:${sa.phone}`} className="flex-1">
                          <Button variant="outline" className="w-full" size="sm"><Phone className="h-3.5 w-3.5 mr-1" /> Call</Button>
                        </a>
                      )}
                      {sa.email && (
                        <a href={`mailto:${sa.email}`} className="flex-1">
                          <Button variant="outline" className="w-full" size="sm"><Mail className="h-3.5 w-3.5 mr-1" /> Email</Button>
                        </a>
                      )}
                      <Button variant="default" className="flex-1" size="sm" onClick={() => setDetailTab("communicate")}>
                        <MessageSquare className="h-3.5 w-3.5 mr-1" /> Chat
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Active Assignments */}
                  <TabsContent value="assigned" className="space-y-3 mt-4">
                    {activeAssignments.length === 0 && <p className="text-center text-muted-foreground py-8">No active assignments</p>}
                    {activeAssignments.map((asg) => {
                      const claim = claims.find((c) => c.id === asg.claim_id);
                      return (
                        <div key={asg.id} className="border rounded-xl p-4 hover:border-primary/30 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-sm font-medium text-card-foreground">{asg.assignment_code}</span>
                            <StatusBadge status={asg.status} />
                          </div>
                          {claim && (
                            <>
                              <p className="text-sm text-card-foreground">{claim.description}</p>
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{claim.city}, {claim.state}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-muted-foreground">{claim.claim_type.replace(/_/g, " ")} · ₹{Number(claim.estimated_value).toLocaleString()}</p>
                                <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => window.open(`https://www.google.com/maps/@${claim.latitude},${claim.longitude},15z`, "_blank")}>
                                  <ExternalLink className="h-3 w-3 mr-0.5" /> Map
                                </Button>
                              </div>
                            </>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" /> {new Date(asg.assigned_time).toLocaleDateString()}
                            <span className="ml-auto">{asg.distance} km</span>
                          </div>
                        </div>
                      );
                    })}
                  </TabsContent>

                  {/* Completed */}
                  <TabsContent value="completed" className="space-y-3 mt-4">
                    {completedAssignments.length === 0 && <p className="text-center text-muted-foreground py-8">No completed assignments</p>}
                    {completedAssignments.map((asg) => {
                      const claim = claims.find((c) => c.id === asg.claim_id);
                      return (
                        <div key={asg.id} className="border rounded-xl p-4 opacity-80">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-sm font-medium text-card-foreground">{asg.assignment_code}</span>
                            <StatusBadge status="completed" />
                          </div>
                          {claim && <p className="text-sm text-card-foreground">{claim.description}</p>}
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <CheckCircle className="h-3 w-3 text-success" /> {asg.distance} km · ₹{Number(asg.total_cost).toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </TabsContent>

                  {/* Travel Details */}
                  <TabsContent value="travel" className="space-y-4 mt-4">
                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div className="bg-muted/40 border rounded-xl p-3">
                        <Route className="h-4 w-4 mx-auto text-primary mb-1" />
                        <p className="text-lg font-bold text-card-foreground">{totalDistance.toFixed(1)} km</p>
                        <p className="text-[10px] text-muted-foreground">Total KM</p>
                      </div>
                      <div className="bg-muted/40 border rounded-xl p-3">
                        <IndianRupee className="h-4 w-4 mx-auto text-success mb-1" />
                        <p className="text-lg font-bold text-card-foreground">₹{totalTravelCost.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">KM Cost</p>
                      </div>
                      <div className="bg-muted/40 border rounded-xl p-3">
                        <Navigation className="h-4 w-4 mx-auto text-warning mb-1" />
                        <p className="text-lg font-bold text-card-foreground">₹{totalStayCost.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">Stay Cost</p>
                      </div>
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                        <IndianRupee className="h-4 w-4 mx-auto text-primary mb-1" />
                        <p className="text-lg font-bold text-primary">₹{totalAssignmentCost.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">Total Cost</p>
                      </div>
                    </div>

                    <div className="rounded-xl border bg-muted/20 p-3 text-xs text-muted-foreground">
                      Rate settings: ₹{travelSettings.costPerKm}/km, stay added after {travelSettings.stayThresholdKm} km, stay amount ₹{travelSettings.stayCost}
                    </div>

                    <div className="space-y-3">
                      {agentAssignments.length === 0 && <p className="text-center text-muted-foreground py-8">No travel cost recorded yet</p>}
                      {agentAssignments.map((asg) => {
                        const claim = claims.find((c) => c.id === asg.claim_id);
                        return (
                          <div key={asg.id} className="border rounded-xl p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-mono text-sm font-medium text-card-foreground">{asg.assignment_code}</p>
                                <p className="text-sm text-muted-foreground mt-1">{claim?.description || asg.claim_id}</p>
                                {claim && <p className="text-xs text-muted-foreground mt-1">{claim.city}, {claim.state}</p>}
                              </div>
                              <StatusBadge status={asg.status} />
                            </div>
                            <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
                              <div className="rounded-lg bg-muted/50 p-2">
                                <p className="text-muted-foreground">Distance</p>
                                <p className="font-semibold text-card-foreground">{Number(asg.distance).toFixed(1)} km</p>
                              </div>
                              <div className="rounded-lg bg-muted/50 p-2">
                                <p className="text-muted-foreground">KM Cost</p>
                                <p className="font-semibold text-card-foreground">₹{Number(asg.travel_cost).toLocaleString()}</p>
                              </div>
                              <div className="rounded-lg bg-muted/50 p-2">
                                <p className="text-muted-foreground">Stay</p>
                                <p className="font-semibold text-card-foreground">₹{Number(asg.hotel_cost).toLocaleString()}</p>
                              </div>
                              <div className="rounded-lg bg-primary/10 p-2">
                                <p className="text-muted-foreground">Total</p>
                                <p className="font-semibold text-primary">₹{Number(asg.total_cost).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  {/* Activity Timeline */}
                  <TabsContent value="activity" className="space-y-3 mt-4">
                    {agentLogs.length === 0 && <p className="text-center text-muted-foreground py-8">No activity recorded yet</p>}
                    <div className="space-y-0">
                      {agentLogs.map((log, i) => (
                        <div key={log.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="h-2.5 w-2.5 rounded-full bg-primary mt-2 shrink-0" />
                            {i < agentLogs.length - 1 && <div className="w-px flex-1 bg-border" />}
                          </div>
                          <div className="pb-4">
                            <p className="text-sm font-medium text-card-foreground capitalize">{log.action.replace(/_/g, " ")}</p>
                            {log.details && <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>}
                            <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Chat */}
                  <TabsContent value="communicate" className="mt-4 space-y-3">
                    <div className="flex gap-2">
                      {sa.phone && <a href={`tel:${sa.phone}`} className="flex-1"><Button variant="outline" className="w-full" size="sm"><Phone className="h-3.5 w-3.5 mr-1" /> Call</Button></a>}
                      {sa.email && <a href={`mailto:${sa.email}`} className="flex-1"><Button variant="outline" className="w-full" size="sm"><Mail className="h-3.5 w-3.5 mr-1" /> Email</Button></a>}
                    </div>
                    <div className="border rounded-xl overflow-hidden">
                      <div className="px-3 py-2 bg-primary/5 border-b flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                        <p className="text-sm font-medium text-card-foreground">Chat with {sa.name}</p>
                        {sa.user_id && <div className="ml-auto h-2 w-2 rounded-full bg-success" title="Online" />}
                      </div>
                      <ManagerChat agent={sa} managerId={user?.id || ""} />
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Map Popup ────────────────────────────────────────────────── */}
      <Dialog open={!!mapAgent} onOpenChange={(v) => !v && setMapAgent(null)}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Agent Location: {mapAgent?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 relative h-full">
            {mapAgent && (
              <ClaimMap agents={[mapAgent]} claims={[]} showAgents={true} showClaims={false} className="absolute inset-0 h-full w-full" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
