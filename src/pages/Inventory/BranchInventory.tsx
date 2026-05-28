/**
 * Branch Inventory Page
 * Shows inventory levels for the current branch (or all branches for super admin)
 */

import React, { useEffect, useState } from 'react';
import { 
    Card, 
    Row, 
    Col, 
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
    Tooltip,
    message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    ShopOutlined,
    InboxOutlined,
    SearchOutlined,
    ReloadOutlined,
    WarningOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { useBranchStore } from '../../store/branchStore';
import { AdminRole } from '../../types/admin.types';
import type { BranchInventoryItem } from '../../types/branch.types';

const { Title, Text } = Typography;
const { Search } = Input;

const BranchInventory: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [inventory, setInventory] = useState<BranchInventoryItem[]>([]);

    const user = useAuthStore((state) => state.user);
    const { branches } = useBranchStore();
    const isSuperAdmin = user?.role === AdminRole.SUPER_ADMIN;

    useEffect(() => {
        fetchInventory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBranch]);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            setError(null);

            // Mock data - in production, fetch from API
            const mockInventory: BranchInventoryItem[] = [
                {
                    inventory_id: '1',
                    branch_id: '44444444-4444-4444-4444-444444444444',
                    branch_name: 'Colombo Central',
                    product_id: 'p1',
                    product_name: 'Organic Ceylon Tea 500g',
                    product_sku: 'TEA-500G-01',
                    variant_name: 'Premium Blend',
                    stock_quantity: 45,
                    reserved_quantity: 5,
                    available_quantity: 40,
                    low_stock_threshold: 20,
                    reorder_point: 30,
                    max_stock_level: 100,
                    is_low_stock: false,
                    is_out_of_stock: false,
                    last_restocked: '2026-01-15T10:00:00Z',
                    created_at: '2025-01-01T00:00:00Z',
                    updated_at: '2026-01-28T12:00:00Z',
                },
                {
                    inventory_id: '2',
                    branch_id: '44444444-4444-4444-4444-444444444444',
                    branch_name: 'Colombo Central',
                    product_id: 'p2',
                    product_name: 'Fresh Coconut Oil 1L',
                    product_sku: 'OIL-1L-02',
                    variant_name: 'Extra Virgin',
                    stock_quantity: 8,
                    reserved_quantity: 3,
                    available_quantity: 5,
                    low_stock_threshold: 25,
                    reorder_point: 35,
                    max_stock_level: 80,
                    is_low_stock: true,
                    is_out_of_stock: false,
                    last_restocked: '2026-01-10T08:00:00Z',
                    created_at: '2025-01-01T00:00:00Z',
                    updated_at: '2026-01-28T14:00:00Z',
                },
                {
                    inventory_id: '3',
                    branch_id: '55555555-5555-5555-5555-555555555555',
                    branch_name: 'Kandy City',
                    product_id: 'p3',
                    product_name: 'Basmati Rice 5kg',
                    product_sku: 'RICE-5KG-03',
                    variant_name: 'Long Grain',
                    stock_quantity: 0,
                    reserved_quantity: 0,
                    available_quantity: 0,
                    low_stock_threshold: 30,
                    reorder_point: 40,
                    max_stock_level: 150,
                    is_low_stock: false,
                    is_out_of_stock: true,
                    created_at: '2025-01-01T00:00:00Z',
                    updated_at: '2026-01-28T10:00:00Z',
                },
                {
                    inventory_id: '4',
                    branch_id: '55555555-5555-5555-5555-555555555555',
                    branch_name: 'Kandy City',
                    product_id: 'p4',
                    product_name: 'Cinnamon Sticks Premium',
                    product_sku: 'CINN-100G-04',
                    variant_name: '100g Pack',
                    stock_quantity: 75,
                    reserved_quantity: 10,
                    available_quantity: 65,
                    low_stock_threshold: 25,
                    reorder_point: 35,
                    max_stock_level: 120,
                    is_low_stock: false,
                    is_out_of_stock: false,
                    last_restocked: '2026-01-20T09:00:00Z',
                    created_at: '2025-01-01T00:00:00Z',
                    updated_at: '2026-01-28T16:00:00Z',
                },
                {
                    inventory_id: '5',
                    branch_id: '66666666-6666-6666-6666-666666666666',
                    branch_name: 'Galle Fort',
                    product_id: 'p5',
                    product_name: 'Cardamom Pods',
                    product_sku: 'CARD-50G-05',
                    variant_name: '50g Premium',
                    stock_quantity: 22,
                    reserved_quantity: 2,
                    available_quantity: 20,
                    low_stock_threshold: 20,
                    reorder_point: 25,
                    max_stock_level: 60,
                    is_low_stock: false,
                    is_out_of_stock: false,
                    last_restocked: '2026-01-22T11:00:00Z',
                    created_at: '2025-01-01T00:00:00Z',
                    updated_at: '2026-01-28T09:00:00Z',
                },
            ];

            // Filter by branch if not super admin or if specific branch selected
            let filteredInventory = mockInventory;
            if (!isSuperAdmin && user?.branch_id) {
                filteredInventory = mockInventory.filter(item => item.branch_id === user.branch_id);
            } else if (selectedBranch !== 'all') {
                filteredInventory = mockInventory.filter(item => item.branch_id === selectedBranch);
            }

            setInventory(filteredInventory);

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load inventory data';
            console.error('Inventory error:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Filter by search query
    const filteredInventory = inventory.filter(item => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            item.product_name.toLowerCase().includes(query) ||
            item.product_sku.toLowerCase().includes(query) ||
            item.variant_name?.toLowerCase().includes(query)
        );
    });

    // Calculate stats
    const stats = {
        totalItems: filteredInventory.length,
        lowStock: filteredInventory.filter(item => item.is_low_stock).length,
        outOfStock: filteredInventory.filter(item => item.is_out_of_stock).length,
        healthy: filteredInventory.filter(item => !item.is_low_stock && !item.is_out_of_stock).length,
    };

    const getStockStatus = (item: BranchInventoryItem) => {
        if (item.is_out_of_stock) {
            return { color: '#ff4d4f', text: 'Out of Stock', icon: <ExclamationCircleOutlined /> };
        }
        if (item.is_low_stock) {
            return { color: '#faad14', text: 'Low Stock', icon: <WarningOutlined /> };
        }
        return { color: '#52c41a', text: 'In Stock', icon: <InboxOutlined /> };
    };

    const columns: ColumnsType<BranchInventoryItem> = [
        {
            title: 'Product',
            key: 'product',
            render: (_, record) => (
                <Space orientation="vertical" size={0}>
                    <Text strong>{record.product_name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        SKU: {record.product_sku}
                    </Text>
                    {record.variant_name && (
                        <Tag style={{ marginTop: 4 }}>{record.variant_name}</Tag>
                    )}
                </Space>
            ),
        },
        ...(isSuperAdmin ? [{
            title: 'Branch',
            dataIndex: 'branch_name',
            key: 'branch_name',
            render: (name: string) => (
                <Space>
                    <ShopOutlined />
                    {name}
                </Space>
            ),
        }] : []),
        {
            title: 'Stock Level',
            key: 'stock',
            sorter: (a, b) => a.stock_quantity - b.stock_quantity,
            render: (_, record) => {
                const percentage = Math.round((record.stock_quantity / record.max_stock_level) * 100);
                const status = getStockStatus(record);
                return (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <Progress 
                                percent={percentage}
                                size="small"
                                status={record.is_out_of_stock ? 'exception' : record.is_low_stock ? 'normal' : 'success'}
                                style={{ width: 100 }}
                                format={() => ''}
                            />
                            <Text strong>{record.stock_quantity}</Text>
                            <Text type="secondary">/ {record.max_stock_level}</Text>
                        </div>
                        <Tag color={status.color} icon={status.icon}>
                            {status.text}
                        </Tag>
                    </div>
                );
            },
        },
        {
            title: 'Available',
            key: 'available',
            render: (_, record) => (
                <Space orientation="vertical" size={0}>
                    <Text strong style={{ color: record.available_quantity > 0 ? '#52c41a' : '#ff4d4f' }}>
                        {record.available_quantity}
                    </Text>
                    {record.reserved_quantity > 0 && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            ({record.reserved_quantity} reserved)
                        </Text>
                    )}
                </Space>
            ),
        },
        {
            title: 'Thresholds',
            key: 'thresholds',
            render: (_, record) => (
                <Space orientation="vertical" size={0}>
                    <Text style={{ fontSize: 12 }}>
                        Low: <Text strong>{record.low_stock_threshold}</Text>
                    </Text>
                    <Text style={{ fontSize: 12 }}>
                        Reorder: <Text strong>{record.reorder_point}</Text>
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Request Stock Transfer">
                        <Button 
                            size="small" 
                            type="primary"
                            disabled={!record.is_low_stock && !record.is_out_of_stock}
                            onClick={() => message.info('Transfer request feature coming soon')}
                        >
                            Transfer
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" tip="Loading inventory..." />
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
                            <InboxOutlined />
                            Branch Inventory
                        </Space>
                    </Title>
                    <Text type="secondary">Manage inventory levels across branches</Text>
                </div>
                <Button icon={<ReloadOutlined />} onClick={fetchInventory}>
                    Refresh
                </Button>
            </div>

            {error && (
                <Alert message={error} type="warning" showIcon closable style={{ marginBottom: '24px' }} />
            )}

            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={12} sm={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary">Total Items</Text>
                            <Title level={3} style={{ margin: '8px 0 0' }}>{stats.totalItems}</Title>
                        </div>
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderLeft: '4px solid #52c41a' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary">Healthy</Text>
                            <Title level={3} style={{ margin: '8px 0 0', color: '#52c41a' }}>{stats.healthy}</Title>
                        </div>
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderLeft: '4px solid #faad14' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary">Low Stock</Text>
                            <Title level={3} style={{ margin: '8px 0 0', color: '#faad14' }}>{stats.lowStock}</Title>
                        </div>
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderLeft: '4px solid #ff4d4f' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary">Out of Stock</Text>
                            <Title level={3} style={{ margin: '8px 0 0', color: '#ff4d4f' }}>{stats.outOfStock}</Title>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: '24px' }}>
                <Space wrap>
                    <Search
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: 250 }}
                        allowClear
                        prefix={<SearchOutlined />}
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
                </Space>
            </Card>

            {/* Inventory Table */}
            <Card>
                <Table
                    dataSource={filteredInventory}
                    columns={columns}
                    rowKey="inventory_id"
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                />
            </Card>
        </div>
    );
};

export default BranchInventory;
