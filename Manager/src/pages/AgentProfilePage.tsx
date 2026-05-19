import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import StatusBadge from "@/components/StatusBadge";
import { mockAgents, mockClaims } from "@/lib/mockData";
import {
  ArrowLeft, Phone, Mail, MessageSquare, MapPin, Star, FileText,
  DollarSign, Plus, Car, Navigation, IndianRupee, Calendar,
  CheckCircle2, AlertCircle, Send, ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AgentProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const agent = mockAgents.find((a) => a.id === id);
  const [assignDialog, setAssignDialog] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([]);
  const [newClaim, setNewClaim] = useState({ customer: "", amount: "", type: "Vehicle" });
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  if (!agent) return <DashboardLayout title="Agent Not Found"><p className="text-muted-foreground">Agent not found.</p></DashboardLayout>;

  const agentClaims = mockClaims.filter((c) => c.agent === agent.name);
  const activeClaims = agentClaims.filter((c) => c.status === "pending" || c.status === "in-progress");
  const completedClaims = agentClaims.filter((c) => c.status === "approved" || c.status === "rejected");

  const handleAssignClaim = () => {
    if (!newClaim.customer || !newClaim.amount) {
      toast({ title: "Error", description: "Please fill all fields.", variant: "destructive" });
      return;
    }
    toast({ title: "Claim Assigned", description: `New claim assigned to ${agent.name} for ${newClaim.customer}.` });
    setAssignDialog(false);
    setNewClaim({ customer: "", amount: "", type: "Vehicle" });
  };

  const sendMessage = () => {
    if (!chatMessage.trim()) return;
    setChatMessages(prev => [...prev, { sender: "manager", text: chatMessage, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setChatMessage("");
    toast({ title: "Message sent", description: `Message sent to ${agent.name}` });
    setTimeout(() => {
      const replies = ["Noted sir, will update shortly.", "On it!", "Yes sir, understood.", "Will send the documents soon."];
      setChatMessages(prev => [...prev, { sender: "agent", text: replies[Math.floor(Math.random() * replies.length)], time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    }, 1500);
  };

  return (
    <DashboardLayout title="Agent Profile">
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/agents")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Agents
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6 text-center">
              <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-4">{agent.avatar}</div>
              <h2 className="text-xl font-bold text-card-foreground">{agent.name}</h2>
              <StatusBadge status={agent.status} className="mt-2" />
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2"><Mail className="h-4 w-4" />{agent.email}</div>
                <div className="flex items-center justify-center gap-2"><Phone className="h-4 w-4" />{agent.phone}</div>
                <div className="flex items-center justify-center gap-2"><MapPin className="h-4 w-4" />{agent.region}</div>
                <div className="flex items-center justify-center gap-2"><Calendar className="h-4 w-4" />Joined: {agent.joiningDate}</div>
              </div>
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                <Button size="sm" onClick={() => setChatOpen(true)}><MessageSquare className="h-4 w-4 mr-1" />Chat</Button>
                <Button size="sm" variant="outline"><Phone className="h-4 w-4 mr-1" />Call</Button>
                <Button size="sm" variant="outline" onClick={() => navigate("/tracking")}><MapPin className="h-4 w-4 mr-1" />Track</Button>
                <Button size="sm" variant="outline" onClick={() => setAssignDialog(true)}><Plus className="h-4 w-4 mr-1" />Assign</Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Performance Overview</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Assigned", value: agent.assignedClaims, icon: FileText, color: "gradient-info" },
                  { label: "Completed", value: agent.completedClaims, icon: CheckCircle2, color: "gradient-success" },
                  { label: "Rating", value: `${agent.rating} ★`, icon: Star, color: "gradient-warning" },
                  { label: "Earnings", value: `₹${(agent.earnings / 1000).toFixed(0)}K`, icon: DollarSign, color: "gradient-primary" },
                ].map((s) => (
                  <div key={s.label} className="text-center p-4 rounded-xl bg-muted/50">
                    <div className={`h-10 w-10 rounded-lg ${s.color} flex items-center justify-center mx-auto mb-2 text-primary-foreground`}><s.icon className="h-5 w-5" /></div>
                    <p className="text-lg font-bold text-card-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <Car className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-lg font-bold text-card-foreground">{agent.totalKmTraveled.toLocaleString()} km</p>
                  <p className="text-xs text-muted-foreground">Total KM Traveled</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <IndianRupee className="h-8 w-8 text-warning mx-auto mb-2" />
                  <p className="text-lg font-bold text-card-foreground">₹{agent.travelCost.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Travel Cost</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <Navigation className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="text-lg font-bold text-card-foreground">₹{(agent.travelCost / agent.totalKmTraveled).toFixed(1)}/km</p>
                  <p className="text-xs text-muted-foreground">Cost Per KM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Claims & Payments Tabs */}
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="active" className="p-4">
              <TabsList>
                <TabsTrigger value="active">Active Claims ({activeClaims.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedClaims.length})</TabsTrigger>
                <TabsTrigger value="all">All Claims ({agentClaims.length})</TabsTrigger>
                <TabsTrigger value="payments">Payment History</TabsTrigger>
              </TabsList>
              {["active", "completed", "all"].map((tab) => {
                const list = tab === "active" ? activeClaims : tab === "completed" ? completedClaims : agentClaims;
                return (
                  <TabsContent key={tab} value={tab}>
                    {list.length === 0 ? (
                      <p className="text-muted-foreground text-sm py-4 text-center">No claims</p>
                    ) : (
                      <div className="space-y-2">
                        {list.map((claim) => (
                          <div key={claim.id} onClick={() => navigate(`/claims/${claim.id}`)} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-primary" />
                              <div>
                                <p className="text-sm font-semibold text-card-foreground">{claim.id} — {claim.customer}</p>
                                <p className="text-xs text-muted-foreground">{claim.type} • ₹{claim.amount.toLocaleString()} • {claim.date}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={claim.status} />
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                );
              })}
              <TabsContent value="payments">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <Card className="border"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-card-foreground">₹{agent.earnings.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Earnings</p></CardContent></Card>
                    <Card className="border"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-success">₹{agent.paymentHistory.reduce((s, p) => s + p.bonus, 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Bonus</p></CardContent></Card>
                    <Card className="border"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-warning">₹{agent.paymentHistory.reduce((s, p) => s + p.travelAllowance, 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Travel Allowance</p></CardContent></Card>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b text-muted-foreground">
                        <th className="text-left py-3 font-medium">Month</th>
                        <th className="text-right py-3 font-medium">Salary</th>
                        <th className="text-right py-3 font-medium">Bonus</th>
                        <th className="text-right py-3 font-medium">Travel</th>
                        <th className="text-right py-3 font-medium">Total</th>
                      </tr></thead>
                      <tbody>
                        {agent.paymentHistory.map((p, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-3 text-card-foreground font-medium">{p.month}</td>
                            <td className="py-3 text-right text-card-foreground">₹{p.salary.toLocaleString()}</td>
                            <td className="py-3 text-right text-success">₹{p.bonus.toLocaleString()}</td>
                            <td className="py-3 text-right text-muted-foreground">₹{p.travelAllowance.toLocaleString()}</td>
                            <td className="py-3 text-right font-bold text-card-foreground">₹{p.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Assign Claim Dialog */}
      <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign New Claim to {agent.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Customer Name</Label><Input value={newClaim.customer} onChange={(e) => setNewClaim({ ...newClaim, customer: e.target.value })} className="mt-1" placeholder="Enter customer name" /></div>
            <div><Label>Claim Amount (₹)</Label><Input type="number" value={newClaim.amount} onChange={(e) => setNewClaim({ ...newClaim, amount: e.target.value })} className="mt-1" placeholder="Enter amount" /></div>
            <div>
              <Label>Claim Type</Label>
              <Select value={newClaim.type} onValueChange={(v) => setNewClaim({ ...newClaim, type: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vehicle">Vehicle</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Property">Property</SelectItem>
                  <SelectItem value="Life">Life</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(false)}>Cancel</Button>
            <Button onClick={handleAssignClaim}>Assign Claim</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b bg-primary/5">
            <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">{agent.avatar}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-card-foreground text-sm">{agent.name}</h4>
              <div className="flex items-center gap-1.5"><StatusBadge status={agent.status} /><span className="text-xs text-muted-foreground">{agent.region}</span></div>
            </div>
          </div>
          <ScrollArea className="h-80 p-4">
            <div className="space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === "manager" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${msg.sender === "manager" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-card-foreground rounded-bl-sm"}`}>
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === "manager" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
              {chatMessages.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Start chatting with {agent.name}</p>}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>
          <div className="border-t p-3 flex gap-2">
            <Input value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Type a message..." className="flex-1 h-9 text-sm" />
            <Button size="sm" onClick={sendMessage} className="h-9 px-3"><Send className="h-4 w-4" /></Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AgentProfilePage;
