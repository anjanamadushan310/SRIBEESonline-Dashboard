import apiClient from './client';

export interface Order {
    order_id: string;
    order_number: string;
    user_id: string;
    customer_name?: string;
    customer_email?: string;
    total_amount: number;
    status: string;
    payment_status: string;
    payment_method?: string;
    delivery_address_id: string;
    delivery_slot_date?: string;
    delivery_slot_time?: string;
    created_at: string;
    updated_at: string;
}

export interface OrderDetail extends Order {
    items: OrderItem[];
    address?: any;
    status_history?: OrderStatusHistory[];
}

export interface OrderItem {
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
}

export interface OrderStatusHistory {
    status: string;
    created_at: string;
    updated_by?: string;
}

export interface OrderListResponse {
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
}

export const orderApi = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
        payment_status?: string;
        search?: string;
    }): Promise<OrderListResponse> => {
        const response = await apiClient.get('/orders/admin/all', { params });
        return response.data;
    },

    getById: async (id: string): Promise<OrderDetail> => {
        const response = await apiClient.get(`/orders/${id}`);
        return response.data.data;
    },

    updateStatus: async (id: string, status: string): Promise<Order> => {
        const response = await apiClient.put(`/orders/${id}/status`, { status });
        return response.data.data;
    },
};
