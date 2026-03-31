import API from "../api/axios";

export const internshipService = {
  // Create internship
  createInternship: async (formData) => {
    // formData is already a FormData object from component
    const response = await API.post("/internship", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Get all internships (Admin) — accepts filter params for server-side filtering
  getAllInternships: async (params = {}) => {
    const response = await API.get("/internship", { params });
    return response.data;
  },

  // Get own internships (Student)
  getOwnInternships: async () => {
    const response = await API.get("/internship/me");
    return response.data;
  },

  // Get student internships by admin
  getStudentInternshipsByAdmin: async (studentId) => {
    const response = await API.get(
      `/internship/student-internship-by-admin/${studentId}`
    );
    return response.data;
  },

  // Get single internship
  getSingleInternship: async (internshipId) => {
    const response = await API.get(`/internship/${internshipId}`);
    return response.data;
  },

  // Update internship
  updateInternship: async (internshipId, formData) => {
    // formData is already a FormData object from component
    const response = await API.put(`/internship/${internshipId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Delete internship
  deleteInternship: async (internshipId) => {
    const response = await API.delete(`/internship/${internshipId}`);
    return response.data;
  },

  // Export internships (Admin only)
  exportInternships: async (params) => {
    const response = await API.get("/internship", {
      params: { ...params, export: "true" },
      responseType: "blob",
    });
    return response.data;
  },
};