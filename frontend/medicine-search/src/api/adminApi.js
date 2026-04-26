import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ItemSetup = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState({ item_name: "", generic_id: "", generic_name: "" });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/items");
      setItems(res.data.items);
    } catch (err) {
      toast.error("Failed to fetch items");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async () => {
    try {
      if (currentItem._id) {
        // update
        await axios.put(`/api/items/${currentItem._id}`, currentItem);
        toast.success("Item updated");
      } else {
        // add
        await axios.post("/api/items", currentItem);
        toast.success("Item added");
      }
      setModalOpen(false);
      setCurrentItem({ item_name: "", generic_id: "", generic_name: "" });
      fetchItems();
    } catch (err) {
      toast.error("Save failed");
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`/api/items/${id}`);
      toast.success("Item deleted");
      fetchItems();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Item Setup</h2>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={() => setModalOpen(true)}
      >
        Add Item
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Item Name</th>
              <th className="border px-2 py-1">Generic ID</th>
              <th className="border px-2 py-1">Generic Name</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td className="border px-2 py-1">{item.id}</td>
                <td className="border px-2 py-1">{item.item_name}</td>
                <td className="border px-2 py-1">{item.generic_id}</td>
                <td className="border px-2 py-1">{item.generic_name}</td>
                <td className="border px-2 py-1">
                  <button className="text-blue-500 mr-2" onClick={() => handleEdit(item)}>Edit</button>
                  <button className="text-red-500" onClick={() => handleDelete(item._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-96">
            <h3 className="text-lg font-bold mb-2">{currentItem._id ? "Edit Item" : "Add Item"}</h3>
            <input
              className="border w-full p-2 mb-2"
              placeholder="ID"
              value={currentItem.id}
              onChange={(e) => setCurrentItem({ ...currentItem, id: e.target.value })}
            />
            <input
              className="border w-full p-2 mb-2"
              placeholder="Item Name"
              value={currentItem.item_name}
              onChange={(e) => setCurrentItem({ ...currentItem, item_name: e.target.value })}
            />
            <input
              className="border w-full p-2 mb-2"
              placeholder="Generic ID"
              value={currentItem.generic_id}
              onChange={(e) => setCurrentItem({ ...currentItem, generic_id: e.target.value })}
            />
            <input
              className="border w-full p-2 mb-2"
              placeholder="Generic Name"
              value={currentItem.generic_name}
              onChange={(e) => setCurrentItem({ ...currentItem, generic_name: e.target.value })}
            />
            <div className="flex justify-end mt-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded mr-2"
                onClick={() => {
                  setModalOpen(false);
                  setCurrentItem({ item_name: "", generic_id: "", generic_name: "" });
                }}
              >
                Cancel
              </button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemSetup;
