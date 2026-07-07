/**
 * Stock Transfers Page
 * Manage stock transfer requests between branches
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
    Space, 
    Typography,
    Button,
    Input,
    Modal,
    Form,
    InputNumber,
    message,
    Tabs,
    Tooltip,
    Popconfirm,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    SwapOutlined,
    SendOutlined,
    CheckOutlined,
    CloseOutlined,
    ClockCircleOutlined,
    SearchOutlined,
    PlusOutlined,
    ShopOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { useBranchStore } from '../../store/branchStore';
import { AdminRole } from '../../types/admin.types';
import type { StockTransfer, TransferStatus } from '../../types/branch.types';
import { TRANSFER_STATUS_CONFIG } from '../../types/branch.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Search } = Input;
const { TextArea } = Input;

const StockTransfers: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [transfers, setTransfers] = useState<StockTransfer[]>([]);
    const [isNewTransferModalOpen, setIsNewTransferModalOpen] = useState(false);

    const user = useAuthStore((state) => state.user);
    const { branches } = useBranchStore();
    const canApprove = user?.role === AdminRole.SUPER_ADMIN || user?.role === AdminRole.INVENTORY_MANAGER;

    const [form] = Form.useForm();

    useEffect(() => {
        fetchTransfers();
    }, []);

    const fetchTransfers = async () => {
        try {
            setLoading(true);
            setError(null);

            // Mock data - in production, fetch from API
            const mockTransfers: StockTransfer[] = [
                {
                    transfer_id: 't1',
                    from_branch_id: '44444444-4444-4444-4444-444444444444',
                    from_branch_name: 'Colombo Central',
                    to_branch_id: '55555555-5555-5555-5555-555555555555',
                    to_branch_name: 'Kandy City',
                    product_id: 'p1',
                    product_name: 'Organic Ceylon Tea 500g',
                    variant_name: 'Premium Blend',
                    quantity: 20,
                    status: 'pending',
                    requested_by_id: 'u1',
                    requested_by_name: 'John Manager',
                    notes: 'Urgent: Low stock at Kandy branch',
                    requested_at: '2026-01-28T10:00:00Z',
                },
                {
                    transfer_id: 't2',
                    from_branch_id: '66666666-6666-6666-6666-666666666666',
                    from_branch_name: 'Galle Fort',
                    to_branch_id: '44444444-4444-4444-4444-444444444444',
                    to_branch_name: 'Colombo Central',
                    product_id: 'p2',
                    product_name: 'Fresh Coconut Oil 1L',
                    variant_name: 'Extra Virgin',
                    quantity: 15,
                    status: 'approved',
                    requested_by_id: 'u2',
                    requested_by_name: 'Sarah Staff',
                    approved_by_id: 'u3',
                    approved_by_name: 'Admin User',
                    notes: 'Regular replenishment',
                    requested_at: '2026-01-27T14:00:00Z',
                    approved_at: '2026-01-27T16:00:00Z',
                },
                {
                    transfer_id: 't3',
                    from_branch_id: '44444444-4444-4444-4444-444444444444',
                    from_branch_name: 'Colombo Central',
                    to_branch_id: '66666666-6666-6666-6666-666666666666',
                    to_branch_name: 'Galle Fort',
                    product_id: 'p3',
                    product_name: 'Basmati Rice 5kg',
                    variant_name: 'Long Grain',
                    quantity: 30,
                    status: 'in_transit',
                    requested_by_id: 'u4',
                    requested_by_name: 'Mike Manager',
                    approved_by_id: 'u3',
                    approved_by_name: 'Admin User',
                    notes: 'Seasonal demand increase',
                    requested_at: '2026-01-26T09:00:00Z',
                    approved_at: '2026-01-26T11:00:00Z',
                },
                {
                    transfer_id: 't4',
                    from_branch_id: '55555555-5555-5555-5555-555555555555',
                    from_branch_name: 'Kandy City',
                    to_branch_id: '44444444-4444-4444-4444-444444444444',
                    to_branch_name: 'Colombo Central',
                    product_id: 'p4',
                    product_name: 'Cinnamon Sticks Premium',
                    variant_name: '100g Pack',
                    quantity: 50,
                    status: 'completed',
                    requested_by_id: 'u1',
                    requested_by_name: 'John Manager',
                    approved_by_id: 'u3',
                    approved_by_name: 'Admin User',
                    notes: 'Monthly transfer',
                    requested_at: '2026-01-20T08:00:00Z',
                    approved_at: '2026-01-20T10:00:00Z',
                    completed_at: '2026-01-22T14:00:00Z',
                },
                {
                    transfer_id: 't5',
                    from_branch_id: '66666666-6666-6666-6666-666666666666',
                    from_branch_name: 'Galle Fort',
                    to_branch_id: '55555555-5555-5555-5555-555555555555',
                    to_branch_name: 'Kandy City',
                    product_id: 'p5',
                    product_name: 'Cardamom Pods',
                    variant_name: '50g Premium',
                    quantity: 10,
                    status: 'cancelled',
                    requested_by_id: 'u2',
                    requested_by_name: 'Sarah Staff',
                    notes: 'Cancelled - found local supplier',
                    requested_at: '2026-01-18T11:00:00Z',
                },
            ];

            setTransfers(mockTransfers);

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load transfers';
            console.error('Transfers error:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Filter transfers
    const filteredTransfers = transfers.filter(transfer => {
        // Filter by tab (status)
        if (activeTab !== 'all' && transfer.status !== activeTab) {
            return false;
        }
        
        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                transfer.product_name.toLowerCase().includes(query) ||
                transfer.from_branch_name.toLowerCase().includes(query) ||
                transfer.to_branch_name.toLowerCase().includes(query) ||
                transfer.requested_by_name.toLowerCase().includes(query)
            );
        }
        
        return true;
    });

    // Calculate stats
    const stats = {
        pending: transfers.filter(t => t.status === 'pending').length,
        approved: transfers.filter(t => t.status === 'approved').length,
        inTransit: transfers.filter(t => t.status === 'in_transit').length,
        completed: transfers.filter(t => t.status === 'completed').length,
    };

    const handleApprove = (transferId: string) => {
        message.success('Transfer approved');
        setTransfers(transfers.map(t => 
            t.transfer_id === transferId 
                ? { ...t, status: 'approved' as TransferStatus, approved_at: new Date().toISOString(), approved_by_name: user?.full_name }
                : t
        ));
    };

    const handleReject = (transferId: string) => {
        message.info('Transfer rejected');
        setTransfers(transfers.map(t => 
            t.transfer_id === transferId 
                ? { ...t, status: 'cancelled' as TransferStatus }
                : t
        ));
    };

    const handleMarkInTransit = (transferId: string) => {
        message.success('Marked as in transit');
        setTransfers(transfers.map(t => 
            t.transfer_id === transferId 
                ? { ...t, status: 'in_transit' as TransferStatus }
                : t
        ));
    };

    const handleMarkCompleted = (transferId: string) => {
        message.success('Transfer completed');
        setTransfers(transfers.map(t => 
            t.transfer_id === transferId 
                ? { ...t, status: 'completed' as TransferStatus, completed_at: new Date().toISOString() }
                : t
        ));
    };

    const handleNewTransfer = () => {
        form.validateFields().then((values) => {
            const newTransfer: StockTransfer = {
                transfer_id: `t${Date.now()}`,
                from_branch_id: values.from_branch_id,
                from_branch_name: branches.find(b => b.branch_id === values.from_branch_id)?.name || '',
                to_branch_id: values.to_branch_id,
                to_branch_name: branches.find(b => b.branch_id === values.to_branch_id)?.name || '',
                product_id: 'new-product',
                product_name: values.product_name,
                quantity: values.quantity,
                status: 'pending',
                requested_by_id: user?.admin_id || '',
                requested_by_name: user?.full_name || '',
                notes: values.notes,
                requested_at: new Date().toISOString(),
            };
            
            setTransfers([newTransfer, ...transfers]);
            setIsNewTransferModalOpen(false);
            form.resetFields();
            message.success('Transfer request created');
        });
    };

    const getStatusConfig = (status: TransferStatus) => {
        return TRANSFER_STATUS_CONFIG[status] || { label: status, color: '#8c8c8c', bgColor: '#f0f0f0' };
    };

    const columns: ColumnsType<StockTransfer> = [
        {
            title: 'Transfer',
            key: 'transfer',
            render: (_, record) => (
                <Space orientation="vertical" size={0}>
                    <Text strong>{record.product_name}</Text>
                    {record.variant_name && (
                        <Text type="secondary" style={{ fontSize: 12 }}>{record.variant_name}</Text>
                    )}
                    <Tag color="blue" style={{ marginTop: 4 }}>Qty: {record.quantity}</Tag>
                </Space>
            ),
        },
        {
            title: 'From → To',
            key: 'branches',
            render: (_, record) => (
                <Space>
                    <Tag icon={<ShopOutlined />}>{record.from_branch_name}</Tag>
                    <SwapOutlined />
                    <Tag icon={<ShopOutlined />} color="green">{record.to_branch_name}</Tag>
                </Space>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            filters: [
                { text: 'Pending', value: 'pending' },
                { text: 'Approved', value: 'approved' },
                { text: 'In Transit', value: 'in_transit' },
                { text: 'Completed', value: 'completed' },
                { text: 'Cancelled', value: 'cancelled' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (_, record) => {
                const config = getStatusConfig(record.status);
                return (
                    <Tag 
                        style={{ 
                            color: config.color, 
                            backgroundColor: config.bgColor,
                            border: `1px solid ${config.color}`,
                        }}
                    >
                        {config.label}
                    </Tag>
                );
            },
        },
        {
            title: 'Requested',
            key: 'requested',
            sorter: (a, b) => new Date(a.requested_at).getTime() - new Date(b.requested_at).getTime(),
            render: (_, record) => (
                <Space orientation="vertical" size={0}>
                    <Text>{record.requested_by_name}</Text>
                    <Tooltip title={dayjs(record.requested_at).format('YYYY-MM-DD HH:mm')}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            <ClockCircleOutlined /> {dayjs(record.requested_at).fromNow()}
                        </Text>
                    </Tooltip>
                </Space>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            render: (_, record) => {
                if (record.status === 'pending' && canApprove) {
                    return (
                        <Space>
                            <Popconfirm
                                title="Approve this transfer?"
                                onConfirm={() => handleApprove(record.transfer_id)}
                            >
                                <Button type="primary" size="small" icon={<CheckOutlined />}>
                                    Approve
                                </Button>
                            </Popconfirm>
                            <Popconfirm
                                title="Reject this transfer?"
                                onConfirm={() => handleReject(record.transfer_id)}
                            >
                                <Button danger size="small" icon={<CloseOutlined />}>
                                    Reject
                                </Button>
                            </Popconfirm>
                        </Space>
                    );
                }
                
                if (record.status === 'approved' && canApprove) {
                    return (
                        <Button 
                            size="small" 
                            icon={<SendOutlined />}
                            onClick={() => handleMarkInTransit(record.transfer_id)}
                        >
                            Mark In Transit
                        </Button>
                    );
                }
                
                if (record.status === 'in_transit' && canApprove) {
                    return (
                        <Button 
                            type="primary"
                            size="small" 
                            icon={<CheckOutlined />}
                            onClick={() => handleMarkCompleted(record.transfer_id)}
                        >
                            Complete
                        </Button>
                    );
                }
                
                return <Text type="secondary">—</Text>;
            },
        },
    ];

    const tabItems = [
        { key: 'all', label: `All (${transfers.length})` },
        { key: 'pending', label: `Pending (${stats.pending})` },
        { key: 'approved', label: `Approved (${stats.approved})` },
        { key: 'in_transit', label: `In Transit (${stats.inTransit})` },
        { key: 'completed', label: `Completed (${stats.completed})` },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" tip="Loading transfers..." />
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
                            <SwapOutlined />
                            Stock Transfers
                        </Space>
                    </Title>
                    <Text type="secondary">Manage stock transfer requests between branches</Text>
                </div>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setIsNewTransferModalOpen(true)}
                >
                    New Transfer Request
                </Button>
            </div>

            {error && (
                <Alert message={error} type="warning" showIcon closable style={{ marginBottom: '24px' }} />
            )}

            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={12} sm={6}>
                    <Card style={{ borderLeft: '4px solid #d97706' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary">Pending</Text>
                            <Title level={3} style={{ margin: '8px 0 0', color: '#d97706' }}>{stats.pending}</Title>
                        </div>
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderLeft: '4px solid #2563eb' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary">Approved</Text>
                            <Title level={3} style={{ margin: '8px 0 0', color: '#2563eb' }}>{stats.approved}</Title>
                        </div>
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderLeft: '4px solid #7c3aed' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary">In Transit</Text>
                            <Title level={3} style={{ margin: '8px 0 0', color: '#7c3aed' }}>{stats.inTransit}</Title>
                        </div>
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderLeft: '4px solid #16a34a' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary">Completed</Text>
                            <Title level={3} style={{ margin: '8px 0 0', color: '#16a34a' }}>{stats.completed}</Title>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Filters & Table */}
            <Card>
                <Space orientation="vertical" style={{ width: '100%' }} size="large">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                        <Tabs 
                            activeKey={activeTab} 
                            onChange={setActiveTab}
                            items={tabItems}
                        />
                        <Search
                            placeholder="Search transfers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: 250 }}
                            allowClear
                            prefix={<SearchOutlined />}
                        />
                    </div>

                    <Table
                        dataSource={filteredTransfers}
                        columns={columns}
                        rowKey="transfer_id"
                        pagination={{ pageSize: 10, showSizeChanger: true }}
                    />
                </Space>
            </Card>

            {/* New Transfer Modal */}
            <Modal
                title="New Stock Transfer Request"
                open={isNewTransferModalOpen}
                onOk={handleNewTransfer}
                onCancel={() => {
                    setIsNewTransferModalOpen(false);
                    form.resetFields();
                }}
                okText="Submit Request"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="from_branch_id"
                        label="From Branch"
                        rules={[{ required: true, message: 'Please select source branch' }]}
                    >
                        <Select placeholder="Select source branch">
                            {branches.map((branch) => (
                                <Select.Option key={branch.branch_id} value={branch.branch_id}>
                                    {branch.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="to_branch_id"
                        label="To Branch"
                        rules={[{ required: true, message: 'Please select destination branch' }]}
                    >
                        <Select placeholder="Select destination branch">
                            {branches.map((branch) => (
                                <Select.Option key={branch.branch_id} value={branch.branch_id}>
                                    {branch.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="product_name"
                        label="Product"
                        rules={[{ required: true, message: 'Please enter product name' }]}
                    >
                        <Input placeholder="Enter product name" />
                    </Form.Item>

                    <Form.Item
                        name="quantity"
                        label="Quantity"
                        rules={[{ required: true, message: 'Please enter quantity' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="Enter quantity" />
                    </Form.Item>

                    <Form.Item
                        name="notes"
                        label="Notes"
                    >
                        <TextArea rows={3} placeholder="Add any notes or reason for transfer" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default StockTransfers;
