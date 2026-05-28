import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Spin, Alert } from 'antd';
import {
    DollarOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    ShoppingOutlined,
    RiseOutlined,
    FallOutlined,
} from '@ant-design/icons';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardApi } from '../../api/dashboard.api';
import type { DashboardStats, RecentOrder } from '../../api/dashboard.api';
import dayjs from 'dayjs';

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch stats and recent orders
            const [statsData, ordersData] = await Promise.all([
                dashboardApi.getStats(),
                dashboardApi.getRecentOrders(5),
            ]);

            setStats(statsData);
            setRecentOrders(ordersData);
        } catch (err: any) {
            console.error('Dashboard error:', err);
            setError(err.response?.data?.message || 'Failed to load dashboard data');

            // Use mock data for demo
            setStats({
                totalRevenue: 93250.50,
                totalOrders: 1234,
                totalCustomers: 567,
                pendingOrders: 23,
                revenueGrowth: 12.5,
                ordersGrowth: 8.3,
            });

            setRecentOrders([
                {
                    order_id: '1',
                    order_number: 'ORD-2026-001234',
                    customer_name: 'John Doe',
                    total_amount: 125.00,
                    status: 'delivered',
                    created_at: new Date().toISOString(),
                },
                {
                    order_id: '2',
                    order_number: 'ORD-2026-001235',
                    customer_name: 'Jane Smith',
                    total_amount: 89.50,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                },
                {
                    order_id: '3',
                    order_number: 'ORD-2026-001236',
                    customer_name: 'Bob Johnson',
                    total_amount: 210.00,
                    status: 'shipped',
                    created_at: new Date().toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Mock data for charts
    const salesData = [
        { date: 'Mon', revenue: 4200, orders: 24 },
        { date: 'Tue', revenue: 5100, orders: 31 },
        { date: 'Wed', revenue: 3800, orders: 22 },
        { date: 'Thu', revenue: 6200, orders: 38 },
        { date: 'Fri', revenue: 7500, orders: 45 },
        { date: 'Sat', revenue: 8900, orders: 52 },
        { date: 'Sun', revenue: 6800, orders: 41 },
    ];

    const orderStatusData = [
        { name: 'Pending', value: 23, color: '#faad14' },
        { name: 'Confirmed', value: 45, color: '#1890ff' },
        { name: 'Packed', value: 32, color: '#722ed1' },
        { name: 'Shipped', value: 67, color: '#13c2c2' },
        { name: 'Delivered', value: 156, color: '#52c41a' },
    ];

    const topProducts = [
        { name: 'Organic Milk', sales: 245 },
        { name: 'Fresh Bread', sales: 189 },
        { name: 'Eggs (Dozen)', sales: 167 },
        { name: 'Bananas', sales: 143 },
        { name: 'Tomatoes', sales: 128 },
    ];

    const columns = [
        {
            title: 'Order Number',
            dataIndex: 'order_number',
            key: 'order_number',
        },
        {
            title: 'Customer',
            dataIndex: 'customer_name',
            key: 'customer_name',
        },
        {
            title: 'Total',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount: number) => `$${amount.toFixed(2)}`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <span style={{
                    padding: '4px 12px',
                    borderRadius: '4px',
                    backgroundColor: status === 'delivered' ? '#f6ffed' : status === 'pending' ? '#fffbe6' : '#e6f7ff',
                    color: status === 'delivered' ? '#52c41a' : status === 'pending' ? '#faad14' : '#1890ff',
                    textTransform: 'capitalize',
                }}>
                    {status}
                </span>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
        },
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <h1 style={{ marginBottom: 24 }}>Dashboard Overview</h1>

            {error && (
                <Alert
                    message="Using Demo Data"
                    description={error}
                    type="warning"
                    closable
                    style={{ marginBottom: 24 }}
                />
            )}

            {/* Stats Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Revenue"
                            value={stats?.totalRevenue || 0}
                            precision={2}
                            prefix="$"
                            suffix={
                                <DollarOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                            }
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: stats && stats.revenueGrowth > 0 ? '#52c41a' : '#f5222d' }}>
                            {stats && stats.revenueGrowth > 0 ? <RiseOutlined /> : <FallOutlined />}
                            {' '}{Math.abs(stats?.revenueGrowth || 0)}% from last month
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Orders"
                            value={stats?.totalOrders || 0}
                            suffix={
                                <ShoppingCartOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                            }
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: stats && stats.ordersGrowth > 0 ? '#52c41a' : '#f5222d' }}>
                            {stats && stats.ordersGrowth > 0 ? <RiseOutlined /> : <FallOutlined />}
                            {' '}{Math.abs(stats?.ordersGrowth || 0)}% from last month
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Customers"
                            value={stats?.totalCustomers || 0}
                            suffix={
                                <UserOutlined style={{ fontSize: 24, color: '#722ed1' }} />
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Pending Orders"
                            value={stats?.pendingOrders || 0}
                            suffix={
                                <ShoppingOutlined style={{ fontSize: 24, color: '#faad14' }} />
                            }
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={12}>
                    <Card title="Revenue Trend (Last 7 Days)">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#52c41a" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Order Status Distribution">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name}: ${entry.value}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {orderStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={12}>
                    <Card title="Top Selling Products">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topProducts}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="sales" fill="#1890ff" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Recent Orders">
                        <Table
                            dataSource={recentOrders}
                            columns={columns}
                            pagination={false}
                            rowKey="order_id"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;

