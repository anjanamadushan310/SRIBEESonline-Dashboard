/**
 * Admin Customer API (/api/v1/admin/customers) — operates on the customer
 * `users` table. Restricted to super_admin + customer_support.
 * Responses are snake_case dicts.
 */
import apiClient from './client';

export interface Customer {
    user_id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    role: string;
    is_active: boolean;
    is_verified: boolean;
    created_at: string | null;
    last_login: string | null;
}

export interface CustomerListParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface CustomerListResult {
    customers: Customer[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}

interface CustomerListWire {
    success: boolean;
    data: {
        users: Customer[];
        pagination: { total: number; page: number; limit: number; pages: number };
    };
}

export const customersApi = {
    list: async (params?: CustomerListParams): Promise<CustomerListResult> => {
        const clean: Record<string, unknown> = {};
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '') clean[k] = v;
            });
        }
        const res = await apiClient.get<CustomerListWire>('/admin/customers', { params: clean });
        return { customers: res.data.data.users, ...res.data.data.pagination };
    },

    /** Enable/disable a customer account. is_active is a query param on the API. */
    setStatus: async (userId: string, isActive: boolean): Promise<void> => {
        await apiClient.put(`/admin/customers/${userId}/status`, null, {
            params: { is_active: isActive },
        });
    },
};
