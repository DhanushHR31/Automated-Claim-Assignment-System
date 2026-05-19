export type AgentAvailability = "available" | "on_assignment" | "on_leave";
export type ClaimStatus = "pending" | "assigned" | "in_progress" | "completed" | "closed";
export type ClaimType = "accident" | "property" | "health" | "natural_disaster" | "industrial";
export type ClaimUrgency = "low" | "medium" | "high" | "emergency";
export type AssignmentStatus = "pending" | "accepted" | "in_transit" | "inspecting" | "completed";

export interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string;
  home_city: string;
  home_state: string;
  latitude: number;
  longitude: number;
  availability: AgentAvailability;
  working_hours_start: string;
  working_hours_end: string;
  travel_allowed: boolean;
  performance_score: number;
  active_claims: number;
  agent_code: string;
  manager_id: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Claim {
  id: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  claim_type: ClaimType;
  urgency: ClaimUrgency;
  status: ClaimStatus;
  description: string;
  estimated_value: number;
  assigned_agent_id: string | null;
  claim_code: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  claim_id: string;
  agent_id: string;
  assignment_code: string;
  assigned_time: string;
  distance: number;
  travel_cost: number;
  hotel_cost: number;
  total_cost: number;
  status: AssignmentStatus;
  overridden: boolean;
  override_reason: string | null;
  overridden_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  claim_id: string | null;
  agent_id: string | null;
  performed_by: string;
  details: string | null;
  created_at: string;
}
