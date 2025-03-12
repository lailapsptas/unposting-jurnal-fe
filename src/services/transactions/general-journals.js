import api from "../api.js";

export const getAllGeneralJournals = async () => {
  try {
    const response = await api.get("/general-journals/");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching general journals:", error);
    throw error;
  }
};

export const getGeneralJournalById = async (id) => {
  try {
    const response = await api.get(`/general-journals/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching general journal with id ${id}:`, error);
    throw error;
  }
};

export const createGeneralJournal = async (generalJournalData) => {
  try {
    const response = await api.post("/general-journals/", generalJournalData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating general journal:", error);
    throw error;
  }
};

export const updateGeneralJournal = async (id, generalJournalData) => {
  try {
    const response = await api.put(
      `/general-journals/${id}`,
      generalJournalData
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error updating general journal with id ${id}:`, error);
    throw error;
  }
};

export const deleteGeneralJournal = async (id) => {
  try {
    const response = await api.delete(`/general-journals/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting general journal with id ${id}:`, error);
    throw error;
  }
};

export const createMultipleGeneralJournals = async (data) => {
  try {
    const response = await api.post("/general-journals/create-multiple", data);
    return response.data.data;
  } catch (error) {
    console.error("Error creating multiple general journals:", error);
    throw error;
  }
};

export const updateMultipleGeneralJournals = async (data) => {
  try {
    const response = await api.put("/general-journals/update-multiple", data);
    return response.data.data;
  } catch (error) {
    console.error("Error updating multiple general journals:", error);
    throw error;
  }
};

export const createOrUpdateGeneralJournals = async (
  ledgerId,
  transactionDate,
  createEntries = [],
  updateEntries = []
) => {
  try {
    const data = {
      ledger_id: ledgerId,
      transaction_date: transactionDate,
      createEntries: createEntries,
      updateEntries: updateEntries,
    };

    const response = await api.post("/general-journals/create-or-update", data);
    return response.data;
  } catch (error) {
    console.error("Error creating or updating general journals:", error);
    throw error;
  }
};
