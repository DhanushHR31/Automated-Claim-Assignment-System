import { useState, useRef, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, Check, MessageCircle, FileText, AlertTriangle, Send, X, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notifications as initialNotifications, mockAgents } from "@/lib/mockData";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const { managerProfile, user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifs, setNotifs] = useState(initialNotifications);
  const [chatAgent, setChatAgent] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Record<string, { sender: string; text: string; time: string }[]>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const initials = (managerProfile?.full_name || user?.email || "M")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const unreadCount = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markRead = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotifClick = (notif: typeof notifs[0]) => {
    markRead(notif.id);
    if (notif.type === "message" && notif.agentId) {
      setChatAgent(notif.agentId);
      setShowNotifications(false);
    }
  };

  const getNotifIcon = (type: string) => {
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
      const replies = ["Noted sir, will update.", "On it!", "Understood, will send update shortly.", "Yes sir, completing now."];
      setChatMessages(prev => {
        const copy = { ...prev };
        if (!copy[chatAgent!]) copy[chatAgent!] = [];
        copy[chatAgent!] = [...copy[chatAgent!], {
          sender: "agent",
          text: replies[Math.floor(Math.random() * replies.length)],
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }];
        return copy;
      });
    }, 1500);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b bg-card px-4 lg:px-6 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold text-card-foreground">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <div className="relative" ref={dropdownRef}>
                <Button variant="ghost" size="icon" className="relative" onClick={() => setShowNotifications(!showNotifications)}>
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full gradient-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 w-96 bg-card border rounded-xl shadow-2xl z-50 animate-in slide-in-from-top-2 fade-in">
                    <div className="flex items-center justify-between p-4 border-b">
                      <h3 className="font-semibold text-card-foreground text-sm">Notifications</h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
                            <Check className="h-3 w-3 mr-1" />Mark all read
                          </Button>
                        )}
                      </div>
                    </div>
                    <ScrollArea className="max-h-96">
                      <div className="p-2">
                        {notifs.map(n => (
                          <div
                            key={n.id}
                            onClick={() => handleNotifClick(n)}
                            className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${!n.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/40"}`}
                          >
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${!n.read ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                              {getNotifIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm truncate ${!n.read ? "font-semibold text-card-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                                {!n.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                            </div>
                            {n.type === "message" && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs shrink-0" onClick={(e) => { e.stopPropagation(); handleNotifClick(n); }}>
                                Reply
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pl-2 border-l">
                <div className="hidden sm:flex flex-col items-end leading-tight">
                  <span className="text-xs font-medium text-card-foreground truncate max-w-[140px]">
                    {managerProfile?.full_name || "Manager"}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {managerProfile?.employee_id || "—"}
                  </span>
                </div>
                <div className="relative" ref={profileRef}>
                  <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="cursor-pointer hover:opacity-80 transition-opacity">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={managerProfile?.avatar_url || undefined} alt={managerProfile?.full_name || "Manager"} />
                      <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 top-10 w-48 bg-card border rounded-lg shadow-lg z-40 animate-in fade-in slide-in-from-top-2">
                      <div className="p-3 border-b">
                        <p className="text-xs font-semibold text-card-foreground">{managerProfile?.full_name || "Manager"}</p>
                        <p className="text-xs text-muted-foreground">{user?.role}</p>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={() => {
                            navigate("/settings");
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-card-foreground hover:bg-muted rounded transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </button>
                        <button
                          onClick={() => {
                            logout();
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
        </div>
      </div>

      {/* Global Chat Popup from Notification */}
      {chatAgent && chatAgentData && (
        <div className="fixed bottom-4 right-4 w-80 bg-card border rounded-xl shadow-2xl z-50 animate-in slide-in-from-bottom-2 fade-in overflow-hidden">
          <div className="flex items-center gap-3 p-3 border-b bg-primary/5">
            <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
              {chatAgentData.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-card-foreground text-sm truncate">{chatAgentData.name}</h4>
              <StatusBadge status={chatAgentData.status} />
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setChatAgent(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="h-56 p-3">
            <div className="space-y-2">
              {(chatMessages[chatAgent] || []).length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-6">Start chatting with {chatAgentData.name}</p>
              )}
              {(chatMessages[chatAgent] || []).map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === "manager" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-1.5 text-xs ${msg.sender === "manager" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-card-foreground rounded-bl-sm"}`}>
                    <p>{msg.text}</p>
                    <p className={`text-[9px] mt-0.5 ${msg.sender === "manager" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t p-2 flex gap-1.5">
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
              placeholder="Type message..."
              className="flex-1 h-8 text-xs"
            />
            <Button size="sm" onClick={sendChatMessage} className="h-8 px-2.5"><Send className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
};

export default DashboardLayout;
