/**
 * Axios API Client with Interceptors
 * Handles authentication, branch isolation, and session management
 */

import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token and branch context
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Add authentication token
        const token = localStorage.getItem('admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add branch context for non-super-admin users
        const userStr = localStorage.getItem('admin_user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.role !== 'super_admin' && user.branch_id) {
                    config.headers['X-Branch-ID'] = user.branch_id;
                }
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }

        // Add active branch from store (for super admin branch switching)
        const activeBranch = localStorage.getItem('active_branch');
        if (activeBranch && !config.headers['X-Branch-ID']) {
            config.headers['X-Branch-ID'] = activeBranch;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors and session invalidation
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError<{ message?: string; error?: string }>) => {
        // Handle 401 Unauthorized - Session expired or invalid
        if (error.response?.status === 401) {
            // Don't auto-redirect - let components handle with fallback data
            // This allows the admin dashboard to work in demo mode
            console.warn('401 Unauthorized - API requires authentication. Using fallback data.');
        }

        // Handle 403 Forbidden - Insufficient permissions
        if (error.response?.status === 403) {
            console.warn('Access forbidden:', error.response.data?.message);
        }

        // Handle 404 Not Found - Endpoint doesn't exist
        if (error.response?.status === 404) {
            // Silently handle - components will use fallback data
        }

        // Handle 500 Server Error
        if (error.response?.status === 500) {
            console.error('Server error:', error.response.data?.message);
        }

        // Handle network errors
        if (!error.response) {
            console.error('Network error - server may be unavailable');
        }

        return Promise.reject(error);
    }
);

// Helper function for GET requests
export const get = async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
    const response = await apiClient.get<T>(url, { params });
    return response.data;
};

// Helper function for POST requests
export const post = async <T>(url: string, data?: unknown): Promise<T> => {
    const response = await apiClient.post<T>(url, data);
    return response.data;
};

// Helper function for PUT requests
export const put = async <T>(url: string, data?: unknown): Promise<T> => {
    const response = await apiClient.put<T>(url, data);
    return response.data;
};

// Helper function for PATCH requests
export const patch = async <T>(url: string, data?: unknown): Promise<T> => {
    const response = await apiClient.patch<T>(url, data);
    return response.data;
};

// Helper function for DELETE requests
export const del = async <T>(url: string): Promise<T> => {
    const response = await apiClient.delete<T>(url);
    return response.data;
};

// Helper for file uploads
export const uploadFile = async <T>(url: string, formData: FormData): Promise<T> => {
    const response = await apiClient.post<T>(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Cache invalidation helper
export const invalidateCache = async (keys: string[]): Promise<void> => {
    await apiClient.post('/admin/cache/invalidate', { keys });
};

export default apiClient;
