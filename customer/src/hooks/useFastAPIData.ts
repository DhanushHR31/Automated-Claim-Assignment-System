import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "http://localhost:8000";

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("customer_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API error: ${response.statusText}`);
  }
  return response.json();
};

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchWithAuth("/profiles"),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: any) => fetchWithAuth("/profiles", { method: "PATCH", body: JSON.stringify(updates) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useKYCDocuments() {
  return useQuery({
    queryKey: ["kyc_documents"],
    queryFn: () => fetchWithAuth("/kyc_documents"),
  });
}

export function useUpdateKYCDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (doc: any) => fetchWithAuth("/kyc_documents", { method: "POST", body: JSON.stringify(doc) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kyc_documents"] }),
  });
}

export function useInsurancePolicies() {
  return useQuery({
    queryKey: ["insurance_policies"],
    queryFn: () => fetchWithAuth("/insurance_policies"),
  });
}

export function useInsurancePolicy(id: string) {
  return useQuery({
    queryKey: ["insurance_policies", id],
    queryFn: () => fetchWithAuth(`/insurance_policies/${id}`),
    enabled: !!id,
  });
}

export function useHospitalsPublic() {
  return useQuery({
    queryKey: ["hospitals_public"],
    queryFn: () => fetchWithAuth("/hospitals/public"),
  });
}

export function useHospitalPublic(id: string) {
  return useQuery({
    queryKey: ["hospital_public", id],
    queryFn: () => fetchWithAuth(`/hospitals/public/${id}`),
    enabled: !!id,
  });
}

export function useCreateInsurancePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (policy: any) => fetchWithAuth("/insurance_policies", { method: "POST", body: JSON.stringify(policy) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insurance_policies"] }),
  });
}

export function useUpdateInsurancePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & any) => fetchWithAuth(`/insurance_policies/${id}`, { method: "PATCH", body: JSON.stringify(updates) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insurance_policies"] }),
  });
}

export function useClaims() {
  return useQuery({
    queryKey: ["claims"],
    queryFn: () => fetchWithAuth("/claims"),
  });
}

export function useCreateClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (claim: any) => fetchWithAuth("/claims", { method: "POST", body: JSON.stringify(claim) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["claims"] }),
  });
}

// ── Payments ──────────────────────────────────────────────────────────────────
export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: () => fetchWithAuth("/payments"),
  });
}

export function usePaymentsByPolicy(policyId: string) {
  return useQuery({
    queryKey: ["payments", policyId],
    queryFn: () => fetchWithAuth(`/payments/policy/${policyId}`),
    enabled: !!policyId,
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payment: any) => fetchWithAuth("/payments", { method: "POST", body: JSON.stringify(payment) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}
