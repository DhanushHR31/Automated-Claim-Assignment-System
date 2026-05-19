export const mockAgents = [
  { id: "1", name: "Rajesh Kumar", email: "rajesh@example.com", phone: "+91 98765 43210", status: "active" as const, assignedClaims: 12, completedClaims: 45, rating: 4.5, avatar: "RK", earnings: 125000, totalKmTraveled: 1842, travelCost: 18420, joiningDate: "2024-06-15", region: "Mumbai West", paymentHistory: [{ month: "Mar 2026", salary: 35000, bonus: 5000, travelAllowance: 4200, total: 44200 }, { month: "Feb 2026", salary: 35000, bonus: 3500, travelAllowance: 3800, total: 42300 }, { month: "Jan 2026", salary: 35000, bonus: 4000, travelAllowance: 4500, total: 43500 }] },
  { id: "2", name: "Priya Sharma", email: "priya@example.com", phone: "+91 87654 32109", status: "busy" as const, assignedClaims: 8, completedClaims: 62, rating: 4.8, avatar: "PS", earnings: 180000, totalKmTraveled: 2450, travelCost: 24500, joiningDate: "2023-11-20", region: "Mumbai Central", paymentHistory: [{ month: "Mar 2026", salary: 38000, bonus: 8000, travelAllowance: 5200, total: 51200 }, { month: "Feb 2026", salary: 38000, bonus: 7000, travelAllowance: 4800, total: 49800 }, { month: "Jan 2026", salary: 38000, bonus: 6500, travelAllowance: 5000, total: 49500 }] },
  { id: "3", name: "Amit Patel", email: "amit@example.com", phone: "+91 76543 21098", status: "offline" as const, assignedClaims: 0, completedClaims: 38, rating: 4.2, avatar: "AP", earnings: 95000, totalKmTraveled: 1200, travelCost: 12000, joiningDate: "2024-09-10", region: "Thane", paymentHistory: [{ month: "Mar 2026", salary: 32000, bonus: 2000, travelAllowance: 2800, total: 36800 }, { month: "Feb 2026", salary: 32000, bonus: 2500, travelAllowance: 3200, total: 37700 }, { month: "Jan 2026", salary: 32000, bonus: 1500, travelAllowance: 3000, total: 36500 }] },
  { id: "4", name: "Sneha Gupta", email: "sneha@example.com", phone: "+91 65432 10987", status: "active" as const, assignedClaims: 15, completedClaims: 71, rating: 4.9, avatar: "SG", earnings: 210000, totalKmTraveled: 2890, travelCost: 28900, joiningDate: "2023-04-05", region: "Pune", paymentHistory: [{ month: "Mar 2026", salary: 40000, bonus: 10000, travelAllowance: 6200, total: 56200 }, { month: "Feb 2026", salary: 40000, bonus: 9000, travelAllowance: 5800, total: 54800 }, { month: "Jan 2026", salary: 40000, bonus: 8500, travelAllowance: 6000, total: 54500 }] },
  { id: "5", name: "Vikram Singh", email: "vikram@example.com", phone: "+91 54321 09876", status: "busy" as const, assignedClaims: 6, completedClaims: 29, rating: 3.9, avatar: "VS", earnings: 78000, totalKmTraveled: 980, travelCost: 9800, joiningDate: "2025-01-12", region: "Mumbai South", paymentHistory: [{ month: "Mar 2026", salary: 30000, bonus: 1500, travelAllowance: 2200, total: 33700 }, { month: "Feb 2026", salary: 30000, bonus: 2000, travelAllowance: 2500, total: 34500 }, { month: "Jan 2026", salary: 30000, bonus: 1000, travelAllowance: 2000, total: 33000 }] },
  { id: "6", name: "Neha Reddy", email: "neha@example.com", phone: "+91 43210 98765", status: "active" as const, assignedClaims: 10, completedClaims: 55, rating: 4.6, avatar: "NR", earnings: 165000, totalKmTraveled: 2100, travelCost: 21000, joiningDate: "2024-02-28", region: "Bangalore", paymentHistory: [{ month: "Mar 2026", salary: 36000, bonus: 6000, travelAllowance: 4800, total: 46800 }, { month: "Feb 2026", salary: 36000, bonus: 5500, travelAllowance: 4200, total: 45700 }, { month: "Jan 2026", salary: 36000, bonus: 5000, travelAllowance: 4500, total: 45500 }] },
];

export const mockClaims = [
  { id: "CLM-001", customer: "Suresh Mehta", customerPhone: "+91 99887 76655", customerEmail: "suresh.mehta@gmail.com", customerAddress: "12, Andheri West, Mumbai 400058", agent: "Rajesh Kumar", status: "pending" as const, amount: 50000, type: "Vehicle", date: "2026-04-10", documents: 3, incidentDate: "2026-04-08", incidentLocation: "Western Express Highway, Mumbai", description: "Front bumper damage due to rear-end collision at traffic signal. Police FIR filed." },
  { id: "CLM-002", customer: "Anita Desai", customerPhone: "+91 88776 65544", customerEmail: "anita.desai@yahoo.com", customerAddress: "45, Bandra East, Mumbai 400051", agent: "Priya Sharma", status: "approved" as const, amount: 125000, type: "Health", date: "2026-04-08", documents: 5, incidentDate: "2026-04-05", incidentLocation: "Lilavati Hospital, Mumbai", description: "Emergency hospitalization for cardiac treatment. All bills and discharge summary attached." },
  { id: "CLM-003", customer: "Ramesh Iyer", customerPhone: "+91 77665 54433", customerEmail: "ramesh.iyer@outlook.com", customerAddress: "78, Shivaji Nagar, Pune 411005", agent: "Sneha Gupta", status: "in-progress" as const, amount: 75000, type: "Property", date: "2026-04-06", documents: 4, incidentDate: "2026-04-03", incidentLocation: "Shivaji Nagar, Pune", description: "Water damage to ground floor due to pipe burst. Furniture and electronics damaged." },
  { id: "CLM-004", customer: "Kavita Nair", customerPhone: "+91 66554 43322", customerEmail: "kavita.nair@gmail.com", customerAddress: "23, Koramangala, Bangalore 560034", agent: "Vikram Singh", status: "rejected" as const, amount: 30000, type: "Vehicle", date: "2026-04-05", documents: 2, incidentDate: "2026-04-02", incidentLocation: "MG Road, Bangalore", description: "Minor scratch on car door. Claim rejected due to insufficient documentation." },
  { id: "CLM-005", customer: "Deepak Joshi", customerPhone: "+91 55443 32211", customerEmail: "deepak.joshi@gmail.com", customerAddress: "56, MG Road, Bangalore 560001", agent: "Neha Reddy", status: "approved" as const, amount: 200000, type: "Health", date: "2026-04-03", documents: 6, incidentDate: "2026-03-28", incidentLocation: "Apollo Hospital, Bangalore", description: "Knee replacement surgery. Pre-authorization obtained. All medical records attached." },
  { id: "CLM-006", customer: "Meena Pillai", customerPhone: "+91 44332 21100", customerEmail: "meena.pillai@hotmail.com", customerAddress: "89, Thane West, Mumbai 400601", agent: "Amit Patel", status: "pending" as const, amount: 95000, type: "Property", date: "2026-04-01", documents: 3, incidentDate: "2026-03-29", incidentLocation: "Thane West, Mumbai", description: "Fire damage in kitchen area. Fire brigade report and photos submitted." },
  { id: "CLM-007", customer: "Arjun Rao", customerPhone: "+91 33221 10099", customerEmail: "arjun.rao@gmail.com", customerAddress: "34, Dadar, Mumbai 400014", agent: "Rajesh Kumar", status: "in-progress" as const, amount: 45000, type: "Vehicle", date: "2026-03-28", documents: 4, incidentDate: "2026-03-25", incidentLocation: "Dadar TT, Mumbai", description: "Windshield crack from road debris while driving. Dashcam footage available." },
  { id: "CLM-008", customer: "Lakshmi Das", customerPhone: "+91 22110 09988", customerEmail: "lakshmi.das@yahoo.com", customerAddress: "67, Whitefield, Bangalore 560066", agent: "Priya Sharma", status: "approved" as const, amount: 180000, type: "Health", date: "2026-03-25", documents: 7, incidentDate: "2026-03-20", incidentLocation: "Manipal Hospital, Bangalore", description: "Appendectomy surgery. Emergency admission. Complete billing and medical records." },
];

export const monthlyClaimsData = [
  { month: "Jan", claims: 45, approved: 32, rejected: 8 },
  { month: "Feb", claims: 52, approved: 38, rejected: 6 },
  { month: "Mar", claims: 61, approved: 45, rejected: 10 },
  { month: "Apr", claims: 48, approved: 35, rejected: 7 },
  { month: "May", claims: 55, approved: 42, rejected: 5 },
  { month: "Jun", claims: 67, approved: 51, rejected: 9 },
  { month: "Jul", claims: 72, approved: 58, rejected: 8 },
  { month: "Aug", claims: 58, approved: 44, rejected: 6 },
  { month: "Sep", claims: 63, approved: 49, rejected: 7 },
  { month: "Oct", claims: 70, approved: 55, rejected: 11 },
  { month: "Nov", claims: 65, approved: 50, rejected: 8 },
  { month: "Dec", claims: 78, approved: 62, rejected: 10 },
];

export const claimStatusData = [
  { name: "Approved", value: 45, fill: "hsl(142, 76%, 36%)" },
  { name: "Pending", value: 25, fill: "hsl(38, 92%, 50%)" },
  { name: "In Progress", value: 20, fill: "hsl(217, 91%, 60%)" },
  { name: "Rejected", value: 10, fill: "hsl(0, 84%, 60%)" },
];

export const agentPerformanceData = [
  { name: "Rajesh K.", score: 85, claims: 45, efficiency: 78, avgTime: 3.2 },
  { name: "Priya S.", score: 92, claims: 62, efficiency: 91, avgTime: 2.8 },
  { name: "Amit P.", score: 78, claims: 38, efficiency: 72, avgTime: 4.1 },
  { name: "Sneha G.", score: 96, claims: 71, efficiency: 94, avgTime: 2.5 },
  { name: "Vikram S.", score: 72, claims: 29, efficiency: 65, avgTime: 4.8 },
  { name: "Neha R.", score: 88, claims: 55, efficiency: 84, avgTime: 3.0 },
];

export const notifications = [
  { id: "1", title: "New claim assigned", message: "CLM-009 assigned to Rajesh Kumar", time: "2 min ago", read: false, type: "claim" as const, agentId: "1" },
  { id: "2", title: "Claim completed", message: "CLM-002 has been approved and settled", time: "15 min ago", read: false, type: "claim" as const, agentId: "2" },
  { id: "3", title: "Agent message", message: "Rajesh Kumar: Sir, survey completed for CLM-001", time: "30 min ago", read: false, type: "message" as const, agentId: "1" },
  { id: "4", title: "Agent request", message: "Vikram Singh requested document access", time: "1 hour ago", read: true, type: "message" as const, agentId: "5" },
  { id: "5", title: "Claim completed", message: "CLM-005 approved - ₹200,000 settled", time: "2 hours ago", read: true, type: "claim" as const, agentId: "6" },
  { id: "6", title: "Agent message", message: "Sneha Gupta: Customer not reachable for CLM-003", time: "2 hours ago", read: true, type: "message" as const, agentId: "4" },
  { id: "7", title: "Payment update", message: "Monthly payout processed for 6 agents", time: "3 hours ago", read: true, type: "system" as const },
  { id: "8", title: "Agent message", message: "Neha Reddy: Documents uploaded for CLM-005", time: "4 hours ago", read: true, type: "message" as const, agentId: "6" },
];

export const claimTypeData = [
  { name: "Vehicle", count: 35, amount: 1250000 },
  { name: "Health", count: 28, amount: 3500000 },
  { name: "Property", count: 18, amount: 2100000 },
  { name: "Life", count: 12, amount: 4800000 },
];

export const weeklyTrendData = [
  { day: "Mon", claims: 12, resolved: 8 },
  { day: "Tue", claims: 15, resolved: 11 },
  { day: "Wed", claims: 8, resolved: 6 },
  { day: "Thu", claims: 18, resolved: 14 },
  { day: "Fri", claims: 22, resolved: 17 },
  { day: "Sat", claims: 10, resolved: 9 },
  { day: "Sun", claims: 5, resolved: 4 },
];
