export const searchMedicine = async (query) => {
  if (!query || !query.trim()) return [];
  try {
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    const res = await fetch(`${baseUrl}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      console.error("Search API error:", res.status);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Search API error:", err);
    return [];
  }
};