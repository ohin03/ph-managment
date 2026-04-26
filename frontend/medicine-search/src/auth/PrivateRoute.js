import { Navigate } from "react-router-dom";
import { getToken } from "../utils/token.util";

const PrivateRoute = ({ children }) => {
  return getToken() ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
