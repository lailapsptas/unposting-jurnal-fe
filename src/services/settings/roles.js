import api from "../api.js";

export const getAllRoles = async () => {
  try {
    const response = await api.get("/roles/");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};

export const getRoleById = async (id) => {
  try {
    const response = await api.get(`/roles/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching role with id ${id}:`, error);
    throw error;
  }
};

export const createRole = async (roleData) => {
  try {
    const response = await api.post("/roles/", roleData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating role:", error);
    throw error;
  }
};

export const updateRole = async (id, roleData) => {
  try {
    const response = await api.put(`/roles/${id}`, roleData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating role with id ${id}:`, error);
    throw error;
  }
};

export const deleteRole = async (id) => {
  try {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting role with id ${id}:`, error);
    throw error;
  }
};
