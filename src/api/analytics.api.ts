/**
 * Admin Analytics API (/api/v1/admin/analytics) — branch-scoped on the server.
 * Restricted to super_admin + branch_manager. Responses are snake_case dicts.
 */
import apiClient from './client';

export interface AnalyticsScope {
    is_super_admin: boolean;
    branch_id: string | null;
}

export interface AnalyticsSummary {
    total_revenue: number;
    total_orders: number;
    active_customers: number;
    low_stock_alerts: number;
    scope: AnalyticsScope;
}

export interface SalesPoint {
    date: string; // ISO date (YYYY-MM-DD)
    revenue: number;
    orders: number;
}

export interface SalesSeries {
    series: SalesPoint[];
    days: number;
    scope: AnalyticsScope;
}

interface SummaryWire {
    success: boolean;
    data: AnalyticsSummary;
}

interface SalesWire {
    success: boolean;
    data: SalesSeries;
}

export const analyticsApi = {
    summary: async (branchId?: string): Promise<AnalyticsSummary> => {
        const params = branchId ? { branch_id: branchId } : undefined;
        const res = await apiClient.get<SummaryWire>('/admin/analytics/summary', { params });
        return res.data.data;
    },

    sales: async (branchId?: string, days = 30): Promise<SalesSeries> => {
        const params: Record<string, unknown> = { days };
        if (branchId) params.branch_id = branchId;
        const res = await apiClient.get<SalesWire>('/admin/analytics/sales', { params });
        return res.data.data;
    },
};
