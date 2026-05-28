import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, Tag, Card, message } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../../api/orders.api';
import type { Order } from '../../api/orders.api';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;

const OrderList: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');

    useEffect(() => {
        fetchOrders();
    }, [currentPage, pageSize, searchText, statusFilter, paymentStatusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderApi.getAll({
                page: currentPage,
                limit: pageSize,
                search: searchText,
                status: statusFilter,
                payment_status: paymentStatusFilter,
            });

            setOrders(response.orders || []);
            setTotal(response.total || 0);
        } catch (error: any) {
            console.error('Failed to fetch orders:', error);
            message.error('Failed to load orders');

            // Demo data fallback
            const demoOrders: Order[] = [
                {
                    order_id: '1',
                    order_number: 'ORD-2026-001234',
                    user_id: 'user1',
                    customer_name: 'John Doe',
                    customer_email: 'john@example.com',
                    total_amount: 125.50,
                    status: 'delivered',
                    payment_status: 'paid',
                    payment_method: 'card',
                    delivery_address_id: 'addr1',
                    delivery_slot_date: '2026-01-20',
                    delivery_slot_time: 'morning',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    order_id: '2',
                    order_number: 'ORD-2026-001235',
                    user_id: 'user2',
                    customer_name: 'Jane Smith',
                    customer_email: 'jane@example.com',
                    total_amount: 89.99,
                    status: 'pending',
                    payment_status: 'pending',
                    payment_method: 'cod',
                    delivery_address_id: 'addr2',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    order_id: '3',
                    order_number: 'ORD-2026-001236',
                    user_id: 'user3',
                    customer_name: 'Bob Johnson',
                    customer_email: 'bob@example.com',
                    total_amount: 210.00,
                    status: 'shipped',
                    payment_status: 'paid',
                    payment_method: 'upi',
                    delivery_address_id: 'addr3',
                    delivery_slot_date: '2026-01-21',
                    delivery_slot_time: 'evening',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ];
            setOrders(demoOrders);
            setTotal(demoOrders.length);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'orange',
            confirmed: 'blue',
            packed: 'purple',
            shipped: 'cyan',
            delivered: 'green',
            cancelled: 'red',
        };
        return colors[status] || 'default';
    };

    const getPaymentStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'orange',
            paid: 'green',
            failed: 'red',
            refunded: 'purple',
        };
        return colors[status] || 'default';
    };

    const columns: ColumnsType<Order> = [
        {
            title: 'Order Number',
            dataIndex: 'order_number',
            key: 'order_number',
            fixed: 'left',
            width: 180,
        },
        {
            title: 'Customer',
            dataIndex: 'customer_name',
            key: 'customer_name',
            render: (name: string, record: Order) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{name}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{record.customer_email}</div>
                </div>
            ),
        },
        {
            title: 'Total',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount: number) => `$${amount.toFixed(2)}`,
            sorter: (a, b) => a.total_amount - b.total_amount,
        },
        {
            title: 'Order Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)} style={{ textTransform: 'capitalize' }}>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Payment Status',
            dataIndex: 'payment_status',
            key: 'payment_status',
            render: (status: string) => (
                <Tag color={getPaymentStatusColor(status)} style={{ textTransform: 'capitalize' }}>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Payment Method',
            dataIndex: 'payment_method',
            key: 'payment_method',
            render: (method: string) => method?.toUpperCase() || 'N/A',
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => dayjs(date).format('MMM DD, YYYY HH:mm'),
            sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 100,
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/orders/${record.order_id}`)}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <div>
            <h1 style={{ marginBottom: 16 }}>Orders</h1>

            <Card>
                <Space style={{ marginBottom: 16, width: '100%' }} orientation="vertical">
                    <Space wrap>
                        <Search
                            placeholder="Search by order number or customer..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            style={{ width: 300 }}
                            onSearch={setSearchText}
                        />
                        <Select
                            placeholder="Order Status"
                            style={{ width: 150 }}
                            allowClear
                            onChange={setStatusFilter}
                        >
                            <Option value="pending">Pending</Option>
                            <Option value="confirmed">Confirmed</Option>
                            <Option value="packed">Packed</Option>
                            <Option value="shipped">Shipped</Option>
                            <Option value="delivered">Delivered</Option>
                            <Option value="cancelled">Cancelled</Option>
                        </Select>
                        <Select
                            placeholder="Payment Status"
                            style={{ width: 150 }}
                            allowClear
                            onChange={setPaymentStatusFilter}
                        >
                            <Option value="pending">Pending</Option>
                            <Option value="paid">Paid</Option>
                            <Option value="failed">Failed</Option>
                            <Option value="refunded">Refunded</Option>
                        </Select>
                    </Space>
                </Space>

                <Table
                    columns={columns}
                    dataSource={orders}
                    rowKey="order_id"
                    loading={loading}
                    scroll={{ x: 1200 }}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} orders`,
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

export default OrderList;
