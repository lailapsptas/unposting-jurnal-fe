import api from "../api.js";

export const getAllJobPositions = async () => {
  try {
    const response = await api.get("/job-positions/");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching Job Positions:", error);
    throw error;
  }
};

export const getJobPositionById = async (id) => {
  try {
    const response = await api.get(`/job-positions/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching Job Position with id ${id}:`, error);
    throw error;
  }
};

export const createJobPosition = async (jobPositionData) => {
  try {
    const response = await api.post("/job-positions/", jobPositionData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating Job Position:", error);
    throw error;
  }
};

export const updateJobPosition = async (id, jobPositionData) => {
  try {
    const response = await api.put(`/job-positions/${id}`, jobPositionData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating Job Position with id ${id}:`, error);
    throw error;
  }
};

export const deleteJobPosition = async (id) => {
  try {
    const response = await api.delete(`/job-positions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting Job Position with id ${id}:`, error);
    throw error;
  }
};
