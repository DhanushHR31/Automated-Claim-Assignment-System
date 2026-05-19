import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { hospitalApi, type Hospital } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Hospital Profile — MediClaim" }] }),
  component: () => <AppShell><ProfilePage /></AppShell>,
});

function ProfilePage() {
  const [h, setH] = useState<Hospital | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { hospitalApi.getMe().then(setH).catch(console.error); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!h) return;
    setBusy(true);
    try {
      const updated = await hospitalApi.updateMe({
        hospital_name: h.hospital_name,
        contact_number: h.contact_number,
        address: h.address,
        city: h.city,
        state: h.state,
        license_number: h.license_number,
        specialization: h.specialization,
        bed_capacity: h.bed_capacity,
      });
      setH(updated);
      toast.success("Profile updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  if (!h) return <div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>;

  return (
    <>
      <PageHeader title="Hospital profile" subtitle="Keep your details up to date for claim verification." />
      <Card className="p-6 shadow-[var(--shadow-card)]">
        <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2"><Label>Hospital name</Label><Input value={h.hospital_name} onChange={(e) => setH({ ...h, hospital_name: e.target.value })} /></div>
          <div className="space-y-2"><Label>Contact number</Label><Input value={h.contact_number ?? ""} onChange={(e) => setH({ ...h, contact_number: e.target.value })} /></div>
          <div className="space-y-2"><Label>License number</Label><Input value={h.license_number ?? ""} onChange={(e) => setH({ ...h, license_number: e.target.value })} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Address</Label><Textarea value={h.address ?? ""} onChange={(e) => setH({ ...h, address: e.target.value })} rows={2} /></div>
          <div className="space-y-2"><Label>City</Label><Input value={h.city ?? ""} onChange={(e) => setH({ ...h, city: e.target.value })} /></div>
          <div className="space-y-2"><Label>State</Label><Input value={h.state ?? ""} onChange={(e) => setH({ ...h, state: e.target.value })} /></div>
          <div className="space-y-2"><Label>Specializations</Label><Input value={h.specialization ?? ""} onChange={(e) => setH({ ...h, specialization: e.target.value })} placeholder="Cardiology, Orthopedics, …" /></div>
          <div className="space-y-2"><Label>Bed capacity</Label><Input type="number" min={0} value={h.bed_capacity ?? ""} onChange={(e) => setH({ ...h, bed_capacity: e.target.value ? Number(e.target.value) : undefined })} /></div>
          <div className="md:col-span-2 flex justify-end pt-2">
            <Button type="submit" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Save changes</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
