/**
 * Admin Post Office Directory API (/api/v1/admin/locations) — Super Admin only.
 *
 * The master "Delivery Zones" catalog: every Post Office tagged with its
 * District and Province. Powers the Branch form's coverage picker and the
 * Delivery Zones settings tab. Wire format is snake_case.
 */
import apiClient from './client';

export interface PostOffice {
    id: string;
    post_office: string;
    district: string;
    province: string;
    is_active: boolean;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface PostOfficePayload {
    post_office: string;
    district: string;
    province: string;
    is_active?: boolean;
}

export interface LocationFilter {
    province?: string;
    district?: string;
    active_only?: boolean;
}

interface ListWire {
    success: boolean;
    data: { post_offices: PostOffice[] };
    total: number;
}

interface MutationWire {
    success: boolean;
    data: PostOffice;
    message: string;
}

export const locationsApi = {
    list: async (filter: LocationFilter = {}): Promise<PostOffice[]> => {
        const res = await apiClient.get<ListWire>('/admin/locations', { params: filter });
        return res.data.data.post_offices;
    },

    create: async (payload: PostOfficePayload): Promise<PostOffice> => {
        const res = await apiClient.post<MutationWire>('/admin/locations', payload);
        return res.data.data;
    },

    update: async (id: string, payload: Partial<PostOfficePayload>): Promise<PostOffice> => {
        const res = await apiClient.put<MutationWire>(`/admin/locations/${id}`, payload);
        return res.data.data;
    },

    remove: async (id: string): Promise<void> => {
        await apiClient.delete(`/admin/locations/${id}`);
    },
};
