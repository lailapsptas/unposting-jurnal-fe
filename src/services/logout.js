import axios from "axios";

const API_URL = import.meta.env.VITE_LOCAL_API_URL;

export const logout = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return response.data;
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};
