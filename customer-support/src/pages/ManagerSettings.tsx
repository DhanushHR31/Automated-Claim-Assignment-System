import { useState } from "react";
import { User, Bell, Shield, Save, MapPin, Users, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getTravelCostSettings, saveTravelCostSettings } from "@/lib/travelCost";

const karnatakaDistricts = [
  "Bangalore Urban", "Bangalore Rural", "Mysuru", "Hubli-Dharwad", "Mangaluru",
  "Belgaum", "Gulbarga", "Davanagere", "Bellary", "Shimoga",
  "Tumkur", "Raichur", "Bidar", "Hassan", "Mandya",
  "Chitradurga", "Udupi", "Chikmagalur", "Kodagu", "Gadag",
  "Haveri", "Uttara Kannada", "Chamarajanagar", "Koppal", "Ramanagara",
  "Yadgir", "Bagalkot", "Dharwad", "Vijayapura", "Kolar"
];

export default function ManagerSettings() {
  const { user, displayName, role } = useAuth();
  const [profileName, setProfileName] = useState(displayName || "");
  const [saving, setSaving] = useState(false);
  const [travelCosts, setTravelCosts] = useState(() => getTravelCostSettings());

  const [notifs, setNotifs] = useState({
    newClaim: true,
    agentStatus: true,
    assignmentComplete: true,
    systemAlerts: true,
    agentRegistration: true,
    claimEscalation: true,
  });

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Mocked out because user is local now and the endpoint doesn't exist yet for updating self
      toast.success("Profile updated successfully (Mocked)");
    } catch (err: any) {
      toast.error("Failed to update profile", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSystem = () => {
    saveTravelCostSettings(travelCosts);
    toast.success("System settings saved", {
      description: `Travel Rs. ${travelCosts.costPerKm}/km, stay after ${travelCosts.stayThresholdKm} km, stay cost Rs. ${travelCosts.stayCost}`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage profile, notifications, system & regional settings</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="profile" className="gap-1"><User className="h-3.5 w-3.5" /> Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1"><Bell className="h-3.5 w-3.5" /> Alerts</TabsTrigger>
          <TabsTrigger value="system" className="gap-1"><Shield className="h-3.5 w-3.5" /> System</TabsTrigger>
          <TabsTrigger value="region" className="gap-1"><MapPin className="h-3.5 w-3.5" /> Region</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <div className="bg-card border rounded-xl p-6 shadow-card max-w-lg space-y-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                {(displayName || "M").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-card-foreground">{displayName || "Manager"}</p>
                <p className="text-sm text-muted-foreground capitalize">{role || "manager"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled className="bg-muted" />
              </div>
              <div>
                <Label>Role</Label>
                <Input value={role || "manager"} disabled className="bg-muted capitalize" />
              </div>
            </div>

            <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <div className="bg-card border rounded-xl p-6 shadow-card max-w-lg space-y-4">
            <h3 className="font-semibold text-card-foreground">Notification Preferences</h3>
            {[
              { key: "newClaim" as const, label: "New Claim Created", desc: "Get notified when a new claim is submitted" },
              { key: "agentStatus" as const, label: "Agent Status Changes", desc: "When agents change availability" },
              { key: "assignmentComplete" as const, label: "Assignment Completed", desc: "When an agent completes an inspection" },
              { key: "systemAlerts" as const, label: "System Alerts", desc: "Important system notifications" },
              { key: "agentRegistration" as const, label: "New Agent Registration", desc: "When a new agent registers via the app" },
              { key: "claimEscalation" as const, label: "Claim Escalation", desc: "When a claim requires immediate attention" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch checked={notifs[key]} onCheckedChange={(v) => { setNotifs((p) => ({ ...p, [key]: v })); toast.success(`${label} ${v ? "enabled" : "disabled"}`); }} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="mt-4">
          <div className="bg-card border rounded-xl p-6 shadow-card max-w-lg space-y-4">
            <h3 className="font-semibold text-card-foreground">System Configuration</h3>

            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium text-card-foreground">Auto-Assignment</p>
                <p className="text-xs text-muted-foreground mb-2">Automatically assign nearest available agent to new claims</p>
                <Switch defaultChecked={false} onCheckedChange={(v) => toast.success(`Auto-assignment ${v ? "enabled" : "disabled"}`)} />
              </div>

              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium text-card-foreground">Max Claims Per Agent</p>
                <p className="text-xs text-muted-foreground mb-2">Maximum concurrent claims an agent can handle</p>
                <Input type="number" defaultValue={5} min={1} max={20} className="w-24" />
              </div>

              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium text-card-foreground">Travel Cost Per KM (₹)</p>
                <p className="text-xs text-muted-foreground mb-2">Rate used for travel cost calculation</p>
                <Input
                  type="number"
                  value={travelCosts.costPerKm}
                  min={1}
                  className="w-24"
                  onChange={(e) => setTravelCosts((prev) => ({ ...prev, costPerKm: Number(e.target.value) || 0 }))}
                />
              </div>

              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium text-card-foreground">Hotel Cost Threshold (KM)</p>
                <p className="text-xs text-muted-foreground mb-2">Distance after which hotel costs are added</p>
                <Input
                  type="number"
                  value={travelCosts.stayThresholdKm}
                  min={50}
                  className="w-24"
                  onChange={(e) => setTravelCosts((prev) => ({ ...prev, stayThresholdKm: Number(e.target.value) || 0 }))}
                />
              </div>

              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium text-card-foreground">Stay Cost (₹)</p>
                <p className="text-xs text-muted-foreground mb-2">Amount added when travel crosses the stay threshold</p>
                <Input
                  type="number"
                  value={travelCosts.stayCost}
                  min={0}
                  className="w-28"
                  onChange={(e) => setTravelCosts((prev) => ({ ...prev, stayCost: Number(e.target.value) || 0 }))}
                />
              </div>

              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium text-card-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Working Hours</p>
                <p className="text-xs text-muted-foreground mb-2">Default working hours for new agents</p>
                <div className="flex items-center gap-2">
                  <Input type="time" defaultValue="07:00" className="w-32" />
                  <span className="text-muted-foreground">to</span>
                  <Input type="time" defaultValue="17:00" className="w-32" />
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium text-card-foreground flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Max Agents Per Manager</p>
                <p className="text-xs text-muted-foreground mb-2">Maximum agents a single manager can oversee</p>
                <Input type="number" defaultValue={10} min={1} max={50} className="w-24" />
              </div>
            </div>

            <Button onClick={handleSaveSystem} className="w-full">
              <Save className="h-4 w-4 mr-1" /> Save Configuration
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="region" className="mt-4">
          <div className="bg-card border rounded-xl p-6 shadow-card max-w-lg space-y-4">
            <h3 className="font-semibold text-card-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Regional Settings — Karnataka
            </h3>

            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium text-card-foreground">Operating State</p>
                <p className="text-xs text-muted-foreground mb-2">Primary state of operations</p>
                <Input value="Karnataka" disabled className="bg-muted w-40" />
              </div>

              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium text-card-foreground">Default City</p>
                <p className="text-xs text-muted-foreground mb-2">Default city for new claims</p>
                <Select defaultValue="Bangalore Urban">
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {karnatakaDistricts.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium text-card-foreground flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" /> Currency
                </p>
                <p className="text-xs text-muted-foreground mb-2">Display currency for costs</p>
                <Input value="₹ INR" disabled className="bg-muted w-32" />
              </div>

              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium text-card-foreground">Language</p>
                <p className="text-xs text-muted-foreground mb-2">Primary communication language</p>
                <Select defaultValue="en">
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium text-card-foreground">Covered Districts</p>
                <p className="text-xs text-muted-foreground mb-2">Districts where service is active</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {karnatakaDistricts.slice(0, 10).map((d) => (
                    <span key={d} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{d}</span>
                  ))}
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">+{karnatakaDistricts.length - 10} more</span>
                </div>
              </div>
            </div>

            <Button onClick={() => toast.success("Regional settings saved")} className="w-full">
              <Save className="h-4 w-4 mr-1" /> Save Regional Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
