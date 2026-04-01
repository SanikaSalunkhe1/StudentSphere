import API from '../api/axios';

export const reportService = {
    getAccreditationReport: async (params) => {
        try {
            const response = await API.get(`/reports`, {
                params
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
