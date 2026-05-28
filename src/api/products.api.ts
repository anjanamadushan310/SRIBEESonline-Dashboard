import apiClient from './client';

export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    category: string;
    images: string[];
    stock: number;
    sku: string;
    status: 'active' | 'inactive';
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ProductListResponse {
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
}

export interface CreateProductDTO {
    name: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    category: string;
    images?: string[];
    stock: number;
    sku: string;
    status: 'active' | 'inactive';
    tags?: string[];
}

export const productApi = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        status?: string;
    }): Promise<ProductListResponse> => {
        const response = await apiClient.get('/products', { params });
        return response.data;
    },

    getById: async (id: string): Promise<Product> => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data.data;
    },

    create: async (data: CreateProductDTO): Promise<Product> => {
        const response = await apiClient.post('/products', data);
        return response.data.data;
    },

    update: async (id: string, data: Partial<CreateProductDTO>): Promise<Product> => {
        const response = await apiClient.put(`/products/${id}`, data);
        return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/products/${id}`);
    },
};
