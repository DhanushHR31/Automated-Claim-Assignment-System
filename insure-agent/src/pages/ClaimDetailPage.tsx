import { useParams, useNavigate } from "react-router-dom";
import { useClaims, getClaimTypeIcon } from "@/hooks/useClaims";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Phone, MapPin, Clock, Navigation, FileText, Camera, Upload,
  CheckCircle2, XCircle, MessageSquare, Send
} from "lucide-react";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';

export default function ClaimDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { claims, loading, acceptClaim, updateClaimStatus, rejectClaim, uploadDocument, fetchDocuments } = useClaims();
  const claim = claims.find((c) => c.id === id || c.claim_number === id);
  const [claimMsg, setClaimMsg] = useState("");
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!claim || !user) return;
    const load = async () => {
      const docs = await fetchDocuments(claim.id);
      setUploadedDocs(docs);
    };
    load();
  }, [claim, user, fetchDocuments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">Claim not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/claims")}>
            Back to Claims
          </Button>
        </div>
      </div>
    );
  }

  const isEmergency = claim.priority.toLowerCase() === "emergency" || claim.priority.toLowerCase() === "high";
  const currentStatus = claim.status;

  const handleAccept = async () => {
    await acceptClaim(claim.id);
  };

  const handleReject = async () => {
    await rejectClaim(claim.id);
    navigate("/claims");
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${claim.location_lat},${claim.location_lng}&travelmode=driving`;
    window.open(url, "_blank");
    toast.success("Opening Google Maps navigation...");
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user || !claim) return;

    for (const file of Array.from(files)) {
      await uploadDocument(claim.id, file);
    }

    const docs = await fetchDocuments(claim.id);
    setUploadedDocs(docs);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleStatusAdvance = async (newStatus: string) => {
    await updateClaimStatus(claim.id, newStatus);
  };

  const handleFinalSubmit = async () => {
    await updateClaimStatus(claim.id, "submitted");
  };

  const statusSteps = ["assigned", "accepted", "in_progress", "documents_uploaded", "submitted", "approved", "completed"];
  const statusLabels: Record<string, string> = {
    assigned: "Assigned",
    accepted: "Accepted",
    in_progress: "In Progress",
    documents_uploaded: "Documents Uploaded",
    submitted: "Submitted",
    approved: "Approved",
    completed: "Completed",
  };
  const currentStepIndex = statusSteps.indexOf(currentStatus);

  return (
    <div className="animate-slide-up max-w-5xl mx-auto">
      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleFileUpload} />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getClaimTypeIcon(claim.claim_type)}</span>
            <h1 className="text-2xl font-bold">{claim.claim_number}</h1>
          </div>
          <Badge variant={isEmergency ? "destructive" : "outline"} className="text-xs font-semibold">
            {isEmergency && "🚨 "}{claim.priority}
          </Badge>
        </div>

        {currentStatus === "assigned" && (
          <div className="flex gap-3">
            <Button onClick={handleAccept} className="bg-success hover:bg-success/90 text-success-foreground">
              <CheckCircle2 className="h-4 w-4 mr-2" /> Accept Claim
            </Button>
            <Button onClick={handleReject} variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
              <XCircle className="h-4 w-4 mr-2" /> Reject
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Customer Info */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-base font-semibold mb-4">Customer Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Name", value: claim.customer_name },
                { label: "Phone", value: claim.customer_phone, isPhone: true },
                { label: "Policy No.", value: claim.policy_number },
                { label: "Claim Amount", value: `₹${claim.claim_amount.toLocaleString()}`, isMoney: true },
                { label: "District", value: claim.district },
                { label: "Type", value: claim.claim_type },
              ].map(({ label, value, isPhone, isMoney }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  {isPhone ? (
                    <a href={`tel:${value}`} className="font-medium text-primary flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {value}
                    </a>
                  ) : (
                    <span className={`font-medium ${isMoney ? "text-foreground" : ""}`}>{value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-base font-semibold mb-2">Incident Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{claim.incident_description || "No description provided."}</p>
          </div>

          {/* Location & Navigation */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-base font-semibold mb-3">Location</h3>
            <div className="flex items-start gap-2 mb-3">
              <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">{claim.location_address}</p>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {claim.location_lat.toFixed(4)}, {claim.location_lng.toFixed(4)}
              </span>
            </div>

            <div className="rounded-lg bg-muted h-40 flex items-center justify-center mb-3 border border-border overflow-hidden">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-1 opacity-50" />
                <p className="text-xs text-muted-foreground">📍 {claim.location_lat.toFixed(4)}, {claim.location_lng.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">{claim.district}</p>
              </div>
            </div>

            <Button onClick={handleNavigate} className="w-full" disabled={currentStatus === "assigned"}>
              <Navigation className="h-4 w-4 mr-2" /> Navigate with Google Maps
            </Button>
            {currentStatus === "assigned" && (
              <p className="text-xs text-muted-foreground text-center mt-2">Accept the claim first to start navigation</p>
            )}
          </div>

          {/* Documents */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Documents & Evidence</h3>
              <Button onClick={handleUploadClick} size="sm" variant="outline" disabled={currentStatus === "assigned"}>
                <Camera className="h-4 w-4 mr-2" /> Upload Photos/Docs
              </Button>
            </div>
            {uploadedDocs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Upload className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No documents uploaded yet</p>
                <p className="text-xs">Accept claim and upload photos, documents, evidence</p>
              </div>
            ) : (
              <div className="space-y-2">
                {uploadedDocs.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between py-3 px-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{doc.name}</span>
                        <span className="text-[10px] text-muted-foreground capitalize">Source: {doc.source}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" asChild className="h-7 text-[10px]">
                        <a href={`http://localhost:8000${doc.url}`} target="_blank" rel="noreferrer">View</a>
                      </Button>
                      <Badge variant="outline" className="text-[10px] text-info border-info/30">
                        {doc.status || "Verified"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {currentStatus === "accepted" && (
            <Button onClick={() => handleStatusAdvance("in_progress")} className="w-full">
              Mark as In Progress
            </Button>
          )}
          {currentStatus === "in_progress" && uploadedDocs.length > 0 && (
            <Button onClick={() => handleStatusAdvance("documents_uploaded")} className="w-full">
              Mark Documents Complete
            </Button>
          )}
          {currentStatus === "documents_uploaded" && (
            <Button onClick={handleFinalSubmit} className="w-full bg-success hover:bg-success/90 text-success-foreground h-12 text-base">
              <CheckCircle2 className="h-5 w-5 mr-2" /> Submit Claim for Approval
            </Button>
          )}
          {currentStatus === "submitted" && (
            <div className="rounded-xl bg-success/10 border border-success/20 p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-sm font-semibold text-success">Claim Submitted Successfully!</p>
              <p className="text-xs text-muted-foreground mt-1">Waiting for manager approval. You can now accept nearby claims.</p>
              <Button onClick={() => navigate("/claims")} variant="outline" className="mt-3">
                View Other Claims
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-base font-semibold mb-4">Claim Progress</h3>
            <div className="space-y-3">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    i <= currentStepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {i <= currentStepIndex ? "✓" : i + 1}
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm ${i <= currentStepIndex ? "font-semibold" : "text-muted-foreground"}`}>
                      {statusLabels[step]}
                    </span>
                    {i === currentStepIndex && <p className="text-[10px] text-primary font-medium">Current</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Quick Update
            </h3>
            <p className="text-xs text-muted-foreground mb-3">Send update about this claim to manager</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={claimMsg}
                onChange={(e) => setClaimMsg(e.target.value)}
                placeholder="Type update..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button size="sm" onClick={() => { toast.success("Update sent to manager"); setClaimMsg(""); }}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-base font-semibold mb-3">Claim Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{claim.claim_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">District</span>
                <span className="font-medium">{claim.district}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{new Date(claim.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="text-[10px]">{statusLabels[currentStatus] || currentStatus}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
