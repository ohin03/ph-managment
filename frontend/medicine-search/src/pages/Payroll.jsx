import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

const Payroll = () => {
    const [employees, setEmployees] = useState([]);
    const [history, setHistory] = useState([]);
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [lastDue, setLastDue] = useState(0);
    
    // --- FIX: Default Month Setup ---
    const initialMonth = new Date().toISOString().slice(0, 7); // Format: "YYYY-MM"
    const [monthInput, setMonthInput] = useState(initialMonth);
    const [monthDisplay, setMonthDisplay] = useState(
        new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
    );
    
    const [paidInput, setPaidInput] = useState(0);
    const [advance, setAdvance] = useState(0);
    const [deduction, setDeduction] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const empRes = await api.get("/hr/employees");
            const histRes = await api.get(`/hr/salary-history?month=${monthDisplay}`);
            setEmployees(empRes.data);
            setHistory(histRes.data);
        } catch (err) { console.error(err); }
    }, [monthDisplay]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleMonthChange = (e) => {
        const val = e.target.value;
        if (!val) return;
        setMonthInput(val);
        const d = new Date(val);
        setMonthDisplay(d.toLocaleString('default', { month: 'long', year: 'numeric' }));
    };

    const handleEmpSelect = async (id) => {
        const emp = employees.find(e => e._id === id);
        setSelectedEmp(emp);
        if (emp) {
            setPaidInput(emp.salary); 
            const res = await api.get(`/hr/last-due/${id}`);
            setLastDue(res.data.lastDue || 0);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this record permanently?")) {
            try {
                await api.delete(`/hr/salary-delete/${id}`);
                toast.success("Record Deleted");
                fetchData();
            } catch (err) { toast.error("Error!"); }
        }
    };

    const handleAction = async (e) => {
        e.preventDefault();
        const currentMonthDue = Number(selectedEmp.salary) - Number(paidInput);
        const totalDueNow = Number(lastDue) + currentMonthDue;

        const payload = {
            employeeId: selectedEmp._id,
            month: monthDisplay,
            basicSalary: selectedEmp.salary,
            paidAmount: Number(paidInput),
            dueAmount: totalDueNow,
            advance: Number(advance),
            deduction: Number(deduction),
            netPaid: (Number(paidInput)) - (Number(advance) + Number(deduction)),
            paymentMethod: "Cash"
        };

        try {
            if (isEditing) {
                await api.put(`/hr/salary-update/${editId}`, payload);
                toast.info("Record Updated");
            } else {
                await api.post("/hr/pay-salary", payload);
                toast.success("Salary Disbursed!");
            }
            setSelectedEmp(null); setIsEditing(false); setPaidInput(0); setAdvance(0); setDeduction(0); fetchData();
        } catch (err) { toast.error("Failed!"); }
    };

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            
            {/* --- TOP HEADER SECTION --- */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden bg-white">
                <div className="card-body p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div>
                        <h3 className="fw-bolder text-dark mb-1">Financial Ledger</h3>
                        <p className="text-muted mb-0 small"><i className="fa fa-info-circle me-1"></i> Current View: <strong>{monthDisplay}</strong></p>
                    </div>
                    <div className="d-flex align-items-center bg-light p-2 px-3 rounded-pill border">
                        <span className="small fw-bold text-muted me-2">Month:</span>
                        <input 
                            type="month" 
                            className="border-0 bg-transparent fw-bold text-primary" 
                            style={{ outline: 'none' }} 
                            value={monthInput} // FIX: Default value set hoye thakbe
                            onChange={handleMonthChange} 
                        />
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* --- FORM SIDE --- */}
                <div className="col-xl-4">
                    <div className="card border-0 shadow-sm rounded-4 sticky-top" style={{ top: '20px', zIndex: 10 }}>
                        <div className={`p-4 ${isEditing ? 'bg-warning' : 'bg-primary'} text-white rounded-top-4`}>
                            <h5 className="mb-1 fw-bold">{isEditing ? "📝 Modify Transaction" : "💰 Disburse Salary"}</h5>
                            <p className="small mb-0 opacity-75">Select staff and input payment details</p>
                        </div>
                        <div className="card-body p-4">
                            <label className="fw-bold small text-muted mb-2">EMPLOYEE NAME</label>
                            <select className="form-select form-select-lg border-0 bg-light rounded-3 mb-4" 
                                value={selectedEmp?._id || ""} 
                                onChange={(e) => handleEmpSelect(e.target.value)}>
                                <option value="">Select Employee</option>
                                {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                            </select>

                            {selectedEmp && (
                                <form onSubmit={handleAction} className="animate__animated animate__fadeIn">
                                    <div className="p-3 rounded-4 mb-4" style={{ background: '#0f172a' }}>
                                        <div className="d-flex justify-content-between mb-2 text-white-50 small">
                                            <span>Basic Salary:</span>
                                            <span className="text-white fw-bold">৳{selectedEmp.salary}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-1 text-white-50 small">
                                            <span>Arrears/Baki:</span>
                                            <span className="text-warning fw-bold">৳{lastDue}</span>
                                        </div>
                                        <hr className="border-secondary opacity-25" />
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="text-info small fw-bold">Total Payable:</span>
                                            <span className="h4 mb-0 text-info fw-bolder">৳{Number(selectedEmp.salary) + Number(lastDue)}</span>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="fw-bold small text-dark mb-2 uppercase">PAYING AMOUNT (৳)</label>
                                        <input type="number" className="form-control form-control-lg border-primary bg-primary bg-opacity-10 fw-bold" 
                                            value={paidInput} onChange={(e) => setPaidInput(e.target.value)} />
                                    </div>

                                    <div className="row g-3 mb-4">
                                        <div className="col-6">
                                            <label className="fw-bold small text-muted mb-1">ADVANCE</label>
                                            <input type="number" className="form-control border-0 bg-light fw-bold" value={advance} onChange={(e)=>setAdvance(e.target.value)} />
                                        </div>
                                        <div className="col-6">
                                            <label className="fw-bold small text-muted mb-1">DEDUCTION</label>
                                            <input type="number" className="form-control border-0 bg-light fw-bold" value={deduction} onChange={(e)=>setDeduction(e.target.value)} />
                                        </div>
                                    </div>

                                    <button className={`btn w-100 py-3 fw-bold rounded-pill shadow-sm border-0 ${isEditing ? 'btn-warning text-dark' : 'btn-primary'}`}>
                                        {isEditing ? "UPDATE LEDGER" : "CONFIRM DISBURSEMENT"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- HISTORY SIDE (PRO LIST) --- */}
                <div className="col-xl-8">
                    <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                        <div className="card-header bg-white border-0 p-4">
                            <h5 className="fw-bold mb-0">Monthly Salary History</h5>
                        </div>
                        <div className="table-responsive">
                            <table className="table align-middle mb-0">
                                <thead className="bg-light">
                                    <tr className="text-muted small uppercase">
                                        <th className="ps-4 py-3 border-0">Date & Staff</th>
                                        <th className="py-3 border-0">Basic</th>
                                        <th className="py-3 border-0">Paid</th>
                                        <th className="py-3 border-0">Balance/Due</th>
                                        <th className="py-3 border-0 text-end pe-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map(h => (
                                        <tr key={h._id} className="border-bottom border-light">
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-box me-3">
                                                        {h.employeeId?.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark mb-0">{h.employeeId?.name}</div>
                                                        <small className="text-muted">{new Date(h.createdAt).toLocaleDateString('en-GB')}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="fw-semibold">৳{h.basicSalary}</td>
                                            <td className="text-success fw-bold text-uppercase">৳{h.paidAmount}</td>
                                            <td>
                                                <span className={`status-pill ${h.dueAmount > 0 ? 'status-due' : 'status-paid'}`}>
                                                    {h.dueAmount > 0 ? `Due: ৳${h.dueAmount}` : '✓ Fully Paid'}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <button className="btn btn-sm btn-icon btn-light me-2 rounded-3 border" 
                                                    onClick={() => { setIsEditing(true); setEditId(h._id); setSelectedEmp(h.employeeId); setPaidInput(h.paidAmount); setAdvance(h.advance); setDeduction(h.deduction); }}>
                                                    <i className="fa fa-pen text-info small">🔄</i>
                                                </button>
                                                <button className="btn btn-sm btn-icon btn-light rounded-3 border" onClick={() => handleDelete(h._id)}>
                                                    <i className="fa fa-trash text-danger small">🗑️</i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {history.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5 text-muted small">No transactions found for {monthDisplay}.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .avatar-box {
                    width: 40px; height: 40px; background: #eff6ff; color: #3b82f6;
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 10px; font-weight: 800; font-size: 1.1rem;
                }
                .status-pill {
                    padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;
                }
                .status-paid { background: #dcfce7; color: #166534; }
                .status-due { background: #fee2e2; color: #991b1b; }
                .btn-icon { width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; }
                .sticky-top { transition: all 0.3s ease; }
            `}</style>
        </div>
    );
};

export default Payroll;