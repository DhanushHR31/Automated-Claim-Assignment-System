import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { useProfile, useUpdateProfile, useKYCDocuments } from "@/hooks/useFastAPIData";

interface KYCDoc {
  document_type: string;
  verification_status: string;
  notes: string | null;
}

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: kycDocsList } = useKYCDocuments();
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [kycDocs, setKycDocs] = useState<KYCDoc[]>([]);
  const [kycData, setKycData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setDob(profile.date_of_birth || "");
    }
  }, [profile]);

  useEffect(() => {
    if (kycDocsList) {
      setKycDocs(kycDocsList);
      const extracted: Record<string, any> = {};
      kycDocsList.forEach((d: any) => { 
        if (d.notes) {
          try { extracted[d.document_type] = JSON.parse(d.notes); } catch {} 
        }
      });
      setKycData(extracted);
    }
  }, [kycDocsList]);

  const initials = (fullName || user?.email || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateProfile.mutateAsync({ full_name: fullName, phone, date_of_birth: dob || null });
      toast({ title: "Saved!", description: "Profile updated successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const aadhaar = kycData.aadhaar || {};
  const pan = kycData.pan || {};
  const bank = kycData.bank_details || {};
  const verifiedCount = kycDocs.filter((d) => d.verification_status === "verified").length;
  const totalDocs = kycDocs.length;

  const statusIcon = (s: string) => {
    if (s === "verified") return <CheckCircle className="w-3.5 h-3.5 text-success" />;
    if (s === "rejected") return <XCircle className="w-3.5 h-3.5 text-destructive" />;
    return <Clock className="w-3.5 h-3.5 text-warning" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div><h1 className="text-2xl font-bold text-foreground">Settings</h1><p className="text-sm text-muted-foreground mt-1">Manage your account and view KYC details</p></div>

        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16"><AvatarFallback className="gradient-primary text-primary-foreground text-lg font-semibold">{initials}</AvatarFallback></Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{fullName || "Set your name"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Full Name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={user?.email || ""} disabled /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" /></div>
              <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></div>
            </div>
            <Button onClick={handleSave} disabled={updateProfile.isPending} className="gradient-primary text-primary-foreground">{updateProfile.isPending ? "Saving..." : "Save Changes"}</Button>
          </CardContent>
        </Card>

        {/* KYC Summary */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" /> KYC Details</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate("/kyc")}>Manage KYC</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className={totalDocs >= 5 ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}>
                {totalDocs}/5 Documents
              </Badge>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{verifiedCount} Verified</Badge>
            </div>

            {/* Document Status List */}
            <div className="space-y-2">
              {["aadhaar", "pan", "income_certificate", "ration_card", "bank_details"].map((type) => {
                const doc = kycDocs.find((d) => d.document_type === type);
                const label = type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                return (
                  <div key={type} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>{label}</span>
                    </div>
                    {doc ? (
                      <div className="flex items-center gap-1">{statusIcon(doc.verification_status)}<span className="text-xs capitalize">{doc.verification_status}</span></div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not uploaded</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Extracted Key Info */}
            {(aadhaar.full_name || pan.pan_number || bank.account_number) && (
              <div className="border-t pt-4 space-y-2">
                <p className="text-xs font-semibold text-foreground">Extracted Information</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {aadhaar.full_name && <div><span className="text-muted-foreground">Name</span><p className="font-medium">{aadhaar.full_name}</p></div>}
                  {aadhaar.gender && <div><span className="text-muted-foreground">Gender</span><p className="font-medium">{aadhaar.gender}</p></div>}
                  {aadhaar.date_of_birth && <div><span className="text-muted-foreground">DOB</span><p className="font-medium">{aadhaar.date_of_birth}</p></div>}
                  {pan.pan_number && <div><span className="text-muted-foreground">PAN</span><p className="font-medium">{pan.pan_number}</p></div>}
                  {bank.bank_name && <div><span className="text-muted-foreground">Bank</span><p className="font-medium">{bank.bank_name}</p></div>}
                  {bank.account_number && <div><span className="text-muted-foreground">Account</span><p className="font-medium">{bank.account_number}</p></div>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Policy Expiry Reminders", desc: "Get notified before policies expire", checked: true },
              { label: "Claim Status Updates", desc: "Track claim progress", checked: true },
              { label: "New Plan Recommendations", desc: "AI-powered plan suggestions", checked: false },
              { label: "Payment Reminders", desc: "Premium due date alerts", checked: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div><p className="text-sm font-medium text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                <Switch defaultChecked={item.checked} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
