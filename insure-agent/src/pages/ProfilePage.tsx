import { useEffect, useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";
import { earnings } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User, Mail, Phone, MapPin, Star, Award, IndianRupee,
  Landmark, ChevronRight, Shield, Camera, Edit
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [paymentDetails, setPaymentDetails] = useState({
    bank_name: "",
    account_number: "",
    ifsc_code: "",
  });

  useEffect(() => {
    if (!user) return;

    const fetchPaymentDetails = async () => {
      try {
        const token = localStorage.getItem("agent_token");
        const resp = await fetch(`http://localhost:8000/payment-details/${user.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (resp.ok) {
          const data = await resp.json();
          setPaymentDetails({
            bank_name: data.bank_name || "",
            account_number: data.account_number || "",
            ifsc_code: data.ifsc_code || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch payment details:", err);
      }
    };

    fetchPaymentDetails();
  }, [user]);

  if (!profile) return null;

  const initials = (profile.full_name || "AG").split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <div className="animate-slide-up max-w-4xl mx-auto">
      <div className="rounded-2xl bg-primary p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-primary-foreground/20 flex items-center justify-center text-3xl font-bold text-primary-foreground">
              {initials}
            </div>
            <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-card flex items-center justify-center text-foreground shadow-lg hover:bg-muted transition-colors">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary-foreground">{profile.full_name || "Agent"}</h1>
            <p className="text-sm text-primary-foreground/70">{profile.email}</p>
            <Badge className="mt-2 bg-primary-foreground/20 text-primary-foreground border-0">Field Agent • Karnataka</Badge>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-sm text-primary-foreground/80 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {profile.district || "Bengaluru Urban"}
              </span>
              <span className="text-sm text-primary-foreground/80 flex items-center gap-1">
                <Phone className="h-3 w-3" /> {profile.phone || "Not set"}
              </span>
            </div>
          </div>
          <Link to="/settings">
            <Button variant="secondary" size="sm">
              <Edit className="h-4 w-4 mr-2" /> Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-base font-semibold mb-4">Personal Details</h3>
          <div className="space-y-4">
            {[
              { icon: User, label: "Full Name", value: profile.full_name || "Not set" },
              { icon: Mail, label: "Email", value: profile.email || "Not set" },
              { icon: Phone, label: "Phone", value: profile.phone || "Not set" },
              { icon: MapPin, label: "City", value: profile.city || "Bengaluru" },
              { icon: MapPin, label: "District", value: profile.district || "Bengaluru Urban" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Banking Details</h3>
            <Link to="/settings" className="text-xs text-primary font-medium hover:underline">Edit</Link>
          </div>
          <div className="space-y-4">
            {[
              { icon: Landmark, label: "Bank Name", value: paymentDetails.bank_name || "Not set" },
              { label: "Account Number", value: paymentDetails.account_number ? `••••${paymentDetails.account_number.slice(-4)}` : "Not set" },
              { label: "IFSC Code", value: paymentDetails.ifsc_code || "Not set" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : <div className="w-4" />}
                <div>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold mb-3">Earnings Summary</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-success/5">
                <p className="text-lg font-bold text-success">₹{earnings.today.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Today</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-lg font-bold">₹{(earnings.thisMonth / 1000).toFixed(1)}k</p>
                <p className="text-[10px] text-muted-foreground">This Month</p>
              </div>
              <div className="p-3 rounded-lg bg-warning/5">
                <p className="text-lg font-bold text-warning">₹{(earnings.pending / 1000).toFixed(1)}k</p>
                <p className="text-[10px] text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-base font-semibold mb-3">Location Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge className={profile.is_online ? "bg-success/10 text-success border-0" : "bg-muted text-muted-foreground border-0"}>
                {profile.is_online ? "🟢 Online" : "🔴 Offline"}
              </Badge>
            </div>
            {profile.current_lat && (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Latitude</span>
                  <span className="font-mono font-medium">{profile.current_lat.toFixed(6)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Longitude</span>
                  <span className="font-mono font-medium">{profile.current_lng?.toFixed(6)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-base font-semibold mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Edit Settings", path: "/settings", color: "primary" },
              { label: "View Earnings", path: "/earnings", color: "success" },
              { label: "Contact Manager", path: "/messages", color: "info" },
              { label: "Support Center", path: "/support", color: "warning" },
            ].map(({ label, path }) => (
              <Link key={path} to={path} className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium">
                {label}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
