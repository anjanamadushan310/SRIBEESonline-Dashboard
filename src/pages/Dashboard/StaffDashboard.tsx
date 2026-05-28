/**
 * Staff Dashboard - Staff View
 * Simplified view focused on order processing and daily tasks
 */

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, List, Spin, Alert, Tag, Space, Typography, Badge, Button, Empty, Segmented } from 'antd';
import {
    ShoppingCartOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    InboxOutlined,
    UserOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

interface Order {
    order_id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    delivery_address: string;
    total: number;
    items_count: number;
    created_at: string;
    status: 'pending' | 'processing' | 'ready' | 'shipped';
    items: Array<{
        name: string;
        quantity: number;
        variant?: string;
    }>;
}

type ViewMode = 'pending' | 'processing' | 'ready';

const StaffDashboard: React.FC = () => {
    const user = useAuthStore((state) => state.user);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('pending');
    
    // Stats
    const [stats, setStats] = useState({
        pendingOrders: 0,
        processingOrders: 0,
        readyOrders: 0,
        completedToday: 0,
    });

    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Mock staff-specific data
            setStats({
                pendingOrders: 5,
                processingOrders: 3,
                readyOrders: 2,
                completedToday: 18,
            });

            setOrders([
                {
                    order_id: '1',
                    order_number: 'ORD-001234',
                    customer_name: 'Nimal Perera',
                    customer_phone: '+94 77 123 4567',
                    delivery_address: '123 Galle Road, Colombo 03',
                    total: 156.50,
                    items_count: 5,
                    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
                    status: 'pending',
                    items: [
                        { name: 'Organic Ceylon Tea', quantity: 2, variant: '500g' },
                        { name: 'Basmati Rice', quantity: 1, variant: '5kg' },
                        { name: 'Coconut Oil', quantity: 2, variant: '1L' },
                    ],
                },
                {
                    order_id: '2',
                    order_number: 'ORD-001235',
                    customer_name: 'Kamala Silva',
                    customer_phone: '+94 71 234 5678',
                    delivery_address: '45 Temple Road, Kandy',
                    total: 234.00,
                    items_count: 8,
                    created_at: new Date(Date.now() - 32 * 60000).toISOString(),
                    status: 'pending',
                    items: [
                        { name: 'Cinnamon Sticks', quantity: 3, variant: 'Premium 100g' },
                        { name: 'Cardamom Pods', quantity: 2, variant: '50g' },
                        { name: 'Black Pepper', quantity: 3, variant: '200g' },
                    ],
                },
                {
                    order_id: '3',
                    order_number: 'ORD-001232',
                    customer_name: 'Sunil Fernando',
                    customer_phone: '+94 76 345 6789',
                    delivery_address: '78 Beach Road, Galle',
                    total: 89.99,
                    items_count: 3,
                    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
                    status: 'processing',
                    items: [
                        { name: 'Mango Chutney', quantity: 2, variant: '350g' },
                        { name: 'Papadam', quantity: 1, variant: 'Pack of 20' },
                    ],
                },
                {
                    order_id: '4',
                    order_number: 'ORD-001230',
                    customer_name: 'Dilini Jayawardena',
                    customer_phone: '+94 70 456 7890',
                    delivery_address: '56 Lake Road, Colombo 08',
                    total: 312.75,
                    items_count: 12,
                    created_at: new Date(Date.now() - 90 * 60000).toISOString(),
                    status: 'processing',
                    items: [
                        { name: 'Mixed Spice Set', quantity: 1 },
                        { name: 'Jasmine Rice', quantity: 2, variant: '10kg' },
                    ],
                },
                {
                    order_id: '5',
                    order_number: 'ORD-001228',
                    customer_name: 'Rohan de Silva',
                    customer_phone: '+94 75 567 8901',
                    delivery_address: '34 Hill Street, Nuwara Eliya',
                    total: 67.25,
                    items_count: 2,
                    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
                    status: 'ready',
                    items: [
                        { name: 'Ceylon Black Tea', quantity: 4, variant: '250g' },
                    ],
                },
                {
                    order_id: '6',
                    order_number: 'ORD-001227',
                    customer_name: 'Anjali Mendis',
                    customer_phone: '+94 72 678 9012',
                    delivery_address: '89 Main Street, Matara',
                    total: 145.00,
                    items_count: 6,
                    created_at: new Date(Date.now() - 150 * 60000).toISOString(),
                    status: 'ready',
                    items: [
                        { name: 'Turmeric Powder', quantity: 2, variant: '500g' },
                        { name: 'Curry Leaves', quantity: 4, variant: 'Fresh Pack' },
                    ],
                },
            ]);

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
            console.error('Dashboard error:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter((order) => order.status === viewMode);

    const getStatusConfig = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return { color: '#faad14', icon: <ClockCircleOutlined />, text: 'Pending', action: 'Start Processing' };
            case 'processing':
                return { color: '#1890ff', icon: <SyncOutlined spin />, text: 'Processing', action: 'Mark as Ready' };
            case 'ready':
                return { color: '#52c41a', icon: <CheckCircleOutlined />, text: 'Ready', action: 'Hand to Delivery' };
            case 'shipped':
                return { color: '#722ed1', icon: <InboxOutlined />, text: 'Shipped', action: 'View Details' };
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
        // API call would go here
        console.log(`Updating order ${orderId} to ${newStatus}`);
        
        // Optimistic update
        setOrders((prev) =>
            prev.map((order) =>
                order.order_id === orderId ? { ...order, status: newStatus } : order
            )
        );

        // In production, re-fetch from API to update stats
    };

    const getNextStatus = (current: Order['status']): Order['status'] | null => {
        switch (current) {
            case 'pending': return 'processing';
            case 'processing': return 'ready';
            case 'ready': return 'shipped';
            default: return null;
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" tip="Loading your tasks...">
                    <div style={{ padding: 50 }} />
                </Spin>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <Title level={2} style={{ margin: 0 }}>
                    Welcome, {user?.full_name?.split(' ')[0] || 'Staff'}! 👋
                </Title>
                <Text type="secondary">
                    Your Branch • {dayjs().format('dddd, MMMM D')}
                </Text>
            </div>

            {error && (
                <Alert message={error} type="warning" showIcon closable style={{ marginBottom: '24px' }} />
            )}

            {/* Quick Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={12} sm={6}>
                    <Card 
                        hoverable 
                        onClick={() => setViewMode('pending')}
                        style={{ 
                            borderTop: viewMode === 'pending' ? '3px solid #faad14' : undefined,
                            backgroundColor: viewMode === 'pending' ? '#fffbe6' : undefined,
                        }}
                    >
                        <Statistic
                            title="Pending"
                            value={stats.pendingOrders}
                            prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                            styles={{ content: { color: '#faad14' } }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card 
                        hoverable 
                        onClick={() => setViewMode('processing')}
                        style={{ 
                            borderTop: viewMode === 'processing' ? '3px solid #1890ff' : undefined,
                            backgroundColor: viewMode === 'processing' ? '#e6f7ff' : undefined,
                        }}
                    >
                        <Statistic
                            title="Processing"
                            value={stats.processingOrders}
                            prefix={<SyncOutlined style={{ color: '#1890ff' }} />}
                            styles={{ content: { color: '#1890ff' } }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card 
                        hoverable 
                        onClick={() => setViewMode('ready')}
                        style={{ 
                            borderTop: viewMode === 'ready' ? '3px solid #52c41a' : undefined,
                            backgroundColor: viewMode === 'ready' ? '#f6ffed' : undefined,
                        }}
                    >
                        <Statistic
                            title="Ready"
                            value={stats.readyOrders}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            styles={{ content: { color: '#52c41a' } }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Completed Today"
                            value={stats.completedToday}
                            prefix={<ShoppingCartOutlined style={{ color: '#722ed1' }} />}
                            styles={{ content: { color: '#722ed1' } }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Order Queue */}
            <Card
                title={
                    <Space>
                        <span>Order Queue</span>
                        <Badge 
                            count={filteredOrders.length} 
                            style={{ 
                                backgroundColor: viewMode === 'pending' ? '#faad14' : 
                                                 viewMode === 'processing' ? '#1890ff' : '#52c41a' 
                            }} 
                        />
                    </Space>
                }
                extra={
                    <Segmented
                        value={viewMode}
                        onChange={(value) => setViewMode(value as ViewMode)}
                        options={[
                            { label: `Pending (${stats.pendingOrders})`, value: 'pending' },
                            { label: `Processing (${stats.processingOrders})`, value: 'processing' },
                            { label: `Ready (${stats.readyOrders})`, value: 'ready' },
                        ]}
                    />
                }
            >
                {filteredOrders.length === 0 ? (
                    <Empty 
                        description={
                            viewMode === 'pending' ? 'No pending orders! Great job! 🎉' :
                            viewMode === 'processing' ? 'No orders being processed' :
                            'No orders ready for delivery'
                        }
                    />
                ) : (
                    <List
                        dataSource={filteredOrders}
                        renderItem={(order) => {
                            const statusConfig = getStatusConfig(order.status);
                            const nextStatus = getNextStatus(order.status);
                            
                            return (
                                <Card 
                                    style={{ marginBottom: 16 }}
                                    styles={{ body: { padding: '16px' } }}
                                >
                                    <Row gutter={[16, 16]} align="middle">
                                        {/* Order Info */}
                                        <Col xs={24} sm={12} md={8}>
                                            <Space orientation="vertical" size={4}>
                                                <Space>
                                                    <Text strong style={{ fontSize: '16px' }}>{order.order_number}</Text>
                                                    <Tag color={statusConfig.color} icon={statusConfig.icon}>
                                                        {statusConfig.text}
                                                    </Tag>
                                                </Space>
                                                <Text type="secondary">
                                                    {dayjs(order.created_at).fromNow()} • {order.items_count} items
                                                </Text>
                                                <Text strong style={{ color: '#16a34a', fontSize: '18px' }}>
                                                    ${order.total.toFixed(2)}
                                                </Text>
                                            </Space>
                                        </Col>

                                        {/* Customer Info */}
                                        <Col xs={24} sm={12} md={8}>
                                            <Space orientation="vertical" size={4}>
                                                <Space>
                                                    <UserOutlined />
                                                    <Text strong>{order.customer_name}</Text>
                                                </Space>
                                                <Space>
                                                    <PhoneOutlined />
                                                    <Text type="secondary">{order.customer_phone}</Text>
                                                </Space>
                                                <Space align="start">
                                                    <EnvironmentOutlined style={{ marginTop: 4 }} />
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        {order.delivery_address}
                                                    </Text>
                                                </Space>
                                            </Space>
                                        </Col>

                                        {/* Items & Action */}
                                        <Col xs={24} md={8}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                {/* Items Preview */}
                                                <div style={{ 
                                                    background: '#f5f5f5', 
                                                    padding: '8px 12px', 
                                                    borderRadius: 8,
                                                    maxHeight: 80,
                                                    overflow: 'auto',
                                                }}>
                                                    {order.items.slice(0, 3).map((item, idx) => (
                                                        <Text key={idx} style={{ display: 'block', fontSize: '12px' }}>
                                                            • {item.quantity}x {item.name} {item.variant && `(${item.variant})`}
                                                        </Text>
                                                    ))}
                                                    {order.items.length > 3 && (
                                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                                            +{order.items.length - 3} more items
                                                        </Text>
                                                    )}
                                                </div>

                                                {/* Action Button */}
                                                {nextStatus && (
                                                    <Button 
                                                        type="primary"
                                                        block
                                                        icon={<ArrowRightOutlined />}
                                                        onClick={() => handleStatusUpdate(order.order_id, nextStatus)}
                                                        style={{ 
                                                            backgroundColor: viewMode === 'pending' ? '#1890ff' : 
                                                                             viewMode === 'processing' ? '#52c41a' : '#722ed1'
                                                        }}
                                                    >
                                                        {statusConfig.action}
                                                    </Button>
                                                )}
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                            );
                        }}
                    />
                )}
            </Card>
        </div>
    );
};

export default StaffDashboard;
