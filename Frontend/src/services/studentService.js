import API from "../api/axios";

export const studentService = {

  // Import Student IDs only (Admin only) - new auth flow
  // Excel must have a single column: studentID
  importStudentIDs: async (file) => {
    const formData = new FormData();
    formData.append("studentIDs", file);
    const response = await API.post("/student/import-student-ids", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Add student details (Student)
  addStudent: async (formData) => {
    // ✅ FIXED: formData is already a FormData object from component, just send it
    const response = await API.patch("/student", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Update student (Student or Admin)
  updateStudent: async (studentId, formData) => {
    // ✅ FIXED: formData is already a FormData object from component, just send it
    const response = await API.put(`/student/${studentId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Delete student
  deleteStudent: async (studentId) => {
    const response = await API.delete(`/student/${studentId}`);
    return response.data;
  },

  // Get students with search/pagination
  getStudents: async (params) => {
    const response = await API.get("/student", { params });
    return response.data;
  },

  // Get all students (Admin only)
  getAllStudents: async () => {
    const response = await API.get("/student", { params: { limit: 20 } });
    return response.data;
  },

  // Get logged-in student's own data
  getMyData: async () => {
    const response = await API.get("/student/me");
    return response.data;
  },

  // Get single student by ID (Admin)
  getSingleStudent: async (studentId) => {
    const response = await API.get(`/student/${studentId}`);
    return response.data;
  },
  // Export all students (Admin only)
  exportStudents: async (params) => {
    // The main GET /student route handles export when export=true is passed
    const response = await API.get("/student", {
      params: { ...params, export: "true" },
      responseType: "blob",
    });
    return response.data;
  },
};