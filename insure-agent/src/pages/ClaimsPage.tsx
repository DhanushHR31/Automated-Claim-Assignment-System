import { useState } from "react";
import { ClaimCard } from "@/components/ClaimCard";
import { useClaims } from "@/hooks/useClaims";
import { Search, FileText } from "lucide-react";

const statusFilters = ["All", "assigned", "accepted", "in_progress", "documents_uploaded", "submitted", "completed"];
const statusLabels: Record<string, string> = {
  All: "All",
  assigned: "Assigned",
  accepted: "Accepted",
  in_progress: "In Progress",
  documents_uploaded: "Docs Uploaded",
  submitted: "Submitted",
  completed: "Completed",
};

export default function ClaimsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const { claims, loading, acceptClaim, rejectClaim } = useClaims();

  const filtered = claims.filter((c) => {
    const matchSearch =
      c.claim_number.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      c.district.toLowerCase().includes(search.toLowerCase());
    const matchStatus = activeFilter === "All" || c.status === activeFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts: Record<string, number> = {
    All: claims.length,
    ...Object.fromEntries(statusFilters.slice(1).map((s) => [s, claims.filter((c) => c.status === s).length])),
  };

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Claims Management</h1>
          <p className="text-sm text-muted-foreground">Karnataka Region • {claims.length} total claims</p>
        </div>
      </div>

      <div className="relative mb-4 max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by claim ID, customer, or district..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
              activeFilter === filter
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {statusLabels[filter] || filter}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeFilter === filter ? "bg-primary-foreground/20" : "bg-background"}`}>
              {statusCounts[filter] || 0}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No claims found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            filtered.map((claim) => (
              <ClaimCard
                key={claim.id}
                claim={claim}
                onAccept={claim.status === "assigned" ? () => acceptClaim(claim.id) : undefined}
                onReject={claim.status === "assigned" ? () => rejectClaim(claim.id) : undefined}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
