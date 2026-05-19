import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { AppShell, PageHeader, StatusBadge } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supportApi, type Ticket, type Message } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { MessageCircle, Plus, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Support — MediClaim" }] }),
  component: () => <AppShell><SupportPage /></AppShell>,
});

function SupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [active, setActive] = useState<Ticket | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState("");
  const [issue, setIssue] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  const loadTickets = useCallback(async () => {
    const data = await supportApi.listTickets();
    setTickets(data);
    if (data.length && !active) setActive(data[0]);
  }, [active]);

  const loadMsgs = useCallback(async (ticketId: string) => {
    const data = await supportApi.listMessages(ticketId);
    setMsgs(data);
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);
  useEffect(() => { if (active) loadMsgs(active.id); }, [active, loadMsgs]);

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const ticket = await supportApi.createTicket(subject, issue);
      setSubject(""); setIssue(""); setShowNew(false);
      toast.success("Ticket created");
      setActive(ticket);
      loadTickets();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const sendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !reply.trim()) return;
    try {
      await supportApi.sendMessage(active.id, reply);
      setReply("");
      loadMsgs(active.id);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <>
      <PageHeader title="Customer support" subtitle="Raise tickets and chat with our team."
        actions={<Button onClick={() => setShowNew(true)}><Plus className="h-4 w-4 mr-2" />New ticket</Button>}
      />
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-3 shadow-[var(--shadow-card)] md:max-h-[70vh] md:overflow-auto">
          {tickets.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No tickets yet.</p>
          ) : (
            <ul className="space-y-1">
              {tickets.map((t) => (
                <li key={t.id}>
                  <button onClick={() => setActive(t)} className={`w-full text-left p-3 rounded-lg transition-colors ${active?.id === t.id ? "bg-primary-soft" : "hover:bg-muted"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{t.subject}</p>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{t.issue}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="md:col-span-2 p-0 shadow-[var(--shadow-card)] flex flex-col md:max-h-[70vh]">
          {showNew ? (
            <form onSubmit={createTicket} className="p-6 space-y-3">
              <h3 className="font-semibold">New support ticket</h3>
              <div className="space-y-2"><Label>Subject</Label><Input required value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
              <div className="space-y-2"><Label>Describe your issue</Label><Textarea required rows={5} value={issue} onChange={(e) => setIssue(e.target.value)} /></div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
                <Button type="submit" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Create</Button>
              </div>
            </form>
          ) : !active ? (
            <div className="flex-1 grid place-items-center p-12 text-center text-sm text-muted-foreground">
              <div><MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />Select a ticket or create a new one.</div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-border">
                <p className="font-semibold">{active.subject}</p>
                <p className="text-xs text-muted-foreground">{active.issue}</p>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-3 bg-muted/30">
                {msgs.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-8">No messages yet — say hi 👋</p>
                ) : msgs.map((m) => {
                  const mine = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"}`}>
                        {m.message}
                        <p className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{new Date(m.sent_at).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={sendMsg} className="p-3 border-t border-border flex gap-2">
                <Input placeholder="Type your message…" value={reply} onChange={(e) => setReply(e.target.value)} />
                <Button type="submit"><Send className="h-4 w-4" /></Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
