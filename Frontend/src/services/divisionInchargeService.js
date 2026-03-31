import API from "../api/axios";

export const divisionInchargeService = {
    // Add a single Division Incharge (Admin)
    addSingle: async (data) => {
        const response = await API.post("/divisionIncharge", data, { withCredentials: true });
        return response.data;
    },

    // Get All Division Incharges (Admin)
    getAll: async (params = {}) => {
        const response = await API.get("/divisionIncharge", { params, withCredentials: true });
        return response.data;
    },

    // Get Single Division Incharge by ID (Admin)
    getById: async (id) => {
        const response = await API.get(`/divisionIncharge/${id}`, { withCredentials: true });
        return response.data;
    },

    // Edit name / year / division (Admin)
    updateDetails: async (id, data) => {
        const response = await API.patch(`/divisionIncharge/${id}`, data, { withCredentials: true });
        return response.data;
    },

    // Change email (Admin) — backend sends new password to new email
    changeEmail: async (id, newEmail) => {
        const response = await API.patch(`/divisionIncharge/change-email/${id}`, { newEmail }, { withCredentials: true });
        return response.data;
    },

    // Delete Division Incharge (Admin)
    delete: async (id) => {
        const response = await API.delete(`/divisionIncharge/${id}`, { withCredentials: true });
        return response.data;
    },

    // Import from Excel — NOTE: backend route is currently commented out, will return 404
    importExcel: async (file) => {
        const formData = new FormData();
        formData.append("divisionInchargeData", file);
        const response = await API.post("/divisionIncharge/import", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
        });
        return response.data;
    },
};