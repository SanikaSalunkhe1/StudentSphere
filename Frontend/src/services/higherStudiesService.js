import API from "../api/axios";

export const higherStudiesService = {
  // Create higher study
  createHigherStudy: async (formData) => {
    const response = await API.post("/higherStudies", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Update higher study
  updateHigherStudy: async (higherStudyId, formData) => {
    const response = await API.put(
      `/higherStudies/${higherStudyId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  // Delete higher study
  deleteHigherStudy: async (higherStudyId) => {
    const response = await API.delete(`/higherStudies/${higherStudyId}`);
    return response.data;
  },

  // Get own higher studies (Student)
  getOwnHigherStudies: async () => {
    const response = await API.get("/higherStudies/me");
    return response.data;
  },

  // Get all higher studies (Admin) — accepts filter params for server-side filtering
  getAllHigherStudies: async (params = {}) => {
    const response = await API.get("/higherStudies", { params });
    return response.data;
  },

  // Get higher studies by student ID
  getHigherStudiesByStudent: async (studentId) => {
    const response = await API.get(`/higherStudies/${studentId}`);
    return response.data;
  },

  // Export higher studies
  exportHigherStudies: async (params = {}) => {
    const exportParams = { ...params, export: true };
    const response = await API.get("/higherStudies", {
      params: exportParams,
      responseType: "blob",
    });
    return response.data;
  },
};