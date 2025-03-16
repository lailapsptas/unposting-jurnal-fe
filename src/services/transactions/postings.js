import api from "../api.js";

export const createPosting = async (postingData) => {
  try {
    const response = await api.post("/posting/", postingData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating posting:", error);
    throw error;
  }
};

export const unpostMonth = async (unpostData) => {
  try {
    const response = await api.post("/posting/unpost", unpostData);
    return response.data.data;
  } catch (error) {
    console.error("Error unposting month:", error);
    throw error;
  }
};

export const getAllPostings = async (filters = {}) => {
  try {
    const response = await api.get("/posting/", { params: filters });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching posting:", error);
    throw error;
  }
};

export const getPostingById = async (id) => {
  try {
    const response = await api.get(`/posting/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching posting with id ${id}:`, error);
    throw error;
  }
};

export const getUnpostedLedgers = async () => {
  try {
    const response = await api.get("/posting/unposted-ledgers");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching unposted ledgers:", error);
    throw error;
  }
};

export const getPostingReport = async (filters) => {
  try {
    const response = await api.get("/posting/report", { params: filters });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching posting report:", error);
    throw error;
  }
};
