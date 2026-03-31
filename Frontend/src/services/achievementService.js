import API from "../api/axios";

export const achievementService = {
  // Achievement methods below...

  // Create achievement
  createAchievement: async (achievementData) => {
    const response = await API.post("/achievements", achievementData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // ✅ CORRECT - Uses student's own route
  getAchievementsByStu: async () => {
    const response = await API.get("/achievements");
    return response.data.data;
  },

  // Update achievement
  updateAchievement: async (achievementId, achievementData) => {
    const response = await API.put(
      `/achievements/${achievementId}`,
      achievementData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  // Delete achievement
  deleteAchievement: async (achievementId) => {
    const response = await API.delete(`/achievements/${achievementId}`);
    return response.data;
  },

  // Get all achievements (Admin)
  getAllAchievements: async (params = {}) => {
    const response = await API.get("/achievements/all", { params });
    return response.data;
  },

  // Export achievements (Admin only)
  exportAchievements: async (params) => {
    const response = await API.get("/achievements/all", {
      params: { ...params, export: "true" },
      responseType: "blob",
    });
    return response.data;
  },
};