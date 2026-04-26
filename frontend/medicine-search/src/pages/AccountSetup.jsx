import { useEffect, useState } from "react";
import { getAccounts, createOrUpdateAccount, deleteAccount } from "../api/accountApi";
import { toast } from "react-toastify";
import AccountModal from "../components/account/AccountModal";

const AccountSetup = () => {
  const [accounts, setAccounts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState(null);

  const loadAccounts = async () => {
    const data = await getAccounts();
    setAccounts(data);
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleAdd = () => {
    setEditAccount(null);
    setModalOpen(true);
  };

  const handleEdit = (acc) => {
    setEditAccount(acc);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete account?")) {
      await deleteAccount(id);
      toast.success("Account deleted");
      loadAccounts();
    }
  };

  return (
    <div className="page-content">
      <h2>Account Setup</h2>
      <button className="btn btn-primary mb-3" onClick={handleAdd}>+ Add Account</button>

      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr key={acc._id}>
              <td>{acc.name}</td>
              <td>{acc.type}</td>
              <td>৳ {acc.currentBalance}</td>
              <td>{acc.status}</td>
              <td>
                <button className="btn btn-info btn-sm me-1" onClick={() => handleEdit(acc)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(acc._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <AccountModal
          account={editAccount}
          close={() => setModalOpen(false)}
          reload={loadAccounts}
        />
      )}
    </div>
  );
};

export default AccountSetup;
