import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, Tag, Image, message, Popconfirm, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../../api/products.api';
import type { Product } from '../../api/products.api';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;

const ProductList: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    useEffect(() => {
        fetchProducts();
    }, [currentPage, pageSize, searchText, categoryFilter, statusFilter]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productApi.getAll({
                page: currentPage,
                limit: pageSize,
                search: searchText,
                category: categoryFilter,
                status: statusFilter,
            });

            setProducts(response.products || []);
            setTotal(response.total || 0);
        } catch (error: any) {
            console.error('Failed to fetch products:', error);
            message.error('Failed to load products');

            // Demo data fallback
            const demoProducts: Product[] = [
                {
                    _id: '1',
                    name: 'Organic Milk',
                    description: 'Fresh organic whole milk',
                    price: 4.99,
                    compareAtPrice: 5.99,
                    category: 'Dairy',
                    images: ['https://via.placeholder.com/150'],
                    stock: 50,
                    sku: 'MILK-ORG-001',
                    status: 'active',
                    tags: ['organic', 'dairy'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    _id: '2',
                    name: 'Fresh Bread',
                    description: 'Whole wheat bread',
                    price: 2.99,
                    category: 'Bakery',
                    images: ['https://via.placeholder.com/150'],
                    stock: 30,
                    sku: 'BREAD-WW-001',
                    status: 'active',
                    tags: ['bakery', 'fresh'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    _id: '3',
                    name: 'Eggs (Dozen)',
                    description: 'Farm fresh eggs',
                    price: 3.49,
                    category: 'Dairy',
                    images: ['https://via.placeholder.com/150'],
                    stock: 100,
                    sku: 'EGGS-FARM-001',
                    status: 'active',
                    tags: ['eggs', 'fresh'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ];
            setProducts(demoProducts);
            setTotal(demoProducts.length);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await productApi.delete(id);
            message.success('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            message.error('Failed to delete product');
        }
    };

    const columns: ColumnsType<Product> = [
        {
            title: 'Image',
            dataIndex: 'images',
            key: 'images',
            width: 80,
            render: (images: string[]) => (
                <Image
                    src={images?.[0] || 'https://via.placeholder.com/150'}
                    alt="Product"
                    width={50}
                    height={50}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                />
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price: number, record: Product) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>${price.toFixed(2)}</div>
                    {record.compareAtPrice && (
                        <div style={{ fontSize: 12, color: '#999', textDecoration: 'line-through' }}>
                            ${record.compareAtPrice.toFixed(2)}
                        </div>
                    )}
                </div>
            ),
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
            render: (stock: number) => (
                <Tag color={stock > 20 ? 'green' : stock > 0 ? 'orange' : 'red'}>
                    {stock} units
                </Tag>
            ),
            sorter: (a, b) => a.stock - b.stock,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'active' ? 'green' : 'default'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/products/${record._id}/edit`)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete product"
                        description="Are you sure you want to delete this product?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0 }}>Products</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/products/new')}
                >
                    Add Product
                </Button>
            </div>

            <Card>
                <Space style={{ marginBottom: 16, width: '100%' }} orientation="vertical">
                    <Space wrap>
                        <Search
                            placeholder="Search products..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            style={{ width: 300 }}
                            onSearch={setSearchText}
                        />
                        <Select
                            placeholder="Category"
                            style={{ width: 150 }}
                            allowClear
                            onChange={setCategoryFilter}
                        >
                            <Option value="Dairy">Dairy</Option>
                            <Option value="Bakery">Bakery</Option>
                            <Option value="Fruits">Fruits</Option>
                            <Option value="Vegetables">Vegetables</Option>
                            <Option value="Meat">Meat</Option>
                        </Select>
                        <Select
                            placeholder="Status"
                            style={{ width: 120 }}
                            allowClear
                            onChange={setStatusFilter}
                        >
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                        </Select>
                    </Space>
                </Space>

                <Table
                    columns={columns}
                    dataSource={products}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} products`,
                        onChange: (page, size) => {
                            setCurrentPage(page);
                            setPageSize(size);
                        },
                    }}
                />
            </Card>
        </div>
    );
};

export default ProductList;
