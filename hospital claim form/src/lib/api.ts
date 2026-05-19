const BASE = "http://localhost:8000";

function getToken(): string | null {
  return localStorage.getItem("mediclaim_token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  isFormData = false
): Promise<T> {
  const headers: HeadersInit = { ...authHeaders() };
  if (body && !isFormData) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isFormData
      ? (body as FormData)
      : body
      ? JSON.stringify(body)
      : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json();
  
  // Normalize response for MediClaim frontend if it's an auth response
  if (path === "/login" || path === "/register") {
    return {
      access_token: data.access_token,
      token_type: data.token_type,
      user_id: data.user.id,
      email: data.user.email
    } as T;
  }
  
  return data;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
  upload: <T>(path: string, formData: FormData) =>
    request<T>("POST", path, formData, true),
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
}

export const authApi = {
  register: (email: string, password: string, hospital_name: string) =>
    api.post<TokenResponse>("/register", { email, password, full_name: hospital_name, role: "hospital" }),
  login: (email: string, password: string) =>
    api.post<TokenResponse>("/login", { email, password }),
};

// ── Hospital ──────────────────────────────────────────────────────────────────
export interface Hospital {
  id: string;
  hospital_name: string;
  email?: string;
  contact_number?: string;
  address?: string;
  city?: string;
  state?: string;
  license_number?: string;
  specialization?: string;
  bed_capacity?: number;
}

export const hospitalApi = {
  getMe: () => api.get<Hospital>("/hospitals/me"),
  updateMe: (data: Partial<Hospital>) => api.put<Hospital>("/hospitals/me", data),
};

// ── Policies ──────────────────────────────────────────────────────────────────
export interface Policy {
  id: string;
  policy_number: string;
  customer_name: string;
  aadhaar_number?: string;
  pan_number?: string;
  contact_number?: string;
  email?: string;
  policy_type: string;
  coverage_amount: number;
  start_date: string;
  end_date: string;
  status: string;
  corporate_company_name?: string;
  insurance_company?: { id: string; company_name: string };
}

export interface CustomerSummary {
  id: string;
  custom_id: string;
  full_name: string;
  email: string;
  phone?: string;
}

export interface ActivePolicySummary {
  id: string;
  policy_number: string;
  name: string;
  provider: string;
  coverage: string;
  expiry_date: string;
}

export interface CustomerLookupResult {
  customer: CustomerSummary;
  active_policies: ActivePolicySummary[];
}

export const policyApi = {
  lookup: (policy_number: string) =>
    api.get<Policy>(`/policies/lookup?policy_number=${encodeURIComponent(policy_number)}`),
};

export const hospitalApi = {
  lookupCustomer: (customId: string) =>
    api.get<CustomerLookupResult>(`/hospital/lookup/customer/${encodeURIComponent(customId)}`),
};

// ── Claims ────────────────────────────────────────────────────────────────────
export interface ClaimListItem {
  id: string;
  claim_number: string;
  claim_status: string;
  estimated_amount?: number;
  created_at: string;
  policy?: { policy_number: string; customer_name: string; coverage_amount: number; insurance_company?: { company_name: string } };
}

export interface Claim extends ClaimListItem {
  diagnosis?: string;
  doctor_name?: string;
  admission_date?: string;
  discharge_date?: string;
  approved_amount?: number;
  remarks?: string;
  patient_details?: {
    patient_name: string;
    age?: number;
    gender?: string;
    is_corporate: boolean;
    employee_id?: string;
  };
}

export interface ClaimCreate {
  policy_id: string;
  diagnosis?: string;
  doctor_name?: string;
  admission_date?: string;
  discharge_date?: string;
  estimated_amount?: number;
  patient_name: string;
  age?: number;
  gender?: string;
  aadhaar?: string;
  pan?: string;
  contact?: string;
  patient_email?: string;
  is_corporate?: boolean;
  employee_id?: string;
}

export interface HospitalClaimCreate {
  policy_id: string;
  diagnosis?: string;
  doctor_name?: string;
  admission_date?: string;
  discharge_date?: string;
  estimated_amount?: number;
  patient_name: string;
  patient_age?: number;
  patient_gender?: string;
  aadhaar?: string;
  pan?: string;
  contact?: string;
  patient_email?: string;
  is_corporate?: boolean;
  employee_id?: string;
  remarks?: string;
}

export const claimApi = {
  list: () => api.get<ClaimListItem[]>("/claims/"),
  get: (id: string) => api.get<Claim>(`/claims/${id}`),
  create: (data: ClaimCreate) => api.post<Claim>("/claims/", data),
  startHospitalClaim: (data: HospitalClaimCreate) => api.post<Claim>("/hospital/claims/start", data),
  submit: (id: string) => api.post<Claim>(`/claims/${id}/submit`),
  simulateApproval: (id: string, decision: "approved" | "rejected") =>
    api.post<Claim>(`/claims/${id}/simulate-approval`, { decision }),
  simulateVerification: (id: string) =>
    api.post<Claim>(`/claims/${id}/simulate-verification`),
  simulatePayment: (id: string) =>
    api.post<Claim>(`/claims/${id}/simulate-payment`),
  submitBilling: (id: string, data: { total_bill: number; pharmacy_bill?: number; notes?: string }) =>
    api.post<Claim>(`/claims/${id}/billing`, data),
};

// ── Documents ─────────────────────────────────────────────────────────────────
export interface Document {
  id: string;
  document_type: string;
  file_path: string;
  file_name?: string;
  uploaded_at: string;
}

export const documentApi = {
  list: (claimId: string) => api.get<Document[]>(`/claims/${claimId}/documents`),
  upload: (claimId: string, document_type: string, file: File) => {
    const fd = new FormData();
    fd.append("document_type", document_type);
    fd.append("file", file);
    return api.upload<Document>(`/claims/${claimId}/documents`, fd);
  },
  delete: (claimId: string, docId: string) =>
    api.delete<void>(`/claims/${claimId}/documents/${docId}`),
  downloadUrl: (claimId: string, docId: string) =>
    `${BASE}/claims/${claimId}/documents/${docId}/download`,
};

// ── Billing ───────────────────────────────────────────────────────────────────
export interface BillingRow {
  id: string;
  total_bill: number;
  pharmacy_bill?: number;
  submitted_at: string;
  claim?: { claim_number: string; claim_status: string; patient_name?: string };
}

export const billingApi = {
  list: () => api.get<BillingRow[]>("/billing/"),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export interface PaymentRow {
  id: string;
  amount_paid: number;
  payment_date?: string;
  transaction_id?: string;
  payment_status: string;
  created_at: string;
  claim?: { claim_number: string; patient_name?: string; company_name?: string };
}

export const paymentApi = {
  list: () => api.get<PaymentRow[]>("/payments/"),
};

// ── Support ───────────────────────────────────────────────────────────────────
export interface Ticket {
  id: string;
  subject: string;
  issue: string;
  status: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  sender_role: string;
  message: string;
  sent_at: string;
}

export const supportApi = {
  listTickets: () => api.get<Ticket[]>("/support/tickets"),
  createTicket: (subject: string, issue: string) =>
    api.post<Ticket>("/support/tickets", { subject, issue }),
  listMessages: (ticketId: string) =>
    api.get<Message[]>(`/support/tickets/${ticketId}/messages`),
  sendMessage: (ticketId: string, message: string) =>
    api.post<Message>(`/support/tickets/${ticketId}/messages`, { message }),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  paid: number;
  monthly: { name: string; claims: number }[];
  hospital_name: string;
}

export const dashboardApi = {
  stats: () => api.get<DashboardStats>("/dashboard/stats"),
};
