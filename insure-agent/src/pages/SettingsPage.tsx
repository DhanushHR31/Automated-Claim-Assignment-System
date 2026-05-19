import { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { karnatakaDistricts } from "@/data/mockData";
import {
  User, Mail, Phone, MapPin, Landmark, Bell, Globe, Shield, Lock,
  Camera, Save, MapPinned, Smartphone, Volume2, MessageSquare
} from "lucide-react";

export default function SettingsPage() {
  const { user, profile, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    city: profile?.city || "Bengaluru",
    district: profile?.district || "Bengaluru Urban",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        city: profile.city || "Bengaluru",
        district: profile.district || "Bengaluru Urban",
        bank_name: "",
        account_number: "",
        ifsc_code: "",
      });
    }
  }, [profile]);

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
          setForm((prev) => ({
            ...prev,
            bank_name: data.bank_name || "",
            account_number: data.account_number || "",
            ifsc_code: data.ifsc_code || "",
          }));
        }
      } catch (err) {
        console.error("Failed to fetch payment details:", err);
      }
    };

    fetchPaymentDetails();
  }, [user]);

  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    claimAlerts: true,
    emergencyAlerts: true,
    weatherAlerts: true,
    paymentAlerts: true,
    managerMessages: true,
    soundEnabled: true,
    vibrationEnabled: true,
    locationTracking: true,
    autoLocation: true,
    language: "English",
    mapType: "Standard",
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "banking", label: "Banking", icon: Landmark },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "location", label: "Location", icon: MapPinned },
    { id: "security", label: "Security", icon: Shield },
    { id: "preferences", label: "Preferences", icon: Globe },
  ];

  const handleSaveProfile = async () => {
    await updateProfile({
      full_name: form.full_name,
      phone: form.phone,
      city: form.city,
      district: form.district,
    });
  };

  const handleSaveBanking = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("agent_token");
      const resp = await fetch(`http://localhost:8000/payment-details/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          bank_name: form.bank_name,
          account_number: form.account_number,
          ifsc_code: form.ifsc_code,
        }),
      });
      if (!resp.ok) throw new Error("Update failed");
      toast.success("Banking details updated!");
    } catch (err) {
      toast.error("Failed to update banking details");
    }
  };



  return (
    <div className="animate-slide-up max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Agent Settings</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 space-y-6">
          {activeTab === "profile" && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  {(form.full_name || "AG").split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <Button variant="outline" size="sm"><Camera className="h-4 w-4 mr-2" /> Change Photo</Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, max 5MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="pl-10" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email (read-only)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={form.email} disabled className="pl-10 opacity-60" />
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <Badge className="text-[10px]">Verified</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="pl-10" placeholder="+91 98456 78901" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="pl-10" placeholder="Bengaluru" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">District (Karnataka)</label>
                  <select
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                  >
                    {karnatakaDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <Button onClick={handleSaveProfile} className="mt-6">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </div>
          )}

          {activeTab === "banking" && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Banking Details</h2>
              <p className="text-sm text-muted-foreground mb-6">Your claim payment will be credited to this account</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">Bank Name</label>
                  <div className="relative">
                    <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} className="pl-10" placeholder="State Bank of India" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Account Number</label>
                  <Input value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} placeholder="1234567890" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">IFSC Code</label>
                  <Input value={form.ifsc_code} onChange={(e) => setForm({ ...form, ifsc_code: e.target.value })} placeholder="SBIN0001234" />
                </div>
              </div>
              <Button onClick={handleSaveBanking} className="mt-6">
                <Save className="h-4 w-4 mr-2" /> Update Banking
              </Button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Notification Channels</h2>
                <div className="space-y-4">
                  {[
                    { key: "pushNotifications", label: "Push Notifications", desc: "Receive push notifications on your device", icon: Smartphone },
                    { key: "emailNotifications", label: "Email Notifications", desc: "Get updates via email", icon: Mail },
                    { key: "smsNotifications", label: "SMS Notifications", desc: "Receive SMS alerts", icon: MessageSquare },
                  ].map(({ key, label, desc, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                      <Switch checked={settings[key as keyof typeof settings] as boolean} onCheckedChange={(v) => setSettings({ ...settings, [key]: v })} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Alert Types</h2>
                <div className="space-y-4">
                  {[
                    { key: "claimAlerts", label: "New Claim Alerts", desc: "When a new claim is assigned" },
                    { key: "emergencyAlerts", label: "Emergency Alerts", desc: "Urgent claim notifications with sound" },
                    { key: "weatherAlerts", label: "Weather Alerts - Karnataka", desc: "Weather warnings near claim locations in Karnataka" },
                    { key: "paymentAlerts", label: "Payment Alerts", desc: "Payment credited notifications" },
                    { key: "managerMessages", label: "Manager Messages", desc: "Messages from your regional manager" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Switch checked={settings[key as keyof typeof settings] as boolean} onCheckedChange={(v) => setSettings({ ...settings, [key]: v })} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Sound & Vibration</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Volume2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Alert Sound</p>
                        <p className="text-xs text-muted-foreground">Play sound on new notifications</p>
                      </div>
                    </div>
                    <Switch checked={settings.soundEnabled} onCheckedChange={(v) => setSettings({ ...settings, soundEnabled: v })} />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Vibration</p>
                        <p className="text-xs text-muted-foreground">Vibrate on emergency alerts</p>
                      </div>
                    </div>
                    <Switch checked={settings.vibrationEnabled} onCheckedChange={(v) => setSettings({ ...settings, vibrationEnabled: v })} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "location" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Location Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <MapPinned className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Live Location Tracking</p>
                        <p className="text-xs text-muted-foreground">Share your location in real-time for claim assignment</p>
                      </div>
                    </div>
                    <Switch checked={settings.locationTracking} onCheckedChange={(v) => setSettings({ ...settings, locationTracking: v })} />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">Auto-Collect Location</p>
                      <p className="text-xs text-muted-foreground">Automatically collect location when claim is accepted</p>
                    </div>
                    <Switch checked={settings.autoLocation} onCheckedChange={(v) => setSettings({ ...settings, autoLocation: v })} />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Map Preferences</h2>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Map Type</label>
                  <select
                    value={settings.mapType}
                    onChange={(e) => setSettings({ ...settings, mapType: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                  >
                    <option>Standard</option>
                    <option>Satellite</option>
                    <option>Terrain</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="Min. 6 characters" className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="Confirm password" className="pl-10" />
                    </div>
                  </div>
                  <Button><Save className="h-4 w-4 mr-2" /> Update Password</Button>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Session & Security</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Data Encryption</span>
                    <Badge className="bg-success/10 text-success border-0 text-[10px]">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-muted-foreground">Two-Factor Auth</span>
                    <Badge variant="outline" className="text-[10px]">Not Enabled</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Role-Based Access</span>
                    <Badge className="bg-success/10 text-success border-0 text-[10px]">Configured</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">App Preferences</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                    >
                      <option>English</option>
                      <option>ಕನ್ನಡ (Kannada)</option>
                      <option>हिन्दी (Hindi)</option>
                      <option>தமிழ் (Tamil)</option>
                      <option>తెలుగు (Telugu)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">About</h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>InsureAgent Karnataka v2.0</p>
                  <p>Smart Claim Assignment & Field Agent Management</p>
                  <p>Covering all 31 districts of Karnataka</p>
                  <p className="text-[11px] mt-4">© 2024 InsureAgent Karnataka. All rights reserved.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
