import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logoutWithAttendance } from "../../api/attendanceApi";
import { useState } from "react";
import "./Sidebar.css";

const Sidebar = ({ collapsed, mobileOpen, closeMobile }) => {
  const navigate = useNavigate();
  const { authed, role, menuAccess, logout } = useAuth();

  const [adminOpen, setAdminOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [salesOpen, setSalesOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [reportSalesOpen, setReportSalesOpen] = useState(false);
  const [reportPurchaseOpen, setReportPurchaseOpen] = useState(false);
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [reportTransactionOpen, setReportTransactionOpen] = useState(false);
const [hrOpen, setHrOpen] = useState(false);
const toggleHrMenu = () => setHrOpen(!hrOpen);
const toggleReportTransaction = () =>
  setReportTransactionOpen(!reportTransactionOpen);

  const toggleTransactionMenu = () => setTransactionOpen(!transactionOpen);

  const toggleAdminMenu = () => setAdminOpen(!adminOpen);
  const togglePurchaseMenu = () => setPurchaseOpen(!purchaseOpen);
  const toggleSalesMenu = () => setSalesOpen(!salesOpen);
  const toggleReportMenu = () => setReportOpen(!reportOpen);
  const toggleLedger = () => setLedgerOpen(!ledgerOpen);
  const toggleReportSales = () => setReportSalesOpen(!reportSalesOpen);
  const toggleReportPurchase = () => setReportPurchaseOpen(!reportPurchaseOpen);

  const handleLogout = async () => {
    await logoutWithAttendance();
    logout();
    navigate("/login");
    closeMobile();
  };

  // Helper to check permissions
  const hasAccess = (permission) => role === "ADMIN" || menuAccess.includes(permission);

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={closeMobile}></div>}

      <nav className={`page-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "active" : ""}`}>
        <ul className="x-navigation">
          {/* Logo */}
          <li className="xn-logo  ">
            <Link to="/" onClick={closeMobile}>Our Pharmacy</Link>
          </li>

          {/* Dashboard */}
          {authed && hasAccess("dashboard") && (
            <li>
              <Link to="/" onClick={closeMobile}>
                <i className="fa fa-desktop"></i>
                <span className="xn-text">Dashboard</span>
              </Link>
            </li>
          )}

          <li className="xn-divider"></li>

          {/* Medicines */}
          {authed && hasAccess("medicines") && (
            <li>
              <Link to="/medicines" onClick={closeMobile}>
                <i className="fa fa-medkit"></i>
                <span className="xn-text">Medicines</span>
              </Link>
            </li>
          )}

          <li className="xn-divider"></li>

        

          {/* Sales */}
          {authed && (hasAccess("sales-entry") || hasAccess("sales-return") || hasAccess("vendor-sales")) && (
            <li className={`xn-parent ${salesOpen ? "active" : ""}`}>
              <Link to="#" className="link-style-menu" onClick={toggleSalesMenu}>
                <i className="fa fa-chart-line">🧾</i>
                <span className="xn-text text-white">Sales</span>
                <i className={`fa fa-chevron-${salesOpen ? "down" : "right"} toggle-arrow text-white`}></i>
              </Link>

              {salesOpen && (
                <ul className="x-submenu round-submenu">
                  {hasAccess("sales-entry") && (
                    <li>
                      <Link to="/sales-entry" onClick={closeMobile}>
                        <span className="submenu-icon">✦</span>
                        <span className="xn-text">Sales Entry</span>
                      </Link>
                    </li>
                  )}
                  {hasAccess("sales-return") && (
                    <li>
                      <Link to="/sales-return" onClick={closeMobile}>
                        <span className="submenu-icon">✦</span>
                        <span className="xn-text">Sales Return</span>
                      </Link>
                    </li>
                  )}
                  {hasAccess("vendor-sales") && (
                    <li>
                      <Link to="/vendor-sales" onClick={closeMobile}>
                        <span className="submenu-icon">✦</span>
                        <span className="xn-text">Vendor Sales</span>
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </li>
          )}

         



{/* ================= TRANSACTION ================= */}
         {authed && hasAccess("customer-receive") && (
           <>
            <li className="xn-divider"></li>

              <li className={`xn-parent ${transactionOpen ? "active" : ""}`}>
           <Link
              to="#"
              className="link-style-menu"
              onClick={toggleTransactionMenu}
            >
            <i className="fa fa-exchange-alt">💵</i>
             <span className="xn-text text-white">Transaction</span>
            <i
              className={`fa fa-chevron-${
                transactionOpen ? "down" : "right"
                } toggle-arrow text-white`}
             ></i>
           </Link>

            {transactionOpen && (
          <ul className="x-submenu round-submenu">
             {hasAccess("customer-receive") && (
            <li>
              <Link
                to="/transactions/customer-receive"
                onClick={closeMobile}
              >
                <span className="submenu-icon">✦</span>
                <span className="xn-text">Customer Receive</span>
              </Link>
            </li>
          )}

          {hasAccess("vendor-receive") && (
           <li>
            <Link
              to="/transactions/vendor-receive"
               onClick={closeMobile}
             >
             <span className="submenu-icon">✦</span>
             <span className="xn-text">Vendor Receive</span>
            </Link>
          </li>
          )}
         
        </ul>
      )}
    </li>
  </>
)}

  <li className="xn-divider"></li>

  {/* Purchase */}
          {authed && (hasAccess("purchase-entry") || hasAccess("purchase-return")) && (
            <li className={`xn-parent ${purchaseOpen ? "active" : ""}`}>
              <Link to="#" className="link-style-menu" onClick={togglePurchaseMenu}>
                <i className="fa fa-shopping-cart"></i>
                <span className="xn-text text-white">Purchase</span>
                <i className={`fa fa-chevron-${purchaseOpen ? "down" : "right"} toggle-arrow text-white`}></i>
              </Link>

              {purchaseOpen && (
                <ul className="x-submenu round-submenu">
                  {hasAccess("purchase-entry") && (
                    <li>
                      <Link to="/purchase-entry" onClick={closeMobile}>
                        <span className="submenu-icon">✦</span>
                        <span className="xn-text">Purchase Entry</span>
                      </Link>
                    </li>
                  )}
                  {hasAccess("purchase-return") && (
                    <li>
                      <Link to="/purchase-return" onClick={closeMobile}>
                        <span className="submenu-icon">✦</span>
                        <span className="xn-text">Purchase Return</span>
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </li>
          )}

          <li className="xn-divider"></li>










          {/* Report */}
          {authed && (
            hasAccess("sales-report") || hasAccess("sales-return-report") ||
            hasAccess("purchase-report") || hasAccess("purchase-return-report") ||
            hasAccess("ledger") || hasAccess("customer-ledger") ||
            hasAccess("vendor-ledger") || hasAccess("vendor-report") ||
            hasAccess("customer-receive-report") || hasAccess("vendor-receive-report")
          ) && (
            <li className={`xn-parent ${reportOpen ? "active" : ""}`}>
              <Link to="#" className="link-style-menu" onClick={toggleReportMenu}>
                <i className="fa fa-chart-bar">📊</i>
                <span className="xn-text text-white">Report</span>
                <i className={`fa fa-chevron-${reportOpen ? "down" : "right"} toggle-arrow text-white`}></i>
              </Link>

              {reportOpen && (
                <ul className="x-submenu round-submenu">
                  {/* Sales Reports */}
                  {(hasAccess("sales-report") || hasAccess("sales-return-report") ||  hasAccess("vendor-report") ) && (
                    <li className={`xn-parent ${reportSalesOpen ? "active" : ""}`}>
                      <Link to="#" onClick={toggleReportSales}>
                        <span className="submenu-icon">📈</span>
                        <span className="xn-text">Sales</span>
                        <i className={`fa fa-chevron-${reportSalesOpen ? "down" : "right"} toggle-arrow`}></i>
                      </Link>
                      {reportSalesOpen && (
                        <ul className="x-submenu">
                          {hasAccess("sales-report") && (
                            <li>
                              <Link to="/reports/sales-report" onClick={closeMobile}>
                                <span className="submenu-icon">-</span>
                                <span className="xn-text text-warning-emphasis">Sales Report</span>
                              </Link>
                            </li>
                          )}
                          {hasAccess("sales-return-report") && (
                            <li>
                              <Link to="/reports/sales-return-report" onClick={closeMobile}>
                                <span className="submenu-icon">-</span>
                                <span className="xn-text text-warning-emphasis">Sales Return Report</span>
                              </Link>
                            </li>
                          )}

 {/* Vendor Report */}
                  {hasAccess("vendor-report") && (
                    <li>
                      <Link to="/reports/vendor-report" onClick={closeMobile}>
                        <span className="submenu-icon">-</span>
                        <span className="xn-text text-warning-emphasis">Vendor Report</span>
                      </Link>
                    </li>
                  )}




                        </ul>
                      )}
                    </li>
                  )}

                  {/* Purchase Reports */}
                  {(hasAccess("purchase-report") || hasAccess("purchase-return-report")) && (
                    <li className={`xn-parent ${reportPurchaseOpen ? "active" : ""}`}>
                      <Link to="#" onClick={toggleReportPurchase}>
                        <span className="submenu-icon">🛒</span>
                        <span className="xn-text ">Purchase</span>
                        <i className={`fa fa-chevron-${reportPurchaseOpen ? "down" : "right"} toggle-arrow`}></i>
                      </Link>
                      {reportPurchaseOpen && (
                        <ul className="x-submenu">
                          {hasAccess("purchase-report") && (
                            <li>
                              <Link to="/reports/purchase-report" onClick={closeMobile}>
                                <span className="submenu-icon">-</span>
                                <span className="xn-text text-warning-emphasis">Purchase Report</span>
                              </Link>
                            </li>
                          )}
                          {hasAccess("purchase-return-report") && (
                            <li>
                              <Link to="/reports/purchase-return-report" onClick={closeMobile}>
                                <span className="submenu-icon">-</span>
                                <span className="xn-text  text-warning-emphasis ">Purchase Return Report</span>
                              </Link>
                            </li>
                          )}
                        </ul>
                      )}
                    </li>
                  )}
                   
                  {/* Transaction Report */}
{hasAccess("customer-receive-report") && (
  <li className={`xn-parent ${reportTransactionOpen ? "active" : ""}`}>
    <Link to="#" onClick={toggleReportTransaction}>
      <span className="submenu-icon">💳</span>
      <span className="xn-text">Transaction</span>
      <i
        className={`fa fa-chevron-${
          reportTransactionOpen ? "down" : "right"
        } toggle-arrow`}
      ></i>
    </Link>

    {reportTransactionOpen && (
      <ul className="x-submenu">
        <li>
          <Link
            to="/reports/customer-receive-report"
            onClick={closeMobile}
          >
            <span className="submenu-icon">-</span>
            <span className="xn-text text-warning-emphasis">Customer Receive Report</span>
          </Link>
        </li>

         {/* Vendor Receive Report */}
        {hasAccess("vendor-receive-report") && (
          <li>
            <Link
              to="/reports/vendor-receive-report"
              onClick={closeMobile}
            >
              <span className="submenu-icon">-</span>
              <span className="xn-text text-warning-emphasis">Vendor Receive Report</span>
            </Link>
          </li>
        )}
      </ul>
    )}

  </li>
)}



                  {/* Ledger */}
                  {hasAccess("ledger") && (
                    <li className={`xn-parent ${ledgerOpen ? "active" : ""}`}>
                      <Link to="#" onClick={toggleLedger}>
                        <span className="submenu-icon">📒</span>
                        <span className="xn-text">Ledger</span>
                        <i className={`fa fa-chevron-${ledgerOpen ? "down" : "right"} toggle-arrow`}></i>
                      </Link>
                      {ledgerOpen && (
                        <ul className="x-submenu">
                          {hasAccess("customer-ledger") && (
                            <li>
                              <Link to="/customer-ledger" onClick={closeMobile}>
                                <span className="submenu-icon">-</span>
                                <span className="xn-text text-warning-emphasis">Customer Ledger</span>
                              </Link>
                            </li>
                          )}
                          {hasAccess("vendor-ledger") && (
                            <li>
                              <Link to="/vendor-ledger" onClick={closeMobile}>
                                <span className="submenu-icon">-</span>
                                <span className="xn-text text-warning-emphasis">Vendor Ledger</span>
                              </Link>
                            </li>
                          )}
                        </ul>
                      )}
                    </li>
                  )}


                  {/* Attendance Report */}
{hasAccess("attendance-report") && (
  <li>
    <Link 
      to="/reports/attendance-report" 
      onClick={closeMobile}
    >
      <span className="submenu-icon">📅</span>
      <span className="xn-text ">Attendance Report</span>
    </Link>
  </li>
)}


                 

                </ul>
              )}
            </li>
          )}

          <li className="xn-divider"></li>




{authed && role === "ADMIN" && (
  <li className={`xn-parent ${hrOpen ? "active" : ""}`}>
    <Link to="#" className="link-style-menu" onClick={toggleHrMenu}>
      <i className="fa fa-users"></i>
      <span className="xn-text text-white">HR Management</span>
      <i className={`fa fa-chevron-${hrOpen ? "down" : "right"} toggle-arrow text-white`}></i>
    </Link>

    {hrOpen && (
      <ul className="x-submenu round-submenu">
        <li>
          <Link to="/hr/dashboard" onClick={closeMobile}>
            <span className="submenu-icon">✦</span>
            <span className="xn-text">HR Dashboard</span>
          </Link>
        </li>
        <li>
          <Link to="/hr/attendance" onClick={closeMobile}>
            <span className="submenu-icon">✦</span>
            <span className="xn-text">Daily Attendance</span>
          </Link>
        </li>
        <li>
          <Link to="/hr/payroll" onClick={closeMobile}>
            <span className="submenu-icon">✦</span>
            <span className="xn-text">Payroll / Salary</span>
          </Link>
        </li>
      </ul>
    )}
  </li>
)}
<li className="xn-divider"></li>






          



          {/* Administration */}
          {authed && role === "ADMIN" && (
            <li className={`xn-parent ${adminOpen ? "active" : ""}`}>
              <Link to="#" className="link-style-menu" onClick={toggleAdminMenu}>
                <i className="fa fa-cogs"></i>
                <span className="xn-text text-white">Administration</span>
                <i className={`fa fa-chevron-${adminOpen ? "down" : "right"} toggle-arrow text-white`}></i>
              </Link>

              {adminOpen && (
                <ul className="x-submenu round-submenu">
                  <li>
                    <Link to="/employees" onClick={closeMobile}>
                      <span className="submenu-icon">◎</span>
                      <span className="xn-text">User Management</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/administration/item-setup" onClick={closeMobile}>
                      <span className="submenu-icon">◎</span>
                      <span className="xn-text">Item Setup</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/administration/customer-setup" onClick={closeMobile}>
                      <span className="submenu-icon">◎</span>
                      <span className="xn-text">Customer Setup</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/administration/vendor-setup" onClick={closeMobile}>
                      <span className="submenu-icon">◎</span>
                      <span className="xn-text">Vendor Setup</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/bank-setup" onClick={closeMobile}>
                      <span className="submenu-icon">◎</span>
                      <span className="xn-text">Bank Setup</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/administration/account-setup" onClick={closeMobile}>
                      <span className="submenu-icon">◎</span>
                      <span className="xn-text">Account Setup</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/customer-ledger" onClick={closeMobile}>
                      <span className="submenu-icon">◎</span>
                      <span className="xn-text">Customer Ledger</span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          )}

          <li className="xn-divider"></li>

          {/* Profile */}
          {authed && (
            <li>
              <Link to="/profile" onClick={closeMobile}>
                <i className="fa fa-user"></i>
                <span className="xn-text">Profile</span>
              </Link>
            </li>
          )}

          <li className="xn-divider"></li>

          {/* Login / Logout */}
          {!authed ? (
            <li>
              <Link to="/login" onClick={closeMobile}>
                <i className="fa fa-sign-in"></i>
                <span className="xn-text">Login</span>
              </Link>
            </li>
          ) : (
            <li>
              <button className="btn-logout" onClick={handleLogout}>
                <i className="fa fa-sign-out"></i>
                <span className="xn-text">Logout</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
};

export default Sidebar;