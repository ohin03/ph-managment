import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Desktop only sidebar collapse
  const toggleSidebar = () => {
    if (window.innerWidth < 768) return;
    setCollapsed(!collapsed);
  };

  // Mobile sidebar open/close
  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className={`page-wrapper ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        closeMobile={() => setMobileOpen(false)}
      />

      <div className="main-content">
        <div className="page-navbar">
          <Navbar
            toggleSidebar={toggleSidebar}
            toggleMobileSidebar={toggleMobileSidebar}
          />
        </div>

        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;

