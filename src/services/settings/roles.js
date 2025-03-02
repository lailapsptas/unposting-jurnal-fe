import axios from "axios";

const API_URL = import.meta.env.VITE_LOCAL_API_URL;

const getToken = () => {
  return localStorage.getItem("token");
};

axios.defaults.headers.common["Authorization"] = `Bearer ${getToken()}`;

export const getAllRoles = async () => {
  try {
    const response = await axios.get(`${API_URL}/roles/`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};

export const getRoleById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/roles/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching role with id ${id}:`, error);
    throw error;
  }
};

export const createRole = async (roleData) => {
  try {
    const response = await axios.post(`${API_URL}/roles/`, roleData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating role:", error);
    throw error;
  }
};

export const updateRole = async (id, roleData) => {
  try {
    const response = await axios.put(`${API_URL}/roles/${id}`, roleData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating role with id ${id}:`, error);
    throw error;
  }
};

export const deleteRole = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/roles/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting role with id ${id}:`, error);
    throw error;
  }
};
