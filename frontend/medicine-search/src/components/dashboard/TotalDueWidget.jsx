import React, { useEffect, useState } from "react";
import { getTotalDue } from "../api/ledgerApi";

const TotalDueWidget = () => {
  const [totalDue, setTotalDue] = useState(0);

  const fetchTotalDue = async () => {
    try {
      const data = await getTotalDue();
      setTotalDue(data.totalDue);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTotalDue();
  }, []);

  return (
    <div className="dashboard-widget due-widget" onClick={() => window.location="/customer-ledger"}>
      <h4>Total Customer Due</h4>
      <h2>৳ {totalDue}</h2>
      <p>Click to view ledger</p>
    </div>
  );
};

export default TotalDueWidget;
