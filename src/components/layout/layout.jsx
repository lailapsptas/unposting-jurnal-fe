import { useState } from "react";
import Navbar from "./Navbar";
import SidebarMenu from "./Sidebar";
import PropTypes from "prop-types";

export default function Layout({ children }) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="layout-wrapper">
      <div
        className={`layout-container ${
          isSidebarVisible ? "sidebar-active" : ""
        }`}
      >
        <SidebarMenu visible={isSidebarVisible} />
        <div className="main-content">
          <Navbar onToggleSidebar={toggleSidebar} />
          <main className="p-4">{children}</main>
        </div>
      </div>
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
