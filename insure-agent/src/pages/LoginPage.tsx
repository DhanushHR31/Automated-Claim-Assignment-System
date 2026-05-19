import { useEffect, useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Eye, EyeOff, Mail, Lock, BadgeCheck } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = location.state as { email?: string } | null;
    if (state?.email) {
      setEmail(state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="max-w-md text-center">
          <Shield className="h-20 w-20 text-primary-foreground mx-auto mb-8" />
          <h1 className="text-4xl font-extrabold text-primary-foreground mb-4">InsureAgent Karnataka</h1>
          <p className="text-lg text-primary-foreground/80">Smart Claim Assignment & Field Agent Management for Karnataka</p>
          <div className="mt-10 grid grid-cols-3 gap-6 text-primary-foreground/70">
            <div>
              <p className="text-3xl font-bold text-primary-foreground">8K+</p>
              <p className="text-xs mt-1">Claims Processed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">350+</p>
              <p className="text-xs mt-1">Active Agents</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">30</p>
              <p className="text-xs mt-1">Districts Covered</p>
            </div>
          </div>
          <div className="mt-8 text-sm text-primary-foreground/60">
            Covering all 31 districts of Karnataka
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <Shield className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-extrabold">InsureAgent KA</h1>
          </div>

          <h2 className="text-2xl font-bold mb-1">Agent Login</h2>
          <p className="text-muted-foreground text-sm mb-8">Sign in to access your Karnataka claims dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="agent@insurekarnataka.co" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type={showPw ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">Register here</Link>
          </p>


        </div>
      </div>
    </div>
  );
}
