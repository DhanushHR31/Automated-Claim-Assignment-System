export interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string;
  homeCity: string;
  homeState: string;
  latitude: number;
  longitude: number;
  availability: "available" | "on_assignment" | "on_leave";
  workingHoursStart: string;
  workingHoursEnd: string;
  travelAllowed: boolean;
  performanceScore: number;
  activeClaims: number;
  avatar?: string;
}

export interface Claim {
  id: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  claimType: "accident" | "property" | "health" | "natural_disaster" | "industrial";
  urgency: "low" | "medium" | "high" | "emergency";
  status: "pending" | "assigned" | "in_progress" | "completed" | "closed";
  timestamp: string;
  description: string;
  estimatedValue: number;
  assignedAgentId?: string;
}

export interface Assignment {
  id: string;
  claimId: string;
  agentId: string;
  assignedTime: string;
  distance: number;
  travelCost: number;
  hotelCost: number;
  totalCost: number;
  status: "pending" | "accepted" | "in_transit" | "inspecting" | "completed";
  overridden: boolean;
  overrideReason?: string;
  overriddenBy?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  claimId: string;
  agentId?: string;
  performedBy: string;
  timestamp: string;
  details: string;
}

export const agents: Agent[] = [
  { id: "AGT-001", name: "Rajesh Kumar", phone: "+91-9876543210", email: "rajesh@claims.co", homeCity: "Bangalore", homeState: "Karnataka", latitude: 12.9716, longitude: 77.5946, availability: "available", workingHoursStart: "07:00", workingHoursEnd: "17:00", travelAllowed: true, performanceScore: 92, activeClaims: 2 },
  { id: "AGT-002", name: "Priya Sharma", phone: "+91-9876543211", email: "priya@claims.co", homeCity: "Mysore", homeState: "Karnataka", latitude: 12.2958, longitude: 76.6394, availability: "available", workingHoursStart: "08:00", workingHoursEnd: "18:00", travelAllowed: true, performanceScore: 88, activeClaims: 1 },
  { id: "AGT-003", name: "Amit Patel", phone: "+91-9876543212", email: "amit@claims.co", homeCity: "Chennai", homeState: "Tamil Nadu", latitude: 13.0827, longitude: 80.2707, availability: "on_assignment", workingHoursStart: "07:00", workingHoursEnd: "17:00", travelAllowed: false, performanceScore: 85, activeClaims: 4 },
  { id: "AGT-004", name: "Sneha Reddy", phone: "+91-9876543213", email: "sneha@claims.co", homeCity: "Hyderabad", homeState: "Telangana", latitude: 17.385, longitude: 78.4867, availability: "available", workingHoursStart: "09:00", workingHoursEnd: "19:00", travelAllowed: true, performanceScore: 95, activeClaims: 1 },
  { id: "AGT-005", name: "Vikram Singh", phone: "+91-9876543214", email: "vikram@claims.co", homeCity: "Mumbai", homeState: "Maharashtra", latitude: 19.076, longitude: 72.8777, availability: "on_leave", workingHoursStart: "07:00", workingHoursEnd: "17:00", travelAllowed: true, performanceScore: 78, activeClaims: 0 },
  { id: "AGT-006", name: "Ananya Das", phone: "+91-9876543215", email: "ananya@claims.co", homeCity: "Pune", homeState: "Maharashtra", latitude: 18.5204, longitude: 73.8567, availability: "available", workingHoursStart: "08:00", workingHoursEnd: "18:00", travelAllowed: false, performanceScore: 90, activeClaims: 3 },
  { id: "AGT-007", name: "Karthik Nair", phone: "+91-9876543216", email: "karthik@claims.co", homeCity: "Kochi", homeState: "Kerala", latitude: 9.9312, longitude: 76.2673, availability: "available", workingHoursStart: "07:00", workingHoursEnd: "17:00", travelAllowed: true, performanceScore: 82, activeClaims: 2 },
  { id: "AGT-008", name: "Deepa Iyer", phone: "+91-9876543217", email: "deepa@claims.co", homeCity: "Coimbatore", homeState: "Tamil Nadu", latitude: 11.0168, longitude: 76.9558, availability: "available", workingHoursStart: "08:00", workingHoursEnd: "17:00", travelAllowed: true, performanceScore: 87, activeClaims: 1 },
];

export const claims: Claim[] = [
  { id: "CLM-001", address: "MG Road, Bangalore", city: "Bangalore", state: "Karnataka", latitude: 12.9758, longitude: 77.6045, claimType: "accident", urgency: "high", status: "pending", timestamp: "2026-03-15T08:30:00Z", description: "Vehicle collision at MG Road junction", estimatedValue: 250000 },
  { id: "CLM-002", address: "Mysore Palace Road", city: "Mysore", state: "Karnataka", latitude: 12.3051, longitude: 76.6551, claimType: "property", urgency: "medium", status: "assigned", timestamp: "2026-03-15T09:15:00Z", description: "Water damage to commercial property", estimatedValue: 500000, assignedAgentId: "AGT-002" },
  { id: "CLM-003", address: "Anna Nagar, Chennai", city: "Chennai", state: "Tamil Nadu", latitude: 13.085, longitude: 80.2101, claimType: "health", urgency: "low", status: "in_progress", timestamp: "2026-03-14T14:00:00Z", description: "Health insurance claim for hospital treatment", estimatedValue: 150000, assignedAgentId: "AGT-003" },
  { id: "CLM-004", address: "Banjara Hills, Hyderabad", city: "Hyderabad", state: "Telangana", latitude: 17.4156, longitude: 78.4347, claimType: "natural_disaster", urgency: "emergency", status: "pending", timestamp: "2026-03-15T06:00:00Z", description: "Flood damage to residential complex", estimatedValue: 1200000 },
  { id: "CLM-005", address: "Andheri West, Mumbai", city: "Mumbai", state: "Maharashtra", latitude: 19.1364, longitude: 72.8296, claimType: "industrial", urgency: "high", status: "pending", timestamp: "2026-03-15T10:00:00Z", description: "Factory equipment damage due to fire", estimatedValue: 3500000 },
  { id: "CLM-006", address: "Koregaon Park, Pune", city: "Pune", state: "Maharashtra", latitude: 18.5362, longitude: 73.8936, claimType: "accident", urgency: "medium", status: "completed", timestamp: "2026-03-13T11:30:00Z", description: "Two-wheeler accident damage claim", estimatedValue: 75000, assignedAgentId: "AGT-006" },
  { id: "CLM-007", address: "Marine Drive, Kochi", city: "Kochi", state: "Kerala", latitude: 9.9816, longitude: 76.2755, claimType: "property", urgency: "low", status: "assigned", timestamp: "2026-03-14T16:00:00Z", description: "Storm damage to warehouse roof", estimatedValue: 320000, assignedAgentId: "AGT-007" },
];

export const assignments: Assignment[] = [
  { id: "ASG-001", claimId: "CLM-002", agentId: "AGT-002", assignedTime: "2026-03-15T09:20:00Z", distance: 5.2, travelCost: 260, hotelCost: 0, totalCost: 260, status: "inspecting", overridden: false },
  { id: "ASG-002", claimId: "CLM-003", agentId: "AGT-003", assignedTime: "2026-03-14T14:30:00Z", distance: 8.1, travelCost: 405, hotelCost: 0, totalCost: 405, status: "completed", overridden: false },
  { id: "ASG-003", claimId: "CLM-006", agentId: "AGT-006", assignedTime: "2026-03-13T12:00:00Z", distance: 3.4, travelCost: 170, hotelCost: 0, totalCost: 170, status: "completed", overridden: true, overrideReason: "Agent requested swap due to personal commitment", overriddenBy: "Manager Singh" },
  { id: "ASG-004", claimId: "CLM-007", agentId: "AGT-007", assignedTime: "2026-03-14T16:15:00Z", distance: 6.7, travelCost: 335, hotelCost: 0, totalCost: 335, status: "in_transit", overridden: false },
];

export const auditLogs: AuditLog[] = [
  { id: "LOG-001", action: "claim_created", claimId: "CLM-001", performedBy: "System", timestamp: "2026-03-15T08:30:00Z", details: "New claim submitted via portal" },
  { id: "LOG-002", action: "auto_assigned", claimId: "CLM-002", agentId: "AGT-002", performedBy: "Assignment Engine", timestamp: "2026-03-15T09:20:00Z", details: "Auto-assigned based on proximity score 0.94" },
  { id: "LOG-003", action: "manual_override", claimId: "CLM-006", agentId: "AGT-006", performedBy: "Manager Singh", timestamp: "2026-03-13T12:00:00Z", details: "Override: Agent requested swap due to personal commitment" },
  { id: "LOG-004", action: "status_update", claimId: "CLM-003", agentId: "AGT-003", performedBy: "AGT-003", timestamp: "2026-03-14T15:00:00Z", details: "Status changed to in_progress" },
  { id: "LOG-005", action: "claim_completed", claimId: "CLM-006", agentId: "AGT-006", performedBy: "AGT-006", timestamp: "2026-03-13T17:00:00Z", details: "Inspection completed, report uploaded" },
];

// Distance calculation using Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Assignment scoring engine
export function scoreAgent(agent: Agent, claim: Claim): { score: number; distance: number; travelCost: number; hotelCost: number } {
  const distance = calculateDistance(agent.latitude, agent.longitude, claim.latitude, claim.longitude);
  const maxDistance = 2000;
  const distanceScore = Math.max(0, 1 - distance / maxDistance);
  const performanceScore = agent.performanceScore / 100;
  const availabilityScore = agent.availability === "available" ? 1 : 0;
  const workloadScore = Math.max(0, 1 - agent.activeClaims / 6);
  const travelScore = agent.travelAllowed || distance < 100 ? 1 : 0;
  const sameCity = agent.homeCity === claim.city ? 0.2 : 0;
  const sameState = agent.homeState === claim.state ? 0.1 : 0;

  const score = (0.35 * distanceScore + 0.25 * performanceScore + 0.15 * availabilityScore + 0.1 * workloadScore + 0.05 * travelScore + sameCity + sameState) * (availabilityScore > 0 ? 1 : 0) * (travelScore > 0 ? 1 : 0);

  const travelCost = Math.round(distance * 8);
  const hotelCost = distance > 200 ? 3500 : 0;

  return { score: Math.round(score * 100) / 100, distance, travelCost, hotelCost };
}

export function getBestAgents(claim: Claim, agentList: Agent[]): Array<Agent & { score: number; distance: number; travelCost: number; hotelCost: number }> {
  return agentList
    .map((agent) => {
      const result = scoreAgent(agent, claim);
      return { ...agent, ...result };
    })
    .sort((a, b) => b.score - a.score);
}
