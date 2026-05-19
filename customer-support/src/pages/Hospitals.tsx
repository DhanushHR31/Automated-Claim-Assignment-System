import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Search, MapPin, Phone, Mail, Star, Building2,
  Trash2, Edit2, X, Check, CheckCircle, XCircle, FileText, Send, MessageSquare, ExternalLink, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const API_BASE = "http://localhost:8000";

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("manager_token");
  const resp = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || "Request failed");
  }
  return resp.json();
};

interface Hospital {
  id: string;
  user_id: string;
  hospital_name: string;
  email: string | null;
  city: string;
  state: string;
  hospital_id_8: string | null;
  stats: {
    total: number;
    approved: number;
    pending: number;
    completed: number;
  };
}

function HospitalChat({ hospitalUserId }: { hospitalUserId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const managerToken = localStorage.getItem("manager_token");

  useEffect(() => {
    if (!hospitalUserId || !managerToken) return;
    const loadMessages = async () => {
      try {
        const resp = await fetch(`${API_BASE}/messages?peer_id=${hospitalUserId}`, {
          headers: { Authorization: `Bearer ${managerToken}` },
        });
        if (resp.ok) {
          const data = await resp.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Chat load error:", err);
      }
    };
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [hospitalUserId, managerToken]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !managerToken) return;
    const content = input.trim();
    try {
      const resp = await fetch(`${API_BASE}/messages/hospital`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${managerToken}`,
        },
        body: JSON.stringify({ receiver_id: hospitalUserId, content }),
      });
      if (resp.ok) {
        const saved = await resp.json();
        setMessages((prev) => [...prev, saved]);
        setInput("");
      }
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex-1 overflow-y-auto space-y-2 p-4">
        {messages.map((msg) => {
          const isMine = msg.sender_role !== "hospital";
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <p className="text-sm">{msg.content}</p>
                <p className="text-[10px] mt-1 opacity-60">
                  {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t flex gap-2">
        <input 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type a message to the hospital..." 
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button size="icon" onClick={sendMessage}><Send className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

export default function Hospitals() {
  const qc = useQueryClient();
  const { data: hospitals = [], isLoading } = useQuery<Hospital[]>({
    queryKey: ["hospitals-all"],
    queryFn: () => fetchWithAuth("/hospitals/all"),
  });

  const [search, setSearch] = useState("");
  const [searchId, setSearchId] = useState("");
  const [isSearchingId, setIsSearchingId] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    if (selectedHospitalId) {
      fetchWithAuth(`/hospitals/${selectedHospitalId}/details`).then(setDetails);
    } else {
      setDetails(null);
    }
  }, [selectedHospitalId]);

  const handleIdSearch = async () => {
    if (!searchId.trim()) return;
    setIsSearchingId(true);
    const token = localStorage.getItem("manager_token");
    try {
      const resp = await fetch(`${API_BASE}/support/search/hospital/${searchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setSelectedHospitalId(data.profile.user_id);
        toast.success("Hospital found");
      } else {
        toast.error("Hospital not found", { description: "No hospital with this 8-digit ID exists." });
      }
    } catch (err) {
      console.error(err);
      toast.error("Search failed");
    } finally {
      setIsSearchingId(false);
    }
  };

  const filtered = hospitals.filter((h) => 
    h.hospital_name.toLowerCase().includes(search.toLowerCase()) ||
    h.city.toLowerCase().includes(search.toLowerCase()) ||
    (h.hospital_id_8 && h.hospital_id_8.includes(search))
  );

  if (isLoading) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hospitals</h1>
          <p className="text-muted-foreground text-sm">Network providers and claim statistics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Network", value: hospitals.length, color: "text-primary" },
          { label: "Active Claims", value: hospitals.reduce((s, h) => s + h.stats.pending, 0), color: "text-warning" },
          { label: "Approved Claims", value: hospitals.reduce((s, h) => s + h.stats.approved, 0), color: "text-success" },
          { label: "Completed", value: hospitals.reduce((s, h) => s + h.stats.completed, 0), color: "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="bg-card border rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search hospitals..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-9"
          />
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((h) => (
          <div 
            key={h.id} 
            className="bg-card border rounded-xl p-5 hover:border-primary/50 transition-all cursor-pointer shadow-sm group"
            onClick={() => setSelectedHospitalId(h.user_id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline" className="text-[10px]">
                {h.stats.pending} Pending
              </Badge>
            </div>
            <h3 className="font-bold text-lg">{h.hospital_name}</h3>
            <div className="flex items-center gap-2 mt-1">
              {h.hospital_id_8 && <Badge variant="secondary" className="text-[9px] h-4 px-1">ID: {h.hospital_id_8}</Badge>}
              <p className="text-xs text-muted-foreground font-mono">{h.user_id.slice(0, 8)}…</p>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" /> {h.city}, {h.state}
            </p>
            
            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center text-[10px]">
              <div>
                <p className="font-bold text-card-foreground">{h.stats.total}</p>
                <p className="text-muted-foreground">Claims</p>
              </div>
              <div>
                <p className="font-bold text-success">{h.stats.approved}</p>
                <p className="text-muted-foreground">Approved</p>
              </div>
              <div>
                <p className="font-bold text-primary">{h.stats.completed}</p>
                <p className="text-muted-foreground">Paid</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedHospitalId} onOpenChange={(v) => !v && setSelectedHospitalId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          {details ? (
            <>
              <DialogHeader className="p-6 border-b">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-2xl">{details.profile.name}</DialogTitle>
                      {details.profile.hospital_id_8 && <Badge variant="secondary">ID: {details.profile.hospital_id_8}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Mail className="h-3 w-3" /> {details.profile.email} • 
                      <Phone className="h-3 w-3" /> {details.profile.contact}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="claims" className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="mx-6 mt-4 grid grid-cols-3">
                  <TabsTrigger value="claims">Claims ({details.claims.length})</TabsTrigger>
                  <TabsTrigger value="profile">Profile Information</TabsTrigger>
                  <TabsTrigger value="chat">Chat with Hospital</TabsTrigger>
                </TabsList>

                <TabsContent value="claims" className="flex-1 overflow-y-auto p-6 space-y-4">
                  {details.claims.map((claim: any) => (
                    <div key={claim.id} className="border rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-mono text-muted-foreground">{claim.claim_number}</p>
                          <h4 className="font-bold text-lg">{claim.patient}</h4>
                        </div>
                        <Badge className={claim.status === "approved" ? "bg-success" : "bg-warning"}>
                          {claim.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs uppercase tracking-wider">Estimated Amount</p>
                          <p className="font-bold text-primary text-base">₹{claim.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs uppercase tracking-wider">Created At</p>
                          <p className="font-medium">{new Date(claim.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {claim.documents && claim.documents.length > 0 && (
                        <div className="pt-4 border-t">
                          <p className="text-xs font-semibold mb-2">Uploaded Documents</p>
                          <div className="flex flex-wrap gap-2">
                            {claim.documents.map((doc: any) => (
                              <Button key={doc.id} variant="outline" size="sm" className="h-8 text-[10px]" asChild>
                                <a href={`${API_BASE}${doc.url}`} target="_blank" rel="noreferrer">
                                  <FileText className="h-3 w-3 mr-1" /> {doc.name || "Document"}
                                </a>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {claim.status === "initiated" || claim.status === "submitted" ? (
                        <div className="flex gap-2 pt-2">
                          <Button 
                            className="flex-1 bg-success hover:bg-success/90" 
                            onClick={async () => {
                              const amount = prompt("Enter approved amount:", claim.amount.toString());
                              if (amount) {
                                await fetchWithAuth(`/hospitals/claims/${claim.id}/approve?amount=${amount}`, { method: "POST" });
                                setSelectedHospitalId(null);
                                toast.success("Claim approved");
                                qc.invalidateQueries({ queryKey: ["hospitals-all"] });
                              }
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" /> Approve Claim
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                  {details.claims.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-20" />
                      <p className="text-muted-foreground">No claims submitted by this hospital yet.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="profile" className="p-6 space-y-6 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "License Number", value: details.profile.license, icon: Activity },
                      { label: "Specialization", value: details.profile.specialization, icon: Building2 },
                      { label: "Address", value: details.profile.address, icon: MapPin },
                      { label: "Email", value: details.profile.email, icon: Mail },
                    ].map((item) => (
                      <div key={item.label} className="bg-muted/30 rounded-2xl p-4">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-bold">{item.label}</p>
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4 text-primary" />
                          <p className="text-sm font-semibold">{item.value || "N/A"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="chat" className="flex-1 overflow-hidden flex flex-col">
                  <HospitalChat hospitalUserId={selectedHospitalId} />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="p-12 text-center flex flex-col items-center gap-3">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground">Loading hospital intelligence...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
