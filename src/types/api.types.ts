/**
 * API Response Types for SRIBEESonline Admin Dashboard
 */

// Generic API Response
export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data: T;
    error?: ApiError;
}

// API Error
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    stack?: string;
}

// Pagination
export interface PaginationParams {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: PaginationMeta;
}

// Auth Response
export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
        user: {
            admin_id: string;
            email: string;
            full_name: string;
            role: string;
            branch_id?: string;
            branch_name?: string;
            is_active: boolean;
        };
    };
}

export interface AuthCheckResponse {
    success: boolean;
    data: {
        authenticated: boolean;
        user?: {
            admin_id: string;
            email: string;
            full_name: string;
            role: string;
            branch_id?: string;
            branch_name?: string;
        };
    };
}

// Dashboard Stats Response
export interface DashboardStatsResponse {
    success: boolean;
    data: {
        revenue: {
            total: number;
            growth_percentage: number;
            period: string;
        };
        orders: {
            total: number;
            pending: number;
            processing: number;
            delivered: number;
            growth_percentage: number;
        };
        customers: {
            total: number;
            new_this_month: number;
            growth_percentage: number;
        };
        products: {
            total: number;
            low_stock: number;
            out_of_stock: number;
        };
        top_products: Array<{
            product_id: string;
            name: string;
            sales_count: number;
            revenue: number;
        }>;
        revenue_chart: Array<{
            date: string;
            revenue: number;
            orders: number;
        }>;
    };
}

// Analytics Response
export interface AnalyticsResponse {
    success: boolean;
    data: {
        period: string;
        metrics: {
            total_revenue: number;
            total_orders: number;
            average_order_value: number;
            conversion_rate: number;
        };
        trends: Array<{
            date: string;
            revenue: number;
            orders: number;
            customers: number;
        }>;
        top_categories: Array<{
            category_id: string;
            name: string;
            revenue: number;
            orders: number;
        }>;
        top_products: Array<{
            product_id: string;
            name: string;
            revenue: number;
            quantity_sold: number;
        }>;
    };
}

// Watchlist Analytics Response
export interface WatchlistAnalyticsResponse {
    success: boolean;
    data: {
        total_watchlist_items: number;
        total_unique_products: number;
        total_users_watching: number;
        most_watched_products: Array<{
            product_id: string;
            product_name: string;
            variant_id?: string;
            variant_name?: string;
            watch_count: number;
            conversion_rate: number;
        }>;
        watchlist_trends: Array<{
            date: string;
            adds: number;
            removes: number;
            conversions: number;
        }>;
        branch_breakdown?: Array<{
            branch_id: string;
            branch_name: string;
            watch_count: number;
            top_product: string;
        }>;
    };
}

// Branch Performance Response
export interface BranchPerformanceResponse {
    success: boolean;
    data: {
        branches: Array<{
            branch_id: string;
            branch_name: string;
            revenue: number;
            orders: number;
            average_order_value: number;
            growth_percentage: number;
            pending_orders: number;
            staff_count: number;
        }>;
        comparison: {
            best_performer: string;
            worst_performer: string;
            total_revenue: number;
            total_orders: number;
        };
    };
}

// File Upload Response
export interface FileUploadResponse {
    success: boolean;
    data: {
        url: string;
        filename: string;
        size: number;
        mimetype: string;
    };
}

// Bulk Operation Response
export interface BulkOperationResponse {
    success: boolean;
    data: {
        total: number;
        successful: number;
        failed: number;
        errors?: Array<{
            id: string;
            error: string;
        }>;
    };
}

// Cache Invalidation Response
export interface CacheInvalidationResponse {
    success: boolean;
    message: string;
    data: {
        keys_invalidated: number;
        timestamp: string;
    };
}
