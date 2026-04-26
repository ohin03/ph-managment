import { getToken } from "../utils/token.util";

const baseUrl = process.env.REACT_APP_API_BASE_URL;

// Helper: Auth headers
const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

/* ============================
   GET ITEMS (paginated)
============================ */
export const getItems = async (page = 1, limit = 20) => {
  try {
    const res = await fetch(`${baseUrl}/items?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch items");

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("getItems error:", err);
    return { items: [], total: 0 };
  }
};

/* ============================
   SEARCH ITEMS
============================ */
export const searchItems = async (query) => {
  if (!query || !query.trim()) return [];

  try {
    const res = await fetch(`${baseUrl}/items/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      console.error("searchItems error:", res.status);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("searchItems error:", err);
    return [];
  }
};

/* ============================
   ADD ITEM
============================ */
export const addItem = async (itemData) => {
  try {
    const res = await fetch(`${baseUrl}/items`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Item যোগ করতে ব্যর্থ");

    return result;
  } catch (err) {
    console.error("addItem error:", err);
    throw err;
  }
};

/* ============================
   UPDATE ITEM
============================ */
export const updateItem = async (id, itemData) => {
  try {
    const res = await fetch(`${baseUrl}/items/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Item আপডেট করতে ব্যর্থ");

    return result;
  } catch (err) {
    console.error("updateItem error:", err);
    throw err;
  }
};

/* ============================
   DELETE ITEM
============================ */
export const deleteItem = async (id) => {
  try {
    const res = await fetch(`${baseUrl}/items/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Item ডিলিট করতে ব্যর্থ");

    return result;
  } catch (err) {
    console.error("deleteItem error:", err);
    throw err;
  }
};