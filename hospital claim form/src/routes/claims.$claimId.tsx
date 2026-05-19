import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { AppShell, PageHeader, StatusBadge } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { claimApi, documentApi, type Claim, type Document } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Upload, FileText, Trash2, Send, Loader2, ArrowLeft, Receipt, Wallet, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/claims/$claimId")({
  head: () => ({ meta: [{ title: "Claim Details — MediClaim" }] }),
  component: () => <AppShell><ClaimDetail /></AppShell>,
});

const DOC_TYPES = [
  { v: "admission_doc", l: "Admission letter" },
  { v: "diagnosis_report", l: "Diagnosis report" },
  { v: "insurance_doc", l: "Insurance document" },
  { v: "aadhaar", l: "Aadhaar card" },
  { v: "pan", l: "PAN card" },
  { v: "company_id", l: "Company ID (corporate)" },
  { v: "discharge_summary", l: "Discharge summary" },
  { v: "final_bill", l: "Final bill" },
  { v: "pharmacy_bill", l: "Pharmacy bill" },
] as const;

function ClaimDetail() {
  const { claimId } = Route.useParams();
  const { user } = useAuth();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [docs, setDocs] = useState<Document[]>([]);
  const [docType, setDocType] = useState<string>(DOC_TYPES[0].v);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [totalBill, setTotalBill] = useState("");
  const [pharmacyBill, setPharmacyBill] = useState("");

  const refresh = useCallback(async () => {
    const [c, d] = await Promise.all([
      claimApi.get(claimId),
      documentApi.list(claimId),
    ]);
    setClaim(c);
    setDocs(d);
  }, [claimId]);

  useEffect(() => { refresh(); }, [refresh]);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      await documentApi.upload(claimId, docType, file);
      toast.success("Document uploaded");
      refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeDoc = async (doc: Document) => {
    await documentApi.delete(claimId, doc.id);
    toast.success("Document removed");
    refresh();
  };

  const submitForApproval = async () => {
    if (!claim) return;
    setSubmitting(true);
    try {
      await claimApi.submit(claimId);
      toast.success("Sent for pre-authorization");
      refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const simulateApproval = async (decision: "approved" | "rejected") => {
    await claimApi.simulateApproval(claimId, decision);
    toast.success(`Claim ${decision}`);
    refresh();
  };

  const simulateVerification = async () => {
    await claimApi.simulateVerification(claimId);
    toast.success("Moved to under verification");
    refresh();
  };

  const simulatePayment = async () => {
    await claimApi.simulatePayment(claimId);
    toast.success("Payment processed");
    refresh();
  };

  const submitBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalBill) return;
    await claimApi.submitBilling(claimId, {
      total_bill: Number(totalBill),
      pharmacy_bill: pharmacyBill ? Number(pharmacyBill) : undefined,
    });
    toast.success("Billing submitted");
    setTotalBill(""); setPharmacyBill("");
    refresh();
  };

  if (!claim) return <div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>;

  const status = claim.claim_status;

  return (
    <>
      <PageHeader
        title={claim.claim_number}
        subtitle={`Policy: ${claim.policy?.policy_number ?? "—"} · Patient: ${claim.patient_details?.patient_name ?? claim.policy?.customer_name ?? "—"}`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/claims"><ArrowLeft className="h-4 w-4 mr-2" />All claims</Link>
          </Button>
        }
      />

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Status", value: <StatusBadge status={status} /> },
          { label: "Estimated", value: `₹${Number(claim.estimated_amount ?? 0).toLocaleString("en-IN")}` },
          { label: "Approved", value: `₹${Number(claim.approved_amount ?? 0).toLocaleString("en-IN")}` },
          { label: "Insurer", value: claim.policy?.insurance_company?.company_name ?? "—" },
          { label: "Admission", value: claim.admission_date ?? "—" },
          { label: "Discharge", value: claim.discharge_date ?? "—" },
        ].map((s) => (
          <Card key={s.label} className="p-4 shadow-[var(--shadow-card)]">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <div className="mt-1 font-semibold">{s.value}</div>
          </Card>
        ))}
      </div>

      {/* Documents */}
      <Card className="p-6 mb-6 shadow-[var(--shadow-card)]">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><FileText className="h-4 w-4" />Documents</h2>
        <div className="flex gap-3 mb-4 flex-wrap">
          <select value={docType} onChange={(e) => setDocType(e.target.value)} className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
            {DOC_TYPES.map((d) => <option key={d.v} value={d.v}>{d.l}</option>)}
          </select>
          <Label className="cursor-pointer">
            <Button asChild variant="outline" size="sm" disabled={uploading}>
              <span>{uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}Upload</span>
            </Button>
            <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
          </Label>
        </div>
        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
        ) : (
          <ul className="space-y-2">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{d.file_name ?? d.file_path}</p>
                  <p className="text-xs text-muted-foreground">{d.document_type} · {new Date(d.uploaded_at).toLocaleDateString()}</p>
                </div>
                <a href={`http://localhost:8000/api/claims/${claimId}/documents/${d.id}/download`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Open</a>
                <button onClick={() => removeDoc(d)} className="text-destructive hover:opacity-70"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Workflow actions */}
      <Card className="p-6 mb-6 shadow-[var(--shadow-card)]">
        <h2 className="font-semibold mb-4">Workflow actions</h2>
        <div className="flex flex-wrap gap-3">
          {status === "initiated" && (
            <Button onClick={submitForApproval} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <Send className="h-4 w-4 mr-2" />Submit for pre-authorization
            </Button>
          )}
          {status === "pending_approval" && (
            <>
              <Button variant="outline" onClick={() => simulateApproval("approved")}><CheckCircle2 className="h-4 w-4 mr-2" />Simulate insurer approval</Button>
              <Button variant="outline" onClick={() => simulateApproval("rejected")} className="text-destructive border-destructive/40 hover:bg-destructive/10">Simulate rejection</Button>
            </>
          )}
          {status === "approved" && (
            <Button variant="outline" onClick={simulateVerification}>Move to verification</Button>
          )}
          {status === "under_verification" && (
            <Button onClick={simulatePayment}><Wallet className="h-4 w-4 mr-2" />Simulate payment</Button>
          )}
        </div>
        {claim.remarks && <p className="mt-3 text-sm text-muted-foreground">Remarks: {claim.remarks}</p>}
      </Card>

      {/* Billing */}
      {(status === "approved" || status === "under_verification" || status === "paid") && (
        <Card className="p-6 shadow-[var(--shadow-card)]">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Receipt className="h-4 w-4" />Submit billing</h2>
          <form onSubmit={submitBilling} className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <Label>Total bill (₹)</Label>
              <Input type="number" min={0} value={totalBill} onChange={(e) => setTotalBill(e.target.value)} className="w-40" required />
            </div>
            <div className="space-y-1">
              <Label>Pharmacy bill (₹)</Label>
              <Input type="number" min={0} value={pharmacyBill} onChange={(e) => setPharmacyBill(e.target.value)} className="w-40" />
            </div>
            <Button type="submit">Submit bill</Button>
          </form>
        </Card>
      )}
    </>
  );
}
