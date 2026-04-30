import React, { useEffect, useState } from "react";
import { getItems, deleteItem, searchItems } from "../api/itemApi";
import { toast } from "react-toastify";
import "./ItemList.css";

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const limit = 10;

  useEffect(() => {
    loadData();
  }, [page, search]);

  const loadData = async () => {
    setLoading(true);

    if (search.trim()) {
      const results = await searchItems(search.trim());
      setTotal(results.length);
      setItems(results.slice((page - 1) * limit, page * limit));
    } else {
      const res = await getItems(page, limit);
      setItems(res.items);
      setTotal(res.total);
    }

    setLoading(false);
  };

  const totalPage = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="itemlist-wrapper">
      <h3>All Medicines</h3>

      <div className="itemlist-search">
        <input
          type="text"
          className="form-control"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search medicines by name or generic..."
        />
      </div>

      {loading ? (
        <div className="text-center py-4">Loading medicines...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-4">No medicines found.</div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Generic</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i._id}>
                  <td>{i.name || i.item_name}</td>
                  <td>{i.genericName || i.generic_name}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={async () => {
                        try {
                          await deleteItem(i._id);
                          toast.success("Deleted Successfully!");
                          loadData();
                        } catch (err) {
                          toast.error("Delete failed!");
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-center">
            <button className="btn btn-primary" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
            <span>Page {page} / {totalPage}</span>
            <button className="btn btn-primary" disabled={page === totalPage} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ItemList;