import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { HeartPulse, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { session, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: "/dashboard" });
  }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, hospitalName || "My Hospital");
        toast.success("Welcome to MediClaim!");
      } else {
        await signIn(email, password);
        toast.success("Welcome back!");
      }
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/15 grid place-items-center backdrop-blur">
            <HeartPulse className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg">MediClaim</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">Insurance claims,<br />simplified for hospitals.</h1>
          <p className="text-primary-foreground/80 max-w-md">
            Fetch policies, file pre-authorizations, upload documents, and track approvals & payments — all in one place.
          </p>
          <div className="flex gap-2 pt-2">
            {["Fetch", "Submit", "Approve", "Pay"].map((s, i) => (
              <span key={s} className="px-3 py-1 rounded-full bg-white/15 text-xs font-medium">{i + 1}. {s}</span>
            ))}
          </div>
        </div>
        <p className="text-xs text-primary-foreground/70">© MediClaim · Secure hospital portal</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-md p-8 shadow-[var(--shadow-card)]">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="h-9 w-9 rounded-xl grid place-items-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="font-semibold">MediClaim</span>
          </div>
          <h2 className="text-2xl font-bold">{mode === "signin" ? "Hospital sign in" : "Register your hospital"}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" ? "Use your hospital credentials to continue." : "Create a hospital account to start filing claims."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital name</Label>
                <Input id="hospital" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} placeholder="City General Hospital" required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@hospital.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>New hospital?{" "}<button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">Register here</button></>
            ) : (
              <>Already registered?{" "}<button onClick={() => setMode("signin")} className="text-primary font-medium hover:underline">Sign in</button></>
            )}
          </div>

          <div className="mt-6 p-3 rounded-lg bg-primary-soft border border-border text-xs text-foreground/80">
            <p className="font-medium mb-1">Try sample policies after signup:</p>
            <p className="text-muted-foreground">POL-1001, POL-1002, POL-1003, POL-1005 (active) · POL-1004 (expired)</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
