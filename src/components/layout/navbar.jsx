import { Menubar } from "primereact/menubar";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import PropTypes from "prop-types";
import { useAuth } from "../../states/use-auth";
import logo from "../../assets/logo/textBlack.png";
import "../styles/navbar.css";

export default function Navbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const start = (
    <div className="navbar-start">
      <Button
        icon="pi pi-bars"
        className="toggle-button"
        onClick={onToggleSidebar}
        aria-label="Toggle Sidebar"
      />
      <img src={logo} alt="Siskeu" className="logo" />
    </div>
  );

  const end = (
    <div className="navbar-end">
      <span className="username">{user?.full_name}</span>
      <Avatar image="/profile.jpg" shape="circle" className="profile-avatar" />
    </div>
  );

  return <Menubar className="navbar-custom" start={start} end={end} />;
}

Navbar.propTypes = {
  onToggleSidebar: PropTypes.func.isRequired,
};
