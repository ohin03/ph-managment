import React, { useEffect, useState } from "react";
import { getItems, deleteItem } from "../api/itemApi";
import { toast } from "react-toastify";
import "./ItemList.css";

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    const res = await getItems(page, limit);
    setItems(res.items);
    setTotal(res.total);
  };

  const totalPage = Math.ceil(total / limit);

  return (
    <div className="itemlist-wrapper">
      <h3>All Medicines</h3>

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
    </div>
  );
};

export default ItemList;