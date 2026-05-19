import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { calculateTravelCost } from "@/lib/travelCost";

export const API_BASE = "http://localhost:8000";

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const token = localStorage.getItem("manager_token");
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "API request failed");
  }
  return response.json();
}

// ── Agents ────────────────────────────────────────────────────────────────────
export function useAgents() {
  return useQuery({ queryKey: ["agents"], queryFn: () => fetchAPI("/agents") });
}

export function useCreateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (agent: any) => fetchAPI("/agents", { method: "POST", body: JSON.stringify(agent) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agents"] }),
  });
}

export function useUpdateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & any) =>
      fetchAPI(`/agents/${id}`, { method: "PATCH", body: JSON.stringify(updates) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agents"] }),
  });
}

// ── Support Claims ────────────────────────────────────────────────────────────
export function useClaims() {
  return useQuery({ queryKey: ["support_claims"], queryFn: () => fetchAPI("/support-claims") });
}

export function useCreateClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (claim: any) => fetchAPI("/support-claims", { method: "POST", body: JSON.stringify(claim) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["support_claims"] }),
  });
}

export function useUpdateClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & any) =>
      fetchAPI(`/support-claims/${id}`, { method: "PATCH", body: JSON.stringify(updates) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support_claims"] });
    },
  });
}

// ── Assignments ───────────────────────────────────────────────────────────────
export function useAssignments() {
  return useQuery({ queryKey: ["assignments"], queryFn: () => fetchAPI("/assignments") });
}

export function useCreateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assignment: any) => fetchAPI("/assignments", { method: "POST", body: JSON.stringify(assignment) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
      qc.invalidateQueries({ queryKey: ["support_claims"] });
    },
  });
}

export function useUpdateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & any) =>
      fetchAPI(`/assignments/${id}`, { method: "PATCH", body: JSON.stringify(updates) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments"] }),
  });
}

// ── Audit Logs ────────────────────────────────────────────────────────────────
export function useAuditLogs() {
  return useQuery({ queryKey: ["audit_logs"], queryFn: () => fetchAPI("/audit-logs") });
}

export function useCreateAuditLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (log: any) => fetchAPI("/audit-logs", { method: "POST", body: JSON.stringify(log) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["audit_logs"] }),
  });
}

// ── Distance / Scoring ────────────────────────────────────────────────────────
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

export function scoreAgent(agent: any, claim: any) {
  const distance = calculateDistance(agent.latitude, agent.longitude, claim.latitude, claim.longitude);
  const distanceScore = Math.max(0, 1 - distance / 2000);
  const performanceScore = agent.performance_score / 100;
  const availabilityScore = agent.availability === "available" ? 1 : 0;
  const workloadScore = Math.max(0, 1 - agent.active_claims / 6);
  const travelScore = agent.travel_allowed || distance < 100 ? 1 : 0;
  const sameCity = agent.home_city === claim.city ? 0.2 : 0;
  const sameState = agent.home_state === claim.state ? 0.1 : 0;
  const score =
    (0.35 * distanceScore + 0.25 * performanceScore + 0.15 * availabilityScore +
      0.1 * workloadScore + 0.05 * travelScore + sameCity + sameState) *
    (availabilityScore > 0 ? 1 : 0) *
    (travelScore > 0 ? 1 : 0);
  const costs = calculateTravelCost(distance);
  return {
    score: Math.round(score * 100) / 100,
    distance,
    travelCost: costs.travelCost,
    hotelCost: costs.hotelCost,
    totalCost: costs.totalCost,
  };
}

export function getBestAgents(claim: any, agentList: any[]) {
  return agentList
    .map((agent) => ({ ...agent, ...scoreAgent(agent, claim) }))
    .sort((a, b) => b.score - a.score);
}
