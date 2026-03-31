import API from "../api/axios";

export const placementService = {
  // Create placement
  createPlacement: async (formData) => {
    const response = await API.post("/placement", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Update placement
  updatePlacement: async (placementId, formData) => {
    const response = await API.put(`/placement/${placementId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Delete placement
  deletePlacement: async (placementId) => {
    const response = await API.delete(`/placement/${placementId}`);
    return response.data;
  },

  // Get all placements (Admin) — accepts filter params for server-side filtering
  getAllPlacements: async (params = {}) => {
    const response = await API.get("/placement", { params });
    return response.data;
  },

  // Get own placements (Student)
  getOwnPlacements: async () => {
    const response = await API.get("/placement/me");
    return response.data;
  },

  // Get student placements by admin
  getStudentPlacementsByAdmin: async (studentId) => {
    const response = await API.get(
      `/placement/student-placement-by-admin/${studentId}`
    );
    return response.data;
  },

  // Get single placement
  getSinglePlacement: async (placementId) => {
    const response = await API.get(`/placement/${placementId}`);
    return response.data;
  },

  // Export placements
  exportPlacements: async (params = {}) => {
    const exportParams = { ...params, export: true };
    const response = await API.get("/placement", {
      params: exportParams,
      responseType: "blob",
    });
    return response.data;
  },
};