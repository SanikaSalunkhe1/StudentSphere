import API from "../api/axios";

export const activityService = {
  // Create activity
  createActivity: async (formData) => {
    const response = await API.post("/activities", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Get activities by logged-in student
  getActivityByStu: async () => {
    const response = await API.get("/activities");
    return response.data;
  },

  // Update activity
  updateActivity: async (id, formData) => {
    const response = await API.put(`/activities/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Delete activity
  deleteActivity: async (id) => {
    const response = await API.delete(`/activities/${id}`);
    return response.data;
  },

  // ✅ FIXED: Get all activities (Admin only)
  getAllActivities: async (params = {}) => {
    const response = await API.get("/activities/all", { params });
    return response.data;
  },

  // Get activities by specific student (Admin only)
  getActivitiesByStudent: async (studentId) => {
    const response = await API.get(`/activities/student/${studentId}`);
    return response.data;
  },

  // Export activities (Admin only)
  exportActivities: async (params) => {
    const response = await API.get("/activities/all", {
      params: { ...params, export: "true" },
      responseType: "blob",
    });
    return response.data;
  },
};