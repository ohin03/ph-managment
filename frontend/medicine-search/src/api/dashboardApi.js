// src/api/dashboardApi.js
import axiosInstance from './axiosInstance';

export const getDashboardData = async (date) => {
    try {
        const url = date ? `/dashboard?date=${date}` : '/dashboard';
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
};