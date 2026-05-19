import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = "http://localhost:8000";

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("manager_token");
  const resp = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || `API error: ${resp.statusText}`);
  }
  return resp.json();
};

export interface Manager {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  department: string | null;
  max_agents: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ManagerInsert {
  user_id?: string;
  name: string;
  phone?: string;
  email?: string;
  department?: string;
  max_agents?: number;
}

export function useManagers() {
  return useQuery({
    queryKey: ["managers"],
    queryFn: () => fetchWithAuth("/managers") as Promise<Manager[]>,
  });
}

export function useCreateManager() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (manager: ManagerInsert) =>
      fetchWithAuth("/managers", { method: "POST", body: JSON.stringify(manager) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["managers"] }),
  });
}

export function useUpdateManager() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Partial<Manager>) =>
      fetchWithAuth(`/managers/${id}`, { method: "PATCH", body: JSON.stringify(updates) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["managers"] }),
  });
}
