/**
 * Admin Branch Inventory API (Module 7.5)
 * Targets /api/v1/admin/inventory — branch-scoped on the server via
 * inject_branch_filter (Branch Managers see only their branch).
 *
 * Responses are snake_case (hand-built dicts), matching the types below.
 */
import apiClient from './client';

export interface InventoryItem {
    inventory_id: string;
    product_id: string;
    product_name: string;
    sku: string | null;
    branch_id: string;
    branch_name: string;
    stock_quantity: number;
    reserved_quantity: number;
    available_quantity: number;
    low_stock_threshold: number;
    is_low_stock: boolean;
    is_active: boolean;
}

export interface InventoryScope {
    is_super_admin: boolean;
    branch_id: string | null;
}

export interface InventoryListParams {
    page?: number;
    limit?: number;
    search?: string;
    low_stock_only?: boolean;
    branch_id?: string; // super admin only
}

export interface InventoryListResult {
    items: InventoryItem[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    scope: InventoryScope;
}

export interface InventoryUpdatePayload {
    stock_quantity?: number;
    reserved_quantity?: number;
    low_stock_threshold?: number;
}

interface InventoryListWire {
    success: boolean;
    data: {
        items: InventoryItem[];
        pagination: { total: number; page: number; limit: number; total_pages: number };
        scope: InventoryScope;
    };
}

interface InventoryUpdateWire {
    success: boolean;
    data: InventoryItem;
    message: string;
}

export const inventoryApi = {
    list: async (params?: InventoryListParams): Promise<InventoryListResult> => {
        const clean: Record<string, unknown> = {};
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '') clean[k] = v;
            });
        }
        const res = await apiClient.get<InventoryListWire>('/admin/inventory', { params: clean });
        return {
            items: res.data.data.items,
            scope: res.data.data.scope,
            ...res.data.data.pagination,
        };
    },

    update: async (inventoryId: string, payload: InventoryUpdatePayload): Promise<InventoryItem> => {
        const res = await apiClient.put<InventoryUpdateWire>(
            `/admin/inventory/${inventoryId}`,
            payload
        );
        return res.data.data;
    },
};
