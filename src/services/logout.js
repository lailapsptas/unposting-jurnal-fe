import api from "./api";

/**
 * Handles manual logout - when user clicks logout button
 * Makes API call to server to invalidate token
 */
export const manualLogout = async () => {
  try {
    const response = await api.post("/auth/logout");

    // Clear local storage after successful server logout
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return response.data;
  } catch (error) {
    console.error("Error during manual logout:", error);

    // Even if server logout fails, clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Return a success message since we've cleared local storage
    return { status: "success", message: "Logged out locally" };
  }
};

/**
 * Handles automatic logout - when token is expired or invalid
 * No API call needed since token is already invalid
 */
export const autoLogout = () => {
  // Just clear the storage
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  return { status: "success", message: "Auto logged out due to expired token" };
};
