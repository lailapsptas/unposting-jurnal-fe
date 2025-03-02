import axios from "axios";

const API_URL = import.meta.env.VITE_LOCAL_API_URL;

const getToken = () => {
  return localStorage.getItem("token");
};

axios.defaults.headers.common["Authorization"] = `Bearer ${getToken()}`;

export const getAllAccounts = async () => {
  try {
    const response = await axios.get(`${API_URL}/accounts/`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error;
  }
};

export const getAccountById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/accounts/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching account with id ${id}:`, error);
    throw error;
  }
};

export const createAccount = async (accountData) => {
  try {
    const response = await axios.post(`${API_URL}/accounts/`, accountData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
};

export const updateAccount = async (id, accountData) => {
  try {
    const response = await axios.put(`${API_URL}/accounts/${id}`, accountData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating account with id ${id}:`, error);
    throw error;
  }
};

export const deleteAccount = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/accounts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting account with id ${id}:`, error);
    throw error;
  }
};
