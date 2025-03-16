import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { useRef } from "react";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { autoLogout } from "../../services/logout";
import "../styles/layout.css";
import "../styles/sidebar.css";

export default function SidebarMenu({ visible }) {
  const navigate = useNavigate();
  const toast = useRef(null);

  const handleLogoutConfirm = async () => {
    try {
      await autoLogout();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true }); // Gunakan { replace: true } untuk mengganti history
    } catch (error) {
      console.error("Logout failed:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Logout failed",
        life: 3000,
      });
    }
  };

  const showLogoutDialog = () => {
    confirmDialog({
      group: "logout",
      message: "Are you sure you want to log out?",
      header: "Confirmation",
      defaultFocus: "accept",
      accept: handleLogoutConfirm,
      reject: () => {},
    });
  };

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog
        group="logout"
        content={({ headerRef, contentRef, footerRef, hide, message }) => (
          <div className="confirm-dialog">
            <div className="confirm-icon">
              <i className="pi pi-question"></i>
            </div>
            <span className="confirm-header" ref={headerRef}>
              {message.header}
            </span>
            <p className="confirm-message" ref={contentRef}>
              {message.message}
            </p>
            <div className="confirm-footer" ref={footerRef}>
              <button
                className="confirm-button confirm-cancel"
                onClick={(event) => {
                  hide(event);
                }}
              >
                No
              </button>
              <button
                className="confirm-button confirm-save"
                onClick={(event) => {
                  hide(event);
                  handleLogoutConfirm();
                }}
              >
                Yes
              </button>
            </div>
          </div>
        )}
      />
      <div className={`sidebar ${visible ? "visible" : ""}`}>
        <div className="sidebar-header">
          <h2>SIDE BAR</h2>
        </div>
        <div className="sidebar-section">
          <h3>MENU</h3>
          <Link to="/dashboard" className="sidebar-item">
            <i className="pi pi-slack" />
            <span>Dashboard</span>
          </Link>
        </div>
        <div className="sidebar-section">
          <h3>TRANSACTION</h3>
          <Link to="/accounts" className="sidebar-item">
            <i className="pi pi-credit-card" />
            <span>Account</span>
          </Link>
          <Link to="/general-ledgers" className="sidebar-item">
            <i className="pi pi-book" />
            <span>General Ledger</span>
          </Link>
          <Link to="/petty-cash" className="sidebar-item">
            <i className="pi pi-money-bill" />
            <span>Petty Cash</span>
          </Link>
          <Link to="/postings" className="sidebar-item">
            <i className="pi pi-file" />
            <span>Journal Post</span>
          </Link>
          <Link to="/reports" className="sidebar-item">
            <i className="pi pi-print" />
            <span>Report</span>
          </Link>
        </div>
        <div className="sidebar-section">
          <h3>SETTINGS</h3>
          <Link to="/users" className="sidebar-item">
            <i className="pi pi-users" />
            <span>Users</span>
          </Link>
          <Link to="/roles" className="sidebar-item">
            <i className="pi pi-id-card" />
            <span>Roles</span>
          </Link>
          <Link to="/job-positions" className="sidebar-item">
            <i className="pi pi-briefcase" />
            <span>Job Positions</span>
          </Link>
          <div className="sidebar-item" onClick={showLogoutDialog}>
            <i className="pi pi-sign-out" />
            <span>Log Out</span>
          </div>
        </div>
      </div>
    </>
  );
}

SidebarMenu.propTypes = {
  visible: PropTypes.bool.isRequired,
};
