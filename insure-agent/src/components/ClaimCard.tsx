import { Link } from "react-router-dom";
import { DBClaim, getPriorityColor, getClaimTypeIcon, getPriorityLabel } from "@/hooks/useClaims";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, IndianRupee, ChevronRight, CheckCircle2, XCircle } from "lucide-react";

interface ClaimCardProps {
  claim: DBClaim;
  onAccept?: () => void;
  onReject?: () => void;
}

const statusLabels: Record<string, string> = {
  assigned: "Assigned",
  accepted: "Accepted",
  in_progress: "In Progress",
  documents_uploaded: "Docs Uploaded",
  submitted: "Submitted",
  approved: "Approved",
  completed: "Completed",
};

export function ClaimCard({ claim, onAccept, onReject }: ClaimCardProps) {
  const isEmergency = claim.priority === "emergency";

  return (
    <Link to={`/claims/${claim.id}`}>
      <div className={`rounded-xl border bg-card p-4 hover:shadow-md transition-all cursor-pointer ${
        isEmergency ? "border-destructive/40 bg-destructive/5 animate-pulse-emergency" : "border-border"
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getClaimTypeIcon(claim.claim_type)}</span>
            <div>
              <h3 className="text-sm font-bold">{claim.claim_number}</h3>
              <p className="text-[11px] text-muted-foreground">{claim.claim_type} • {claim.district}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isEmergency ? "destructive" : "outline"} className="text-[10px]">
              {isEmergency && "🚨 "}{getPriorityLabel(claim.priority)}
            </Badge>
            <Badge variant="outline" className="text-[10px]">{statusLabels[claim.status] || claim.status}</Badge>
          </div>
        </div>

        <p className="text-sm font-medium mb-1">{claim.customer_name}</p>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{claim.incident_description || "No description"}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{claim.district}</span>
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <IndianRupee className="h-3 w-3" />{claim.claim_amount.toLocaleString()}
            </span>
          </div>

          {onAccept && (
            <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
              <Button size="sm" className="h-7 text-xs bg-success hover:bg-success/90 text-success-foreground" onClick={onAccept}>
                <CheckCircle2 className="h-3 w-3 mr-1" /> Accept
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs border-destructive text-destructive" onClick={onReject}>
                <XCircle className="h-3 w-3 mr-1" /> Reject
              </Button>
            </div>
          )}

          {!onAccept && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>
    </Link>
  );
}
