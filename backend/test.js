const mongoose = require('mongoose');
const Sale = require('./models/Sale');

async function test() {
  await mongoose.connect('mongodb+srv://testuser:testuser123@cluster0.gesjpwi.mongodb.net/medicineDB');
  const sales = await Sale.find();
  console.log(sales.map(s => ({
    invoiceNo: s.invoiceNo,
    totalDue: s.totalDue,
    dueAmount: s.dueAmount, // perhaps wrong key?
    date: s.saleDate,
    amount: s.totalAmount,
    paid: s.totalPaid
  })));
  process.exit(0);
}

test();
