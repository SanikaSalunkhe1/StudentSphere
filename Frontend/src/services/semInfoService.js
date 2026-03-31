import API from "../api/axios";

export const semInfoService = {
    // Student: get own semester info records
    getOwnSemInfo: async () => {
        const response = await API.get("/semesterInfo/");
        return response.data;
    },

    // Admin / DI: get all semester info records
    getAllSemInfo: async (params = {}) => {
        const response = await API.get("/semesterInfo/all", { params });
        return response.data;
    },

    // Admin / DI: get a specific student's semester info
    getStudentSemInfo: async (studentId) => {
        const response = await API.get(`/semesterInfo/student/${studentId}`);
        return response.data;
    },

    // Student / Admin / DI: create a semester info record
    addSemInfo: async (data) => {
        const response = await API.post("/semesterInfo/", data);
        return response.data;
    },

    // Student / Admin / DI: update a semester info record
    updateSemInfo: async (id, data) => {
        const response = await API.put(`/semesterInfo/${id}`, data);
        return response.data;
    },

    // Student / Admin / DI: delete a semester info record
    deleteSemInfo: async (id) => {
        const response = await API.delete(`/semesterInfo/${id}`);
        return response.data;
    },

    // Admin: export all semester info as Excel blob
    exportSemInfo: async (params = {}) => {
        const exportParams = { ...params, export: "true" };
        const response = await API.get("/semesterInfo/all", {
            params: exportParams,
            responseType: "blob",
        });
        return response.data;
    },
};