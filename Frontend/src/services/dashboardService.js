import API from "../api/axios";

export const dashboardService = {
  getStudentDashboard: async () => {
    const response = await API.get("/dashboard/student");
    return response.data;
  },

  getAdminDashboard: async () => {
    const response = await API.get("/dashboard/admin");
    return response.data;
  },

  getDivisionDashboard: async () => {
    const response = await API.get("/dashboard/divisionIncharge");
    return response.data;
  }
};