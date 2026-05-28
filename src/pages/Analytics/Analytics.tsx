import React from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import { DollarOutlined, ShoppingCartOutlined, UserOutlined, RiseOutlined } from '@ant-design/icons';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics: React.FC = () => {
    // Mock analytics data
    const salesData = [
        { month: 'Jan', revenue: 45000, orders: 245 },
        { month: 'Feb', revenue: 52000, orders: 289 },
        { month: 'Mar', revenue: 48000, orders: 267 },
        { month: 'Apr', revenue: 61000, orders: 312 },
        { month: 'May', revenue: 55000, orders: 298 },
        { month: 'Jun', revenue: 67000, orders: 345 },
    ];

    const categoryData = [
        { name: 'Dairy', value: 4500, color: '#0088FE' },
        { name: 'Bakery', value: 3200, color: '#00C49F' },
        { name: 'Fruits', value: 2800, color: '#FFBB28' },
        { name: 'Vegetables', value: 2100, color: '#FF8042' },
        { name: 'Meat', value: 1800, color: '#8884D8' },
    ];

    const topProducts = [
        { name: 'Organic Milk', sales: 1245, revenue: 6225 },
        { name: 'Fresh Bread', sales: 989, revenue: 2956 },
        { name: 'Eggs (Dozen)', sales: 867, revenue: 3026 },
        { name: 'Bananas', sales: 743, revenue: 1486 },
        { name: 'Tomatoes', sales: 628, revenue: 1884 },
    ];

    const topCustomers = [
        { name: 'John Doe', orders: 45, spent: 2250 },
        { name: 'Jane Smith', orders: 38, spent: 1890 },
        { name: 'Bob Johnson', orders: 32, spent: 1680 },
        { name: 'Alice Brown', orders: 28, spent: 1540 },
        { name: 'Charlie Wilson', orders: 25, spent: 1375 },
    ];

    const productColumns = [
        {
            title: 'Product',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Sales',
            dataIndex: 'sales',
            key: 'sales',
        },
        {
            title: 'Revenue',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (value: number) => `$${value.toFixed(2)}`,
        },
    ];

    const customerColumns = [
        {
            title: 'Customer',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Orders',
            dataIndex: 'orders',
            key: 'orders',
        },
        {
            title: 'Total Spent',
            dataIndex: 'spent',
            key: 'spent',
            render: (value: number) => `$${value.toFixed(2)}`,
        },
    ];

    return (
        <div>
            <h1 style={{ marginBottom: 24 }}>Analytics & Reports</h1>

            {/* Summary Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Revenue (6 months)"
                            value={328000}
                            precision={2}
                            prefix="$"
                            suffix={<DollarOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#52c41a' }}>
                            <RiseOutlined /> 15.3% from last period
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Orders"
                            value={1756}
                            suffix={<ShoppingCartOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#52c41a' }}>
                            <RiseOutlined /> 12.8% from last period
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Average Order Value"
                            value={186.75}
                            precision={2}
                            prefix="$"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Customers"
                            value={567}
                            suffix={<UserOutlined style={{ fontSize: 24, color: '#722ed1' }} />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={12}>
                    <Card title="Revenue & Orders Trend">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#52c41a" strokeWidth={2} name="Revenue ($)" />
                                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#1890ff" strokeWidth={2} name="Orders" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Sales by Category">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name}: $${entry.value}`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Tables */}
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={12}>
                    <Card title="Top Selling Products">
                        <Table
                            columns={productColumns}
                            dataSource={topProducts}
                            rowKey="name"
                            pagination={false}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Top Customers">
                        <Table
                            columns={customerColumns}
                            dataSource={topCustomers}
                            rowKey="name"
                            pagination={false}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Analytics;
