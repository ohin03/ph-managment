

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Styles */
import "./App.css";
import "./Layout.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

/* Layout */
import Layout from "./components/Layout/Layout";

/* Pages */
import Home from "./pages/Home";
import ItemList from "./pages/ItemList";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import EmployeeList from "./pages/EmployeeList";
import ItemSetup from "./pages/ItemSetup"; 
import CustomerSetup from "./pages/CustomerSetup";
import CustomerLedger from "./pages/CustomerLedger";
import VendorSetup from "./pages/VendorSetup";
import VendorLedger from "./pages/VendorLedger";
import BankSetup from "./pages/BankSetup";
import AccountSetup from "./pages/AccountSetup";
import PurchaseEntry from "./pages/PurchaseEntry";
import PurchaseReturn from "./pages/PurchaseReturn";
import SalesEntry from "./pages/SalesEntry";
import VendorSales from "./pages/VendorSales";
import SalesReport from "./pages/SalesReport";
import SalesReturnReport from "./pages/SalesReturnReport";
import VendorReport from "./pages/VendorReport";
import PurchaseReport from "./pages/PurchaseReport";
import PurchaseReturnReport from "./pages/PurchaseReturnReport";
import CustomerReceive from "./pages/CustomerReceive";
import VendorReceive from "./pages/VendorReceive";
import CustomerReciveReport from "./pages/CustomerReciveReport";
import VendorReceiveReport from "./pages/VendorReceiveReport";
import HRDashboard from "./pages/HRDashboard";
import Payroll from "./pages/Payroll";
import Attendance from "./pages/Attendance";
import AttendanceReport from "./pages/AttendanceReport";

/* Auth */
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";

/* Toast */
import { ToastContainer } from "react-toastify";
import SalesReturn from './pages/SalesReturn';

/* Role-based route wrapper */
const RoleRoute = ({ children, roles }) => {
  const { role } = useAuth();
  if (roles.includes(role)) return children;

  return (
    <div className="text-center mt-5">
      <h3>❌ Access Denied</h3>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* HOME */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Home />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* MEDICINES */}
          <Route
            path="/medicines"
            element={
              <PrivateRoute>
                <Layout>
                  <ItemList />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* PROFILE */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* EMPLOYEES (ADMIN ONLY) */}
          <Route
            path="/employees"
            element={
              <PrivateRoute>
                <RoleRoute roles={["ADMIN"]}>
                  <Layout>
                    <EmployeeList />
                  </Layout>
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* ITEM SETUP (ADMIN ONLY) */}
          <Route
            path="/administration/item-setup"
            element={
              <PrivateRoute>
                <RoleRoute roles={["ADMIN"]}>
                  <Layout>
                    <ItemSetup />
                  </Layout>
                </RoleRoute>
              </PrivateRoute>
            }
          />


          {/* ================= ADMIN → CUSTOMER SETUP ================= */}
          <Route
            path="/administration/customer-setup"
            element={
              <PrivateRoute>
                <RoleRoute roles={["ADMIN"]}>
                  <Layout>
                    <CustomerSetup />
                  </Layout>
                </RoleRoute>
              </PrivateRoute>
            }
          />


        {/* Customer Ledger */}
          <Route
            path="/customer-ledger/:customerId?"
            element={
              <PrivateRoute>
                <Layout>
                  <CustomerLedger />
                </Layout>
              </PrivateRoute>
            }
          />



          <Route
  path="/administration/vendor-setup"
  element={
    <PrivateRoute>
      <Layout>
        <VendorSetup />
      </Layout>
    </PrivateRoute>
  }
/>

<Route
  path="/vendor-ledger/:vendorId?"
  element={
    <PrivateRoute>
      <Layout>
        <VendorLedger />
      </Layout>
    </PrivateRoute>
  }
/>

  {/* BANK SETUP */}
          <Route
            path="/bank-setup"
            element={
              <PrivateRoute>
                <RoleRoute roles={["ADMIN"]}>
                  <Layout>
                    <BankSetup />
                  </Layout>
                </RoleRoute>
              </PrivateRoute>
            }
          />

 {/*Account setup */}
  <Route path="/administration/account-setup"
   element={
   <PrivateRoute>
    <RoleRoute roles={["ADMIN"]}>
      <Layout>
        <AccountSetup />
      </Layout>
    </RoleRoute>
  </PrivateRoute>} />

{/*Purchase Entry */}
<Route
  path="/purchase-entry"
  element={
    <PrivateRoute>
      <Layout>
        <PurchaseEntry />
      </Layout>
    </PrivateRoute>
  }
/>


{/* Purchase Return */}
<Route
  path="/purchase-return"
  element={
    <PrivateRoute>
      <Layout>
        <PurchaseReturn />
      </Layout>
    </PrivateRoute>
  }
/>

{/* sales entry */}
<Route
  path="/sales-entry"
  element={
    <PrivateRoute>
      <Layout>
        <SalesEntry />
      </Layout>
    </PrivateRoute>
  }
/>

<Route
  path="/sales-return"
  element={
    <PrivateRoute>
      <Layout>
        <SalesReturn />
      </Layout>
    </PrivateRoute>
  }
/>

{/* Vendor Sales */}
<Route
  path="/vendor-sales"
  element={
    <PrivateRoute>
      <Layout>
        <VendorSales />
      </Layout>
    </PrivateRoute>
  }
/>


<Route
  path="/reports/sales-report"
  element={
    <PrivateRoute>
      <Layout>
       <SalesReport/>
      </Layout>
    </PrivateRoute>
  }
/>

<Route
  path="/reports/sales-return-report"
  element={
    <PrivateRoute>
      <Layout>
        <SalesReturnReport />
      </Layout>
    </PrivateRoute>
  }
/>


<Route
  path="/reports/vendor-report"
  element={
    <PrivateRoute>
      <Layout>
        <VendorReport />
      </Layout>
    </PrivateRoute>
  }
/>

<Route
  path="/reports/purchase-report"
  element={
    <PrivateRoute>
      <Layout>
        <PurchaseReport />
      </Layout>
    </PrivateRoute>
  }
/>

<Route
  path="/reports/purchase-return-report"
  element={
    <PrivateRoute>
      <Layout>
        <PurchaseReturnReport />
      </Layout>
    </PrivateRoute>
  }
/>

{/* ================= TRANSACTION ================= */}
<Route
  path="/transactions/customer-receive"
  element={
    <PrivateRoute>
      <Layout>
        <CustomerReceive />
      </Layout>
    </PrivateRoute>
  }
/>


<Route
  path="/transactions/vendor-receive"
  element={
    <PrivateRoute>
      <Layout>
        <VendorReceive />
      </Layout>
    </PrivateRoute>
  }
/>


<Route
  path="/reports/customer-receive-report"
  element={
    <PrivateRoute>
      <Layout>
        <CustomerReciveReport />
      </Layout>
    </PrivateRoute>
  }
/>


<Route
 path="/reports/vendor-receive-report"
 element={
   <PrivateRoute>
     <Layout>
       <VendorReceiveReport />
     </Layout>
   </PrivateRoute>
 }
/>


<Route
  path="/hr/dashboard"
  element={
    <PrivateRoute>
      <RoleRoute roles={["ADMIN"]}>
        <Layout><HRDashboard /></Layout>
      </RoleRoute>
    </PrivateRoute>
  }
/>
<Route
  path="/hr/payroll"
  element={
    <PrivateRoute>
      <RoleRoute roles={["ADMIN"]}>
        <Layout><Payroll /></Layout>
      </RoleRoute>
    </PrivateRoute>
  }
/>
<Route
  path="/hr/attendance"
  element={
    <PrivateRoute>
      <RoleRoute roles={["ADMIN"]}>
        <Layout><Attendance /></Layout>
      </RoleRoute>
    </PrivateRoute>
  }
/>


<Route 
path="/reports/attendance-report"
 element={
 <PrivateRoute>
  <Layout>
    <AttendanceReport />
    </Layout>
</PrivateRoute>
} />


        </Routes>

        <ToastContainer position="top-center" autoClose={3000} newestOnTop />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
