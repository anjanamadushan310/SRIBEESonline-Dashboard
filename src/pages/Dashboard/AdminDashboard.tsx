/**
 * Admin Dashboard - Super Admin View
 * Shows system-wide analytics, branch performance comparison, and management options
 */

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Spin, Alert, Select, DatePicker, Tag, Progress, Space, Typography } from 'antd';
import {
    DollarOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    ShopOutlined,
    RiseOutlined,
    FallOutlined,
    WarningOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboard.api';
import { useBranchStore } from '../../store/branchStore';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface BranchPerformance {
    branch_id: string;
    branch_name: string;
    revenue: number;
    orders: number;
    average_order_value: number;
    growth_percentage: number;
    pending_orders: number;
    low_stock_count: number;
}

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { branches } = useBranchStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Stats state
    const [globalStats, setGlobalStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalBranches: 0,
        revenueGrowth: 0,
        ordersGrowth: 0,
        lowStockAlerts: 0,
        watchlistItems: 0,
    });

    const [branchPerformance, setBranchPerformance] = useState<BranchPerformance[]>([]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch global stats
            const stats = await dashboardApi.getStats();
            setGlobalStats({
                totalRevenue: stats?.totalRevenue || 245890.50,
                totalOrders: stats?.totalOrders || 3456,
                totalCustomers: stats?.totalCustomers || 1289,
                totalBranches: branches.length || 3,
                revenueGrowth: stats?.revenueGrowth || 15.3,
                ordersGrowth: stats?.ordersGrowth || 12.8,
                lowStockAlerts: stats?.lowStockAlerts || 12,
                watchlistItems: stats?.watchlistItems || 567,
            });

            // Mock branch performance data
            setBranchPerformance([
                {
                    branch_id: '44444444-4444-4444-4444-444444444444',
                    branch_name: 'Colombo Central',
                    revenue: 98450.00,
                    orders: 1234,
                    average_order_value: 79.78,
                    growth_percentage: 18.5,
                    pending_orders: 23,
                    low_stock_count: 5,
                },
                {
                    branch_id: '55555555-5555-5555-5555-555555555555',
                    branch_name: 'Kandy City',
                    revenue: 76320.50,
                    orders: 987,
                    average_order_value: 77.32,
                    growth_percentage: 12.3,
                    pending_orders: 15,
                    low_stock_count: 3,
                },
                {
                    branch_id: '66666666-6666-6666-6666-666666666666',
                    branch_name: 'Galle Fort',
                    revenue: 71120.00,
                    orders: 876,
                    average_order_value: 81.19,
                    growth_percentage: 8.7,
                    pending_orders: 18,
                    low_stock_count: 4,
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

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Chart data
    const revenueChartData = [
        { date: 'Mon', colombo: 14200, kandy: 11100, galle: 9800 },
        { date: 'Tue', colombo: 15100, kandy: 12300, galle: 10500 },
        { date: 'Wed', colombo: 13800, kandy: 10800, galle: 9200 },
        { date: 'Thu', colombo: 16200, kandy: 12800, galle: 11200 },
        { date: 'Fri', colombo: 17500, kandy: 13500, galle: 12100 },
        { date: 'Sat', colombo: 19900, kandy: 15200, galle: 13800 },
        { date: 'Sun', colombo: 16800, kandy: 12900, galle: 11400 },
    ];

    const orderStatusData = [
        { name: 'Pending', value: 56, color: '#faad14' },
        { name: 'Processing', value: 89, color: '#1890ff' },
        { name: 'Shipped', value: 234, color: '#722ed1' },
        { name: 'Delivered', value: 567, color: '#52c41a' },
        { name: 'Cancelled', value: 34, color: '#ff4d4f' },
    ];

    const topWatchedProducts = [
        { product: 'Organic Ceylon Tea 500g', watches: 156, conversions: 45, rate: 28.8 },
        { product: 'Fresh Coconut Oil 1L', watches: 134, conversions: 52, rate: 38.8 },
        { product: 'Basmati Rice 5kg', watches: 128, conversions: 38, rate: 29.7 },
        { product: 'Cinnamon Sticks Premium', watches: 112, conversions: 29, rate: 25.9 },
        { product: 'Mango Chutney 350g', watches: 98, conversions: 31, rate: 31.6 },
    ];

    const branchColumns = [
        {
            title: 'Branch',
            dataIndex: 'branch_name',
            key: 'branch_name',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'Revenue',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (value: number) => (
                <Text style={{ color: '#16a34a', fontWeight: 500 }}>
                    ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
            ),
            sorter: (a: BranchPerformance, b: BranchPerformance) => a.revenue - b.revenue,
        },
        {
            title: 'Orders',
            dataIndex: 'orders',
            key: 'orders',
            sorter: (a: BranchPerformance, b: BranchPerformance) => a.orders - b.orders,
        },
        {
            title: 'Avg. Order',
            dataIndex: 'average_order_value',
            key: 'average_order_value',
            render: (value: number) => `$${value.toFixed(2)}`,
        },
        {
            title: 'Growth',
            dataIndex: 'growth_percentage',
            key: 'growth_percentage',
            render: (value: number) => (
                <Tag color={value >= 0 ? 'green' : 'red'} icon={value >= 0 ? <RiseOutlined /> : <FallOutlined />}>
                    {value >= 0 ? '+' : ''}{value.toFixed(1)}%
                </Tag>
            ),
            sorter: (a: BranchPerformance, b: BranchPerformance) => a.growth_percentage - b.growth_percentage,
        },
        {
            title: 'Pending',
            dataIndex: 'pending_orders',
            key: 'pending_orders',
            render: (value: number) => (
                <Tag color={value > 20 ? 'red' : value > 10 ? 'orange' : 'green'}>{value}</Tag>
            ),
        },
        {
            title: 'Low Stock',
            dataIndex: 'low_stock_count',
            key: 'low_stock_count',
            render: (value: number) => (
                value > 0 ? (
                    <Tag color="warning" icon={<WarningOutlined />}>{value} items</Tag>
                ) : (
                    <Tag color="success">OK</Tag>
                )
            ),
        },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" tip="Loading dashboard...">
                    <div style={{ padding: 50 }} />
                </Spin>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>Admin Dashboard</Title>
                    <Text type="secondary">System-wide overview across all branches</Text>
                </div>
                <Space>
                    <RangePicker 
                        defaultValue={[dayjs().subtract(7, 'day'), dayjs()]}
                    />
                </Space>
            </div>

            {error && (
                <Alert message={error} type="warning" showIcon closable style={{ marginBottom: '24px' }} />
            )}

            {/* Global Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable onClick={() => navigate('/analytics')}>
                        <Statistic
                            title="Total Revenue"
                            value={globalStats.totalRevenue}
                            precision={2}
                            prefix={<DollarOutlined style={{ color: '#16a34a' }} />}
                            suffix={
                                <Tag color="green" style={{ marginLeft: 8 }}>
                                    <RiseOutlined /> {globalStats.revenueGrowth}%
                                </Tag>
                            }
                            styles={{ content: { color: '#16a34a' } }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable onClick={() => navigate('/orders')}>
                        <Statistic
                            title="Total Orders"
                            value={globalStats.totalOrders}
                            prefix={<ShoppingCartOutlined style={{ color: '#2563eb' }} />}
                            suffix={
                                <Tag color="blue" style={{ marginLeft: 8 }}>
                                    <RiseOutlined /> {globalStats.ordersGrowth}%
                                </Tag>
                            }
                            styles={{ content: { color: '#2563eb' } }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable onClick={() => navigate('/customers')}>
                        <Statistic
                            title="Total Customers"
                            value={globalStats.totalCustomers}
                            prefix={<UserOutlined style={{ color: '#7c3aed' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable onClick={() => navigate('/branches')}>
                        <Statistic
                            title="Active Branches"
                            value={globalStats.totalBranches}
                            prefix={<ShopOutlined style={{ color: '#0891b2' }} />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Alert Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12}>
                    <Card 
                        hoverable 
                        onClick={() => navigate('/inventory/low-stock')}
                        style={{ borderLeft: '4px solid #faad14' }}
                    >
                        <Space>
                            <WarningOutlined style={{ fontSize: 24, color: '#faad14' }} />
                            <div>
                                <Text type="secondary">Low Stock Alerts</Text>
                                <Title level={3} style={{ margin: 0 }}>{globalStats.lowStockAlerts} items</Title>
                            </div>
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card 
                        hoverable 
                        onClick={() => navigate('/analytics/watchlist')}
                        style={{ borderLeft: '4px solid #7c3aed' }}
                    >
                        <Space>
                            <EyeOutlined style={{ fontSize: 24, color: '#7c3aed' }} />
                            <div>
                                <Text type="secondary">Watchlist Items</Text>
                                <Title level={3} style={{ margin: 0 }}>{globalStats.watchlistItems} watching</Title>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>

            {/* Charts Row */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                {/* Revenue by Branch Chart */}
                <Col xs={24} lg={16}>
                    <Card title="Revenue by Branch (This Week)">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value) => value !== undefined ? `$${Number(value).toLocaleString()}` : ''} />
                                <Legend />
                                <Line type="monotone" dataKey="colombo" name="Colombo" stroke="#2563eb" strokeWidth={2} />
                                <Line type="monotone" dataKey="kandy" name="Kandy" stroke="#16a34a" strokeWidth={2} />
                                <Line type="monotone" dataKey="galle" name="Galle" stroke="#7c3aed" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Order Status Pie Chart */}
                <Col xs={24} lg={8}>
                    <Card title="Order Status Distribution">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
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

            {/* Branch Performance Table */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col span={24}>
                    <Card 
                        title="Branch Performance Comparison" 
                        extra={
                            <Select defaultValue="this_month" style={{ width: 150 }}>
                                <Select.Option value="today">Today</Select.Option>
                                <Select.Option value="this_week">This Week</Select.Option>
                                <Select.Option value="this_month">This Month</Select.Option>
                                <Select.Option value="this_year">This Year</Select.Option>
                            </Select>
                        }
                    >
                        <Table
                            dataSource={branchPerformance}
                            columns={branchColumns}
                            rowKey="branch_id"
                            pagination={false}
                            onRow={(record) => ({
                                onClick: () => navigate(`/analytics/branch/${record.branch_id}`),
                                style: { cursor: 'pointer' },
                            })}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Watchlist Analytics Preview */}
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card 
                        title="Top Watched Products" 
                        extra={<a onClick={() => navigate('/analytics/watchlist')}>View All</a>}
                    >
                        <Table
                            dataSource={topWatchedProducts}
                            columns={[
                                { title: 'Product', dataIndex: 'product', key: 'product' },
                                { 
                                    title: 'Watches', 
                                    dataIndex: 'watches', 
                                    key: 'watches',
                                    render: (v: number) => <Text strong>{v}</Text>
                                },
                                { 
                                    title: 'Conversions', 
                                    dataIndex: 'conversions', 
                                    key: 'conversions',
                                    render: (v: number) => <Tag color="green">{v} sold</Tag>
                                },
                                { 
                                    title: 'Conversion Rate', 
                                    dataIndex: 'rate', 
                                    key: 'rate',
                                    render: (v: number) => (
                                        <Progress 
                                            percent={v} 
                                            size="small" 
                                            status={v >= 30 ? 'success' : 'normal'}
                                            format={(p) => `${p?.toFixed(1)}%`}
                                        />
                                    )
                                },
                            ]}
                            rowKey="product"
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;
