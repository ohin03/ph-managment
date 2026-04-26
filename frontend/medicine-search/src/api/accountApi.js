import { getToken } from "../utils/token.util";

const baseUrl = process.env.REACT_APP_API_BASE_URL;

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`
});

export const getAccounts = async () => {
  const res = await fetch(`${baseUrl}/accounts`, { headers: headers() });
  return res.json();
};

export const createOrUpdateAccount = async (data) => {
  const res = await fetch(`${baseUrl}/accounts`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteAccount = async (id) => {
  const res = await fetch(`${baseUrl}/accounts/${id}`, {
    method: "DELETE",
    headers: headers()
  });
  return res.json();
};

export const addTransaction = async (data) => {
  const res = await fetch(`${baseUrl}/accounts/transaction`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data)
  });
  return res.json();
};

export const getTransactions = async (accountId) => {
  const res = await fetch(`${baseUrl}/accounts/transaction/${accountId}`, {
    headers: headers()
  });
  return res.json();
};
