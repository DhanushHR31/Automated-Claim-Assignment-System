import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { notifications as initialNotifications, mockAgents } from "@/lib/mockData";
import { Bell, Check, Trash2, MessageCircle, FileText, AlertTriangle, Send, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StatusBadge from "@/components/StatusBadge";

const NotificationsPage = () => {
  const [notifs, setNotifs] = useState(initialNotifications);
  const [chatAgent, setChatAgent] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Record<string, { sender: string; text: string; time: string }[]>>({});
  const { toast } = useToast();

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => { setNotifs(prev => prev.map(n => ({ ...n, read: true }))); toast({ title: "All Marked Read" }); };
  const deleteNotif = (id: string) => { setNotifs(prev => prev.filter(n => n.id !== id)); toast({ title: "Deleted" }); };

  const handleNotifClick = (notif: typeof notifs[0]) => {
    markRead(notif.id);
    if (notif.type === "message" && notif.agentId) {
      setChatAgent(notif.agentId);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "message": return <MessageCircle className="h-4 w-4" />;
      case "claim": return <FileText className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const chatAgentData = mockAgents.find(a => a.id === chatAgent);

  const sendChatMessage = () => {
    if (!chatMessage.trim() || !chatAgent) return;
    setChatMessages(prev => {
      const copy = { ...prev };
      if (!copy[chatAgent]) copy[chatAgent] = [];
      copy[chatAgent] = [...copy[chatAgent], { sender: "manager", text: chatMessage, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }];
      return copy;
    });
    setChatMessage("");
    setTimeout(() => {
      const replies = ["Noted sir.", "Will update shortly.", "On it!", "Understood."];
      setChatMessages(prev => {
        const copy = { ...prev };
        if (!copy[chatAgent!]) copy[chatAgent!] = [];
        copy[chatAgent!] = [...copy[chatAgent!], { sender: "agent", text: replies[Math.floor(Math.random() * replies.length)], time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }];
        return copy;
      });
    }, 1500);
  };

  return (
    <DashboardLayout title="Notifications">
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{unreadCount} unread notifications</p>
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
            <Check className="h-4 w-4 mr-1" />Mark all read
          </Button>
        </div>
        {notifs.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No notifications</CardContent></Card>
        ) : (
          notifs.map((n) => (
            <Card key={n.id} className={`transition-all ${n.read ? "opacity-60" : "border-primary/20"}`}>
              <CardContent className="flex items-start gap-4 p-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${!n.read ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 cursor-pointer" onClick={() => handleNotifClick(n)}>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${!n.read ? "font-semibold text-card-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                  {n.type === "message" && (
                    <Button variant="outline" size="sm" className="mt-2 h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleNotifClick(n); }}>
                      <MessageCircle className="h-3 w-3 mr-1" />Reply to Agent
                    </Button>
                  )}
                </div>
                <div className="flex gap-1">
                  {!n.read && <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => markRead(n.id)}><Check className="h-4 w-4" /></Button>}
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteNotif(n.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Chat Popup Dialog */}
      <Dialog open={!!chatAgent} onOpenChange={() => setChatAgent(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          {chatAgentData && (
            <>
              <div className="flex items-center gap-3 p-4 border-b bg-primary/5">
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {chatAgentData.avatar}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-card-foreground text-sm">{chatAgentData.name}</h4>
                  <StatusBadge status={chatAgentData.status} />
                </div>
              </div>
              <ScrollArea className="h-64 p-4">
                <div className="space-y-3">
                  {(chatMessages[chatAgent!] || []).length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-8">Start chatting with {chatAgentData.name}</p>
                  )}
                  {(chatMessages[chatAgent!] || []).map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === "manager" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${msg.sender === "manager" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-card-foreground rounded-bl-sm"}`}>
                        <p>{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${msg.sender === "manager" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="border-t p-3 flex gap-2">
                <Input value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChatMessage()} placeholder="Type message..." className="flex-1 h-9 text-sm" />
                <Button size="sm" onClick={sendChatMessage} className="h-9 px-3"><Send className="h-4 w-4" /></Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default NotificationsPage;
