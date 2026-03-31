import API from "../api/axios";

export const authService = {
  // Student Login
  login: async (studentID, password) => {
    const cleanID = studentID?.trim().toUpperCase() || "";
    const cleanPassword = password?.trim() || "";
    const response = await API.post("/auth/login", { studentID: cleanID, password: cleanPassword });


    return response.data;
  },

  // Admin Login
  adminLogin: async (email, password) => {
    const cleanEmail = email?.trim().toLowerCase() || "";
    const cleanPassword = password?.trim() || "";
    const response = await API.post("/auth/admin-login", { email: cleanEmail, password: cleanPassword });


    return response.data;
  },

  // Division Incharge Login (New)
  divisionLogin: async (email, password) => {
    const cleanEmail = email?.trim().toLowerCase() || "";
    const cleanPassword = password?.trim() || "";
    const response = await API.post("/auth/division-incharge", {
      email: cleanEmail,
      password: cleanPassword
    });


    return response.data;
  },

  // Signup
  signup: async (studentID, email, password) => {
    const response = await API.post("/auth/signup", { studentID, email, password });
    return response.data;
  },

  // Verify Email
  verifyEmail: async (token) => {
    const response = await API.post(`/auth/verify-email/${token}`);
    return response.data;
  },

  // Forgot Password (Student)
  forgotPassword: async (email) => {
    const response = await API.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Reset Password (Student)
  resetPassword: async (token, newPassword) => {
    const response = await API.post(`/auth/reset-password/${token}`, { newPassword });
    return response.data;
  },

  // Admin Forgot Password
  adminForgotPassword: async (email) => {
    const response = await API.post("/auth/admin/forgot-password", { email });
    return response.data;
  },

  // Admin Reset Password
  adminResetPassword: async (token, newPassword) => {
    const response = await API.post(`/auth/admin/reset-password/${token}`, { newPassword });
    return response.data;
  },

  // Division Incharge Forgot Password
  divisionForgotPassword: async (email) => {
    const response = await API.post("/auth/division-incharge/forgot-password", { email });
    return response.data;
  },

  // Division Incharge Reset Password
  divisionResetPassword: async (token, newPassword) => {
    const response = await API.post(`/auth/division-incharge/reset-password/${token}`, { newPassword });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await API.get("/auth/logout");

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("studentId");
    localStorage.removeItem("studentName");
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminEmail");

    return response.data;
  },
};