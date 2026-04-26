import { useState } from "react";
import { createPurchase } from '../../api/purchaseApi';

const PurchaseModal = ({ close, reload }) => {
  const [form, setForm] = useState({
    invoiceNumber: "",
    vendor: "",
    items: [{ item: "", quantity: 1, rate: 0 }],
    paidAmount: 0,
  });

  const handleItemChange = (index, field, value) => {
    const updated = [...form.items];
    updated[index][field] =
      field === "quantity" || field === "rate"
        ? Number(value)
        : value;
    setForm({ ...form, items: updated });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { item: "", quantity: 1, rate: 0 }],
    });
  };

  const handleSubmit = async () => {
    await createPurchase(form);
    reload();
    close();
  };

  return (
    <div className="modal-backdrop">
      <div className="bg-white p-3">
        <h5>New Purchase</h5>

        <input
          className="form-control mb-2"
          placeholder="Invoice"
          onChange={(e) =>
            setForm({ ...form, invoiceNumber: e.target.value })
          }
        />

        <input
          className="form-control mb-2"
          placeholder="Vendor ID"
          onChange={(e) =>
            setForm({ ...form, vendor: e.target.value })
          }
        />

        {form.items.map((item, idx) => (
          <div key={idx} className="mb-2">
            <input
              className="form-control mb-1"
              placeholder="Item ID"
              onChange={(e) =>
                handleItemChange(idx, "item", e.target.value)
              }
            />
            <input
              type="number"
              className="form-control mb-1"
              placeholder="Quantity"
              onChange={(e) =>
                handleItemChange(idx, "quantity", e.target.value)
              }
            />
            <input
              type="number"
              className="form-control"
              placeholder="Rate"
              onChange={(e) =>
                handleItemChange(idx, "rate", e.target.value)
              }
            />
          </div>
        ))}

        <button
          className="btn btn-info mb-2"
          onClick={addItem}
        >
          + Add Item
        </button>

        <input
          type="number"
          className="form-control mb-2"
          placeholder="Paid Amount"
          onChange={(e) =>
            setForm({
              ...form,
              paidAmount: Number(e.target.value),
            })
          }
        />

        <button
          className="btn btn-success"
          onClick={handleSubmit}
        >
          Save
        </button>

        <button
          className="btn btn-secondary ms-2"
          onClick={close}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PurchaseModal;
