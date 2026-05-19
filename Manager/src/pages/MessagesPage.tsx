import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Search } from "lucide-react";

interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  own: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;
  messages: Message[];
}

const initialConversations: Conversation[] = [
  {
    id: "1", name: "Rajesh Kumar", avatar: "RK",
    lastMsg: "Documents uploaded for CLM-001", time: "2 min", unread: 2,
    messages: [
      { id: "1", sender: "Rajesh Kumar", text: "Hi, I've uploaded the documents for CLM-001", time: "10:30 AM", own: false },
      { id: "2", sender: "You", text: "Great, I'll review them now", time: "10:32 AM", own: true },
      { id: "3", sender: "Rajesh Kumar", text: "Also, the customer wants to know the timeline", time: "10:35 AM", own: false },
      { id: "4", sender: "You", text: "Let me check and get back to you in 30 minutes", time: "10:36 AM", own: true },
    ],
  },
  {
    id: "2", name: "Priya Sharma", avatar: "PS",
    lastMsg: "Claim inspection done", time: "15 min", unread: 0,
    messages: [
      { id: "1", sender: "Priya Sharma", text: "Claim CLM-002 inspection is complete", time: "09:15 AM", own: false },
      { id: "2", sender: "You", text: "Thanks Priya. What's the assessment?", time: "09:20 AM", own: true },
      { id: "3", sender: "Priya Sharma", text: "All documents are valid. Recommend approval.", time: "09:22 AM", own: false },
    ],
  },
  {
    id: "3", name: "Support Team", avatar: "ST",
    lastMsg: "Issue #45 resolved", time: "1 hr", unread: 1,
    messages: [
      { id: "1", sender: "Support Team", text: "Issue #45 has been resolved", time: "08:00 AM", own: false },
      { id: "2", sender: "You", text: "What was the root cause?", time: "08:05 AM", own: true },
      { id: "3", sender: "Support Team", text: "Customer had uploaded wrong documents. Re-uploaded now.", time: "08:10 AM", own: false },
    ],
  },
  {
    id: "4", name: "Sneha Gupta", avatar: "SG",
    lastMsg: "Need clarification on CLM-003", time: "3 hrs", unread: 0,
    messages: [
      { id: "1", sender: "Sneha Gupta", text: "I need clarification on CLM-003 property documents", time: "07:00 AM", own: false },
      { id: "2", sender: "You", text: "What specifically needs clarification?", time: "07:15 AM", own: true },
      { id: "3", sender: "Sneha Gupta", text: "The property valuation report seems outdated — it's from 2023", time: "07:18 AM", own: false },
    ],
  },
  {
    id: "5", name: "Vikram Singh", avatar: "VS",
    lastMsg: "Payment query for CLM-004", time: "5 hrs", unread: 0,
    messages: [
      { id: "1", sender: "Vikram Singh", text: "The customer is asking about payment status for CLM-004", time: "06:00 AM", own: false },
    ],
  },
];

const MessagesPage = () => {
  const [conversations, setConversations] = useState(initialConversations);
  const [selected, setSelected] = useState("1");
  const [msg, setMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === selected)!;

  const filteredConversations = conversations.filter(
    (c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages.length]);

  const handleSend = () => {
    if (!msg.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "You",
      text: msg,
      time,
      own: true,
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selected
          ? { ...c, messages: [...c.messages, newMessage], lastMsg: msg, time: "now", unread: 0 }
          : c
      )
    );
    setMsg("");

    // Simulate reply after 1.5s
    setTimeout(() => {
      const replies = [
        "Got it, I'll look into it right away.",
        "Thanks for the update! Will proceed accordingly.",
        "Understood. I'll send the documents shortly.",
        "Sure, let me check and confirm.",
        "Noted. Will update you soon.",
      ];
      const replyText = replies[Math.floor(Math.random() * replies.length)];
      const replyTime = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        sender: activeConversation.name,
        text: replyText,
        time: replyTime,
        own: false,
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selected
            ? { ...c, messages: [...c.messages, reply], lastMsg: replyText, time: "now" }
            : c
        )
      );
    }, 1500);
  };

  const handleSelectConversation = (id: string) => {
    setSelected(id);
    // Mark as read
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout title="Messages">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-10rem)]">
        <Card className="lg:col-span-1 overflow-hidden flex flex-col">
          <CardHeader className="pb-3 shrink-0">
            <CardTitle className="text-base">Conversations</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-8 text-xs" />
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-auto flex-1">
            {filteredConversations.map((c) => (
              <div key={c.id} onClick={() => handleSelectConversation(c.id)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${selected === c.id ? "bg-primary/5 border-l-2 border-primary" : "hover:bg-muted/30"}`}>
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-card-foreground truncate">{c.name}</p>
                    <span className="text-xs text-muted-foreground">{c.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{c.lastMsg}</p>
                </div>
                {c.unread > 0 && (
                  <span className="h-5 w-5 rounded-full gradient-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {c.unread}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 border-b shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                {activeConversation.avatar}
              </div>
              <div>
                <CardTitle className="text-base">{activeConversation.name}</CardTitle>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4 space-y-3">
            {activeConversation.messages.map((m) => (
              <div key={m.id} className={`flex ${m.own ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${m.own ? "gradient-primary text-primary-foreground rounded-br-md" : "bg-muted text-card-foreground rounded-bl-md"}`}>
                  <p>{m.text}</p>
                  <p className={`text-[10px] mt-1 ${m.own ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.time}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>
          <div className="p-4 border-t shrink-0">
            <div className="flex gap-2">
              <Button size="icon" variant="outline"><Paperclip className="h-4 w-4" /></Button>
              <Input placeholder="Type a message..." value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={handleKeyDown} className="flex-1" />
              <Button size="icon" onClick={handleSend} disabled={!msg.trim()}><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MessagesPage;
