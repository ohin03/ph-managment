import { useEffect, useState } from "react";
import { getBanks } from "../api/bankApi";
import { toast } from "react-toastify";
import BankModal from "../components/bank/BankModal";

const BankSetup = () => {
  const [banks, setBanks] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editBank, setEditBank] = useState(null);

  const loadBanks = async () => {
    try {
      const data = await getBanks(search);
      setBanks(data);
    } catch {
      toast.error("Failed to load banks");
    }
  };

  useEffect(() => {
    loadBanks();
  }, [search]);

  return (
    <div className="page-content">
      <h2>Bank Setup</h2>

      <div className="d-flex mb-3">
        <input
          className="form-control me-2"
          placeholder="Search bank"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditBank(null);
            setModalOpen(true);
          }}
        >
          + Add Bank
        </button>
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Bank</th>
            <th>Account No</th>
            <th>Type</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {banks.map((b) => (
            <tr key={b._id}>
              <td>{b.bankName}</td>
              <td>{b.accountNumber}</td>
              <td>{b.accountType}</td>
              <td>{b.currentBalance}</td>
              <td>{b.status}</td>
              <td>
                <button
                  className="btn btn-sm btn-info"
                  onClick={() => {
                    setEditBank(b);
                    setModalOpen(true);
                  }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <BankModal
          bank={editBank}
          close={() => setModalOpen(false)}
          reload={loadBanks}
        />
      )}
    </div>
  );
};

export default BankSetup;
