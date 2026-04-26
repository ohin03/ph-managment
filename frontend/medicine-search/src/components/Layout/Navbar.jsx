import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logoutWithAttendance } from "../../api/attendanceApi";
import { FaBars, FaPowerOff, FaUserCircle } from "react-icons/fa";

const Navbar = ({ toggleSidebar, toggleMobileSidebar }) => {
  const navigate = useNavigate();
  const { authed, logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutWithAttendance();
      logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="navbar-top d-flex align-items-center px-3 w-100 justify-content-between shadow-sm" style={{ transition: 'all 0.3s ease' }}>

      {/* LEFT SIDE: TOGGLE BUTTONS */}
      <div className="d-flex align-items-center gap-2">
        <button
          className="btn btn-light d-none d-md-flex align-items-center justify-content-center border-0 shadow-sm"
          onClick={toggleSidebar}
          style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(255, 255, 255, 0.9)" }}
        >
          <FaBars size={18} color="#444" />
        </button>

        <button
          className="btn btn-light d-md-none d-flex align-items-center justify-content-center border-0 shadow-sm"
          onClick={toggleMobileSidebar}
          style={{ width: "38px", height: "38px", borderRadius: "10px" }}
        >
          <FaBars size={18} color="#444" />
        </button>
      </div>

      {/* RIGHT SIDE: PREMIUM USER & LOGOUT SECTION */}
      {authed && (
        <div className="d-flex align-items-center gap-3">
          
          {/* USER PROFILE PILL - Glassmorphism Style */}
          <div className="d-flex align-items-center gap-2 px-2 py-1 rounded-pill" 
               style={{ 
                 background: "rgba(255, 255, 255, 0.12)", 
                 border: "1px solid rgba(255, 255, 255, 0.18)",
                 backdropFilter: "blur(4px)",
                 boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
               }}>
            
            {/* User Icon Circle */}
            <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                 style={{ width: "26px", height: "26px", color: "#4318FF" }}>
              <FaUserCircle size={18} />
            </div>

            {/* Username - Clean & Compact */}
            <span style={{ 
              fontWeight: "700", 
              color: "#FFFFFF", 
              fontSize: "12px", 
              letterSpacing: "0.3px",
              paddingRight: "6px",
              textShadow: "0px 1px 2px rgba(0,0,0,0.1)"
            }}>
              {user?.username?.toUpperCase() || "ADMIN"}
            </span>
          </div>

          {/* LOGOUT BUTTON - Pro High-Visibility Design */}
          <button
            onClick={handleLogout}
            className="btn d-flex align-items-center justify-content-center border-0 logout-btn-pro"
            title="Secure Logout"
            style={{ 
              width: "42px", 
              height: "42px", 
              borderRadius: "12px",
              background: "#FF4D4D",
              color: "white",
              boxShadow: "0 4px 14px 0 rgba(255, 77, 77, 0.39)",
              transition: "all 0.2s ease"
            }}
          >
            <FaPowerOff size={22} />
          </button>
        </div>
      )}

      {/* CUSTOM STYLE FOR HOVER EFFECT */}
      <style>{`
        .logout-btn-pro:hover {
          background: #FF3333 !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 51, 51, 0.5) !important;
        }
        .logout-btn-pro:active {
          transform: translateY(0);
        }
      `}</style>
      
    </div>
  );
};

export default Navbar;