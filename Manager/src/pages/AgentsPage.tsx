import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "@/components/StatusBadge";
import { mockAgents, mockClaims } from "@/lib/mockData";
import {
  Star, Phone, Mail, Search, MapPin, Navigation, DollarSign,
  FileText, MessageCircle, Send, IndianRupee, Calendar, Car,
  CheckCircle2, AlertCircle, ChevronRight, Users, TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type StatusFilter = "all" | "active" | "busy" | "offline";

const AgentsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [chatAgent, setChatAgent] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Record<string, { sender: string; text: string; time: string }[]>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  const filtered = mockAgents
    .filter((a) => statusFilter === "all" || a.status === statusFilter)
    .filter((a) => search === "" || a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()));

  const statusCounts = {
    all: mockAgents.length,
    active: mockAgents.filter((a) => a.status === "active").length,
    busy: mockAgents.filter((a) => a.status === "busy").length,
    offline: mockAgents.filter((a) => a.status === "offline").length,
  };

  const totalKm = mockAgents.reduce((s, a) => s + a.totalKmTraveled, 0);
  const totalTravelCost = mockAgents.reduce((s, a) => s + a.travelCost, 0);
  const totalEarnings = mockAgents.reduce((s, a) => s + a.earnings, 0);

  const agentData = mockAgents.find(a => a.id === selectedAgent);
  const agentClaims = agentData ? mockClaims.filter(c => c.agent === agentData.name) : [];
  const chatAgentData = mockAgents.find(a => a.id === chatAgent);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatAgent]);

  const sendMessage = () => {
    if (!chatMessage.trim() || !chatAgent) return;
    setChatMessages(prev => {
      const copy = { ...prev };
      if (!copy[chatAgent]) copy[chatAgent] = [];
      copy[chatAgent] = [...copy[chatAgent], { sender: "manager", text: chatMessage, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }];
      return copy;
    });
    setChatMessage("");
    toast({ title: "Message sent", description: `Message sent to ${chatAgentData?.name}` });
    setTimeout(() => {
      const replies = ["Noted sir, will update shortly.", "On it!", "Yes sir, understood.", "Will send the documents soon.", "Reaching location in 10 minutes."];
      setChatMessages(prev => {
        const copy = { ...prev };
        if (!copy[chatAgent]) copy[chatAgent] = [];
        copy[chatAgent] = [...copy[chatAgent], {
          sender: "agent",
          text: replies[Math.floor(Math.random() * replies.length)],
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }];
        return copy;
      });
    }, 1500);
  };

  return (
    <DashboardLayout title="Agents Management">
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Total Agents</p><p className="text-xl font-bold text-card-foreground">{mockAgents.length}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center"><Car className="h-5 w-5 text-success" /></div>
            <div><p className="text-xs text-muted-foreground">Total KM Traveled</p><p className="text-xl font-bold text-card-foreground">{totalKm.toLocaleString()}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center"><IndianRupee className="h-5 w-5 text-warning" /></div>
            <div><p className="text-xs text-muted-foreground">Travel Cost</p><p className="text-xl font-bold text-card-foreground">₹{(totalTravelCost / 1000).toFixed(0)}K</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-info" /></div>
            <div><p className="text-xs text-muted-foreground">Total Payouts</p><p className="text-xl font-bold text-card-foreground">₹{(totalEarnings / 100000).toFixed(1)}L</p></div>
          </CardContent></Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(["all", "active", "busy", "offline"] as StatusFilter[]).map((s) => (
              <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} onClick={() => setStatusFilter(s)} className="capitalize">
                {s} ({statusCounts[s]})
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search agents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No agents found</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((agent) => {
              const claims = mockClaims.filter(c => c.agent === agent.name);
              return (
                <Card key={agent.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0 cursor-pointer" onClick={() => setSelectedAgent(agent.id)}>
                        {agent.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-card-foreground truncate cursor-pointer hover:text-primary transition-colors" onClick={() => setSelectedAgent(agent.id)}>{agent.name}</h3>
                          <StatusBadge status={agent.status} />
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1"><Mail className="h-3 w-3" />{agent.email}</div>
                          <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{agent.phone}</div>
                          <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{agent.region}</div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t text-center">
                          <div><p className="text-xs text-muted-foreground">Assigned</p><p className="text-sm font-bold text-card-foreground">{agent.assignedClaims}</p></div>
                          <div><p className="text-xs text-muted-foreground">Done</p><p className="text-sm font-bold text-success">{agent.completedClaims}</p></div>
                          <div><p className="text-xs text-muted-foreground">KM</p><p className="text-sm font-bold text-card-foreground">{agent.totalKmTraveled}</p></div>
                          <div className="flex flex-col items-center"><p className="text-xs text-muted-foreground">Rating</p><p className="text-sm font-bold text-warning flex items-center gap-0.5"><Star className="h-3 w-3 fill-warning" />{agent.rating}</p></div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => setSelectedAgent(agent.id)}>
                            Details
                          </Button>
                          <Button size="sm" className="flex-1 h-7 text-xs" onClick={() => setChatAgent(agent.id)}>
                            <MessageCircle className="h-3 w-3 mr-1" />Chat
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate(`/agents/${agent.id}`)}>
                            Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Agent Detail Dialog */}
      <Dialog open={!!selectedAgent && !!agentData} onOpenChange={() => setSelectedAgent(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {agentData && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold">{agentData.avatar}</div>
                  <div>
                    <span className="text-lg">{agentData.name}</span>
                    <div className="flex items-center gap-2 mt-0.5"><StatusBadge status={agentData.status} /><span className="text-xs text-muted-foreground">{agentData.region}</span></div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="info" className="mt-2">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="info">Information</TabsTrigger>
                  <TabsTrigger value="claims">Claims ({agentClaims.length})</TabsTrigger>
                  <TabsTrigger value="travel">Travel & Cost</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-card-foreground">{agentData.email}</span></div>
                      <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-card-foreground">{agentData.phone}</span></div>
                      <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-card-foreground">{agentData.region}</span></div>
                      <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="text-card-foreground">Joined: {agentData.joiningDate}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/30 rounded-lg p-3 text-center"><CheckCircle2 className="h-6 w-6 text-success mx-auto mb-1" /><p className="text-lg font-bold text-card-foreground">{agentData.completedClaims}</p><p className="text-[10px] text-muted-foreground">Completed</p></div>
                      <div className="bg-muted/30 rounded-lg p-3 text-center"><AlertCircle className="h-6 w-6 text-warning mx-auto mb-1" /><p className="text-lg font-bold text-card-foreground">{agentData.assignedClaims}</p><p className="text-[10px] text-muted-foreground">Active</p></div>
                      <div className="bg-muted/30 rounded-lg p-3 text-center"><Star className="h-6 w-6 text-warning mx-auto mb-1" /><p className="text-lg font-bold text-card-foreground">{agentData.rating}</p><p className="text-[10px] text-muted-foreground">Rating</p></div>
                      <div className="bg-muted/30 rounded-lg p-3 text-center"><IndianRupee className="h-6 w-6 text-success mx-auto mb-1" /><p className="text-lg font-bold text-card-foreground">₹{(agentData.earnings / 1000).toFixed(0)}K</p><p className="text-[10px] text-muted-foreground">Earnings</p></div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={() => { setSelectedAgent(null); setChatAgent(agentData.id); }} className="flex-1"><MessageCircle className="h-4 w-4 mr-1.5" />Chat</Button>
                    <Button size="sm" variant="outline" onClick={() => { setSelectedAgent(null); navigate(`/agents/${agentData.id}`); }} className="flex-1">Full Profile</Button>
                    <Button size="sm" variant="outline" onClick={() => { setSelectedAgent(null); navigate("/tracking"); }}>Track</Button>
                  </div>
                </TabsContent>

                <TabsContent value="claims" className="mt-4">
                  <div className="space-y-2">
                    {agentClaims.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No claims assigned</p>}
                    {agentClaims.map(claim => (
                      <div key={claim.id} onClick={() => { setSelectedAgent(null); navigate(`/claims/${claim.id}`); }} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-semibold text-card-foreground">{claim.id}</p>
                            <p className="text-xs text-muted-foreground">{claim.customer} • {claim.type} • ₹{claim.amount.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={claim.status} />
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="travel" className="mt-4 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <Card className="border"><CardContent className="p-4 text-center"><Car className="h-8 w-8 text-primary mx-auto mb-2" /><p className="text-2xl font-bold text-card-foreground">{agentData.totalKmTraveled.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total KM</p></CardContent></Card>
                    <Card className="border"><CardContent className="p-4 text-center"><IndianRupee className="h-8 w-8 text-warning mx-auto mb-2" /><p className="text-2xl font-bold text-card-foreground">₹{agentData.travelCost.toLocaleString()}</p><p className="text-xs text-muted-foreground">Travel Cost</p></CardContent></Card>
                    <Card className="border"><CardContent className="p-4 text-center"><Navigation className="h-8 w-8 text-success mx-auto mb-2" /><p className="text-2xl font-bold text-card-foreground">₹{(agentData.travelCost / agentData.totalKmTraveled * 1).toFixed(1)}</p><p className="text-xs text-muted-foreground">Cost/KM</p></CardContent></Card>
                  </div>
                  <Card className="border">
                    <CardHeader className="py-3"><CardTitle className="text-sm">Travel Breakdown</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { label: "Field Visits", km: Math.round(agentData.totalKmTraveled * 0.6), cost: Math.round(agentData.travelCost * 0.6) },
                          { label: "Office Commute", km: Math.round(agentData.totalKmTraveled * 0.25), cost: Math.round(agentData.travelCost * 0.25) },
                          { label: "Emergency Visits", km: Math.round(agentData.totalKmTraveled * 0.15), cost: Math.round(agentData.travelCost * 0.15) },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <span className="text-sm text-card-foreground">{item.label}</span>
                            <div className="flex gap-4 text-sm">
                              <span className="text-muted-foreground">{item.km} km</span>
                              <span className="font-semibold text-card-foreground">₹{item.cost.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payments" className="mt-4 space-y-4">
                  <Card className="border">
                    <CardHeader className="py-3"><CardTitle className="text-sm">Total Earnings</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-card-foreground">₹{agentData.earnings.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Lifetime earnings since {agentData.joiningDate}</p>
                    </CardContent>
                  </Card>
                  <Card className="border">
                    <CardHeader className="py-3"><CardTitle className="text-sm">Payment History</CardTitle></CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-muted-foreground">
                              <th className="text-left py-2 font-medium">Month</th>
                              <th className="text-right py-2 font-medium">Salary</th>
                              <th className="text-right py-2 font-medium">Bonus</th>
                              <th className="text-right py-2 font-medium">Travel</th>
                              <th className="text-right py-2 font-medium">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {agentData.paymentHistory.map((p, i) => (
                              <tr key={i} className="border-b last:border-0">
                                <td className="py-2 text-card-foreground">{p.month}</td>
                                <td className="py-2 text-right text-card-foreground">₹{p.salary.toLocaleString()}</td>
                                <td className="py-2 text-right text-success">₹{p.bonus.toLocaleString()}</td>
                                <td className="py-2 text-right text-muted-foreground">₹{p.travelAllowance.toLocaleString()}</td>
                                <td className="py-2 text-right font-bold text-card-foreground">₹{p.total.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Popup */}
      <Dialog open={!!chatAgent && !!chatAgentData} onOpenChange={() => setChatAgent(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          {chatAgentData && (
            <>
              <div className="flex items-center gap-3 p-4 border-b bg-primary/5">
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">{chatAgentData.avatar}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-card-foreground text-sm">{chatAgentData.name}</h4>
                  <div className="flex items-center gap-1.5"><StatusBadge status={chatAgentData.status} /><span className="text-xs text-muted-foreground">{chatAgentData.region}</span></div>
                </div>
              </div>
              <ScrollArea className="h-80 p-4">
                <div className="space-y-3">
                  {(chatMessages[chatAgent!] || []).map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === "manager" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${msg.sender === "manager" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-card-foreground rounded-bl-sm"}`}>
                        <p>{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${msg.sender === "manager" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                  {(chatMessages[chatAgent!] || []).length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">Start chatting with {chatAgentData.name}</p>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
              <div className="border-t p-3 flex gap-2">
                <Input value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Type a message..." className="flex-1 h-9 text-sm" />
                <Button size="sm" onClick={sendMessage} className="h-9 px-3"><Send className="h-4 w-4" /></Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AgentsPage;
