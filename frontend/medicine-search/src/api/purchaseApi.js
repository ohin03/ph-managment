const baseUrl = process.env.REACT_APP_API_BASE_URL;

export const savePurchase = async (data) => {
  const res = await fetch(`${baseUrl}/purchase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error("Save failed");
  return res.json();
};

export const getPurchases = async () => {
  const res = await fetch(`${baseUrl}/purchase`);
  return res.json();
};
