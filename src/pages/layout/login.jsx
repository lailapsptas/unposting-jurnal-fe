import { useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import { login as loginApi } from "../../services/login";
import { useAuth } from "../../states/use-auth";
import "../styles/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useRef(null);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await loginApi(email, password);
      const { token, user } = response.data;

      if (token && user) {
        login(user, token);

        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Login successful!",
          life: 3000,
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred during login";

      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: errorMessage,
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <Toast ref={toast} />
      <div className="background-shapes">
        <div className="shape shape-triangle-1"></div>
        <div className="shape shape-triangle-2"></div>
        <div className="shape shape-triangle-3"></div>
        <div className="shape shape-circle-1"></div>
      </div>
      <div className="login-card">
        <div className="login-header">
          <img
            src="/src/assets/logo/textBlack.png"
            alt="Siskeu Logo"
            className="login-logo"
          />
          <h1 className="login-title">Welcome to Siskeu App!</h1>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <span className="p-input-icon-left input-wrapper">
              <i className="pi pi-envelope icon"></i>
              <InputText
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="form-input"
                disabled={loading}
              />
            </span>
          </div>
          <div className="form-group">
            <span className="p-input-icon-left input-wrapper">
              <i className="pi pi-lock icon"></i>
              <InputText
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="form-input"
                type={showPassword ? "text" : "password"}
                disabled={loading}
              />
              <i
                className={`pi ${
                  showPassword ? "pi-eye-slash" : "pi-eye"
                } icon-end`}
                onClick={togglePasswordVisibility}
              />
            </span>
          </div>
          <Button
            label={loading ? "Logging in..." : "Login"}
            className="login-button"
            type="submit"
            loading={loading}
            disabled={loading}
          />
        </form>
      </div>
    </div>
  );
};

export default Login;
