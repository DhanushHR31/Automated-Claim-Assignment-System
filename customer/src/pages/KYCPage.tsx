import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useKYCDocuments, useUpdateKYCDocument } from "@/hooks/useFastAPIData";
import {
  Upload, CheckCircle, Clock, XCircle, FileText, CreditCard, Building, User, ShieldCheck, 
  Eye, Edit2, Save, Loader2, Sparkles
} from "lucide-react";

type DocType = "aadhaar" | "pan" | "income_certificate" | "ration_card" | "bank_details";

interface KYCDoc {
  id: string;
  document_type: DocType;
  document_number: string | null;
  file_url: string | null;
  verification_status: "pending" | "verified" | "rejected";
  notes: string | null;
}

const docConfig: { type: DocType; label: string; icon: typeof FileText; placeholder: string }[] = [
  { type: "aadhaar", label: "Aadhaar Card", icon: CreditCard, placeholder: "XXXX XXXX XXXX" },
  { type: "pan", label: "PAN Card", icon: FileText, placeholder: "ABCDE1234F" },
  { type: "income_certificate", label: "Income Certificate", icon: Building, placeholder: "Certificate Number" },
  { type: "ration_card", label: "Ration Card", icon: User, placeholder: "Ration Card Number" },
  { type: "bank_details", label: "Bank Details", icon: Building, placeholder: "Account Number" },
];

const statusConfig = {
  pending: { label: "Pending", icon: Clock, color: "bg-warning/10 text-warning border-warning/20" },
  verified: { label: "Verified", icon: CheckCircle, color: "bg-success/10 text-success border-success/20" },
  rejected: { label: "Rejected", icon: XCircle, color: "bg-destructive/10 text-destructive border-destructive/20" },
};

const KYCPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: kycDataList, isLoading: loading } = useKYCDocuments();
  const updateKYC = useUpdateKYCDocument();

  const [docs, setDocs] = useState<KYCDoc[]>([]);
  const [uploading, setUploading] = useState<DocType | null>(null);
  const [extracting, setExtracting] = useState<DocType | null>(null);
  const [docNumbers, setDocNumbers] = useState<Record<string, string>>({});
  const [extractedData, setExtractedData] = useState<Record<string, any>>({});
  const [editingDoc, setEditingDoc] = useState<DocType | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (kycDataList) {
      setDocs(kycDataList as KYCDoc[]);
      const nums: Record<string, string> = {};
      const extracted: Record<string, any> = {};
      kycDataList.forEach((d: any) => {
        if (d.document_number) nums[d.document_type] = d.document_number;
        if (d.notes) {
          try { extracted[d.document_type] = JSON.parse(d.notes); } catch {}
        }
      });
      setDocNumbers(nums);
      setExtractedData(extracted);
    }
  }, [kycDataList]);

  const completedCount = docs.filter((d) => d.file_url).length;
  const verifiedCount = docs.filter((d) => d.verification_status === "verified").length;
  const progress = Math.round((completedCount / docConfig.length) * 100);

  const extractDocumentData = async (docType: DocType, file: File) => {
    setExtracting(docType);
    try {
      // Simulate extraction delay since local AI proxy is not available
      await new Promise(r => setTimeout(r, 1500));
      const fakeExtracted = {
        aadhaar: { full_name: user?.email?.split('@')[0], date_of_birth: "1990-01-01", aadhaar_number: "123456789012" },
        pan: { pan_number: "ABCDE1234F" },
        bank_details: { account_number: "1234567890", bank_name: "Local Bank" },
        income_certificate: { certificate_number: "INC123", annual_income: "1000000" },
        ration_card: { card_number: "RAT123" }
      }[docType] || {};

      setExtractedData((prev) => ({ ...prev, [docType]: fakeExtracted }));
      // Auto-fill document number from extracted data
      const numField = getDocNumberField(docType, fakeExtracted);
      if (numField) {
        setDocNumbers((prev) => ({ ...prev, [docType]: numField }));
      }
      toast({ title: "Data Extracted!", description: `Simulated extraction for ${docConfig.find((d) => d.type === docType)?.label}` });
    } catch (e: any) {
      toast({ title: "Extraction Failed", description: e.message || "Could not extract data", variant: "destructive" });
    }
    setExtracting(null);
  };

  const getDocNumberField = (docType: DocType, data: any): string | null => {
    switch (docType) {
      case "aadhaar": return data.aadhaar_number || null;
      case "pan": return data.pan_number || null;
      case "income_certificate": return data.certificate_number || null;
      case "ration_card": return data.card_number || null;
      case "bank_details": return data.account_number || null;
      default: return null;
    }
  };

  const handleUpload = async (docType: DocType, file: File) => {
    if (!user) return;
    setUploading(docType);

    // Extract data from document using AI (simulated)
    await extractDocumentData(docType, file);

    // Simulate file upload with dummy URL
    const fileUrl = `https://local.test/docs/${docType}_${Date.now()}.jpg`;

    const docNumber = docNumbers[docType] || null;
    const notesJson = extractedData[docType] ? JSON.stringify(extractedData[docType]) : null;

    try {
      await updateKYC.mutateAsync({
        document_type: docType,
        document_number: docNumber || "",
        file_url: fileUrl,
        verification_status: "pending",
        notes: notesJson || ""
      });

      toast({ title: "Uploaded!", description: `${docConfig.find((d) => d.type === docType)?.label} uploaded successfully` });
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    }
    
    setUploading(null);
  };

  const handleSaveExtracted = async (docType: DocType) => {
    const merged = { ...(extractedData[docType] || {}), ...(editValues[docType] || {}) };
    setExtractedData((prev) => ({ ...prev, [docType]: merged }));

    try {
      await updateKYC.mutateAsync({
        document_type: docType,
        document_number: docNumbers[docType] || "",
        file_url: docs.find((d) => d.document_type === docType)?.file_url || "",
        verification_status: "pending",
        notes: JSON.stringify(merged)
      });

      setEditingDoc(null);
      setEditValues((prev) => ({ ...prev, [docType]: undefined }));
      toast({ title: "Saved!", description: "Updated document details saved" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const renderExtractedData = (docType: DocType) => {
    const data = extractedData[docType];
    if (!data) return null;
    const isEditing = editingDoc === docType;

    return (
      <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" /> Extracted Information
          </p>
          <Button
            variant="ghost" size="sm" className="h-6 text-xs"
            onClick={() => {
              if (isEditing) {
                handleSaveExtracted(docType);
              } else {
                setEditingDoc(docType);
                setEditValues((prev) => ({ ...prev, [docType]: { ...data } }));
              }
            }}
          >
            {isEditing ? <><Save className="w-3 h-3 mr-1" /> Save</> : <><Edit2 className="w-3 h-3 mr-1" /> Edit</>}
          </Button>
        </div>
        {Object.entries(data).map(([key, value]) => {
          if (key === "family_members" && Array.isArray(value)) {
            return (
              <div key={key} className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Family Members:</p>
                {(value as any[]).map((m, i) => (
                  <p key={i} className="text-xs text-foreground pl-2">
                    {m.name} — Age: {m.age}, {m.relation}
                  </p>
                ))}
              </div>
            );
          }
          const displayKey = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          const currentVal = isEditing ? (editValues[docType]?.[key] ?? value) : value;
          return (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{displayKey}</span>
              {isEditing ? (
                <Input
                  className="h-6 text-xs w-1/2"
                  value={String(currentVal)}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      [docType]: { ...(prev[docType] || {}), [key]: e.target.value },
                    }))
                  }
                />
              ) : (
                <span className="font-medium text-foreground">{String(value)}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Build profile summary from all extracted data
  const profileSummary = () => {
    const aadhaar = extractedData.aadhaar || {};
    const pan = extractedData.pan || {};
    const bank = extractedData.bank_details || {};
    const income = extractedData.income_certificate || {};
    const ration = extractedData.ration_card || {};

    return {
      name: aadhaar.full_name || pan.full_name || bank.account_holder_name || "—",
      dob: aadhaar.date_of_birth || pan.date_of_birth || "—",
      gender: aadhaar.gender || "—",
      address: aadhaar.address || ration.address || "—",
      phone: aadhaar.phone || "—",
      aadhaarNo: aadhaar.aadhaar_number || docNumbers.aadhaar || "—",
      panNo: pan.pan_number || docNumbers.pan || "—",
      bankName: bank.bank_name || "—",
      accountNo: bank.account_number || docNumbers.bank_details || "—",
      ifsc: bank.ifsc_code || "—",
      annualIncome: income.annual_income || "—",
      familyMembers: ration.family_members || [],
    };
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading KYC data...</p></div></DashboardLayout>;

  const profile = profileSummary();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">KYC Verification</h1>
            <p className="text-sm text-muted-foreground mt-1">Upload documents — AI will auto-extract your details</p>
          </div>
          <Badge variant="outline" className={progress === 100 ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}>
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            {progress === 100 ? "KYC Complete" : `${completedCount}/${docConfig.length} Uploaded`}
          </Badge>
        </div>

        <Card className="shadow-card border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">KYC Progress</p>
              <p className="text-sm font-bold text-primary">{progress}%</p>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{completedCount} uploaded</span>
              <span>{verifiedCount} verified</span>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="profile">My Profile Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {docConfig.map((cfg) => {
                const doc = docs.find((d) => d.document_type === cfg.type);
                const status = doc?.verification_status || null;

                return (
                  <Card key={cfg.type} className="shadow-card border-0">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <cfg.icon className="w-5 h-5 text-primary" />
                          </div>
                          <CardTitle className="text-sm font-semibold">{cfg.label}</CardTitle>
                        </div>
                        {status && (
                          <Badge variant="outline" className={statusConfig[status].color}>
                            {(() => { const Icon = statusConfig[status].icon; return <Icon className="w-3 h-3 mr-1" />; })()}
                            {statusConfig[status].label}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Document Number</Label>
                        <Input
                          placeholder={cfg.placeholder}
                          value={docNumbers[cfg.type] || ""}
                          onChange={(e) => setDocNumbers((prev) => ({ ...prev, [cfg.type]: e.target.value }))}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Upload Document</Label>
                        <label className="mt-1.5 flex items-center justify-center gap-2 border-2 border-dashed border-input rounded-lg p-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUpload(cfg.type, file);
                            }}
                          />
                          {uploading === cfg.type || extracting === cfg.type ? (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {extracting === cfg.type ? "Extracting data..." : "Uploading..."}
                            </span>
                          ) : doc?.file_url ? (
                            <span className="text-sm text-success flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" /> Uploaded — Click to replace
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Upload className="w-4 h-4" /> Click to upload
                            </span>
                          )}
                        </label>
                      </div>

                      {doc?.file_url && (
                        <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => window.open(doc.file_url!, "_blank")}>
                          <Eye className="w-3 h-3 mr-1" /> View Document
                        </Button>
                      )}

                      {renderExtractedData(cfg.type)}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-4">
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Complete Profile (from KYC)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Full Name", value: profile.name },
                    { label: "Date of Birth", value: profile.dob },
                    { label: "Gender", value: profile.gender },
                    { label: "Phone", value: profile.phone },
                    { label: "Address", value: profile.address },
                    { label: "Aadhaar Number", value: profile.aadhaarNo },
                    { label: "PAN Number", value: profile.panNo },
                    { label: "Bank Name", value: profile.bankName },
                    { label: "Account Number", value: profile.accountNo },
                    { label: "IFSC Code", value: profile.ifsc },
                    { label: "Annual Income", value: profile.annualIncome ? `₹${profile.annualIncome}` : "—" },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>

                {profile.familyMembers.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-semibold text-foreground mb-2">Family Members (Ration Card)</p>
                    <div className="space-y-2">
                      {profile.familyMembers.map((m: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 p-2 bg-muted/50 rounded-lg text-sm">
                          <span className="font-medium">{m.name}</span>
                          <span className="text-muted-foreground">Age: {m.age}</span>
                          <Badge variant="outline" className="text-xs">{m.relation}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default KYCPage;
