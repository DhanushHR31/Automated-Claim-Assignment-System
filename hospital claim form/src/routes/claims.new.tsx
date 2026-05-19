import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { claimApi, hospitalApi, type ActivePolicySummary, type CustomerLookupResult } from "@/lib/api";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/claims/new")({
  head: () => ({ meta: [{ title: "New Claim — MediClaim" }] }),
  component: () => <AppShell><NewClaim /></AppShell>,
});

function NewClaim() {
  const navigate = useNavigate();
  const [customerIdInput, setCustomerIdInput] = useState("");
  const [customer, setCustomer] = useState<CustomerLookupResult["customer"] | null>(null);
  const [policies, setPolicies] = useState<ActivePolicySummary[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState("");
  const [fetching, setFetching] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [doctor, setDoctor] = useState("");
  const [admission, setAdmission] = useState("");
  const [discharge, setDischarge] = useState("");
  const [estimate, setEstimate] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerIdInput.trim()) return;
    setFetching(true);
    setCustomer(null);
    setPolicies([]);
    setSelectedPolicyId("");
    try {
      const data = await hospitalApi.lookupCustomer(customerIdInput.trim());
      setCustomer(data.customer);
      setPolicies(data.active_policies);
      setSelectedPolicyId(data.active_policies.length > 0 ? data.active_policies[0].id : "");
      setPatientName(data.customer.full_name);
      setContact(data.customer.phone ?? "");
      setEmail(data.customer.email ?? "");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Customer not found");
    } finally {
      setFetching(false);
    }
  };

  const createClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicyId) { toast.error("Select an active policy first."); return; }
    setCreating(true);
    try {
      const claim = await claimApi.startHospitalClaim({
        policy_id: selectedPolicyId,
        diagnosis,
        doctor_name: doctor,
        admission_date: admission || undefined,
        discharge_date: discharge || undefined,
        estimated_amount: estimate ? Number(estimate) : 0,
        patient_name: patientName,
        patient_age: age ? Number(age) : undefined,
        patient_gender: gender || undefined,
        aadhaar: aadhaar || undefined,
        pan: pan || undefined,
        contact: contact || undefined,
        patient_email: email || undefined,
        is_corporate: !!employeeId || false,
        employee_id: employeeId || undefined,
        remarks: diagnosis || undefined,
      });
      toast.success(`Claim ${claim.claim_number} created`);
      navigate({ to: "/claims/$claimId", params: { claimId: claim.id } });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create claim");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <PageHeader title="New claim" subtitle="Look up a customer by ID, then file the hospital claim." />

      <Card className="p-6 mb-6 shadow-[var(--shadow-card)]">
        <h2 className="font-semibold mb-4">Step 1 — Lookup customer</h2>
        <form onSubmit={fetchCustomer} className="flex gap-3">
          <Input value={customerIdInput} onChange={(e) => setCustomerIdInput(e.target.value)} placeholder="e.g. 8-digit customer ID" className="max-w-xs" />
          <Button type="submit" variant="outline" disabled={fetching}>
            {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
            {fetching ? "Searching…" : "Fetch"}
          </Button>
        </form>

        {customer && (
          <div className="mt-4 p-4 rounded-lg border border-border bg-muted/30 space-y-3">
            <div className="flex items-start gap-3">
              <div>
                <p className="font-semibold">{customer.full_name}</p>
                <p className="text-xs text-muted-foreground">ID: {customer.custom_id}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="text-muted-foreground">Email: {customer.email}</div>
              <div className="text-muted-foreground">Phone: {customer.phone ?? "Not available"}</div>
            </div>
          </div>
        )}

        {policies.length > 0 ? (
          <div className="mt-4 p-4 rounded-lg border border-border bg-muted/30">
            <p className="font-semibold mb-2">Active health policies</p>
            <div className="space-y-2">
              {policies.map((policy) => (
                <label key={policy.id} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:border-primary">
                  <input
                    type="radio"
                    name="selectedPolicy"
                    value={policy.id}
                    checked={selectedPolicyId === policy.id}
                    onChange={() => setSelectedPolicyId(policy.id)}
                    className="h-4 w-4"
                  />
                  <div>
                    <p className="font-medium">{policy.policy_number} · {policy.name}</p>
                    <p className="text-xs text-muted-foreground">Provider: {policy.provider} · Coverage: {policy.coverage} · Expires {policy.expiry_date}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ) : customer ? (
          <div className="mt-4 p-4 rounded-lg border border-border bg-muted/30 text-sm text-destructive">No active health policies found for this customer.</div>
        ) : null}
      </Card>

      {selectedPolicyId && (
        <Card className="p-6 shadow-[var(--shadow-card)]">
          <h2 className="font-semibold mb-4">Step 2 — Patient & treatment details</h2>
          <form onSubmit={createClaim} className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2"><Label>Patient name *</Label><Input required value={patientName} onChange={(e) => setPatientName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Age</Label><Input type="number" min={0} value={age} onChange={(e) => setAge(e.target.value)} /></div>
            <div className="space-y-2"><Label>Gender</Label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2"><Label>Aadhaar</Label><Input value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} /></div>
            <div className="space-y-2"><Label>PAN</Label><Input value={pan} onChange={(e) => setPan(e.target.value)} /></div>
            <div className="space-y-2"><Label>Contact</Label><Input value={contact} onChange={(e) => setContact(e.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-2"><Label>Employee ID</Label><Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Diagnosis</Label><Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} /></div>
            <div className="space-y-2"><Label>Doctor name</Label><Input value={doctor} onChange={(e) => setDoctor(e.target.value)} /></div>
            <div className="space-y-2"><Label>Estimated amount (₹)</Label><Input type="number" min={0} value={estimate} onChange={(e) => setEstimate(e.target.value)} /></div>
            <div className="space-y-2"><Label>Admission date</Label><Input type="date" value={admission} onChange={(e) => setAdmission(e.target.value)} /></div>
            <div className="space-y-2"><Label>Discharge date</Label><Input type="date" value={discharge} onChange={(e) => setDischarge(e.target.value)} /></div>
            <div className="md:col-span-2 flex justify-end pt-2">
              <Button type="submit" disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Create claim
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  );
}
