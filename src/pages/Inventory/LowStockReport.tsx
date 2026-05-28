/**
 * Low Stock Report Page
 * Shows comprehensive low stock report across branches
 */

import React, { useEffect, useState } from 'react';
import { 
    Card, 
    Row, 
    Col, 
    Statistic, 
    Table, 
    Spin, 
    Alert, 
    Select, 
    Tag, 
    Progress, 
    Space, 
    Typography,
    Button,
    Input,
    Modal,
    Form,
    message,
} from 'antd';
import {
    WarningOutlined,
    ExclamationCircleOutlined,
    ShopOutlined,
    InboxOutlined,
    SendOutlined,
    ReloadOutlined,
    DownloadOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { useBranchStore } from '../../store/branchStore';
import { AdminRole } from '../../types/admin.types';
import type { LowStockAlert } from '../../types/branch.types';

const { Title, Text } = Typography;
const { Search } = Input;

const LowStockReportPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<string>('all');
    const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState<LowStockAlert | null>(null);

    const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
    const [stats, setStats] = useState({
        critical: 0,
        warning: 0,
        total: 0,
    });

    const user = useAuthStore((state) => state.user);
    const { branches } = useBranchStore();
    const isSuperAdmin = user?.role === AdminRole.SUPER_ADMIN;

    const [transferForm] = Form.useForm();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Mock data - in production, fetch from API
            const mockAlerts: LowStockAlert[] = [
                {
                    inventory_id: '1',
                    branch_id: '44444444-4444-4444-4444-444444444444',
                    branch_name: 'Colombo Central',
                    product_id: 'p1',
                    product_name: 'Organic Ceylon Tea 500g',
                    product_sku: 'TEA-500G-01',
                    variant_name: 'Premium Blend',
                    current_stock: 3,
                    threshold: 20,
                    severity: 'critical',
                },
                {
                    inventory_id: '2',
                    branch_id: '44444444-4444-4444-4444-444444444444',
                    branch_name: 'Colombo Central',
                    product_id: 'p2',
                    product_name: 'Fresh Coconut Oil 1L',
                    product_sku: 'OIL-1L-02',
                    variant_name: 'Extra Virgin',
                    current_stock: 5,
                    threshold: 25,
                    severity: 'critical',
                },
                {
                    inventory_id: '3',
                    branch_id: '55555555-5555-5555-5555-555555555555',
                    branch_name: 'Kandy City',
                    product_id: 'p3',
                    product_name: 'Basmati Rice 5kg',
                    product_sku: 'RICE-5KG-03',
                    variant_name: 'Long Grain',
                    current_stock: 8,
                    threshold: 30,
                    severity: 'warning',
                },
                {
                    inventory_id: '4',
                    branch_id: '55555555-5555-5555-5555-555555555555',
                    branch_name: 'Kandy City',
                    product_id: 'p4',
                    product_name: 'Cinnamon Sticks Premium',
                    product_sku: 'CINN-100G-04',
                    variant_name: '100g Pack',
                    current_stock: 12,
                    threshold: 25,
                    severity: 'warning',
                },
                {
                    inventory_id: '5',
                    branch_id: '66666666-6666-6666-6666-666666666666',
                    branch_name: 'Galle Fort',
                    product_id: 'p5',
                    product_name: 'Cardamom Pods',
                    product_sku: 'CARD-50G-05',
                    variant_name: '50g Premium',
                    current_stock: 15,
                    threshold: 20,
                    severity: 'warning',
                },
                {
                    inventory_id: '6',
                    branch_id: '44444444-4444-4444-4444-444444444444',
                    branch_name: 'Colombo Central',
                    product_id: 'p6',
                    product_name: 'Mango Chutney 350g',
                    product_sku: 'CHUT-350G-06',
                    variant_name: 'Spicy',
                    current_stock: 18,
                    threshold: 25,
                    severity: 'warning',
                },
            ];

            setAlerts(mockAlerts);

            // Calculate stats
            const critical = mockAlerts.filter(a => a.severity === 'critical').length;
            const warning = mockAlerts.filter(a => a.severity === 'warning').length;
            setStats({ critical, warning, total: mockAlerts.length });

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load low stock data';
            console.error('Low stock error:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityConfig = (severity: LowStockAlert['severity']) => {
        switch (severity) {
            case 'critical':
                return { color: '#ff4d4f', icon: <ExclamationCircleOutlined />, label: 'Critical' };
            case 'warning':
                return { color: '#faad14', icon: <WarningOutlined />, label: 'Warning' };
            default:
                return { color: '#1890ff', icon: <InboxOutlined />, label: 'Low' };
        }
    };

    // Filter alerts
    const filteredAlerts = alerts.filter(alert => {
        const matchesBranch = selectedBranch === 'all' || alert.branch_id === selectedBranch;
        const matchesSeverity = selectedSeverity === 'all' || alert.severity === selectedSeverity;
        const matchesSearch = searchQuery === '' || 
            alert.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            alert.variant_name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesBranch && matchesSeverity && matchesSearch;
    });

    // Handle transfer request
    const handleRequestTransfer = (alert: LowStockAlert) => {
        setSelectedAlert(alert);
        transferForm.setFieldsValue({
            product: `${alert.product_name} (${alert.variant_name})`,
            fromBranch: '',
            quantity: alert.threshold - alert.current_stock,
        });
        setIsTransferModalOpen(true);
    };

    const handleSubmitTransfer = () => {
        transferForm.validateFields().then((values) => {
            console.log('Transfer request:', values);
            message.success('Stock transfer request submitted');
            setIsTransferModalOpen(false);
            transferForm.resetFields();
        });
    };

    // Table columns
    const columns = [
        {
            title: 'Severity',
            key: 'severity',
            width: 100,
            filters: [
                { text: 'Critical', value: 'critical' },
                { text: 'Warning', value: 'warning' },
                { text: 'Low', value: 'low' },
            ],
            onFilter: (value: React.Key | boolean, record: LowStockAlert) => record.severity === value,
            render: (_: unknown, record: LowStockAlert) => {
                const config = getSeverityConfig(record.severity);
                return (
                    <Tag color={config.color} icon={config.icon}>
                        {config.label}
                    </Tag>
                );
            },
        },
        {
            title: 'Product',
            key: 'product',
            render: (record: LowStockAlert) => (
                <Space orientation="vertical" size={0}>
                    <Text strong>{record.product_name}</Text>
                    {record.variant_name && (
                        <Text type="secondary" style={{ fontSize: 12 }}>{record.variant_name}</Text>
                    )}
                </Space>
            ),
        },
        {
            title: 'Branch',
            dataIndex: 'branch_name',
            key: 'branch_name',
            filters: branches.map(b => ({ text: b.name, value: b.branch_id })),
            onFilter: (value: React.Key | boolean, record: LowStockAlert) => record.branch_id === value,
            render: (name: string) => (
                <Space>
                    <ShopOutlined />
                    {name}
                </Space>
            ),
        },
        {
            title: 'Stock Level',
            key: 'stock',
            sorter: (a: LowStockAlert, b: LowStockAlert) => 
                (a.current_stock / a.threshold) - (b.current_stock / b.threshold),
            render: (record: LowStockAlert) => {
                const percentage = Math.round((record.current_stock / record.threshold) * 100);
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Progress 
                            percent={percentage}
                            size="small"
                            status={percentage <= 25 ? 'exception' : percentage <= 50 ? 'normal' : 'success'}
                            style={{ width: 100 }}
                            format={() => ''}
                        />
                        <Text strong>{record.current_stock}</Text>
                        <Text type="secondary">/ {record.threshold}</Text>
                    </div>
                );
            },
        },
        {
            title: 'Needed',
            key: 'needed',
            width: 100,
            render: (record: LowStockAlert) => (
                <Tag color="red">
                    +{record.threshold - record.current_stock}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (record: LowStockAlert) => (
                <Space>
                    <Button 
                        type="primary" 
                        size="small" 
                        icon={<SendOutlined />}
                        onClick={() => handleRequestTransfer(record)}
                    >
                        Transfer
                    </Button>
                </Space>
            ),
        },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" tip="Loading low stock report..." />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>
                        <Space>
                            <WarningOutlined style={{ color: '#faad14' }} />
                            Low Stock Report
                        </Space>
                    </Title>
                    <Text type="secondary">Monitor and manage inventory levels across branches</Text>
                </div>
                <Space wrap>
                    <Button icon={<ReloadOutlined />} onClick={fetchData}>
                        Refresh
                    </Button>
                    <Button icon={<DownloadOutlined />}>
                        Export
                    </Button>
                </Space>
            </div>

            {error && (
                <Alert message={error} type="warning" showIcon closable style={{ marginBottom: '24px' }} />
            )}

            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Total Alerts"
                            value={stats.total}
                            prefix={<WarningOutlined style={{ color: '#8c8c8c' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderLeft: '4px solid #ff4d4f' }}>
                        <Statistic
                            title="Critical"
                            value={stats.critical}
                            valueStyle={{ color: '#ff4d4f' }}
                            prefix={<ExclamationCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8}>
                    <Card style={{ borderLeft: '4px solid #faad14' }}>
                        <Statistic
                            title="Warning"
                            value={stats.warning}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<WarningOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: '24px' }}>
                <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space wrap>
                        <Search
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: 250 }}
                            allowClear
                        />
                        {isSuperAdmin && (
                            <Select
                                value={selectedBranch}
                                onChange={setSelectedBranch}
                                style={{ width: 180 }}
                            >
                                <Select.Option value="all">All Branches</Select.Option>
                                {branches.map((branch) => (
                                    <Select.Option key={branch.branch_id} value={branch.branch_id}>
                                        {branch.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                        <Select
                            value={selectedSeverity}
                            onChange={setSelectedSeverity}
                            style={{ width: 150 }}
                        >
                            <Select.Option value="all">All Severity</Select.Option>
                            <Select.Option value="critical">Critical</Select.Option>
                            <Select.Option value="warning">Warning</Select.Option>
                            <Select.Option value="low">Low</Select.Option>
                        </Select>
                    </Space>
                    <Text type="secondary">
                        Showing {filteredAlerts.length} of {alerts.length} alerts
                    </Text>
                </Space>
            </Card>

            {/* Alerts Table */}
            <Card>
                <Table
                    dataSource={filteredAlerts}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 20 }}
                    rowClassName={(record) => 
                        record.severity === 'critical' ? 'ant-table-row-danger' : ''
                    }
                />
            </Card>

            {/* Transfer Request Modal */}
            <Modal
                title={
                    <Space>
                        <SendOutlined />
                        Request Stock Transfer
                    </Space>
                }
                open={isTransferModalOpen}
                onOk={handleSubmitTransfer}
                onCancel={() => setIsTransferModalOpen(false)}
                okText="Submit Request"
            >
                <Form form={transferForm} layout="vertical">
                    <Form.Item name="product" label="Product">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item
                        name="fromBranch"
                        label="Transfer From"
                        rules={[{ required: true, message: 'Select source branch' }]}
                    >
                        <Select placeholder="Select source branch">
                            {branches
                                .filter(b => b.branch_id !== selectedAlert?.branch_id)
                                .map((branch) => (
                                    <Select.Option key={branch.branch_id} value={branch.branch_id}>
                                        {branch.name}
                                    </Select.Option>
                                ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="quantity"
                        label="Quantity"
                        rules={[{ required: true, message: 'Enter quantity' }]}
                    >
                        <Input type="number" min={1} />
                    </Form.Item>
                    <Form.Item name="notes" label="Notes">
                        <Input.TextArea rows={3} placeholder="Optional notes..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default LowStockReportPage;
