import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Table, Timeline, Tag, Button, Modal, Select, message, Spin } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { orderApi } from '../../api/orders.api';
import type { OrderDetail, OrderItem } from '../../api/orders.api';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Option } = Select;

const OrderDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    useEffect(() => {
        if (id) {
            fetchOrder();
        }
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const data = await orderApi.getById(id!);
            setOrder(data);
        } catch (error) {
            message.error('Failed to load order');
            // Demo data fallback
            const demoOrder: OrderDetail = {
                order_id: id!,
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
                items: [
                    {
                        product_id: '1',
                        product_name: 'Organic Milk',
                        quantity: 2,
                        price: 4.99,
                        subtotal: 9.98,
                    },
                    {
                        product_id: '2',
                        product_name: 'Fresh Bread',
                        quantity: 3,
                        price: 2.99,
                        subtotal: 8.97,
                    },
                ],
                address: {
                    street: '123 Main St',
                    city: 'New York',
                    state: 'NY',
                    zip: '10001',
                },
                status_history: [
                    { status: 'pending', created_at: '2026-01-18T10:00:00Z' },
                    { status: 'confirmed', created_at: '2026-01-18T10:30:00Z' },
                    { status: 'packed', created_at: '2026-01-18T14:00:00Z' },
                    { status: 'shipped', created_at: '2026-01-19T09:00:00Z' },
                    { status: 'delivered', created_at: '2026-01-20T15:00:00Z' },
                ],
            };
            setOrder(demoOrder);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        try {
            await orderApi.updateStatus(id!, newStatus);
            message.success('Order status updated successfully');
            setStatusModalVisible(false);
            fetchOrder();
        } catch (error) {
            message.error('Failed to update status');
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

    const itemColumns: ColumnsType<OrderItem> = [
        {
            title: 'Product',
            dataIndex: 'product_name',
            key: 'product_name',
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `$${price.toFixed(2)}`,
        },
        {
            title: 'Subtotal',
            dataIndex: 'subtotal',
            key: 'subtotal',
            render: (subtotal: number) => `$${subtotal.toFixed(2)}`,
        },
    ];

    if (loading || !order) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/orders')}
                style={{ marginBottom: 16 }}
            >
                Back to Orders
            </Button>

            <Card
                title={`Order ${order.order_number}`}
                extra={
                    <Button icon={<PrinterOutlined />}>
                        Print Invoice
                    </Button>
                }
            >
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="Order Number">{order.order_number}</Descriptions.Item>
                    <Descriptions.Item label="Order Date">
                        {dayjs(order.created_at).format('MMM DD, YYYY HH:mm')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Customer">{order.customer_name}</Descriptions.Item>
                    <Descriptions.Item label="Email">{order.customer_email}</Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <Tag color={getStatusColor(order.status)} style={{ textTransform: 'capitalize' }}>
                            {order.status}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Payment Status">
                        <Tag color={order.payment_status === 'paid' ? 'green' : 'orange'}>
                            {order.payment_status?.toUpperCase()}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Payment Method">
                        {order.payment_method?.toUpperCase() || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Amount">
                        <strong style={{ fontSize: 16 }}>${order.total_amount.toFixed(2)}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Delivery Address" span={2}>
                        {order.address ? (
                            <>
                                {order.address.street}, {order.address.city}, {order.address.state} {order.address.zip}
                            </>
                        ) : 'N/A'}
                    </Descriptions.Item>
                    {order.delivery_slot_date && (
                        <Descriptions.Item label="Delivery Slot" span={2}>
                            {dayjs(order.delivery_slot_date).format('MMM DD, YYYY')} - {order.delivery_slot_time}
                        </Descriptions.Item>
                    )}
                </Descriptions>

                <div style={{ marginTop: 24 }}>
                    <Button type="primary" onClick={() => setStatusModalVisible(true)}>
                        Update Status
                    </Button>
                </div>
            </Card>

            <Card title="Order Items" style={{ marginTop: 24 }}>
                <Table
                    columns={itemColumns}
                    dataSource={order.items}
                    rowKey="product_id"
                    pagination={false}
                />
            </Card>

            <Card title="Status Timeline" style={{ marginTop: 24 }}>
                <Timeline>
                    {order.status_history?.map((history, index) => (
                        <Timeline.Item
                            key={index}
                            color={getStatusColor(history.status)}
                        >
                            <div>
                                <Tag color={getStatusColor(history.status)} style={{ textTransform: 'capitalize' }}>
                                    {history.status}
                                </Tag>
                                <div style={{ marginTop: 4, color: '#999' }}>
                                    {dayjs(history.created_at).format('MMM DD, YYYY HH:mm')}
                                </div>
                                {history.updated_by && (
                                    <div style={{ fontSize: 12, color: '#999' }}>
                                        Updated by: {history.updated_by}
                                    </div>
                                )}
                            </div>
                        </Timeline.Item>
                    ))}
                </Timeline>
            </Card>

            <Modal
                title="Update Order Status"
                open={statusModalVisible}
                onOk={handleStatusUpdate}
                onCancel={() => setStatusModalVisible(false)}
            >
                <Select
                    style={{ width: '100%' }}
                    placeholder="Select new status"
                    value={newStatus}
                    onChange={setNewStatus}
                >
                    <Option value="confirmed">Confirmed</Option>
                    <Option value="packed">Packed</Option>
                    <Option value="shipped">Shipped</Option>
                    <Option value="delivered">Delivered</Option>
                    <Option value="cancelled">Cancelled</Option>
                </Select>
            </Modal>
        </div>
    );
};

export default OrderDetailPage;
