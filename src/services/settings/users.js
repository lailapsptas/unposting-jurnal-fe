import axios from "axios";

const API_URL = import.meta.env.VITE_LOCAL_API_URL;

const getToken = () => {
  return localStorage.getItem("token");
};

axios.defaults.headers.common["Authorization"] = `Bearer ${getToken()}`;

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const getUsersById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/users/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching Users with id ${id}:`, error);
    throw error;
  }
};

export const createUsers = async (usersData) => {
  try {
    const response = await axios.post(`${API_URL}/users/`, usersData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating Users:", error);
    throw error;
  }
};

export const updateUsers = async (id, usersData) => {
  try {
    const response = await axios.put(`${API_URL}/users/${id}`, usersData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating Users with id ${id}:`, error);
    throw error;
  }
};

export const deleteUsers = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting Users with id ${id}:`, error);
    throw error;
  }
};
