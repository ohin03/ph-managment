require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const createSuperAdmin = require("./utils/createSuperAdmin");
const dashboardRoute = require("./routes/dashboard.route");
const userRoute = require("./routes/user.route");
const employeeRoutes = require("./routes/employee.route");
const attendanceRoute = require("./routes/attendance.route");
const customerRoutes = require("./routes/customer.route");
const itemRoutes = require("./routes/itemRoutes");
const ledgerRoutes = require("./routes/ledger.route");
const saleRoutes = require("./routes/sale.route");
const vendorRoutes = require("./routes/vendor.route");
const BankRoutes = require("./routes/bank.route");
const accountRoutes = require("./routes/account.route");
const purchaseRoutes = require("./routes/purchase.route");
const purchaseReturnRoutes = require("./routes/purchaseReturn.route");
const medicineRoutes = require("./routes/medicine.routes");
const salesReturnRoutes = require("./routes/salesReturn");
const vendorSaleRoutes = require("./routes/vendorSaleRoutes")
const reportRoutes = require("./routes/report.route");
const returnReportRoute = require("./routes/returnReport");
const vendorReportRoutes = require("./routes/vendorReport");
const purchaseReportRoutes = require("./routes/purchaseReport");
const purchaseReturnReportRoutes = require("./routes/purchaseReturnReport");
const customerReceiveRoutes = require("./routes/customerReceive.routes");
const vendorReceiveRoutes = require("./routes/vendorReceive.routes");
const customerReciveReportRoute = require("./routes/customerReciveReportRoute");
const vendorReceiveReport = require("./routes/vendorReceiveReport");
const hrRoutes = require("./routes/hr.route");



const app = express();


app.use(cors());
app.use(express.json());


console.log("MONGO_URI =", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected successfully");
    await createSuperAdmin();
  })
  .catch((err) => console.log("❌ MongoDB Error:", err));


const authRoutes = require("./routes/auth.route");
app.use("/api", authRoutes);

app.use("/api", dashboardRoute);
app.use("/api", employeeRoutes);
app.use("/api/user", userRoute);
app.use("/api/attendance", attendanceRoute);
app.use("/api/items", itemRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/banks", BankRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/purchase-returns", purchaseReturnRoutes);
app.use("/api/sales-return", salesReturnRoutes);
const searchRoute = require("./routes/search");
app.use("/api/search", searchRoute);
app.use("/api/vendor-sales", vendorSaleRoutes);
app.use("/api/reports", vendorReportRoutes);
app.use("/api/reports", purchaseReportRoutes);
app.use("/api/reports", purchaseReturnReportRoutes);
app.use("/api/customer-receive", customerReceiveRoutes);
app.use("/api/vendor-receive", vendorReceiveRoutes);
app.use("/api/reports", customerReciveReportRoute);
app.use("/api/reports", vendorReceiveReport);
app.use("/api/hr", hrRoutes);
const itemRoute = require("./routes/items");


app.use("/api/reports", reportRoutes);
app.use("/api/reports", returnReportRoute);



app.get("/", (req, res) => {
  res.send("API is running...");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});