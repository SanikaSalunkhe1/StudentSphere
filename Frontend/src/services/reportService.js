import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const reportService = {
    getAccreditationReport: async (params) => {
        try {
            const response = await axios.get(`${API_URL}/reports`, {
                params,
                withCredentials: true 
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
