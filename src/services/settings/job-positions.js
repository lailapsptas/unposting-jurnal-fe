import axios from "axios";

const API_URL = import.meta.env.VITE_LOCAL_API_URL;

const getToken = () => {
  return localStorage.getItem("token");
};

axios.defaults.headers.common["Authorization"] = `Bearer ${getToken()}`;

export const getAllJobPositions = async () => {
  try {
    const response = await axios.get(`${API_URL}/job-positions/`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching Job Positions:", error);
    throw error;
  }
};

export const getJobPositionById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/job-positions/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching Job Position with id ${id}:`, error);
    throw error;
  }
};

export const createJobPosition = async (jobPositionData) => {
  try {
    const response = await axios.post(
      `${API_URL}/job-positions/`,
      jobPositionData
    );
    return response.data.data;
  } catch (error) {
    console.error("Error creating Job Position:", error);
    throw error;
  }
};

export const updateJobPosition = async (id, jobPositionData) => {
  try {
    const response = await axios.put(
      `${API_URL}/job-positions/${id}`,
      jobPositionData
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error updating Job Position with id ${id}:`, error);
    throw error;
  }
};

export const deleteJobPosition = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/job-positions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting Job Position with id ${id}:`, error);
    throw error;
  }
};
