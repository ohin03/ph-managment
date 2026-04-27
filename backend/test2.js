const req = { query: { date: '2026-04-27' } };
let baseDate = new Date();
if (req.query.date) {
  baseDate = new Date(req.query.date);
}
const startOfDay = new Date(baseDate);
startOfDay.setHours(0, 0, 0, 0);
const endOfDay = new Date(baseDate);
endOfDay.setHours(23, 59, 59, 999);

console.log("startOfDay:", startOfDay.toISOString());
console.log("endOfDay:", endOfDay.toISOString());

const startOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
const endOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0, 23, 59, 59, 999);

console.log("startOfMonth:", startOfMonth.toISOString());
console.log("endOfMonth:", endOfMonth.toISOString());

// Test the MongoDB aggregation
const mongoose = require('mongoose');
const Sale = require('./models/Sale');

async function test() {
  await mongoose.connect('mongodb+srv://testuser:testuser123@cluster0.gesjpwi.mongodb.net/medicineDB');
  
  const selectedDateDueAggr = await Sale.aggregate([
    { $match: { saleDate: { $gte: startOfDay, $lte: endOfDay } } },
    { $group: { _id: null, totalDue: { $sum: "$totalDue" } } }
  ]);
  const selectedDateDue = selectedDateDueAggr.length > 0 ? selectedDateDueAggr[0].totalDue : 0;
  
  const selectedMonthDueAggr = await Sale.aggregate([
    { $match: { saleDate: { $gte: startOfMonth, $lte: endOfMonth } } },
    { $group: { _id: null, totalDue: { $sum: "$totalDue" } } }
  ]);
  const selectedMonthDue = selectedMonthDueAggr.length > 0 ? selectedMonthDueAggr[0].totalDue : 0;
  
  const totalDueAggr = await Sale.aggregate([
    { $group: { _id: null, totalDue: { $sum: "$totalDue" } } }
  ]);
  const totalDue = totalDueAggr.length > 0 ? totalDueAggr[0].totalDue : 0;
  
  console.log("Due:", { selectedDateDue, selectedMonthDue, totalDue });
  process.exit(0);
}

test();
