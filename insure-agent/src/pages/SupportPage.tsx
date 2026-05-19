import { useState } from "react";
import { Send, Paperclip, Phone, Mail, Clock, Headphones, MessageSquare, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Single support person for direct communication
const supportContact = {
  name: "Anita Sharma",
  role: "Technical Support Lead - Karnataka",
  status: "Online",
  avatar: "AS",
  phone: "+91 98765 00001",
  email: "support.karnataka@insureagent.co",
  specialization: "Claims Processing & Technical Issues",
  responseTime: "< 2 minutes",
};

interface SupportMessage {
  id: string;
  sender: "agent" | "support";
  senderName: string;
  text: string;
  time: string;
}

const initialSupportMsgs: SupportMessage[] = [
  { id: "1", sender: "support", senderName: "Anita Sharma", text: "ನಮಸ್ಕಾರ! Welcome to InsureAgent Karnataka Support. How can I help you today?", time: "10:00 AM" },
  { id: "2", sender: "agent", senderName: "You", text: "I'm facing an issue with document upload on claim CLM-1003 in Peenya.", time: "10:02 AM" },
  { id: "3", sender: "support", senderName: "Anita Sharma", text: "Let me check that for you. Can you share the error message you're seeing?", time: "10:03 AM" },
];

export default function SupportPage() {
  const [msgs, setMsgs] = useState(initialSupportMsgs);
  const [input, setInput] = useState("");
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: "", description: "", priority: "medium" });

  const [tickets, setTickets] = useState([
    { id: "TKT-001", subject: "App crash during photo upload in Peenya area", status: "Open", priority: "High", created: "2 hours ago" },
    { id: "TKT-002", subject: "Map not loading in Tumakuru district", status: "In Progress", priority: "Medium", created: "1 day ago" },
    { id: "TKT-003", subject: "Payment delay for CLM-2024-0990", status: "Resolved", priority: "Low", created: "3 days ago" },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMsgs([...msgs, {
      id: String(msgs.length + 1),
      sender: "agent",
      senderName: "You",
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
    setInput("");

    // Auto-reply from support
    setTimeout(() => {
      setMsgs(prev => [...prev, {
        id: String(prev.length + 1),
        sender: "support",
        senderName: "Anita Sharma",
        text: "Thank you for the information. I'm looking into this now. I'll update you shortly.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    }, 2000);
  };

  const handleCreateTicket = () => {
    if (!ticketForm.subject) {
      toast.error("Please enter a subject");
      return;
    }
    const newTicket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
      subject: ticketForm.subject,
      status: "Open",
      priority: ticketForm.priority.charAt(0).toUpperCase() + ticketForm.priority.slice(1),
      created: "Just now",
    };
    setTickets(prev => [newTicket, ...prev]);
    setTicketForm({ subject: "", description: "", priority: "medium" });
    setNewTicketOpen(false);
    toast.success("Support ticket created successfully!");
  };

  return (
    <div className="animate-slide-up max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Support Team - Direct Communication</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Support Contact & Tickets */}
        <div className="lg:col-span-1 space-y-4">
          {/* Support Person */}
          <div className="rounded-xl border border-border bg-card p-5 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl mx-auto mb-3">
              {supportContact.avatar}
            </div>
            <h3 className="text-base font-semibold">{supportContact.name}</h3>
            <p className="text-xs text-muted-foreground mb-1">{supportContact.role}</p>
            <div className="flex items-center justify-center gap-1 mb-3">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-xs text-success font-medium">{supportContact.status}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-1">{supportContact.specialization}</p>
            <p className="text-[10px] text-success font-medium mb-3">Response time: {supportContact.responseTime}</p>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 text-xs"><Phone className="h-3 w-3 mr-1" /> Call</Button>
              <Button size="sm" variant="outline" className="flex-1 text-xs"><Mail className="h-3 w-3 mr-1" /> Email</Button>
            </div>
          </div>

          {/* Tickets */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">My Tickets</h3>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setNewTicketOpen(!newTicketOpen)}>
                + New Ticket
              </Button>
            </div>

            {newTicketOpen && (
              <div className="mb-4 p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
                <input
                  placeholder="Subject"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <textarea
                  placeholder="Description"
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[60px]"
                />
                <select
                  value={ticketForm.priority}
                  onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <Button size="sm" className="w-full" onClick={handleCreateTicket}>Create Ticket</Button>
              </div>
            )}

            <div className="space-y-2">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">{ticket.id}</span>
                    <Badge className={`text-[9px] border-0 ${
                      ticket.status === "Open" ? "bg-warning/10 text-warning" :
                      ticket.status === "In Progress" ? "bg-info/10 text-info" : "bg-success/10 text-success"
                    }`}>{ticket.status}</Badge>
                  </div>
                  <p className="text-xs font-medium line-clamp-1">{ticket.subject}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{ticket.created}</span>
                    <Badge variant="outline" className={`text-[9px] ${
                      ticket.priority === "High" ? "text-destructive border-destructive/30" :
                      ticket.priority === "Medium" ? "text-warning border-warning/30" : "text-success border-success/30"
                    }`}>{ticket.priority}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Direct Chat */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card flex flex-col h-[600px]">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                {supportContact.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold">{supportContact.name}</p>
                <p className="text-xs text-success flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> Online • {supportContact.responseTime}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm"><Phone className="h-3 w-3 mr-1" /> Call</Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {msgs.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "agent" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  msg.sender === "agent"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}>
                  {msg.sender === "support" && <p className="text-[10px] font-semibold mb-1 opacity-70">{msg.senderName}</p>}
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender === "agent" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <button className="p-2 text-muted-foreground hover:text-foreground">
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Describe your issue..."
                className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button onClick={handleSend} className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
