/**
 * Admin Category API
 * Targets the admin catalog surface: /api/v1/admin/categories
 * (list is admin-only and includes inactive categories).
 *
 * The backend serializes categories as snake_case dicts (not by Pydantic
 * alias), so the wire shape maps 1:1 to the Category type below.
 */
import apiClient from './client';

/**
 * A category row. The hierarchy is flat-with-a-pointer: `parent_category_id`
 * null means top-level, set means it's a sub-category of that category. The
 * backend caps this at two levels.
 */
export interface Category {
    category_id: string;
    name: string;
    slug: string;
    description?: string | null;
    image_url?: string | null;
    parent_category_id?: string | null;
    is_active: boolean;
    product_count?: number;
    /** Client-side only: populated when nesting rows for a tree table. */
    children?: Category[];
}

export interface CategoryPayload {
    name: string;
    slug: string;
    description?: string | null;
    image_url?: string | null;
    parent_category_id?: string | null;
    is_active: boolean;
}

interface CategoryListWire {
    success: boolean;
    data: { categories: Category[] };
}

interface CategoryMutationWire {
    success: boolean;
    data: Category;
    message: string;
}

export const categoriesApi = {
    list: async (): Promise<Category[]> => {
        const res = await apiClient.get<CategoryListWire>('/admin/categories');
        return res.data.data.categories;
    },

    create: async (payload: CategoryPayload): Promise<Category> => {
        const res = await apiClient.post<CategoryMutationWire>('/admin/categories', payload);
        return res.data.data;
    },

    update: async (id: string, payload: Partial<CategoryPayload>): Promise<Category> => {
        const res = await apiClient.put<CategoryMutationWire>(`/admin/categories/${id}`, payload);
        return res.data.data;
    },

    remove: async (id: string): Promise<void> => {
        await apiClient.delete(`/admin/categories/${id}`);
    },
};
