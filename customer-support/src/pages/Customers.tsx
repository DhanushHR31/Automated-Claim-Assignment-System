import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Users, Mail, Phone, MapPin, Eye,
  FileText, ShieldCheck, CreditCard, AlertCircle,
  CheckCircle, Clock, XCircle, User, Calendar,
  BadgeCheck, BadgeX, IndianRupee, TrendingUp,
  ArrowDownCircle, ArrowUpCircle, Banknote
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const API_BASE = "http://localhost:8000";

const fetchWithAuth = async (url: string) => {
  const token = localStorage.getItem("manager_token");
  const resp = await fetch(`${API_BASE}${url}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!resp.ok) throw new Error("Request failed");
  return resp.json();
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface CustomerSummary {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  is_active: boolean;
  created_at: string;
  policy_count: number;
  claim_count: number;
}

interface CustomerDetail {
  user: { id: string; email: string; full_name: string | null; role: string; is_active: boolean; created_at: string };
  profile: {
    full_name: string | null; date_of_birth: string | null; phone: string | null;
    avatar_url: string | null; address: string | null; city: string | null; state: string | null;
  } | null;
  kyc_documents: Array<{
    id: string; document_type: string; document_number: string | null;
    verification_status: string; notes: string | null; created_at: string;
  }>;
  insurance_policies: Array<{
    id: string; policy_number: string; name: string; type: string; provider: string | null;
    premium: number; coverage: number; status: string; expiry_date: string;
    auto_payment: boolean; payment_method: string | null; created_at: string;
  }>;
  claims: Array<{
    id: string; policy_id: string; policy_name: string | null; policy_number: string | null;
    description: string | null; amount: number; status: string; progress: number;
    submitted_at: string; created_at: string;
  }>;
  payments: Array<{
    id: string; policy_id: string; policy_number: string | null; policy_name: string | null;
    amount: number; payment_method: string | null; transaction_id: string | null;
    status: string; payment_type: string; month_number: number | null;
    notes: string | null; paid_at: string;
  }>;
  payment_summary: {
    total_paid: number;
    total_transactions: number;
    successful: number;
    failed: number;
  };
}

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useCustomers(search: string) {
  return useQuery<CustomerSummary[]>({
    queryKey: ["support_customers", search],
    queryFn: () => fetchWithAuth(`/support/customers${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  });
}

function useCustomerDetail(id: string | null) {
  return useQuery<CustomerDetail>({
    queryKey: ["support_customer_detail", id],
    queryFn: () => fetchWithAuth(`/support/customers/${id}`),
    enabled: !!id,
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function kycStatusIcon(status: string) {
  if (status === "verified") return <BadgeCheck className="h-4 w-4 text-green-500" />;
  if (status === "rejected") return <BadgeX className="h-4 w-4 text-red-500" />;
  return <Clock className="h-4 w-4 text-yellow-500" />;
}

function kycStatusBadge(status: string) {
  const map: Record<string, string> = {
    verified: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${map[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

function policyStatusBadge(status: string) {
  const map: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    Expired: "bg-red-100 text-red-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Cancelled: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${map[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

function claimStatusBadge(status: string) {
  const map: Record<string, string> = {
    Submitted: "bg-blue-100 text-blue-700",
    "Under Review": "bg-yellow-100 text-yellow-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Settled: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${map[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

function initials(name: string | null, email: string) {
  if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  return email[0].toUpperCase();
}

// ── Customer Detail Modal ─────────────────────────────────────────────────────
function CustomerDetailModal({ customerId, onClose }: { customerId: string; onClose: () => void }) {
  const { data, isLoading } = useCustomerDetail(customerId);
  const [tab, setTab] = useState("profile");

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-muted-foreground text-sm">Loading customer data...</p>
          </div>
        ) : data ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">
                  {initials(data.profile?.full_name || data.user.full_name, data.user.email)}
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-xl">
                    {data.profile?.full_name || data.user.full_name || data.user.email}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">{data.user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-muted-foreground">UID: {data.user.id.slice(0, 8)}…</span>
                      {(data.user as any).custom_id && (
                        <Badge variant="secondary" className="text-[10px]">ID: {(data.user as any).custom_id}</Badge>
                      )}
                      <Badge variant={data.user.is_active ? "default" : "secondary"} className="text-[10px]">
                        {data.user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
                {/* Summary pills */}
                <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                  <div className="text-center bg-muted/50 rounded-lg px-3 py-2">
                    <p className="text-lg font-bold text-primary">{data.insurance_policies.length}</p>
                    <p className="text-[10px] text-muted-foreground">Policies</p>
                  </div>
                  <div className="text-center bg-muted/50 rounded-lg px-3 py-2">
                    <p className="text-lg font-bold text-orange-500">{data.claims.length}</p>
                    <p className="text-[10px] text-muted-foreground">Claims</p>
                  </div>
                  <div className="text-center bg-muted/50 rounded-lg px-3 py-2">
                    <p className="text-lg font-bold text-green-600">
                      ₹{Number(data.payment_summary?.total_paid || 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Total Paid</p>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <Tabs value={tab} onValueChange={setTab} className="mt-2">
              <TabsList className="w-full grid grid-cols-5">
                <TabsTrigger value="profile" className="text-xs">
                  <User className="h-3.5 w-3.5 mr-1" /> Profile
                </TabsTrigger>
                <TabsTrigger value="kyc" className="text-xs">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" /> KYC ({data.kyc_documents.length})
                </TabsTrigger>
                <TabsTrigger value="policies" className="text-xs">
                  <FileText className="h-3.5 w-3.5 mr-1" /> Policies ({data.insurance_policies.length})
                </TabsTrigger>
                <TabsTrigger value="claims" className="text-xs">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" /> Claims ({data.claims.length})
                </TabsTrigger>
                <TabsTrigger value="payments" className="text-xs">
                  <CreditCard className="h-3.5 w-3.5 mr-1" /> Payments ({data.payments?.length || 0})
                </TabsTrigger>
              </TabsList>

              {/* ── Profile Tab ── */}
              <TabsContent value="profile" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Full Name", value: data.profile?.full_name || data.user.full_name },
                    { label: "Email", value: data.user.email },
                    { label: "Phone", value: data.profile?.phone },
                    { label: "Date of Birth", value: data.profile?.date_of_birth },
                    { label: "City", value: data.profile?.city },
                    { label: "State", value: data.profile?.state },
                    { label: "Address", value: data.profile?.address },
                    { label: "Member Since", value: new Date(data.user.created_at).toLocaleDateString() },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-muted/40 rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-medium text-card-foreground mt-0.5">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* ── KYC Tab ── */}
              <TabsContent value="kyc" className="mt-4 space-y-3">
                {data.kyc_documents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No KYC documents submitted yet</p>
                ) : (
                  data.kyc_documents.map((doc) => (
                    <div key={doc.id} className="border rounded-xl p-4 flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {kycStatusIcon(doc.verification_status)}
                        <div>
                          <p className="font-medium text-sm text-card-foreground capitalize">
                            {doc.document_type.replace(/_/g, " ")}
                          </p>
                          {doc.document_number && (
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">{doc.document_number}</p>
                          )}
                          {doc.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{doc.notes}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Submitted {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {kycStatusBadge(doc.verification_status)}
                    </div>
                  ))
                )}
              </TabsContent>

              {/* ── Policies Tab ── */}
              <TabsContent value="policies" className="mt-4 space-y-3">
                {data.insurance_policies.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No insurance policies purchased yet</p>
                ) : (
                  data.insurance_policies.map((p) => (
                    <div key={p.id} className="border rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-card-foreground">{p.name}</p>
                          <p className="text-xs font-mono text-muted-foreground">{p.policy_number}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{p.type}</Badge>
                          {policyStatusBadge(p.status)}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-muted/40 rounded-lg p-2">
                          <p className="text-xs font-bold text-primary">₹{Number(p.premium).toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">Premium/yr</p>
                        </div>
                        <div className="bg-muted/40 rounded-lg p-2">
                          <p className="text-xs font-bold text-green-600">₹{Number(p.coverage).toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">Coverage</p>
                        </div>
                        <div className="bg-muted/40 rounded-lg p-2">
                          <p className="text-xs font-bold text-card-foreground">{p.expiry_date}</p>
                          <p className="text-[10px] text-muted-foreground">Expiry</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        {p.provider && <span>Provider: {p.provider}</span>}
                        {p.payment_method && <span>Payment: {p.payment_method}</span>}
                        {p.auto_payment && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" /> Auto-pay
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              {/* ── Claims Tab ── */}
              <TabsContent value="claims" className="mt-4 space-y-3">
                {data.claims.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No claims filed yet</p>
                ) : (
                  data.claims.map((c) => (
                    <div key={c.id} className="border rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm text-card-foreground">
                            {c.policy_name || "Unknown Policy"}
                          </p>
                          {c.policy_number && (
                            <p className="text-xs font-mono text-muted-foreground">{c.policy_number}</p>
                          )}
                        </div>
                        {claimStatusBadge(c.status)}
                      </div>
                      {c.description && (
                        <p className="text-sm text-muted-foreground mb-3">{c.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="font-semibold text-card-foreground">₹{Number(c.amount).toLocaleString()}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(c.submitted_at).toLocaleDateString()}
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${c.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{c.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              {/* ── Payments Tab ── */}
              <TabsContent value="payments" className="mt-4 space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Total Paid", value: `₹${Number(data.payment_summary?.total_paid || 0).toLocaleString()}`, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Transactions", value: data.payment_summary?.total_transactions || 0, color: "text-primary", bg: "bg-primary/5" },
                    { label: "Successful", value: data.payment_summary?.successful || 0, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Failed", value: data.payment_summary?.failed || 0, color: "text-red-500", bg: "bg-red-50" },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                      <p className={`text-base font-bold ${color}`}>{value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Payment History Table */}
                {!data.payments || data.payments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No payment records found</p>
                ) : (
                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/40">
                          <th className="text-left px-3 py-2.5 text-muted-foreground font-medium text-xs">#</th>
                          <th className="text-left px-3 py-2.5 text-muted-foreground font-medium text-xs">Policy</th>
                          <th className="text-left px-3 py-2.5 text-muted-foreground font-medium text-xs">Amount</th>
                          <th className="text-left px-3 py-2.5 text-muted-foreground font-medium text-xs">Method</th>
                          <th className="text-left px-3 py-2.5 text-muted-foreground font-medium text-xs">Transaction ID</th>
                          <th className="text-left px-3 py-2.5 text-muted-foreground font-medium text-xs">Date</th>
                          <th className="text-left px-3 py-2.5 text-muted-foreground font-medium text-xs">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.payments.map((p, idx) => (
                          <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                            <td className="px-3 py-2.5 text-xs text-muted-foreground">
                              {p.payment_type === "premium" && p.month_number
                                ? `Month ${p.month_number}`
                                : `#${idx + 1}`}
                            </td>
                            <td className="px-3 py-2.5">
                              <p className="text-xs font-medium text-card-foreground truncate max-w-[110px]">
                                {p.policy_name || "—"}
                              </p>
                              {p.policy_number && (
                                <p className="text-[10px] text-muted-foreground font-mono">{p.policy_number}</p>
                              )}
                            </td>
                            <td className="px-3 py-2.5">
                              <span className="text-sm font-semibold text-green-600">
                                ₹{Number(p.amount).toLocaleString()}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-xs text-muted-foreground">
                              {p.payment_method || "—"}
                            </td>
                            <td className="px-3 py-2.5">
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {p.transaction_id || "—"}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(p.paid_at).toLocaleDateString("en-IN", {
                                day: "2-digit", month: "short", year: "numeric",
                              })}
                            </td>
                            <td className="px-3 py-2.5">
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                p.status === "success" ? "bg-green-100 text-green-700"
                                : p.status === "failed" ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                              }`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <p className="text-center text-muted-foreground py-8">Customer not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Customers() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: customers = [], isLoading } = useCustomers(debouncedSearch);

  const [searchId, setSearchId] = useState("");
  const [isSearchingId, setIsSearchingId] = useState(false);

  const handleSearch = (v: string) => {
    setSearch(v);
    clearTimeout((window as any)._searchTimer);
    (window as any)._searchTimer = setTimeout(() => setDebouncedSearch(v), 400);
  };

  const handleIdSearch = async () => {
    if (!searchId.trim()) return;
    setIsSearchingId(true);
    const token = localStorage.getItem("manager_token");
    try {
      const resp = await fetch(`${API_BASE}/support/search/customer/${searchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        // The endpoint returns full detail, we can just open the modal with this ID
        setSelectedId(data.user.id);
        toast.success("Customer found");
      } else {
        toast.error("Customer not found", { description: "No customer with this 8-digit ID exists." });
      }
    } catch (err) {
      console.error(err);
      toast.error("Search failed");
    } finally {
      setIsSearchingId(false);
    }
  };

  const filtered = customers.filter((c) => {
    if (statusFilter === "active") return c.is_active;
    if (statusFilter === "inactive") return !c.is_active;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Customers</h1>
        <p className="text-muted-foreground text-sm mt-1">
          All registered customers from the customer portal — click any row to view full details
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Customers", value: customers.length, color: "text-primary" },
          { label: "Active", value: customers.filter((c) => c.is_active).length, color: "text-green-600" },
          { label: "Total Policies", value: customers.reduce((s, c) => s + c.policy_count, 0), color: "text-blue-600" },
          { label: "Total Claims", value: customers.reduce((s, c) => s + c.claim_count, 0), color: "text-orange-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border rounded-xl p-4 text-center shadow-card">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Input 
            placeholder="8-digit ID..." 
            value={searchId} 
            onChange={(e) => setSearchId(e.target.value)} 
            className="w-32"
            maxLength={8}
          />
          <Button variant="secondary" onClick={handleIdSearch} disabled={isSearchingId}>
            {isSearchingId ? "..." : "Fetch"}
          </Button>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-xl shadow-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-muted-foreground text-sm">Loading customers...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Customer</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Contact</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Location</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Policies</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Claims</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Joined</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedId(c.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-xs shrink-0">
                          {initials(c.full_name, c.email)}
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">{c.full_name || "—"}</p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs text-muted-foreground font-mono">{c.id.slice(0, 8)}…</p>
                            {(c as any).custom_id && <Badge variant="secondary" className="text-[9px] h-4 px-1">ID: {(c as any).custom_id}</Badge>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" /> {c.email}
                        </p>
                        {c.phone && (
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" /> {c.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {[c.city, c.state].filter(Boolean).join(", ") || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        <FileText className="h-3 w-3" /> {c.policy_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                        <AlertCircle className="h-3 w-3" /> {c.claim_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={c.is_active ? "default" : "secondary"} className="text-xs">
                        {c.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={(e) => { e.stopPropagation(); setSelectedId(c.id); }}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
                      {customers.length === 0
                        ? "No customers have registered yet in the customer portal."
                        : "No customers match your search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedId && (
        <CustomerDetailModal customerId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
