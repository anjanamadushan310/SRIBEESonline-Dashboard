/**
 * Dashboard Home (Module 7.1)
 * Branch-scoped, data-driven landing page: KPI cards + 30-day revenue chart.
 * Super Admins get a Branch filter; Branch Managers see only their branch
 * (enforced server-side via inject_branch_filter).
 */
import React, { useState } from 'react';
import {
    Row,
    Col,
    Card,
    Statistic,
    Select,
    Skeleton,
    Alert,
    Space,
    Typography,
    Empty,
} from 'antd';
import {
    DollarOutlined,
    ShoppingCartOutlined,
    TeamOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analytics.api';
import type { SalesPoint } from '../../api/analytics.api';
import { branchesApi } from '../../api/branches.api';
import { usePermissions } from '../../hooks/usePermissions';

const { Title, Text } = Typography;

const formatLKR = (value: number): string =>
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(
        value ?? 0
    );

// Compact axis labels: Rs 12k, Rs 1.2M …
const compactLKR = (value: number): string => {
    if (value >= 1_000_000) return `Rs ${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `Rs ${Math.round(value / 1_000)}k`;
    return `Rs ${value}`;
};

const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const point = payload[0].payload as SalesPoint;
    return (
        <div
            style={{
                background: 'rgba(0,0,0,0.8)',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: 12,
            }}
        >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
                {dayjs(label).format('MMM DD, YYYY')}
            </div>
            <div>Revenue: {formatLKR(point.revenue)}</div>
            <div>Orders: {point.orders}</div>
        </div>
    );
};

const DashboardHome: React.FC = () => {
    const { isSuperAdmin } = usePermissions();
    const [branchId, setBranchId] = useState<string | undefined>(undefined);

    const { data: branches = [] } = useQuery({
        queryKey: ['admin', 'branches'],
        queryFn: branchesApi.list,
        enabled: isSuperAdmin,
    });

    const summaryQuery = useQuery({
        queryKey: ['admin', 'analytics', 'summary', branchId],
        queryFn: () => analyticsApi.summary(branchId),
    });

    const salesQuery = useQuery({
        queryKey: ['admin', 'analytics', 'sales', branchId],
        queryFn: () => analyticsApi.sales(branchId, 30),
    });

    const summary = summaryQuery.data;
    const series = salesQuery.data?.series ?? [];

    const kpis = [
        {
            title: 'Total Revenue',
            value: summary?.total_revenue ?? 0,
            render: (v: number) => formatLKR(v),
            icon: <DollarOutlined />,
            color: '#52c41a',
        },
        {
            title: 'Total Orders',
            value: summary?.total_orders ?? 0,
            render: (v: number) => v.toLocaleString(),
            icon: <ShoppingCartOutlined />,
            color: '#1890ff',
        },
        {
            title: 'Active Customers (30d)',
            value: summary?.active_customers ?? 0,
            render: (v: number) => v.toLocaleString(),
            icon: <TeamOutlined />,
            color: '#722ed1',
        },
        {
            title: 'Low Stock Alerts',
            value: summary?.low_stock_alerts ?? 0,
            render: (v: number) => v.toLocaleString(),
            icon: <WarningOutlined />,
            color: '#fa8c16',
        },
    ];

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginBottom: 20,
                }}
            >
                <Title level={3} style={{ margin: 0 }}>
                    Dashboard
                </Title>
                {isSuperAdmin && (
                    <Space>
                        <Text type="secondary">Branch:</Text>
                        <Select
                            placeholder="All Branches"
                            style={{ width: 240 }}
                            allowClear
                            value={branchId}
                            onChange={setBranchId}
                            options={branches.map((b) => ({ label: b.name, value: b.branch_id }))}
                        />
                    </Space>
                )}
            </div>

            {(summaryQuery.isError || salesQuery.isError) && (
                <Alert
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message="Failed to load analytics"
                    description={
                        (summaryQuery.error as any)?.response?.data?.detail ||
                        (salesQuery.error as any)?.response?.data?.detail ||
                        'Please try again.'
                    }
                />
            )}

            {/* KPI Cards */}
            <Row gutter={[16, 16]}>
                {kpis.map((kpi) => (
                    <Col xs={24} sm={12} lg={6} key={kpi.title}>
                        <Card>
                            {summaryQuery.isLoading ? (
                                <Skeleton active paragraph={false} title={{ width: '80%' }} />
                            ) : (
                                <Statistic
                                    title={kpi.title}
                                    value={kpi.value}
                                    formatter={(v) => kpi.render(Number(v))}
                                    prefix={<span style={{ color: kpi.color }}>{kpi.icon}</span>}
                                />
                            )}
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Revenue chart */}
            <Card title="Revenue — Last 30 Days" style={{ marginTop: 16 }}>
                {salesQuery.isLoading ? (
                    <Skeleton active paragraph={{ rows: 6 }} />
                ) : series.length === 0 ? (
                    <Empty description="No sales data for this period" />
                ) : (
                    <ResponsiveContainer width="100%" height={340}>
                        <AreaChart data={series} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#52c41a" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(d) => dayjs(d).format('MMM DD')}
                                interval="preserveStartEnd"
                                minTickGap={28}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis
                                tickFormatter={(v) => compactLKR(Number(v))}
                                width={64}
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip content={<ChartTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#52c41a"
                                strokeWidth={2}
                                fill="url(#revFill)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </Card>
        </div>
    );
};

export default DashboardHome;
