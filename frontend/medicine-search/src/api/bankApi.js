import { getToken } from "../utils/token.util";

const baseUrl = process.env.REACT_APP_API_BASE_URL + "/banks";

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export const getBanks = async (q = "") => {
  const res = await fetch(`${baseUrl}?q=${q}`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to load banks");
  return res.json();
};

export const createBank = async (data) => {
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Create failed");
  return res.json();
};

export const updateBank = async (id, data) => {
  const res = await fetch(`${baseUrl}/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
};
