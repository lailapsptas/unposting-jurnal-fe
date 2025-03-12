import api from "../api.js";

export const getAllGeneralLedgers = async () => {
  try {
    const response = await api.get("/general-ledgers/");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching general ledgers:", error);
    throw error;
  }
};

export const getGeneralLedgerById = async (id) => {
  try {
    const response = await api.get(`/general-ledgers/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching general ledger with id ${id}:`, error);
    throw error;
  }
};

export const createGeneralLedger = async (generalLedgerData) => {
  try {
    const response = await api.post("/general-ledgers/", generalLedgerData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating general ledger:", error);
    throw error;
  }
};

export const updateGeneralLedger = async (id, generalLedgerData) => {
  try {
    const response = await api.put(`/general-ledgers/${id}`, generalLedgerData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating general ledger with id ${id}:`, error);
    throw error;
  }
};

export const deleteGeneralLedger = async (id) => {
  try {
    const response = await api.delete(`/general-ledgers/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting general ledger with id ${id}:`, error);
    throw error;
  }
};

export const postGeneralLedger = async (id) => {
  try {
    const response = await api.put(`/general-ledgers/post/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error posting general ledger with id ${id}:`, error);
    throw error;
  }
};
