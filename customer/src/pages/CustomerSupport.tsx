import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Phone, Mail, MessageCircle, HelpCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const faqs = [
  { q: "How to file a claim?", a: "Go to Claims → File New Claim. Upload required documents and submit." },
  { q: "How to renew policy?", a: "Visit My Policies, find your policy, and click Renew before expiry." },
  { q: "What is KYC?", a: "KYC (Know Your Customer) verification is required for policy purchases. Upload Aadhaar, PAN, and other documents in Settings → KYC." },
  { q: "How to track claim status?", a: "Go to Claims page to see all your claims with real-time status updates." },
  { q: "How to cancel a policy?", a: "Contact support or visit My Policies to request cancellation within the free-look period." },
];

const CustomerSupport = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your InsureHub AI assistant. How can I help you today? You can ask about policies, claims, KYC, or any insurance-related questions." },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const getAIResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase();
    if (lower.includes("claim")) return "To file a claim:\n1. Go to the Claims page\n2. Click 'File New Claim'\n3. Select the policy\n4. Upload supporting documents\n5. Submit your claim\n\nYour claim will be reviewed within 3-5 business days. An agent will be assigned to assist you.";
    if (lower.includes("kyc") || lower.includes("document")) return "For KYC verification:\n1. Go to Settings → KYC\n2. Upload your Aadhaar Card, PAN Card, Income Certificate, Ration Card, and Bank Details\n3. Enter document numbers\n4. Wait for verification (usually 24-48 hours)\n\nAll 5 documents are required for full KYC completion.";
    if (lower.includes("policy") || lower.includes("insurance")) return "You can manage your policies from the 'My Policies' page. To buy new insurance, visit 'Buy Insurance' and choose from Health, Life, Vehicle, Home, Travel, or Business categories. Each plan comes with detailed features and coverage information.";
    if (lower.includes("payment") || lower.includes("premium")) return "We support UPI, Credit/Debit Cards, and Net Banking. You can also enable auto-payment for hassle-free monthly premium payments. Visit your policy details to manage payment settings.";
    if (lower.includes("cancel")) return "You can cancel a policy within the 15-day free-look period for a full refund. After that, cancellation charges may apply. Please visit My Policies or contact our team for assistance.";
    if (lower.includes("renew")) return "To renew a policy:\n1. Go to My Policies\n2. Find the policy expiring soon\n3. Click 'Renew'\n4. Review and pay\n\nWe'll send you reminders before your policy expires.";
    if (lower.includes("agent")) return "An agent is automatically assigned when you file a claim. You can chat with your assigned agent from the Claims page. They can also share their live location for on-site assistance.";
    if (lower.includes("hello") || lower.includes("hi")) return `Hello ${user?.user_metadata?.full_name || "there"}! How can I help you with your insurance needs today?`;
    return "I can help you with:\n• Filing and tracking claims\n• Buying or renewing insurance\n• KYC document verification\n• Payment and premium queries\n• Policy details and benefits\n\nPlease ask a specific question and I'll be happy to assist!";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getAIResponse(input);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customer Support</h1>
          <p className="text-sm text-muted-foreground mt-1">Get help with your insurance queries</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat */}
          <div className="lg:col-span-2">
            <Card className="shadow-card border-0 flex flex-col" style={{ height: "500px" }}>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">AI Assistant</CardTitle>
                    <p className="text-xs text-success flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" /> Online
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${msg.role === "user" ? "gradient-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                      {msg.content}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <div className="p-4 border-t">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                  <Input placeholder="Ask anything about insurance..." value={input} onChange={(e) => setInput(e.target.value)} className="flex-1" />
                  <Button type="submit" size="icon" className="gradient-primary text-primary-foreground" disabled={!input.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          {/* FAQ & Contact */}
          <div className="space-y-4">
            <Card className="shadow-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Quick Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {faqs.map((faq) => (
                  <button key={faq.q} className="w-full text-left text-sm p-2.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" onClick={() => { setInput(faq.q); }}>
                    {faq.q}
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">1800-123-4567 (Toll Free)</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">support@insurehub.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">WhatsApp: +91 98765 43210</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerSupport;
