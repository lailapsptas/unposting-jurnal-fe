import api from "../api.js";

export const getAllUsers = async () => {
  try {
    const response = await api.get("/users/");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const getUsersById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching Users with id ${id}:`, error);
    throw error;
  }
};

export const createUsers = async (usersData) => {
  try {
    const response = await api.post("/users/", usersData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating Users:", error);
    throw error;
  }
};

export const updateUsers = async (id, usersData) => {
  try {
    const response = await api.put(`/users/${id}`, usersData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating Users with id ${id}:`, error);
    throw error;
  }
};

export const deleteUsers = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting Users with id ${id}:`, error);
    throw error;
  }
};
