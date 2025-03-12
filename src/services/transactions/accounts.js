import api from "../api.js";

export const getAllAccounts = async () => {
  try {
    const response = await api.get("/accounts/");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error;
  }
};

export const getAccountById = async (id) => {
  try {
    const response = await api.get(`/accounts/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching account with id ${id}:`, error);
    throw error;
  }
};

export const createAccount = async (accountData) => {
  try {
    const response = await api.post("/accounts/", accountData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
};

export const updateAccount = async (id, accountData) => {
  try {
    const response = await api.put(`/accounts/${id}`, accountData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating account with id ${id}:`, error);
    throw error;
  }
};

export const deleteAccount = async (id) => {
  try {
    const response = await api.delete(`/accounts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting account with id ${id}:`, error);
    throw error;
  }
};
