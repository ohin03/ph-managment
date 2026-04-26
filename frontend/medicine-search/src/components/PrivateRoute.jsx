import React from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../utils/token.util";

const PrivateRoute = ({ children }) => {
  return getToken() ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
