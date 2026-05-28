/**
 * Manager Dashboard - Branch Manager View
 * Shows branch-isolated data: own branch orders, inventory, staff, and low stock alerts
 */

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Spin, Alert, Tag, Progress, Space, Typography, Badge, Button, List, Avatar } from 'antd';
import {
    DollarOutlined,
    ShoppingCartOutlined,
    InboxOutlined,
    TeamOutlined,
    WarningOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

interface PendingOrder {
    order_id: string;
    order_number: string;
    customer_name: string;
    total: number;
    items_count: number;
    created_at: string;
    status: string;
}

interface LowStockItem {
    product_id: string;
    product_name: string;
    variant_name: string;
    current_stock: number;
    min_stock: number;
    stock_percentage: number;
}

interface StaffMember {
    user_id: string;
    full_name: string;
    email: string;
    orders_processed_today: number;
    status: 'active' | 'idle' | 'offline';
}

const ManagerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Branch-specific stats
    const [branchStats, setBranchStats] = useState({
        todayRevenue: 0,
        todayOrders: 0,
        pendingOrders: 0,
        lowStockCount: 0,
        activeStaff: 0,
        inventoryValue: 0,
        revenueGrowth: 0,
    });

    const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
    const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
    const [staffList, setStaffList] = useState<StaffMember[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Mock branch-specific data
            setBranchStats({
                todayRevenue: 4567.89,
                todayOrders: 34,
                pendingOrders: 8,
                lowStockCount: 5,
                activeStaff: 3,
                inventoryValue: 45890.00,
                revenueGrowth: 12.5,
            });

            setPendingOrders([
                { order_id: '1', order_number: 'ORD-001234', customer_name: 'Nimal Perera', total: 156.50, items_count: 5, created_at: new Date(Date.now() - 15 * 60000).toISOString(), status: 'pending' },
                { order_id: '2', order_number: 'ORD-001235', customer_name: 'Kamala Silva', total: 234.00, items_count: 8, created_at: new Date(Date.now() - 32 * 60000).toISOString(), status: 'pending' },
                { order_id: '3', order_number: 'ORD-001236', customer_name: 'Sunil Fernando', total: 89.99, items_count: 3, created_at: new Date(Date.now() - 45 * 60000).toISOString(), status: 'processing' },
                { order_id: '4', order_number: 'ORD-001237', customer_name: 'Dilini Jayawardena', total: 312.75, items_count: 12, created_at: new Date(Date.now() - 78 * 60000).toISOString(), status: 'pending' },
                { order_id: '5', order_number: 'ORD-001238', customer_name: 'Rohan de Silva', total: 67.25, items_count: 2, created_at: new Date(Date.now() - 95 * 60000).toISOString(), status: 'processing' },
            ]);

            setLowStockItems([
                { product_id: '1', product_name: 'Organic Ceylon Tea', variant_name: '500g Pack', current_stock: 5, min_stock: 20, stock_percentage: 25 },
                { product_id: '2', product_name: 'Fresh Coconut Oil', variant_name: '1L Bottle', current_stock: 8, min_stock: 25, stock_percentage: 32 },
                { product_id: '3', product_name: 'Basmati Rice', variant_name: '5kg Bag', current_stock: 3, min_stock: 15, stock_percentage: 20 },
                { product_id: '4', product_name: 'Cinnamon Sticks', variant_name: 'Premium 100g', current_stock: 12, min_stock: 30, stock_percentage: 40 },
                { product_id: '5', product_name: 'Cardamom Pods', variant_name: '50g Pack', current_stock: 6, min_stock: 20, stock_percentage: 30 },
            ]);

            setStaffList([
                { user_id: '1', full_name: 'Amal Kumara', email: 'amal@freshcart.lk', orders_processed_today: 12, status: 'active' },
                { user_id: '2', full_name: 'Priya Mendis', email: 'priya@freshcart.lk', orders_processed_today: 8, status: 'active' },
                { user_id: '3', full_name: 'Kasun Wijesinghe', email: 'kasun@freshcart.lk', orders_processed_today: 5, status: 'idle' },
            ]);

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
            console.error('Dashboard error:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Chart data - hourly orders today
    const hourlyOrdersData = [
        { hour: '8AM', orders: 2, revenue: 156 },
        { hour: '9AM', orders: 5, revenue: 423 },
        { hour: '10AM', orders: 8, revenue: 687 },
        { hour: '11AM', orders: 12, revenue: 956 },
        { hour: '12PM', orders: 6, revenue: 512 },
        { hour: '1PM', orders: 4, revenue: 334 },
        { hour: '2PM', orders: 7, revenue: 589 },
        { hour: '3PM', orders: 9, revenue: 723 },
        { hour: '4PM', orders: 5, revenue: 412 },
    ];

    // Inventory by category
    const inventoryByCategory = [
        { category: 'Tea & Coffee', value: 12500, items: 45 },
        { category: 'Rice & Grains', value: 8900, items: 32 },
        { category: 'Spices', value: 6700, items: 58 },
        { category: 'Oils', value: 5600, items: 23 },
        { category: 'Snacks', value: 4200, items: 67 },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'processing': return 'processing';
            case 'shipped': return 'purple';
            case 'delivered': return 'success';
            default: return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <ClockCircleOutlined />;
            case 'processing': return <SyncOutlined spin />;
            case 'shipped': return <InboxOutlined />;
            case 'delivered': return <CheckCircleOutlined />;
            default: return null;
        }
    };

    const getStaffStatusBadge = (status: StaffMember['status']) => {
        switch (status) {
            case 'active': return <Badge status="success" text="Active" />;
            case 'idle': return <Badge status="warning" text="Idle" />;
            case 'offline': return <Badge status="default" text="Offline" />;
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" tip="Loading branch dashboard..." />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <Title level={2} style={{ margin: 0 }}>
                    Branch Dashboard
                </Title>
                <Text type="secondary">
                    Your Branch • Today: {dayjs().format('dddd, MMMM D, YYYY')}
                </Text>
            </div>

            {error && (
                <Alert message={error} type="warning" showIcon closable style={{ marginBottom: '24px' }} />
            )}

            {/* Quick Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Today's Revenue"
                            value={branchStats.todayRevenue}
                            precision={2}
                            prefix={<DollarOutlined style={{ color: '#16a34a' }} />}
                            styles={{ content: { color: '#16a34a' } }}
                            suffix={
                                <Tag color="green" style={{ marginLeft: 8, fontSize: '12px' }}>
                                    +{branchStats.revenueGrowth}%
                                </Tag>
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Today's Orders"
                            value={branchStats.todayOrders}
                            prefix={<ShoppingCartOutlined style={{ color: '#2563eb' }} />}
                            styles={{ content: { color: '#2563eb' } }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card 
                        hoverable 
                        onClick={() => navigate('/orders?status=pending')}
                        style={{ borderLeft: branchStats.pendingOrders > 5 ? '4px solid #faad14' : undefined }}
                    >
                        <Statistic
                            title="Pending Orders"
                            value={branchStats.pendingOrders}
                            prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                            styles={{ content: { color: branchStats.pendingOrders > 5 ? '#faad14' : undefined } }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card 
                        hoverable 
                        onClick={() => navigate('/inventory/low-stock')}
                        style={{ borderLeft: branchStats.lowStockCount > 0 ? '4px solid #ff4d4f' : undefined }}
                    >
                        <Statistic
                            title="Low Stock Items"
                            value={branchStats.lowStockCount}
                            prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
                            styles={{ content: { color: branchStats.lowStockCount > 0 ? '#ff4d4f' : undefined } }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts Row */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                {/* Today's Orders Chart */}
                <Col xs={24} lg={14}>
                    <Card title="Today's Order Activity">
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={hourlyOrdersData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis yAxisId="left" orientation="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Area 
                                    yAxisId="left"
                                    type="monotone" 
                                    dataKey="orders" 
                                    name="Orders"
                                    stroke="#2563eb" 
                                    fill="#2563eb" 
                                    fillOpacity={0.3} 
                                />
                                <Area 
                                    yAxisId="right"
                                    type="monotone" 
                                    dataKey="revenue" 
                                    name="Revenue ($)"
                                    stroke="#16a34a" 
                                    fill="#16a34a" 
                                    fillOpacity={0.3} 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Inventory Value by Category */}
                <Col xs={24} lg={10}>
                    <Card title="Inventory by Category">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={inventoryByCategory} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="category" type="category" width={100} />
                                <Tooltip formatter={(value) => value !== undefined ? `$${Number(value).toLocaleString()}` : ''} />
                                <Bar dataKey="value" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Pending Orders & Low Stock */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                {/* Pending Orders List */}
                <Col xs={24} lg={14}>
                    <Card 
                        title={
                            <Space>
                                <span>Pending Orders</span>
                                <Badge count={pendingOrders.length} style={{ backgroundColor: '#faad14' }} />
                            </Space>
                        }
                        extra={<Button type="link" onClick={() => navigate('/orders')}>View All <ArrowRightOutlined /></Button>}
                    >
                        <List
                            dataSource={pendingOrders}
                            renderItem={(order) => (
                                <List.Item
                                    key={order.order_id}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/orders/${order.order_id}`)}
                                    extra={
                                        <Text strong style={{ color: '#16a34a' }}>
                                            ${order.total.toFixed(2)}
                                        </Text>
                                    }
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar style={{ backgroundColor: getStatusColor(order.status) === 'warning' ? '#faad14' : '#1890ff' }}>
                                                {getStatusIcon(order.status)}
                                            </Avatar>
                                        }
                                        title={
                                            <Space>
                                                <Text strong>{order.order_number}</Text>
                                                <Tag color={getStatusColor(order.status)}>{order.status}</Tag>
                                            </Space>
                                        }
                                        description={
                                            <Space size="large">
                                                <Text type="secondary">{order.customer_name}</Text>
                                                <Text type="secondary">{order.items_count} items</Text>
                                                <Text type="secondary">{dayjs(order.created_at).fromNow()}</Text>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                {/* Low Stock Alerts */}
                <Col xs={24} lg={10}>
                    <Card 
                        title={
                            <Space>
                                <WarningOutlined style={{ color: '#ff4d4f' }} />
                                <span>Low Stock Alerts</span>
                                <Badge count={lowStockItems.length} style={{ backgroundColor: '#ff4d4f' }} />
                            </Space>
                        }
                        extra={<Button type="link" onClick={() => navigate('/inventory/low-stock')}>View All <ArrowRightOutlined /></Button>}
                    >
                        <List
                            dataSource={lowStockItems}
                            renderItem={(item) => (
                                <List.Item key={item.product_id}>
                                    <List.Item.Meta
                                        title={
                                            <Space>
                                                <Text>{item.product_name}</Text>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>({item.variant_name})</Text>
                                            </Space>
                                        }
                                        description={
                                            <div style={{ width: '100%' }}>
                                                <Progress 
                                                    percent={item.stock_percentage}
                                                    size="small"
                                                    status={item.stock_percentage < 25 ? 'exception' : 'normal'}
                                                    format={() => `${item.current_stock}/${item.min_stock}`}
                                                />
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Staff Activity */}
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card 
                        title={
                            <Space>
                                <TeamOutlined />
                                <span>Staff Activity</span>
                            </Space>
                        }
                    >
                        <Table
                            dataSource={staffList}
                            columns={[
                                {
                                    title: 'Staff Member',
                                    dataIndex: 'full_name',
                                    key: 'full_name',
                                    render: (text: string, record: StaffMember) => (
                                        <Space>
                                            <Avatar style={{ backgroundColor: '#7c3aed' }}>
                                                {text.charAt(0)}
                                            </Avatar>
                                            <div>
                                                <Text strong>{text}</Text>
                                                <br />
                                                <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
                                            </div>
                                        </Space>
                                    ),
                                },
                                {
                                    title: 'Status',
                                    dataIndex: 'status',
                                    key: 'status',
                                    render: (status: StaffMember['status']) => getStaffStatusBadge(status),
                                },
                                {
                                    title: 'Orders Processed Today',
                                    dataIndex: 'orders_processed_today',
                                    key: 'orders_processed_today',
                                    render: (count: number) => (
                                        <Tag color={count >= 10 ? 'green' : count >= 5 ? 'blue' : 'default'}>
                                            {count} orders
                                        </Tag>
                                    ),
                                },
                            ]}
                            rowKey="user_id"
                            pagination={false}
                            size="middle"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ManagerDashboard;
