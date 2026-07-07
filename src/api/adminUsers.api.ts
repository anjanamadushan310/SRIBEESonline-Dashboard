/**
 * Admin User API (/api/v1/admin/users) — Super Admin only.
 * Responses are snake_case dicts. Passwords are write-only (never returned).
 */
import apiClient from './client';
import type { AdminRole } from '../types/admin.types';

export interface AdminUser {
    admin_id: string;
    email: string;
    full_name: string;
    role: AdminRole;
    branch_id: string | null;
    branch_name: string | null;
    is_active: boolean;
    last_login: string | null;
    created_at: string | null;
}

export interface CreateAdminUserPayload {
    email: string;
    password: string;
    full_name: string;
    role: AdminRole;
    branch_id?: string | null;
}

export interface UpdateAdminUserPayload {
    email?: string;
    password?: string; // omit to keep current
    full_name?: string;
    role?: AdminRole;
    branch_id?: string | null;
    is_active?: boolean;
}

interface AdminUserListWire {
    success: boolean;
    data: { users: AdminUser[] };
}

interface AdminUserMutationWire {
    success: boolean;
    data: AdminUser;
    message: string;
}

export const adminUsersApi = {
    list: async (): Promise<AdminUser[]> => {
        const res = await apiClient.get<AdminUserListWire>('/admin/users');
        return res.data.data.users;
    },

    create: async (payload: CreateAdminUserPayload): Promise<AdminUser> => {
        const res = await apiClient.post<AdminUserMutationWire>('/admin/users', payload);
        return res.data.data;
    },

    update: async (id: string, payload: UpdateAdminUserPayload): Promise<AdminUser> => {
        const res = await apiClient.put<AdminUserMutationWire>(`/admin/users/${id}`, payload);
        return res.data.data;
    },

    /** Soft delete — sets is_active = false on the server. */
    deactivate: async (id: string): Promise<void> => {
        await apiClient.delete(`/admin/users/${id}`);
    },
};
