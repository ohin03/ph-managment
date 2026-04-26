import { useState, useEffect } from "react";
import { createOrUpdateAccount } from "../../api/accountApi";
import { toast } from "react-toastify";

const AccountModal = ({ account, close, reload }) => {
  const [form, setForm] = useState({
    name: "",
    type: "CASH",
    bankName: "",
    branch: "",
    accountNumber: "",
    openingBalance: "", // ✅ string to keep exact input
    status: "ACTIVE"
  });

  useEffect(() => {
    if (account) {
      setForm({
        name: account.name || "",
        type: account.type || "CASH",
        bankName: account.bankName || "",
        branch: account.branch || "",
        accountNumber: account.accountNumber || "",
        openingBalance: account.currentBalance !== undefined ? account.currentBalance.toString() : "", // keep as string
        status: account.status || "ACTIVE"
      });
    }
  }, [account]);

  const handleSubmit = async () => {
    try {
      // convert openingBalance to number when sending to backend
      await createOrUpdateAccount({ ...form, openingBalance: Number(form.openingBalance), id: account?._id });
      toast.success(account ? "Account updated" : "Account created");
      close();
      reload();
    } catch {
      toast.error("Operation failed");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h4>{account ? "Edit Account" : "Add Account"}</h4>

        <input
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
          <option value="CASH">Cash</option>
          <option value="BANK">Bank</option>
          <option value="MOBILE">Mobile</option>
        </select>

        {form.type === "BANK" && (
          <>
            <input placeholder="Bank Name" value={form.bankName} onChange={e => setForm({ ...form, bankName: e.target.value })} />
            <input placeholder="Branch" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} />
            <input placeholder="Account Number" value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })} />
          </>
        )}

        <input
          type="text" // ✅ keep as text to avoid automatic zero trimming
          placeholder="Opening Balance"
          value={form.openingBalance}
          onChange={e => setForm({ ...form, openingBalance: e.target.value })}
        />

        <div className="actions mt-2">
          <button className="btn btn-success me-2" onClick={handleSubmit}>
            {account ? "Update" : "Save"}
          </button>
          <button className="btn btn-secondary" onClick={close}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;
