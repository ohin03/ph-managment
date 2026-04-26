const baseUrl = process.env.REACT_APP_API_BASE_URL;

export const loginUser = async (data) => {
  const res = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error("Login failed");
  return res.json();
};
