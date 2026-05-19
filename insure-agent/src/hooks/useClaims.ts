import { useState, useEffect, useCallback } from "react";
import { useAuth } from '@/hooks/useAuth';
import { toast } from "sonner";

export interface DBClaim {
  id: string;
  claim_number: string;
  claim_type: string;
  priority: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  policy_number: string;
  incident_description: string | null;
  claim_amount: number;
  location_address: string;
  location_lat: number;
  location_lng: number;
  district: string;
  assigned_agent_id: string | null;
  assigned_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

const API_BASE = "http://localhost:8000";

export function useClaims() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<DBClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("agent_token");

  const fetchClaims = useCallback(async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const respAssigned = await fetch(`${API_BASE}/agent/claims?agent_id=${user.id}`, { headers });
      const assignedData = await respAssigned.json();

      const respQueue = await fetch(`${API_BASE}/agent/claims/queue`, { headers });
      const queueData = await respQueue.json();

      if (!respAssigned.ok || !respQueue.ok) {
        throw new Error("Failed to fetch claims");
      }

      const combinedClaims = [...(assignedData || []), ...(queueData || [])];
      const uniqueClaims = Array.from(new Map(combinedClaims.map((claim: any) => [claim.id, claim])).values());
      uniqueClaims.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setClaims(uniqueClaims as DBClaim[]);
    } catch (err) {
      console.error("Failed to fetch claims:", err);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const acceptClaim = async (claimId: string) => {
    if (!user || !token) return false;
    try {
      const resp = await fetch(`${API_BASE}/agent/claims/${claimId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: "accepted", 
          accepted_at: new Date().toISOString(), 
          assigned_agent_id: user.id 
        }),
      });
      if (!resp.ok) throw new Error("Failed to accept claim");
      
      toast.success("Claim accepted!");
      await fetchClaims();
      return true;
    } catch (err) {
      toast.error("Failed to accept claim");
      return false;
    }
  };

  const updateClaimStatus = async (claimId: string, status: string) => {
    if (!token) return false;
    try {
      const updates: any = { status };
      if (status === "completed") updates.completed_at = new Date().toISOString();
      
      const resp = await fetch(`${API_BASE}/agent/claims/${claimId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates),
      });
      if (!resp.ok) throw new Error("Failed to update status");

      toast.success(`Claim status updated to: ${status}`);
      await fetchClaims();
      return true;
    } catch (err) {
      toast.error("Failed to update claim status");
      return false;
    }
  };

  const rejectClaim = async (claimId: string) => {
    if (!token) return false;
    try {
      const resp = await fetch(`${API_BASE}/agent/claims/${claimId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: "assigned", assigned_agent_id: null }),
      });
      if (!resp.ok) throw new Error("Failed to reject claim");

      toast.info("Claim rejected. Manager notified.");
      await fetchClaims();
      return true;
    } catch (err) {
      toast.error("Failed to reject claim");
      return false;
    }
  };

  const uploadDocument = async (claimId: string, file: File, type: string = "evidence") => {
    if (!token) return false;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", type);

      const resp = await fetch(`${API_BASE}/agent/claims/${claimId}/documents`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });
      if (!resp.ok) throw new Error("Failed to upload document");

      toast.success("Document uploaded to server ✓");
      await fetchClaims();
      return true;
    } catch (err) {
      toast.error("Upload failed");
      return false;
    }
  };

  const fetchDocuments = async (claimId: string) => {
    if (!token) return [];
    try {
      const resp = await fetch(`${API_BASE}/claims/${claimId}/all-documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) return [];
      return await resp.json();
    } catch (err) {
      return [];
    }
  };

  return { claims, loading, fetchClaims, acceptClaim, updateClaimStatus, rejectClaim, uploadDocument, fetchDocuments };
}

export function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getPriorityColor(priority: string) {
  switch (priority.toLowerCase()) {
    case "emergency": return "destructive";
    case "high": return "destructive";
    case "medium": return "warning";
    case "low": return "success";
    default: return "muted";
  }
}

export function getPriorityLabel(priority: string) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function getClaimTypeIcon(type: string) {
  switch (type.toLowerCase()) {
    case "vehicle": return "🚗";
    case "health": return "🏥";
    case "fire": return "🔥";
    case "property": return "🏠";
    default: return "📋";
  }
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "assigned": return "info";
    case "accepted": return "primary";
    case "in progress": return "warning";
    case "documents uploaded": return "warning";
    case "submitted": return "info";
    case "approved": return "success";
    case "completed": return "success";
    default: return "muted";
  }
}
