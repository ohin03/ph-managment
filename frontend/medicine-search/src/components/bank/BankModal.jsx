import { useEffect, useState } from "react";
import { createBank, updateBank } from "../../api/bankApi";
import { toast } from "react-toastify";
import "./BankModal.css";

const BankModal = ({ bank, close, reload }) => {
  const [form, setForm] = useState({
    bankName: "",
    branch: "",
    accountNumber: "",
    accountType: "CURRENT",
    openingBalance: "", // ✅ FIX: empty string
    status: "ACTIVE",
  });

  useEffect(() => {
    if (bank) {
      setForm({
        bankName: bank.bankName || "",
        branch: bank.branch || "",
        accountNumber: bank.accountNumber || "",
        accountType: bank.accountType || "CURRENT",
        openingBalance: bank.currentBalance ?? "", // ✅ FIX
        status: bank.status || "ACTIVE",
      });
    }
  }, [bank]);

  const submit = async () => {
    try {
      const payload = {
        ...form,
        openingBalance: Number(form.openingBalance || 0), // ✅ backend safe
      };

      bank
        ? await updateBank(bank._id, payload)
        : await createBank(payload);

      toast.success(bank ? "Bank updated" : "Bank added");
      close();
      reload();
    } catch {
      toast.error("Operation failed");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h4>{bank ? "Edit Bank" : "Add Bank"}</h4>

        <input
          placeholder="Bank Name"
          value={form.bankName}
          onChange={(e) =>
            setForm({ ...form, bankName: e.target.value })
          }
        />

        <input
          placeholder="Branch"
          value={form.branch}
          onChange={(e) =>
            setForm({ ...form, branch: e.target.value })
          }
        />

        <input
          placeholder="Account Number"
          value={form.accountNumber}
          onChange={(e) =>
            setForm({ ...form, accountNumber: e.target.value })
          }
        />

        <select
          value={form.accountType}
          onChange={(e) =>
            setForm({ ...form, accountType: e.target.value })
          }
        >
          <option value="CURRENT">Current</option>
          <option value="SAVINGS">Savings</option>
        </select>

        <input
          type="number"
          placeholder="Opening Balance"
          value={form.openingBalance}
          onChange={(e) =>
            setForm({ ...form, openingBalance: e.target.value })
          }
        />

        <div className="actions">
          <button className="btn btn-success" onClick={submit}>
            Save
          </button>
          <button className="btn btn-secondary" onClick={close}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankModal;
  