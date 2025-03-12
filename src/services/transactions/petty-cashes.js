import api from "../api.js";

export const getAllPettyCashes = async () => {
  try {
    const response = await api.get("/petty-cash");
    return response.data;
  } catch (error) {
    console.error("Error fetching petty cashes:", error);
    throw error;
  }
};

export const getPettyCashById = async (id) => {
  try {
    const response = await api.get(`/petty-cash/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching petty cash with id ${id}:`, error);
    throw error;
  }
};

export const createPettyCash = async (pettyCashData) => {
  try {
    const response = await api.post("/petty-cash", pettyCashData);
    return response.data;
  } catch (error) {
    console.error("Error creating petty cash:", error);
    throw error;
  }
};

export const updatePettyCash = async (id, pettyCashData) => {
  try {
    const response = await api.put(`/petty-cash/${id}`, pettyCashData);
    return response.data;
  } catch (error) {
    console.error(`Error updating petty cash with id ${id}:`, error);
    throw error;
  }
};

export const deletePettyCash = async (id) => {
  try {
    const response = await api.delete(`/petty-cash/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting petty cash with id ${id}:`, error);
    throw error;
  }
};

export const approvePettyCash = async (id, approvedData) => {
  try {
    const response = await api.post(`/petty-cash/approve/${id}`, approvedData);
    return response.data;
  } catch (error) {
    console.error(`Error approving petty cash with id ${id}:`, error);
    throw error;
  }
};
