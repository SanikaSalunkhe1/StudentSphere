import axios from "axios";

// Using the same API configuration pattern as other services
// Typically relies on a base URL setup, let's assume we use standard absolute path fallback
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const heatmapService = {
  getHeatmapData: async (year, division) => {
    try {
      let params = {};
      if (year && division) {
        params = { year, division };
      }
      const response = await axios.get(`${API_URL}/heatmap/data`, { ...getHeaders(), params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getInsights: async (metrics) => {
    try {
      const response = await axios.post(`${API_URL}/heatmap/insight`, metrics, getHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  toggleRisk: async (studentId) => {
    try {
      const response = await axios.patch(`${API_URL}/heatmap/${studentId}/toggle`, {}, getHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  sendNudge: async (nudgeData) => {
    try {
      const response = await axios.post(`${API_URL}/heatmap/nudge`, nudgeData, getHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
