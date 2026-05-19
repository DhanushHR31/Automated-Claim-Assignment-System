import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Lock, Bell, Building, MapPin, Calendar, Shield, LogOut, Camera, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Profile {
  full_name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  employee_id: string;
  region: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  date_of_joining: string;
  avatar_url: string;
}

interface NotifPrefs {
  push_notifications: boolean;
  email_alerts: boolean;
  sms_notifications: boolean;
  claim_updates: boolean;
  agent_messages: boolean;
  daily_summary: boolean;
  weekly_report: boolean;
  sound_enabled: boolean;
}

const SettingsPage = () => {
  const { toast } = useToast();
  const { user, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile>({
    full_name: "", email: "", phone: "", designation: "Senior Manager",
    department: "Claims", employee_id: "", region: "", address: "",
    city: "", state: "", pincode: "", date_of_joining: "", avatar_url: "",
  });

  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>({
    push_notifications: true, email_alerts: true, sms_notifications: false,
    claim_updates: true, agent_messages: true, daily_summary: false,
    weekly_report: true, sound_enabled: true,
  });

  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [profileRes, prefsRes] = await Promise.all([
        supabase.from("manager_profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("notification_preferences").select("*").eq("user_id", user.id).single(),
      ]);
      if (profileRes.data) {
        const p = profileRes.data;
        let avatarDisplayUrl = "";
        if (p.avatar_url) {
          // Stored value is the storage object path; mint a short-lived signed URL.
          if (p.avatar_url.startsWith("http")) {
            avatarDisplayUrl = p.avatar_url; // legacy public URL fallback
          } else {
            const { data: signed } = await supabase.storage
              .from("avatars")
              .createSignedUrl(p.avatar_url, 60 * 60);
            avatarDisplayUrl = signed?.signedUrl || "";
          }
        }
        setProfile({
          full_name: p.full_name || "",
          email: p.email || "",
          phone: p.phone || "",
          designation: p.designation || "Senior Manager",
          department: p.department || "Claims",
          employee_id: p.employee_id || "",
          region: p.region || "",
          address: p.address || "",
          city: p.city || "",
          state: p.state || "",
          pincode: p.pincode || "",
          date_of_joining: p.date_of_joining || "",
          avatar_url: avatarDisplayUrl,
        });
      }
      if (prefsRes.data) {
        const n = prefsRes.data;
        setNotifPrefs({
          push_notifications: n.push_notifications ?? true,
          email_alerts: n.email_alerts ?? true,
          sms_notifications: n.sms_notifications ?? false,
          claim_updates: n.claim_updates ?? true,
          agent_messages: n.agent_messages ?? true,
          daily_summary: n.daily_summary ?? false,
          weekly_report: n.weekly_report ?? true,
          sound_enabled: n.sound_enabled ?? true,
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("manager_profiles").update({
      full_name: profile.full_name,
      phone: profile.phone,
      designation: profile.designation,
      department: profile.department,
      region: profile.region,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      pincode: profile.pincode,
      date_of_joining: profile.date_of_joining || null,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Profile Updated", description: "Your information has been saved." });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB.", variant: "destructive" });
      return;
    }

    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploadingAvatar(false);
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      return;
    }

    // Store the storage object path (not a public URL) so we can mint signed URLs on demand.
    const { error: updateError } = await supabase
      .from("manager_profiles")
      .update({ avatar_url: filePath })
      .eq("user_id", user.id);

    setUploadingAvatar(false);
    if (updateError) {
      toast({ title: "Error", description: updateError.message, variant: "destructive" });
    } else {
      const { data: signed } = await supabase.storage
        .from("avatars")
        .createSignedUrl(filePath, 60 * 60);
      setProfile((p) => ({ ...p, avatar_url: signed?.signedUrl || "" }));
      await refreshProfile();
      toast({ title: "Avatar Updated", description: "Your photo has been uploaded." });
      await supabase.from("manager_audit_log").insert({
        user_id: user.id,
        action: "avatar_updated",
        details: filePath,
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAvatarRemove = async () => {
    if (!user) return;
    setUploadingAvatar(true);
    const { error } = await supabase
      .from("manager_profiles")
      .update({ avatar_url: "" })
      .eq("user_id", user.id);
    setUploadingAvatar(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProfile((p) => ({ ...p, avatar_url: "" }));
      await refreshProfile();
      toast({ title: "Avatar Removed" });
      await supabase.from("manager_audit_log").insert({
        user_id: user.id,
        action: "avatar_removed",
      });
    }
  };

  const saveNotifPrefs = async (key: keyof NotifPrefs, value: boolean) => {
    if (!user) return;
    const updated = { ...notifPrefs, [key]: value };
    setNotifPrefs(updated);
    const payload: Partial<NotifPrefs> = { [key]: value };
    const { error } = await supabase.from("notification_preferences").update(payload).eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setNotifPrefs(notifPrefs); // revert
    } else {
      const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      toast({ title: `${label} ${value ? "Enabled" : "Disabled"}` });
    }
  };

  const changePassword = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      toast({ title: "Error", description: "Please fill all password fields.", variant: "destructive" });
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (passwords.newPass.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (!user?.email) {
      toast({ title: "Error", description: "Unable to verify account.", variant: "destructive" });
      return;
    }
    setSaving(true);
    // Re-authenticate with current password before allowing the change.
    const { error: reauthErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: passwords.current,
    });
    if (reauthErr) {
      setSaving(false);
      toast({ title: "Incorrect password", description: "Your current password is incorrect.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: passwords.newPass });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setPasswords({ current: "", newPass: "", confirm: "" });
      toast({ title: "Password Changed", description: "Your password has been updated." });
      await supabase.from("manager_audit_log").insert({
        user_id: user.id,
        action: "password_changed",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const notificationItems: { key: keyof NotifPrefs; label: string; desc: string }[] = [
    { key: "push_notifications", label: "Push Notifications", desc: "Receive push notifications for new claims and updates" },
    { key: "email_alerts", label: "Email Alerts", desc: "Get email alerts for important updates and reports" },
    { key: "sms_notifications", label: "SMS Notifications", desc: "Receive SMS for urgent matters and escalations" },
    { key: "claim_updates", label: "Claim Updates", desc: "Get notified when claim status changes" },
    { key: "agent_messages", label: "Agent Messages", desc: "Notifications when agents send you messages" },
    { key: "daily_summary", label: "Daily Summary", desc: "Receive a daily summary of all activities" },
    { key: "weekly_report", label: "Weekly Report", desc: "Get a weekly performance and analytics report" },
    { key: "sound_enabled", label: "Notification Sound", desc: "Play sound when notifications arrive" },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Settings">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-3xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="profile" className="flex items-center gap-1.5 text-xs"><User className="h-3.5 w-3.5" />Profile</TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1.5 text-xs"><Bell className="h-3.5 w-3.5" />Notifications</TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1.5 text-xs"><Shield className="h-3.5 w-3.5" />Security</TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-1.5 text-xs"><Lock className="h-3.5 w-3.5" />Account</TabsTrigger>
          </TabsList>

          {/* PROFILE TAB */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" />Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center gap-5">
                  <Avatar className="h-20 w-20 border-2 border-border">
                    <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
                    <AvatarFallback className="gradient-primary text-primary-foreground text-xl font-bold">
                      {(profile.full_name || user?.email || "M").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="flex items-center gap-1.5"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        {uploadingAvatar ? "Uploading..." : profile.avatar_url ? "Change Photo" : "Upload Photo"}
                      </Button>
                      {profile.avatar_url && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleAvatarRemove}
                          disabled={uploadingAvatar}
                          className="flex items-center gap-1.5 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">JPG, PNG or WEBP. Max 5MB.</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label>Full Name</Label><Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="mt-1" /></div>
                  <div><Label>Email</Label><Input value={profile.email} className="mt-1" disabled /></div>
                  <div><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="mt-1" placeholder="+91 99999 00000" /></div>
                  <div><Label>Manager ID</Label><Input value={profile.employee_id} className="mt-1 bg-muted font-mono" disabled /></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Building className="h-4 w-4" />Organization Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label>Designation</Label><Input value={profile.designation} onChange={(e) => setProfile({ ...profile, designation: e.target.value })} className="mt-1" /></div>
                  <div><Label>Department</Label><Input value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} className="mt-1" /></div>
                  <div><Label>Region</Label><Input value={profile.region} onChange={(e) => setProfile({ ...profile, region: e.target.value })} className="mt-1" placeholder="North India" /></div>
                  <div><Label className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Date of Joining</Label><Input type="date" value={profile.date_of_joining} onChange={(e) => setProfile({ ...profile, date_of_joining: e.target.value })} className="mt-1" /></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" />Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Street Address</Label><Input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="mt-1" placeholder="123 Main Street" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><Label>City</Label><Input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="mt-1" placeholder="Mumbai" /></div>
                  <div><Label>State</Label><Input value={profile.state} onChange={(e) => setProfile({ ...profile, state: e.target.value })} className="mt-1" placeholder="Maharashtra" /></div>
                  <div><Label>Pincode</Label><Input value={profile.pincode} onChange={(e) => setProfile({ ...profile, pincode: e.target.value })} className="mt-1" placeholder="400001" /></div>
                </div>
                <Button onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save All Changes"}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOTIFICATIONS TAB */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" />Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {notificationItems.map((item, i) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch checked={notifPrefs[item.key]} onCheckedChange={(v) => saveNotifPrefs(item.key, v)} />
                    </div>
                    {i < notificationItems.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECURITY TAB */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" />Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Current Password</Label><Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="mt-1" placeholder="Enter your current password" autoComplete="current-password" /></div>
                <div><Label>New Password</Label><Input type="password" value={passwords.newPass} onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })} className="mt-1" placeholder="Min 6 characters" autoComplete="new-password" /></div>
                <div><Label>Confirm New Password</Label><Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="mt-1" placeholder="Re-enter password" autoComplete="new-password" /></div>
                <Button onClick={changePassword} disabled={saving}>{saving ? "Updating..." : "Update Password"}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ACCOUNT TAB */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" />Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Account Email</Label>
                    <p className="text-sm font-medium mt-1">{user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Account Created</Label>
                    <p className="text-sm font-medium mt-1">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Last Sign In</Label>
                    <p className="text-sm font-medium mt-1">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">User ID</Label>
                    <p className="text-sm font-mono text-xs mt-1 truncate">{user?.id}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-destructive mb-2">Danger Zone</h3>
                  <Button variant="destructive" onClick={handleSignOut} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
