import apiClient from './client';
import { AdminRole } from '../types/admin.types';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        admin: {
            admin_id: string;
            email: string;
            full_name: string;
            role: AdminRole;
            branch_id?: string;
            branch_name?: string;
            is_active: boolean;
        };
        token: string;
    };
}

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/admin/auth/login', credentials);
        return response.data;
    },

    logout: async (): Promise<void> => {
        // Admin logout - just clear local storage
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('/admin/auth/profile');
        return response.data;
    },
};
