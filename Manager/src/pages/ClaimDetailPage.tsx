import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { mockClaims, mockAgents } from "@/lib/mockData";
import { ArrowLeft, FileText, User, DollarSign, Calendar, MessageSquare, Phone, Mail, MapPin, AlertTriangle, Send, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

const ClaimDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const claim = mockClaims.find((c) => c.id === id);
  const [status, setStatus] = useState(claim?.status || "pending");
  const [notes, setNotes] = useState("");
  const [notesList, setNotesList] = useState<{ text: string; time: string }[]>([
    { text: "Claim submitted by customer", time: "2026-04-10 09:00" },
    { text: "Documents verified by agent", time: "2026-04-10 14:30" },
    { text: "Site survey scheduled", time: "2026-04-11 10:00" },
  ]);
  const [queryMessage, setQueryMessage] = useState("");
  const [queries, setQueries] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: "agent", text: "Customer is requesting expedited processing. Please advise.", time: "10:30 AM" },
    { sender: "manager", text: "Approved for fast-track. Ensure all documents are in order.", time: "10:45 AM" },
  ]);

  if (!claim) return <DashboardLayout title="Claim Not Found"><p className="text-muted-foreground">Claim not found.</p></DashboardLayout>;

  const agent = mockAgents.find((a) => a.name === claim.agent);

  const handleStatusChange = (newStatus: "approved" | "rejected") => {
    setStatus(newStatus);
    toast({ title: `Claim ${newStatus === "approved" ? "Approved" : "Rejected"}`, description: `${claim.id} status updated.`, variant: newStatus === "rejected" ? "destructive" : undefined });
  };

  const handleAddNote = () => {
    if (!notes.trim()) return;
    setNotesList((prev) => [...prev, { text: notes, time: new Date().toLocaleString() }]);
    setNotes("");
    toast({ title: "Note Added", description: "Your note has been saved." });
  };

  const sendQuery = () => {
    if (!queryMessage.trim()) return;
    setQueries(prev => [...prev, { sender: "manager", text: queryMessage, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setQueryMessage("");
    setTimeout(() => {
      const replies = ["Noted sir, will check and update.", "Understood, working on it.", "Will share the documents shortly.", "Customer has been informed."];
      setQueries(prev => [...prev, { sender: "agent", text: replies[Math.floor(Math.random() * replies.length)], time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    }, 1500);
  };

  return (
    <DashboardLayout title={`Claim ${claim.id}`}>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/claims")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Claims
        </Button>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Claim Details</TabsTrigger>
            <TabsTrigger value="customer">Customer Info</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="text-base">Claim Information</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {[
                      { label: "Claim ID", value: claim.id, icon: FileText },
                      { label: "Claim Type", value: claim.type, icon: AlertTriangle },
                      { label: "Amount", value: `₹${claim.amount.toLocaleString()}`, icon: DollarSign },
                      { label: "Date Filed", value: claim.date, icon: Calendar },
                      { label: "Incident Date", value: claim.incidentDate, icon: Calendar },
                      { label: "Documents", value: `${claim.documents} files`, icon: FileText },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><item.icon className="h-3 w-3" />{item.label}</div>
                        <p className="text-sm font-semibold text-card-foreground">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-muted/30 border">
                    <p className="text-xs text-muted-foreground mb-1">Incident Description</p>
                    <p className="text-sm text-card-foreground">{claim.description}</p>
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-muted/30 border">
                    <p className="text-xs text-muted-foreground mb-1">Incident Location</p>
                    <p className="text-sm text-card-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{claim.incidentLocation}</p>
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <StatusBadge status={status} />
                  </div>
                  {status === "pending" && (
                    <div className="mt-4 flex gap-2">
                      <Button onClick={() => handleStatusChange("approved")}>Approve Claim</Button>
                      <Button variant="destructive" onClick={() => handleStatusChange("rejected")}>Reject Claim</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Assigned Agent</CardTitle></CardHeader>
                <CardContent className="text-center">
                  <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold mx-auto mb-3">
                    {agent?.avatar || "?"}
                  </div>
                  <h3 className="font-semibold text-card-foreground">{claim.agent}</h3>
                  {agent && (
                    <>
                      <StatusBadge status={agent.status} className="mt-2" />
                      <p className="text-xs text-muted-foreground mt-2">{agent.email}</p>
                      <p className="text-xs text-muted-foreground">{agent.phone}</p>
                      <div className="mt-3 p-3 rounded-lg bg-muted/30 text-left space-y-2">
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Rating</span><span className="font-bold text-warning">{agent.rating} ★</span></div>
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Completed</span><span className="font-bold text-success">{agent.completedClaims}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Active</span><span className="font-bold text-card-foreground">{agent.assignedClaims}</span></div>
                      </div>
                      <div className="flex gap-2 justify-center mt-4">
                        <Button size="sm" variant="outline" onClick={() => navigate(`/agents/${agent.id}`)}>View Profile</Button>
                        <Button size="sm" onClick={() => navigate("/messages")}>
                          <MessageSquare className="h-4 w-4 mr-1" />Chat
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customer" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Customer Details</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xl font-bold">
                        {claim.customer.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-card-foreground">{claim.customer}</h3>
                        <p className="text-sm text-muted-foreground">Policy Holder</p>
                      </div>
                    </div>
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
                        <Phone className="h-4 w-4 text-primary" />
                        <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium text-card-foreground">{claim.customerPhone}</p></div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
                        <Mail className="h-4 w-4 text-primary" />
                        <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium text-card-foreground">{claim.customerEmail}</p></div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
                        <MapPin className="h-4 w-4 text-primary" />
                        <div><p className="text-xs text-muted-foreground">Address</p><p className="text-sm font-medium text-card-foreground">{claim.customerAddress}</p></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Incident Summary</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/30 border">
                    <p className="text-xs text-muted-foreground mb-1">Incident Type</p>
                    <p className="text-sm font-semibold text-card-foreground">{claim.type} Claim</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border">
                    <p className="text-xs text-muted-foreground mb-1">Incident Date</p>
                    <p className="text-sm font-semibold text-card-foreground">{claim.incidentDate}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border">
                    <p className="text-xs text-muted-foreground mb-1">Location</p>
                    <p className="text-sm text-card-foreground">{claim.incidentLocation}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-card-foreground">{claim.description}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border">
                    <p className="text-xs text-muted-foreground mb-1">Claim Amount</p>
                    <p className="text-lg font-bold text-card-foreground">₹{claim.amount.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="communication" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />Claim Queries & Communication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-72 mb-4">
                  <div className="space-y-3 pr-2">
                    {queries.map((q, i) => (
                      <div key={i} className={`flex ${q.sender === "manager" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${q.sender === "manager" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-card-foreground rounded-bl-sm"}`}>
                          <p className={`text-[10px] font-semibold mb-0.5 ${q.sender === "manager" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                            {q.sender === "manager" ? "Manager" : claim.agent}
                          </p>
                          <p>{q.text}</p>
                          <p className={`text-[10px] mt-1 ${q.sender === "manager" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{q.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    value={queryMessage}
                    onChange={(e) => setQueryMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendQuery()}
                    placeholder="Type a query or message..."
                    className="flex-1"
                  />
                  <Button onClick={sendQuery}><Send className="h-4 w-4 mr-1.5" />Send</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />Claim Timeline & Notes</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  {notesList.map((note, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-primary mt-1" />
                        {i < notesList.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div>
                        <p className="text-sm text-card-foreground">{note.text}</p>
                        <p className="text-xs text-muted-foreground">{note.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea placeholder="Add a note..." value={notes} onChange={(e) => setNotes(e.target.value)} className="flex-1" rows={2} />
                  <Button onClick={handleAddNote} className="self-end">Add Note</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader><CardTitle className="text-base">Documents ({claim.documents})</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Array.from({ length: claim.documents }, (_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-card-foreground">Document_{i + 1}.pdf</p>
                        <p className="text-xs text-muted-foreground">{(Math.random() * 2 + 0.5).toFixed(1)} MB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClaimDetailPage;
