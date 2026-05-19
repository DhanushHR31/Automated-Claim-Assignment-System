import { useEffect, useState } from "react";
import { messages as initialMessages } from "@/data/mockData";
import { Send, Paperclip, Phone, Video, Mail, MapPin, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

const managerInfo = {
  name: "Venkatesh Prasad",
  role: "Regional Manager - Karnataka South",
  email: "venkatesh.prasad@insurekarnataka.co",
  phone: "+91 99001 22334",
  region: "Bengaluru Urban, Mysuru, Mandya, Ramanagara",
  experience: "15 years",
  teamSize: 32,
  rating: 4.9,
  status: "Online",
  avatar: "VP",
  achievements: ["Top Manager 2023", "100% Claim Resolution", "Karnataka Best Region Award"],
};

export default function MessagesPage() {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [managerId, setManagerId] = useState<string | null>(null);
  const token = localStorage.getItem("agent_token");

  useEffect(() => {
    if (!user || !token) return;
    const loadThread = async () => {
      try {
        const managerResp = await fetch("http://localhost:8000/support/primary-manager", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (managerResp.ok) {
          const manager = await managerResp.json();
          setManagerId(manager.id);
        }
        const resp = await fetch(`http://localhost:8000/messages?user_id=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.length > 0) {
            setMsgs(data.map((msg: any) => ({
              id: msg.id,
              sender: msg.sender_id === user.id ? "agent" : "manager",
              senderName: msg.sender_id === user.id ? "You" : "Customer Support",
              text: msg.content,
              time: new Date(msg.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            })));
            const firstSupportMessage = data.find((msg: any) => msg.sender_id !== user.id || msg.receiver_id !== user.id);
            if (firstSupportMessage) {
              setManagerId(firstSupportMessage.sender_id === user.id ? firstSupportMessage.receiver_id : firstSupportMessage.sender_id);
            }
          }
        }
      } catch (err) {
        console.error("Message thread load failed:", err);
      }
    };
    loadThread();
  }, [user, token]);

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMsgs([...msgs, {
      id: String(msgs.length + 1),
      sender: "agent",
      senderName: "You",
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput("");

    if (!managerId || !token) return;
    fetch("http://localhost:8000/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ receiver_id: managerId, content: text }),
    }).catch((err) => console.error("Message send failed:", err));
  };

  return (
    <div className="animate-slide-up max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manager Communication</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manager Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary mx-auto mb-3">
              {managerInfo.avatar}
            </div>
            <h2 className="text-lg font-bold">{managerInfo.name}</h2>
            <p className="text-sm text-muted-foreground">{managerInfo.role}</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-xs text-success font-medium">{managerInfo.status}</span>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" className="flex-1 text-xs"><Phone className="h-3 w-3 mr-1" /> Call</Button>
              <Button size="sm" variant="outline" className="flex-1 text-xs"><Video className="h-3 w-3 mr-1" /> Video</Button>
              <Button size="sm" variant="outline" className="flex-1 text-xs"><Mail className="h-3 w-3 mr-1" /> Email</Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Manager Details</h3>
            <div className="space-y-3 text-sm">
              {[
                { icon: Mail, label: "Email", value: managerInfo.email },
                { icon: Phone, label: "Phone", value: managerInfo.phone },
                { icon: MapPin, label: "Region", value: managerInfo.region },
                { icon: Star, label: "Rating", value: `${managerInfo.rating}/5.0` },
                { icon: Award, label: "Experience", value: managerInfo.experience },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Team Info</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-lg bg-primary/5">
                <p className="text-xl font-bold text-primary">{managerInfo.teamSize}</p>
                <p className="text-[10px] text-muted-foreground">Team Members</p>
              </div>
              <div className="p-3 rounded-lg bg-success/5">
                <p className="text-xl font-bold text-success">{managerInfo.rating}</p>
                <p className="text-[10px] text-muted-foreground">Team Rating</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-[10px] text-muted-foreground mb-2">Achievements</p>
              <div className="flex flex-wrap gap-1">
                {managerInfo.achievements.map((a) => (
                  <Badge key={a} variant="outline" className="text-[9px]">{a}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card flex flex-col h-[600px]">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">VP</div>
              <div>
                <h3 className="text-sm font-bold">{managerInfo.name}</h3>
                <p className="text-xs text-success flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> Online
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm"><Phone className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm"><Video className="h-4 w-4" /></Button>
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
                  {msg.sender === "manager" && <p className="text-[10px] font-semibold mb-1 opacity-70">{msg.senderName}</p>}
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender === "agent" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button onClick={handleSend} className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
