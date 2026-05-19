import { Heart, Shield, Car, Home, Plane, Briefcase } from "lucide-react";

export interface PlanDuration {
  months: number;
  label: string;
  discount: number;
  offer?: string;
}

export interface InsurancePlan {
  name: string;
  provider: string;
  premiumMonthly: number;
  coverage: number;
  features: string[];
  rating: number;
  claimSettlement: number;
  durations: PlanDuration[];
}

export const iconMap: Record<string, typeof Heart> = {
  Health: Heart,
  Life: Shield,
  Vehicle: Car,
  Home,
  Travel: Plane,
  Business: Briefcase,
};

const standardDurations: PlanDuration[] = [
  { months: 4, label: "4 Months", discount: 0, offer: "Trial" },
  { months: 6, label: "6 Months", discount: 3, offer: "Starter" },
  { months: 12, label: "1 Year", discount: 5 },
  { months: 24, label: "2 Years", discount: 10 },
  { months: 36, label: "3 Years", discount: 15 },
  { months: 60, label: "5 Years", discount: 20 },
  { months: 84, label: "7 Years", discount: 25 },
  { months: 120, label: "10 Years", discount: 30 },
];

const lifeDurations: PlanDuration[] = [
  { months: 12, label: "1 Year", discount: 0 },
  { months: 24, label: "2 Years", discount: 5 },
  { months: 36, label: "3 Years", discount: 8 },
  { months: 60, label: "5 Years", discount: 12 },
  { months: 120, label: "10 Years", discount: 20 },
  { months: 180, label: "15 Years", discount: 25 },
  { months: 240, label: "20 Years", discount: 30 },
  { months: 360, label: "30 Years", discount: 35 },
];

export const plans: Record<string, InsurancePlan[]> = {
  Health: [
    { name: "Health Basic", provider: "Star Health", premiumMonthly: 399, coverage: 300000, rating: 4.1, claimSettlement: 89, features: ["Hospitalization", "Day care procedures", "Pre-existing cover after 2 yrs"], durations: standardDurations },
    { name: "Health Silver", provider: "Bajaj Allianz", premiumMonthly: 499, coverage: 400000, rating: 4.2, claimSettlement: 91, features: ["Hospitalization", "Day care", "Ambulance cover", "Pre-existing after 18 months"], durations: standardDurations },
    { name: "Health Gold", provider: "HDFC Ergo", premiumMonthly: 699, coverage: 500000, rating: 4.5, claimSettlement: 93, features: ["Hospitalization", "Day care", "Pre-existing after 1 yr", "No room rent limit", "Free health checkup"], durations: standardDurations },
    { name: "Health Plus", provider: "ICICI Lombard", premiumMonthly: 799, coverage: 600000, rating: 4.3, claimSettlement: 92, features: ["Hospitalization", "Day care", "Maternity cover", "Newborn cover", "Ambulance"], durations: standardDurations },
    { name: "Health Shield", provider: "Niva Bupa", premiumMonthly: 899, coverage: 750000, rating: 4.4, claimSettlement: 94, features: ["Hospitalization", "Day care", "AYUSH treatment", "Organ donor", "Pre-existing from day 1"], durations: standardDurations },
    { name: "Health Platinum", provider: "Care Health", premiumMonthly: 1199, coverage: 1000000, rating: 4.6, claimSettlement: 95, features: ["Hospitalization", "Day care", "Pre-existing from day 1", "No room rent limit", "International cover", "Free checkup"], durations: standardDurations },
    { name: "Family Floater Basic", provider: "Star Health", premiumMonthly: 1499, coverage: 1000000, rating: 4.2, claimSettlement: 90, features: ["Family cover", "Hospitalization", "Day care", "Maternity", "Newborn cover"], durations: standardDurations },
    { name: "Family Floater Gold", provider: "HDFC Ergo", premiumMonthly: 1999, coverage: 1500000, rating: 4.5, claimSettlement: 93, features: ["Family cover", "No sub-limits", "Maternity", "Newborn", "Free checkup", "AYUSH"], durations: standardDurations },
    { name: "Super Top-Up", provider: "ICICI Lombard", premiumMonthly: 349, coverage: 2000000, rating: 4.3, claimSettlement: 91, features: ["Deductible ₹3L", "Hospitalization", "Day care", "Pre-existing after 2 yrs"], durations: standardDurations },
    { name: "Health Supreme", provider: "Max Bupa", premiumMonthly: 2499, coverage: 2500000, rating: 4.7, claimSettlement: 96, features: ["Unlimited restore", "Global cover", "Air ambulance", "Organ transplant", "No room rent limit", "Mental health"], durations: standardDurations },
    { name: "Senior Citizen Plan", provider: "Star Health", premiumMonthly: 1899, coverage: 1000000, rating: 4.1, claimSettlement: 88, features: ["Age 60-75", "Pre-existing after 1 yr", "Domiciliary treatment", "Cataract cover"], durations: standardDurations },
    { name: "Critical Illness Cover", provider: "Bajaj Allianz", premiumMonthly: 599, coverage: 1000000, rating: 4.3, claimSettlement: 92, features: ["36 critical illnesses", "Lump sum payout", "Tax benefit u/s 80D"], durations: standardDurations },
  ],
  Life: [
    { name: "Term Basic", provider: "LIC", premiumMonthly: 490, coverage: 5000000, rating: 4.0, claimSettlement: 97, features: ["Death benefit", "Tax benefits u/s 80C"], durations: lifeDurations },
    { name: "Term Shield", provider: "HDFC Life", premiumMonthly: 599, coverage: 7500000, rating: 4.3, claimSettlement: 98, features: ["Death benefit", "Tax benefits", "Terminal illness cover"], durations: lifeDurations },
    { name: "Term Plus", provider: "ICICI Prudential", premiumMonthly: 750, coverage: 10000000, rating: 4.5, claimSettlement: 98, features: ["Death benefit", "Tax benefits", "Critical illness rider", "Accidental death"], durations: lifeDurations },
    { name: "Term Gold", provider: "Max Life", premiumMonthly: 890, coverage: 15000000, rating: 4.6, claimSettlement: 99, features: ["Death benefit", "Tax benefits", "WOP rider", "Accidental death", "Critical illness"], durations: lifeDurations },
    { name: "Term Platinum", provider: "SBI Life", premiumMonthly: 1100, coverage: 20000000, rating: 4.4, claimSettlement: 97, features: ["Death benefit", "Increasing cover", "Return of premium", "All riders included"], durations: lifeDurations },
    { name: "iSelect Term", provider: "Canara HSBC", premiumMonthly: 450, coverage: 5000000, rating: 4.1, claimSettlement: 95, features: ["Death benefit", "Tax benefits", "Online discount"], durations: lifeDurations },
    { name: "e-Term Plan", provider: "Kotak Life", premiumMonthly: 520, coverage: 7500000, rating: 4.2, claimSettlement: 96, features: ["Death benefit", "Accidental death", "Tax benefits", "Flexible payout"], durations: lifeDurations },
    { name: "Saral Jeevan Bima", provider: "LIC", premiumMonthly: 380, coverage: 2500000, rating: 4.0, claimSettlement: 97, features: ["Standardized plan", "Death benefit", "Simple terms", "Tax benefits"], durations: lifeDurations },
    { name: "Term Secure", provider: "Tata AIA", premiumMonthly: 680, coverage: 10000000, rating: 4.4, claimSettlement: 98, features: ["Death benefit", "WOP", "Critical illness", "Joint life option"], durations: lifeDurations },
    { name: "Term Supreme", provider: "Bajaj Allianz Life", premiumMonthly: 1299, coverage: 25000000, rating: 4.7, claimSettlement: 99, features: ["Death benefit", "All riders", "Return of premium", "Increasing cover", "Joint life"], durations: lifeDurations },
  ],
  Vehicle: [
    { name: "Third Party Only", provider: "Bajaj Allianz", premiumMonthly: 250, coverage: 750000, rating: 4.0, claimSettlement: 88, features: ["Third party liability", "Personal accident cover"], durations: standardDurations },
    { name: "Third Party Plus", provider: "ICICI Lombard", premiumMonthly: 320, coverage: 1000000, rating: 4.2, claimSettlement: 90, features: ["Third party", "Personal accident", "Towing charges"], durations: standardDurations },
    { name: "Comprehensive Basic", provider: "HDFC Ergo", premiumMonthly: 450, coverage: 1200000, rating: 4.3, claimSettlement: 91, features: ["Third party", "Own damage", "Personal accident", "Fire & theft"], durations: standardDurations },
    { name: "Comprehensive Plus", provider: "Tata AIG", premiumMonthly: 550, coverage: 1500000, rating: 4.4, claimSettlement: 93, features: ["Third party", "Own damage", "Personal accident", "Roadside assistance", "Key replacement"], durations: standardDurations },
    { name: "Comprehensive Gold", provider: "ICICI Lombard", premiumMonthly: 699, coverage: 2000000, rating: 4.5, claimSettlement: 94, features: ["Third party", "Own damage", "Zero depreciation", "Roadside assistance", "Engine protect"], durations: standardDurations },
    { name: "Comprehensive Platinum", provider: "Bajaj Allianz", premiumMonthly: 899, coverage: 2500000, rating: 4.6, claimSettlement: 95, features: ["All covers", "Zero depreciation", "Return to invoice", "NCB protect", "Consumables"], durations: standardDurations },
    { name: "Two Wheeler Basic", provider: "Digit Insurance", premiumMonthly: 120, coverage: 300000, rating: 4.1, claimSettlement: 89, features: ["Third party", "Own damage", "Personal accident"], durations: standardDurations },
    { name: "Two Wheeler Premium", provider: "HDFC Ergo", premiumMonthly: 199, coverage: 500000, rating: 4.3, claimSettlement: 92, features: ["Third party", "Own damage", "Zero dep", "Roadside assistance", "Key protect"], durations: standardDurations },
    { name: "Commercial Vehicle", provider: "New India Assurance", premiumMonthly: 999, coverage: 5000000, rating: 4.0, claimSettlement: 87, features: ["Third party", "Own damage", "Goods in transit", "Driver PA"], durations: standardDurations },
    { name: "EV Insurance", provider: "Go Digit", premiumMonthly: 380, coverage: 1500000, rating: 4.4, claimSettlement: 93, features: ["EV battery cover", "Own damage", "Third party", "Charging equipment", "Cyber liability"], durations: standardDurations },
  ],
  Home: [
    { name: "Home Shield Basic", provider: "SBI General", premiumMonthly: 100, coverage: 1000000, rating: 4.0, claimSettlement: 88, features: ["Fire & burglary", "Natural calamity"], durations: standardDurations },
    { name: "Home Shield Plus", provider: "HDFC Ergo", premiumMonthly: 180, coverage: 2000000, rating: 4.2, claimSettlement: 90, features: ["Fire & burglary", "Natural calamity", "Contents cover", "Plumbing damage"], durations: standardDurations },
    { name: "Home Guard Gold", provider: "ICICI Lombard", premiumMonthly: 299, coverage: 3000000, rating: 4.4, claimSettlement: 92, features: ["Fire & burglary", "Natural calamity", "Contents", "Electronic equipment", "Temporary accommodation"], durations: standardDurations },
    { name: "Home Guard Platinum", provider: "Bajaj Allianz", premiumMonthly: 450, coverage: 5000000, rating: 4.5, claimSettlement: 93, features: ["All perils", "Contents", "Valuables", "Liability cover", "Temporary housing", "Landscaping"], durations: standardDurations },
    { name: "Home Complete", provider: "Tata AIG", premiumMonthly: 599, coverage: 7500000, rating: 4.6, claimSettlement: 94, features: ["Comprehensive cover", "Earthquake", "Flood", "Terrorism", "Rental loss", "Public liability"], durations: standardDurations },
    { name: "Home Rental Shield", provider: "Digit Insurance", premiumMonthly: 150, coverage: 1500000, rating: 4.1, claimSettlement: 89, features: ["Tenant's content", "Fire", "Theft", "Third party liability", "Lock replacement"], durations: standardDurations },
    { name: "Home Builder Risk", provider: "New India Assurance", premiumMonthly: 350, coverage: 3000000, rating: 4.0, claimSettlement: 87, features: ["Under construction", "Material damage", "Third party", "Debris removal"], durations: standardDurations },
    { name: "Home Premium Elite", provider: "SBI General", premiumMonthly: 799, coverage: 10000000, rating: 4.7, claimSettlement: 95, features: ["All risks", "Art & valuables", "Domestic staff", "Personal cyber", "Identity theft"], durations: standardDurations },
    { name: "Home Earthquake Add-on", provider: "ICICI Lombard", premiumMonthly: 80, coverage: 2000000, rating: 4.2, claimSettlement: 90, features: ["Earthquake damage", "Fire following earthquake", "Debris removal"], durations: standardDurations },
    { name: "Home Smart Protect", provider: "HDFC Ergo", premiumMonthly: 250, coverage: 2500000, rating: 4.3, claimSettlement: 91, features: ["Smart home devices", "IoT equipment", "Cyber protection", "Contents", "Fire & theft"], durations: standardDurations },
  ],
  Travel: [
    { name: "Domestic Basic", provider: "Care Insurance", premiumMonthly: 99, coverage: 200000, rating: 4.0, claimSettlement: 88, features: ["Medical emergency", "Trip cancellation", "Baggage delay"], durations: standardDurations },
    { name: "Domestic Plus", provider: "ICICI Lombard", premiumMonthly: 149, coverage: 400000, rating: 4.2, claimSettlement: 90, features: ["Medical emergency", "Trip cancellation", "Baggage loss", "Hotel extension"], durations: standardDurations },
    { name: "International Basic", provider: "Bajaj Allianz", premiumMonthly: 199, coverage: 500000, rating: 4.3, claimSettlement: 91, features: ["Medical emergency", "Trip cancellation", "Baggage loss", "Flight delay"], durations: standardDurations },
    { name: "International Gold", provider: "HDFC Ergo", premiumMonthly: 349, coverage: 1000000, rating: 4.5, claimSettlement: 93, features: ["Medical emergency", "Evacuation", "Repatriation", "Trip cancellation", "Passport loss", "Baggage"], durations: standardDurations },
    { name: "International Platinum", provider: "Tata AIG", premiumMonthly: 599, coverage: 2500000, rating: 4.6, claimSettlement: 95, features: ["All covers", "Adventure sports", "Pre-existing conditions", "Personal liability", "Hijack cover"], durations: standardDurations },
    { name: "Student Travel", provider: "Care Insurance", premiumMonthly: 299, coverage: 1500000, rating: 4.3, claimSettlement: 92, features: ["Medical emergency", "Study interruption", "Sponsor protection", "Baggage", "Personal liability"], durations: standardDurations },
    { name: "Senior Citizen Travel", provider: "Star Health", premiumMonthly: 499, coverage: 1000000, rating: 4.1, claimSettlement: 89, features: ["Age 60+", "Medical emergency", "Pre-existing cover", "Evacuation", "Trip cancellation"], durations: standardDurations },
    { name: "Corporate Travel", provider: "ICICI Lombard", premiumMonthly: 449, coverage: 2000000, rating: 4.4, claimSettlement: 93, features: ["Business travel", "Laptop cover", "Document loss", "Emergency cash", "Flight delay"], durations: standardDurations },
    { name: "Annual Multi-Trip", provider: "Bajaj Allianz", premiumMonthly: 399, coverage: 1500000, rating: 4.4, claimSettlement: 92, features: ["Unlimited trips", "Medical", "Trip cancel", "Baggage", "Personal accident"], durations: standardDurations },
    { name: "Adventure Travel", provider: "Digit Insurance", premiumMonthly: 549, coverage: 2000000, rating: 4.5, claimSettlement: 94, features: ["Adventure sports", "Trekking", "Scuba", "Paragliding", "Medical evacuation", "Search & rescue"], durations: standardDurations },
  ],
  Business: [
    { name: "Shop Insurance", provider: "New India Assurance", premiumMonthly: 299, coverage: 2000000, rating: 4.0, claimSettlement: 87, features: ["Fire", "Burglary", "Stock cover", "Cash in counter"], durations: standardDurations },
    { name: "Office Package", provider: "HDFC Ergo", premiumMonthly: 399, coverage: 3000000, rating: 4.2, claimSettlement: 90, features: ["Office contents", "Electronic equipment", "Fire", "Burglary", "Public liability"], durations: standardDurations },
    { name: "Business Guard", provider: "ICICI Lombard", premiumMonthly: 500, coverage: 5000000, rating: 4.3, claimSettlement: 91, features: ["Property damage", "Liability cover", "Business interruption", "Employee cover"], durations: standardDurations },
    { name: "Business Shield Plus", provider: "Bajaj Allianz", premiumMonthly: 750, coverage: 7500000, rating: 4.4, claimSettlement: 93, features: ["All perils", "Business interruption", "Money insurance", "Fidelity guarantee", "Cyber cover"], durations: standardDurations },
    { name: "SME Complete", provider: "Tata AIG", premiumMonthly: 999, coverage: 10000000, rating: 4.5, claimSettlement: 94, features: ["Property", "Liability", "Work injury", "Marine transit", "Cyber", "D&O cover"], durations: standardDurations },
    { name: "Professional Indemnity", provider: "ICICI Lombard", premiumMonthly: 450, coverage: 5000000, rating: 4.3, claimSettlement: 92, features: ["Professional liability", "Legal defense", "Negligence cover", "Breach of duty"], durations: standardDurations },
    { name: "Cyber Insurance", provider: "HDFC Ergo", premiumMonthly: 599, coverage: 5000000, rating: 4.4, claimSettlement: 91, features: ["Data breach", "Cyber attack", "Business interruption", "Regulatory fines", "Crisis management"], durations: standardDurations },
    { name: "Product Liability", provider: "New India Assurance", premiumMonthly: 350, coverage: 3000000, rating: 4.1, claimSettlement: 88, features: ["Product defect liability", "Legal costs", "Recall expenses"], durations: standardDurations },
    { name: "Marine Cargo", provider: "SBI General", premiumMonthly: 280, coverage: 5000000, rating: 4.2, claimSettlement: 90, features: ["Inland transit", "Sea freight", "Air freight", "War risk", "SRCC"], durations: standardDurations },
    { name: "Group Health", provider: "Star Health", premiumMonthly: 1499, coverage: 500000, rating: 4.5, claimSettlement: 94, features: ["Employee health", "Family cover", "Maternity", "OPD", "Dental", "Pre-existing from day 1"], durations: standardDurations },
  ],
};

export const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
