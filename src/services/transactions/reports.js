import axios from "axios";

const API_URL = import.meta.env.VITE_LOCAL_API_URL;

const getToken = () => {
  return localStorage.getItem("token");
};

axios.defaults.headers.common["Authorization"] = `Bearer ${getToken()}`;

export const createReport = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/reports/`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating report:", error);
    throw error;
  }
};

export const getAllReports = async () => {
  try {
    const response = await axios.get(`${API_URL}/reports/`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};

export const getReportById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/reports/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching report with id ${id}:`, error);
    throw error;
  }
};

export const downloadReportFile = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/reports/${id}/download`, {
      responseType: "blob", // Untuk menangani file binary (PDF/Excel)
    });

    // Dapatkan nama file dari header Content-Disposition
    const contentDisposition = response.headers["content-disposition"];
    const fileName = contentDisposition
      ? contentDisposition.split("filename=")[1]
      : `report_${id}.${
          response.headers["content-type"].includes("pdf") ? "pdf" : "xlsx"
        }`;

    // Buat URL untuk file yang diunduh
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();

    // Hapus elemen link setelah selesai
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, fileName };
  } catch (error) {
    console.error(`Error downloading report with id ${id}:`, error);
    throw error;
  }
};

export const deleteReport = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/reports/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting report with id ${id}:`, error);
    throw error;
  }
};
