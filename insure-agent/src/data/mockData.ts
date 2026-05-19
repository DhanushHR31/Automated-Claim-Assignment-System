export type ClaimType = "Vehicle" | "Health" | "Fire" | "Property";
export type ClaimPriority = "Low" | "Medium" | "High" | "Emergency";
export type ClaimStatus = "Assigned" | "Accepted" | "In Progress" | "Documents Uploaded" | "Submitted" | "Approved" | "Completed";

export interface Claim {
  id: string;
  type: ClaimType;
  priority: ClaimPriority;
  status: ClaimStatus;
  customerName: string;
  phone: string;
  policyNumber: string;
  description: string;
  claimAmount: number;
  distance: number;
  estimatedTime: string;
  assignedAt: string;
  location: { lat: number; lng: number; address: string };
  district: string;
  documents: { name: string; status: "Pending" | "Uploaded" | "Verified" }[];
}

export interface Message {
  id: string;
  sender: "agent" | "manager";
  senderName: string;
  text: string;
  time: string;
  claimId?: string;
}

export interface Notification {
  id: string;
  type: "claim" | "emergency" | "weather" | "message" | "payment";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

// Karnataka-focused claims data
export const claims: Claim[] = [
  {
    id: "CLM-2024-1001",
    type: "Vehicle",
    priority: "Emergency",
    status: "Assigned",
    customerName: "Ramesh Gowda",
    phone: "+91 98456 78901",
    policyNumber: "POL-VH-KA-11234",
    description: "Major road accident on Outer Ring Road near Marathahalli. Two-wheeler collision with bus. Vehicle severely damaged, rider has minor injuries. Police FIR filed.",
    claimAmount: 320000,
    distance: 4.2,
    estimatedTime: "15 min",
    assignedAt: "3 min ago",
    location: { lat: 12.9516, lng: 77.7010, address: "Outer Ring Road, Marathahalli, Bengaluru" },
    district: "Bengaluru Urban",
    documents: [],
  },
  {
    id: "CLM-2024-1002",
    type: "Health",
    priority: "High",
    status: "Assigned",
    customerName: "Lakshmi Devi N",
    phone: "+91 94480 12345",
    policyNumber: "POL-HE-KA-22345",
    description: "Emergency hospitalization at Manipal Hospital. Cardiac episode reported. Family requesting immediate claim processing for bypass surgery.",
    claimAmount: 450000,
    distance: 6.1,
    estimatedTime: "20 min",
    assignedAt: "12 min ago",
    location: { lat: 12.9632, lng: 77.5969, address: "Manipal Hospital, Old Airport Road, Bengaluru" },
    district: "Bengaluru Urban",
    documents: [{ name: "Hospital Admission Form", status: "Uploaded" }, { name: "Doctor Report", status: "Pending" }],
  },
  {
    id: "CLM-2024-1003",
    type: "Fire",
    priority: "High",
    status: "Accepted",
    customerName: "Mohammed Irfan",
    phone: "+91 88867 54321",
    policyNumber: "POL-FR-KA-33456",
    description: "Warehouse fire in Peenya Industrial Area. Significant damage to goods and structure. Fire brigade report available. Electrical short circuit suspected.",
    claimAmount: 1500000,
    distance: 12.5,
    estimatedTime: "35 min",
    assignedAt: "1 hour ago",
    location: { lat: 13.0310, lng: 77.5180, address: "Peenya Industrial Area, 2nd Phase, Bengaluru" },
    district: "Bengaluru Urban",
    documents: [{ name: "Fire Brigade Report", status: "Verified" }, { name: "Damage Photos", status: "Uploaded" }, { name: "Inventory List", status: "Pending" }],
  },
  {
    id: "CLM-2024-1004",
    type: "Vehicle",
    priority: "Medium",
    status: "In Progress",
    customerName: "Suresh Kumar H",
    phone: "+91 77609 88776",
    policyNumber: "POL-VH-KA-44567",
    description: "Fender bender near Mysuru Road toll. Minor scratches on rear bumper and tail light. No injuries reported. Both parties present.",
    claimAmount: 42000,
    distance: 8.3,
    estimatedTime: "25 min",
    assignedAt: "2 hours ago",
    location: { lat: 12.9352, lng: 77.5038, address: "Nice Road Toll, Mysuru Road, Bengaluru" },
    district: "Bengaluru Urban",
    documents: [{ name: "Damage Photos", status: "Verified" }, { name: "FIR Copy", status: "Uploaded" }],
  },
  {
    id: "CLM-2024-1005",
    type: "Property",
    priority: "Low",
    status: "Documents Uploaded",
    customerName: "Anand Rao K",
    phone: "+91 96325 41178",
    policyNumber: "POL-PR-KA-55678",
    description: "Water leakage from overhead tank causing ceiling damage in 3 rooms. House in Jayanagar 4th Block. Plumber assessment completed.",
    claimAmount: 95000,
    distance: 3.8,
    estimatedTime: "12 min",
    assignedAt: "Yesterday",
    location: { lat: 12.9250, lng: 77.5838, address: "4th Block, Jayanagar, Bengaluru" },
    district: "Bengaluru Urban",
    documents: [{ name: "Damage Photos", status: "Verified" }, { name: "Plumber Report", status: "Verified" }, { name: "Cost Estimate", status: "Verified" }],
  },
  {
    id: "CLM-2024-1006",
    type: "Health",
    priority: "Medium",
    status: "Submitted",
    customerName: "Kavitha S",
    phone: "+91 85436 72190",
    policyNumber: "POL-HE-KA-66789",
    description: "Planned knee replacement surgery at Columbia Asia Hospital, Hebbal. All pre-approvals completed. Surgery was successful.",
    claimAmount: 380000,
    distance: 9.2,
    estimatedTime: "30 min",
    assignedAt: "2 days ago",
    location: { lat: 13.0358, lng: 77.5970, address: "Columbia Asia Hospital, Hebbal, Bengaluru" },
    district: "Bengaluru Urban",
    documents: [{ name: "Surgery Bill", status: "Verified" }, { name: "Doctor Report", status: "Verified" }, { name: "Discharge Summary", status: "Verified" }],
  },
  {
    id: "CLM-2024-1007",
    type: "Vehicle",
    priority: "Medium",
    status: "Completed",
    customerName: "Prashant Hegde",
    phone: "+91 73490 56123",
    policyNumber: "POL-VH-KA-77890",
    description: "Vehicle theft near KR Puram Railway Station parking. CCTV footage available. Police complaint filed.",
    claimAmount: 650000,
    distance: 0,
    estimatedTime: "-",
    assignedAt: "3 days ago",
    location: { lat: 13.0007, lng: 77.6910, address: "KR Puram Railway Station, Bengaluru" },
    district: "Bengaluru Urban",
    documents: [{ name: "Police FIR", status: "Verified" }, { name: "CCTV Screenshots", status: "Verified" }, { name: "RC Book", status: "Verified" }, { name: "Insurance Docs", status: "Verified" }],
  },
  {
    id: "CLM-2024-1008",
    type: "Property",
    priority: "High",
    status: "Assigned",
    customerName: "Nagesh Murthy",
    phone: "+91 98765 00234",
    policyNumber: "POL-PR-KA-88901",
    description: "Flooding damage in ground floor apartment near Bellandur. Recent heavy rains caused waterlogging. Furniture and electronics damaged.",
    claimAmount: 275000,
    distance: 5.6,
    estimatedTime: "18 min",
    assignedAt: "25 min ago",
    location: { lat: 12.9260, lng: 77.6762, address: "Bellandur, Bengaluru" },
    district: "Bengaluru Urban",
    documents: [],
  },
];

export const messages: Message[] = [
  { id: "1", sender: "manager", senderName: "Venkatesh Prasad", text: "Namaskara! Emergency claim CLM-1001 assigned. Vehicle accident on ORR Marathahalli. Please respond immediately.", time: "10:02 AM" },
  { id: "2", sender: "agent", senderName: "You", text: "Received sir. Starting from Koramangala, heading to Marathahalli now.", time: "10:04 AM" },
  { id: "3", sender: "manager", senderName: "Venkatesh Prasad", text: "Good. Customer is waiting near the accident spot. Upload photos as soon as you reach.", time: "10:05 AM" },
  { id: "4", sender: "agent", senderName: "You", text: "ETA 15 minutes via ORR. Will update once on site.", time: "10:06 AM" },
  { id: "5", sender: "manager", senderName: "Venkatesh Prasad", text: "Also check the Bellandur flooding claim CLM-1008 after this. It's nearby.", time: "10:15 AM" },
  { id: "6", sender: "agent", senderName: "You", text: "Sure, will pick up the Bellandur claim after completing the emergency case.", time: "10:16 AM" },
];

export const notifications: Notification[] = [
  { id: "1", type: "emergency", title: "🚨 Emergency Claim Assigned", description: "Vehicle accident at ORR Marathahalli - CLM-2024-1001. Immediate response required.", time: "3 min ago", read: false },
  { id: "2", type: "weather", title: "⚠️ Weather Alert - Karnataka", description: "Heavy rain expected in Bengaluru Urban & Mysuru districts. Drive carefully.", time: "10 min ago", read: false },
  { id: "3", type: "claim", title: "New Claim Assigned", description: "Health claim CLM-2024-1002 at Manipal Hospital assigned to you.", time: "12 min ago", read: false },
  { id: "4", type: "claim", title: "Flooding Claim Assigned", description: "Property claim CLM-2024-1008 at Bellandur assigned to you.", time: "25 min ago", read: true },
  { id: "5", type: "message", title: "Manager Message", description: "Venkatesh Prasad sent you a message about emergency response.", time: "30 min ago", read: true },
  { id: "6", type: "payment", title: "Payment Credited", description: "₹5,500 credited for claim CLM-2024-1007 (Vehicle theft, KR Puram).", time: "1 hour ago", read: true },
];

export const earnings = {
  today: 5500,
  thisMonth: 92500,
  pending: 18000,
  totalClaims: 22,
  completedClaims: 17,
  paymentHistory: [
    { id: "TXN-001", claimId: "CLM-2024-1007", amount: 5500, date: "Today", status: "Credited" },
    { id: "TXN-002", claimId: "CLM-2024-0998", amount: 4200, date: "Yesterday", status: "Credited" },
    { id: "TXN-003", claimId: "CLM-2024-0995", amount: 6800, date: "2 days ago", status: "Credited" },
    { id: "TXN-004", claimId: "CLM-2024-0992", amount: 3500, date: "3 days ago", status: "Credited" },
    { id: "TXN-005", claimId: "CLM-2024-0990", amount: 4800, date: "4 days ago", status: "Credited" },
    { id: "TXN-006", claimId: "CLM-2024-1003", amount: 8000, date: "Pending", status: "Processing" },
    { id: "TXN-007", claimId: "CLM-2024-1004", amount: 3500, date: "Pending", status: "Processing" },
    { id: "TXN-008", claimId: "CLM-2024-1005", amount: 6500, date: "Pending", status: "Processing" },
  ],
};

// Karnataka districts for claims
export const karnatakaDistricts = [
  "Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Mangaluru (DK)", "Hubballi-Dharwad",
  "Belagavi", "Kalaburagi", "Tumakuru", "Shivamogga", "Davanagere",
  "Ballari", "Raichur", "Hassan", "Udupi", "Mandya",
  "Chikkamagaluru", "Kodagu", "Chitradurga", "Bidar", "Ramanagara",
];

export function getPriorityColor(priority: ClaimPriority) {
  switch (priority) {
    case "Emergency": return "emergency";
    case "High": return "destructive";
    case "Medium": return "warning";
    case "Low": return "success";
  }
}

export function getStatusColor(status: ClaimStatus) {
  switch (status) {
    case "Assigned": return "info";
    case "Accepted": return "primary";
    case "In Progress": return "warning";
    case "Documents Uploaded": return "warning";
    case "Submitted": return "info";
    case "Approved": return "success";
    case "Completed": return "success";
  }
}

export function getClaimTypeIcon(type: ClaimType) {
  switch (type) {
    case "Vehicle": return "🚗";
    case "Health": return "🏥";
    case "Fire": return "🔥";
    case "Property": return "🏠";
  }
}
