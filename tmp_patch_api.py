from pathlib import Path

path = Path('hospital claim form/src/lib/api.ts')
text = path.read_text(encoding='utf-8')
old = """export const policyApi = {
  lookup: (policy_number: string) =>
    api.get<Policy>(`/policies/lookup?policy_number=${encodeURIComponent(policy_number)}`),
};

// ── Claims ───────────────────────────────────────────────────────────────────
"""
new = """export interface CustomerSummary {
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

// ── Claims ───────────────────────────────────────────────────────────────────
"""
if old not in text:
    raise ValueError('Pattern not found')
path.write_text(text.replace(old, new), encoding='utf-8')
print('patched')
