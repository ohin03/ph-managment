import { getToken } from "../utils/token.util";

const baseUrl = process.env.REACT_APP_API_BASE_URL;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`
});

// Customer ledger
export const getCustomerLedger = async (customerId) => {
  const res = await fetch(`${baseUrl}/ledger/customer/${customerId}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to load ledger");
  return res.json();
};

// Vendor ledger
export const getVendorLedger = async (vendorId) => {
  const res = await fetch(`${baseUrl}/ledger/vendor/${vendorId}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to load vendor ledger");
  return res.json();
};

// Dashboard total due
export const getTotalDue = async () => {
  const res = await fetch(`${baseUrl}/ledger/summary/due`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to load total due");
  return res.json();
};