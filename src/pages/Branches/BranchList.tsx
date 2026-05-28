/**
 * Branch List Page
 * Manage branches (Super Admin only)
 */

import React, { useEffect, useState } from 'react';
import { 
    Card, 
    Table, 
    Spin, 
    Alert, 
    Tag, 
    Space, 
    Typography,
    Button,
    Input,
    Popconfirm,
    message,
    Modal,
    Form,
    Switch,
    Tooltip,
    Row,
    Col,
    Statistic,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    ShopOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from '@ant-design/icons';
import type { Branch } from '../../types/branch.types';

const { Title, Text } = Typography;
const { Search } = Input;
const { TextArea } = Input;

// Extended Branch type with is_main for UI purposes
interface BranchWithMain extends Omit<Branch, 'state' | 'country' | 'status' | 'updated_at' | 'post_office' | 'district' | 'province'> {
    is_main: boolean;
    city: string;
    post_office?: string;
    district?: string;
    province?: string;
    state?: string;
    country?: string;
    status?: string;
    updated_at?: string;
}

const BranchList: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [branches, setBranches] = useState<BranchWithMain[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<BranchWithMain | null>(null);

    const [form] = Form.useForm();

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            setError(null);

            // Mock data - in production, fetch from API
            const mockBranches: BranchWithMain[] = [
                {
                    branch_id: '44444444-4444-4444-4444-444444444444',
                    name: 'Colombo Central',
                    code: 'COL-CTR',
                    address: '123 Main Street, Colombo 03',
                    city: 'Colombo',
                    phone: '+94 11 234 5678',
                    is_active: true,
                    is_main: true,
                    created_at: '2025-01-01T00:00:00Z',
                },
                {
                    branch_id: '55555555-5555-5555-5555-555555555555',
                    name: 'Kandy City',
                    code: 'KDY-CTY',
                    address: '456 Temple Road, Kandy',
                    city: 'Kandy',
                    phone: '+94 81 234 5678',
                    is_active: true,
                    is_main: false,
                    created_at: '2025-02-15T00:00:00Z',
                },
                {
                    branch_id: '66666666-6666-6666-6666-666666666666',
                    name: 'Galle Fort',
                    code: 'GLE-FRT',
                    address: '789 Fort Road, Galle',
                    city: 'Galle',
                    phone: '+94 91 234 5678',
                    is_active: true,
                    is_main: false,
                    created_at: '2025-03-20T00:00:00Z',
                },
                {
                    branch_id: '77777777-7777-7777-7777-777777777777',
                    name: 'Jaffna North',
                    code: 'JFN-NTH',
                    address: '321 Hospital Road, Jaffna',
                    city: 'Jaffna',
                    phone: '+94 21 234 5678',
                    is_active: false,
                    is_main: false,
                    created_at: '2025-04-10T00:00:00Z',
                },
            ];

            setBranches(mockBranches);

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load branches';
            console.error('Branches error:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Filter branches
    const filteredBranches = branches.filter(branch => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                branch.name.toLowerCase().includes(query) ||
                branch.city.toLowerCase().includes(query) ||
                branch.code.toLowerCase().includes(query)
            );
        }
        return true;
    });

    // Stats
    const stats = {
        total: branches.length,
        active: branches.filter(b => b.is_active).length,
        inactive: branches.filter(b => !b.is_active).length,
    };

    const handleDelete = (branchId: string) => {
        const branch = branches.find(b => b.branch_id === branchId);
        if (branch?.is_main) {
            message.error('Cannot delete the main branch');
            return;
        }
        setBranches(branches.filter(b => b.branch_id !== branchId));
        message.success('Branch deleted');
    };

    const handleToggleStatus = (branchId: string) => {
        setBranches(branches.map(b => 
            b.branch_id === branchId ? { ...b, is_active: !b.is_active } : b
        ));
        message.success('Branch status updated');
    };

    const handleOpenModal = (branch?: BranchWithMain) => {
        if (branch) {
            setEditingBranch(branch);
            form.setFieldsValue(branch);
        } else {
            setEditingBranch(null);
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            if (editingBranch) {
                // Update existing branch
                setBranches(branches.map(b => 
                    b.branch_id === editingBranch.branch_id 
                        ? { ...b, ...values }
                        : b
                ));
                message.success('Branch updated');
            } else {
                // Create new branch
                const newBranch: BranchWithMain = {
                    branch_id: `new-${Date.now()}`,
                    ...values,
                    is_main: false,
                    created_at: new Date().toISOString(),
                };
                setBranches([...branches, newBranch]);
                message.success('Branch created');
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingBranch(null);
        });
    };

    const columns: ColumnsType<BranchWithMain> = [
        {
            title: 'Branch',
            key: 'branch',
            render: (_, record) => (
                <Space orientation="vertical" size={0}>
                    <Space>
                        <Text strong>{record.name}</Text>
                        {record.is_main && <Tag color="gold">Main</Tag>}
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>Code: {record.code}</Text>
                </Space>
            ),
        },
        {
            title: 'Location',
            key: 'location',
            render: (_, record) => (
                <Space orientation="vertical" size={0}>
                    <Space>
                        <EnvironmentOutlined />
                        <Text>{record.city}</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.address}</Text>
                </Space>
            ),
        },
        {
            title: 'Contact',
            key: 'phone',
            render: (_, record) => (
                <Space>
                    <PhoneOutlined />
                    <Text>{record.phone}</Text>
                </Space>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            filters: [
                { text: 'Active', value: true },
                { text: 'Inactive', value: false },
            ],
            onFilter: (value, record) => record.is_active === value,
            render: (_, record) => (
                <Tag 
                    icon={record.is_active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    color={record.is_active ? 'success' : 'error'}
                >
                    {record.is_active ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Edit">
                        <Button 
                            type="text" 
                            icon={<EditOutlined />}
                            onClick={() => handleOpenModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title={record.is_active ? 'Deactivate' : 'Activate'}>
                        <Button 
                            type="text" 
                            icon={record.is_active ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                            onClick={() => handleToggleStatus(record.branch_id)}
                            disabled={record.is_main}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete this branch?"
                        description="This action cannot be undone."
                        onConfirm={() => handleDelete(record.branch_id)}
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                        disabled={record.is_main}
                    >
                        <Tooltip title={record.is_main ? 'Cannot delete main branch' : 'Delete'}>
                            <Button 
                                type="text" 
                                danger 
                                icon={<DeleteOutlined />}
                                disabled={record.is_main}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" tip="Loading branches..." />
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
                            <ShopOutlined />
                            Branches
                        </Space>
                    </Title>
                    <Text type="secondary">Manage store branches and locations</Text>
                </div>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => handleOpenModal()}
                >
                    Add Branch
                </Button>
            </div>

            {error && (
                <Alert message={error} type="warning" showIcon closable style={{ marginBottom: '24px' }} />
            )}

            {/* Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={8}>
                    <Card>
                        <Statistic 
                            title="Total Branches" 
                            value={stats.total}
                            prefix={<ShopOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={8}>
                    <Card>
                        <Statistic 
                            title="Active" 
                            value={stats.active}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={8}>
                    <Card>
                        <Statistic 
                            title="Inactive" 
                            value={stats.inactive}
                            valueStyle={{ color: '#ff4d4f' }}
                            prefix={<CloseCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters & Table */}
            <Card>
                <div style={{ marginBottom: 16 }}>
                    <Search
                        placeholder="Search branches..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: 300 }}
                        allowClear
                        prefix={<SearchOutlined />}
                    />
                </div>

                <Table
                    dataSource={filteredBranches}
                    columns={columns}
                    rowKey="branch_id"
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                />
            </Card>

            {/* Branch Modal */}
            <Modal
                title={editingBranch ? 'Edit Branch' : 'Add New Branch'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setEditingBranch(null);
                }}
                okText={editingBranch ? 'Update' : 'Create'}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Branch Name"
                        rules={[{ required: true, message: 'Please enter branch name' }]}
                    >
                        <Input placeholder="e.g. Colombo Central" />
                    </Form.Item>

                    <Form.Item
                        name="code"
                        label="Branch Code"
                        rules={[{ required: true, message: 'Please enter branch code' }]}
                    >
                        <Input placeholder="e.g. COL-CTR" style={{ textTransform: 'uppercase' }} />
                    </Form.Item>

                    <Form.Item
                        name="city"
                        label="City"
                        rules={[{ required: true, message: 'Please enter city' }]}
                    >
                        <Input placeholder="e.g. Colombo" />
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="Address"
                        rules={[{ required: true, message: 'Please enter address' }]}
                    >
                        <TextArea rows={2} placeholder="Full address" />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Phone"
                        rules={[{ required: true, message: 'Please enter phone number' }]}
                    >
                        <Input placeholder="+94 11 234 5678" />
                    </Form.Item>

                    <Form.Item
                        name="is_active"
                        label="Status"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BranchList;
