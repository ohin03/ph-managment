// backend/routes/dashboard.route.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const roleGuard = require("../middleware/role.middleware");
const Sale = require("../models/Sale");
const Item = require("../models/Item");
const Customer = require("../models/customer.model");
const Vendor = require("../models/Vendor");

router.get(
  "/dashboard",
  auth,
  roleGuard(["ADMIN", "EMPLOYEE"]),
  async (req, res) => {
    try {
      // 1. Basic Counts
      const totalOrders = await Sale.countDocuments();
      const totalMedicines = await Item.countDocuments();
      const totalCustomers = await Customer.countDocuments();
      const totalSuppliers = await Vendor.countDocuments();

      // 2. Today's Sales (Based on Selected Date)
      let baseDate = new Date();
      if (req.query.date) {
        baseDate = new Date(req.query.date);
      }
      const startOfDay = new Date(baseDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(baseDate);
      endOfDay.setHours(23, 59, 59, 999);

      const todaysSalesAggr = await Sale.aggregate([
        { $match: { saleDate: { $gte: startOfDay, $lte: endOfDay } } },
        { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } }
      ]);
      const todaysSales = todaysSalesAggr.length > 0 ? todaysSalesAggr[0].totalAmount : 0;

      // 3. Yesterday's Sales for trend
      const startOfYesterday = new Date(startOfDay);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      const endOfYesterday = new Date(endOfDay);
      endOfYesterday.setDate(endOfYesterday.getDate() - 1);

      const yesterdaySalesAggr = await Sale.aggregate([
        { $match: { saleDate: { $gte: startOfYesterday, $lte: endOfYesterday } } },
        { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } }
      ]);
      const yesterdaySales = yesterdaySalesAggr.length > 0 ? yesterdaySalesAggr[0].totalAmount : 0;

      // 4. Monthly Sales (Line Chart)
      const currentYear = baseDate.getFullYear();
      const monthlySalesAggregation = await Sale.aggregate([
        {
          $match: {
            saleDate: {
              $gte: new Date(`${currentYear}-01-01`),
              $lte: new Date(`${currentYear}-12-31`)
            }
          }
        },
        {
          $group: {
            _id: { $month: "$saleDate" },
            sales: { $sum: 1 },
            revenue: { $sum: "$totalAmount" }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlySalesData = monthNames.map((name, index) => {
        const monthData = monthlySalesAggregation.find(m => m._id === index + 1);
        return {
          name,
          sales: monthData ? monthData.sales : 0,
          revenue: monthData ? monthData.revenue : 0
        };
      });

      // 5. Category/Company Distribution (Pie Chart)
      const companyAggr = await Item.aggregate([
        {
          $group: {
            _id: { $cond: [ { $eq: ["$companyName", ""] }, "Unknown", "$companyName" ] },
            value: { $sum: "$stock" }
          }
        },
        { $sort: { value: -1 } },
        { $limit: 5 }
      ]);
      const categoryData = companyAggr.map(c => ({ name: c._id || "Unknown", value: c.value }));
      
      // Keep pie chart rendering if DB is empty to avoid crashing it
      if (categoryData.length === 0) {
        categoryData.push({ name: "No Data", value: 1 });
      }

      // 6. Recent Sales
      const recentSalesRecords = await Sale.find().sort({ createdAt: -1 }).limit(5).populate("customerId", "name");
      const recentSales = recentSalesRecords.map(sale => ({
        id: sale.invoiceNo,
        customer: sale.customerId ? sale.customerId.name : "Walk-in Customer",
        amount: sale.totalAmount,
        status: sale.totalDue > 0 ? 'Pending' : 'Paid',
        date: sale.saleDate ? sale.saleDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
      }));

      // 7. Alerts
      const lowStockMedicines = await Item.find({ stock: { $lt: 10 } }).limit(5).select("name stock");
      
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const expiringMedicines = await Item.find({ 
        expiryDate: { $lte: thirtyDaysFromNow, $gte: new Date() } 
      }).limit(5).select("name expiryDate");

      // 8. Total Revenue & Average Sale
      const totalRevAggr = await Sale.aggregate([
        { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } }
      ]);
      const totalRevenue = totalRevAggr.length > 0 ? totalRevAggr[0].totalAmount : 0;
      const averageSale = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // 9. Top Selling Medicine and Top Customers
      const topMedicinesAggr = await Sale.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.medicine", quantitySold: { $sum: "$items.quantity" } } },
        { $sort: { quantitySold: -1 } },
        { $limit: 3 }
      ]);
      const topMedicines = topMedicinesAggr.map(t => ({
        name: t._id,
        sold: t.quantitySold
      }));

      const topCustomersAggr = await Sale.aggregate([
        { $match: { customerId: { $ne: null } } },
        { $group: { _id: "$customerId", spent: { $sum: "$totalAmount" } } },
        { $sort: { spent: -1 } },
        { $limit: 3 },
        { $lookup: { from: "customers", localField: "_id", foreignField: "_id", as: "customer" } },
        { $unwind: "$customer" }
      ]);
      const topCustomers = topCustomersAggr.map(t => ({
        name: t.customer.name,
        spent: t.spent
      }));

      // 10. Due Calculations
      const totalDueAggr = await Sale.aggregate([
        { $group: { _id: null, totalDue: { $sum: "$totalDue" } } }
      ]);
      const totalDue = totalDueAggr.length > 0 ? totalDueAggr[0].totalDue : 0;

      const selectedDateDueAggr = await Sale.aggregate([
        { $match: { saleDate: { $gte: startOfDay, $lte: endOfDay } } },
        { $group: { _id: null, totalDue: { $sum: "$totalDue" } } }
      ]);
      const selectedDateDue = selectedDateDueAggr.length > 0 ? selectedDateDueAggr[0].totalDue : 0;

      const startOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      const endOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0, 23, 59, 59, 999);
      const selectedMonthDueAggr = await Sale.aggregate([
        { $match: { saleDate: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, totalDue: { $sum: "$totalDue" } } }
      ]);
      const selectedMonthDue = selectedMonthDueAggr.length > 0 ? selectedMonthDueAggr[0].totalDue : 0;
      res.json({
        totalOrders,
        totalMedicines,
        totalCustomers,
        totalSuppliers,
        todaysSales,
        yesterdaySales,
        monthlySalesData,
        categoryData,
        recentSales,
        lowStockMedicines,
        expiringMedicines,
        totalRevenue,
        averageSale,
        topMedicines,
        topMedicines,
        topCustomers,
        totalDue,
        selectedDateDue,
        selectedMonthDue
      });

    } catch (error) {
      console.error("Dashboard API Error:", error);
      res.status(500).json({ message: "Server error generating dashboard data." });
    }
  }
);

module.exports = router;