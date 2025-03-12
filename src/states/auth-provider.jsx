// states/auth-provider.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { AuthContext } from "./auth-context";
import axios from "axios";
import { manualLogout, autoLogout } from "../services/logout.js";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;

    try {
      // Decode the JWT token (without verification)
      const payload = JSON.parse(atob(token.split(".")[1]));

      // Check if the token has expired
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error("Error decoding token:", error);
      return true; // Assume token is invalid if we can't decode it
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          // Check if token is expired
          if (isTokenExpired(token)) {
            console.log("Token expired on page load, auto logging out");
            handleAutoLogout();
          } else {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);

            // Set Authorization header for future requests
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            // Set up axios interceptor for handling 401 errors globally
            setupAxiosInterceptors();
          }
        } catch (error) {
          console.error("Failed to parse user data:", error);
          handleAutoLogout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Set up axios interceptor to catch 401 errors
  const setupAxiosInterceptors = () => {
    // Remove any existing interceptors to prevent duplicates
    axios.interceptors.response.handlers?.forEach((handler, index) => {
      if (handler && handler.__authInterceptor) {
        axios.interceptors.response.eject(index);
      }
    });

    // Create a new interceptor
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // If we receive a 401 Unauthorized error, log the user out
        if (error.response && error.response.status === 401) {
          console.log("Received 401 response, auto logging out");
          handleAutoLogout();
        }
        return Promise.reject(error);
      }
    );

    // Mark this interceptor for identification
    axios.interceptors.response.handlers[interceptor].__authInterceptor = true;
  };

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    // Set Authorization header for future requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Set up interceptors when logging in
    setupAxiosInterceptors();
  };

  // For manual logout (user clicks logout button)
  const logout = async () => {
    try {
      // Use the manual logout service
      await manualLogout();
    } catch (error) {
      console.error("Error during manual logout process:", error);
    } finally {
      // Always clear user state and navigate regardless of API result
      completeLogout();
    }
  };

  // For automatic logout (token expired or invalid)
  const handleAutoLogout = () => {
    // Use the auto logout service (no API call needed)
    autoLogout();
    completeLogout();
  };

  // Shared logic for both logout types
  const completeLogout = () => {
    // Clear user state
    setUser(null);

    // Clear Authorization header
    delete axios.defaults.headers.common["Authorization"];

    // Navigate to login page
    navigate("/login", { replace: true });
  };

  const value = {
    user,
    login,
    logout, // We only expose the manual logout to components
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
