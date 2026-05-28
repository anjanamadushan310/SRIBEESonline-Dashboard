/**
 * Admin User List Page
 * Manage admin users across branches (Super Admin only)
 */

import React, { useEffect, useState } from 'react';
import { 
    Card, 
    Table, 
    Spin, 
    Alert, 
    Select, 
    Tag, 
    Space, 
    Typography,
    Button,
    Input,
    Popconfirm,
    message,
    Avatar,
    Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    UserOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ShopOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useBranchStore } from '../../store/branchStore';
import { AdminRole } from '../../types/admin.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// Role labels for display
const AdminRoleLabels: Record<string, string> = {
    [AdminRole.SUPER_ADMIN]: 'Super Admin',
    [AdminRole.BRANCH_MANAGER]: 'Branch Manager',
    [AdminRole.STAFF]: 'Staff',
    [AdminRole.SUPPORT]: 'Support',
    [AdminRole.INVENTORY]: 'Inventory Manager',
};
const { Search } = Input;

interface AdminUser {
    admin_id: string;
    email: string;
    full_name: string;
    role: string;
    branch_id: string | null;
    branch_name: string | null;
    is_active: boolean;
    created_at: string;
    last_login: string | null;
}

const AdminUserList: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string | null>(null);
    const [branchFilter, setBranchFilter] = useState<string | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);

    const navigate = useNavigate();
    const { branches } = useBranchStore();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            // Mock data - in production, fetch from API
            const mockUsers: AdminUser[] = [
                {
                    admin_id: 'a1',
                    email: 'superadmin@freshcart.com',
                    full_name: 'Super Admin',
                    role: AdminRole.SUPER_ADMIN,
                    branch_id: null,
                    branch_name: null,
                    is_active: true,
                    created_at: '2025-01-01T00:00:00Z',
                    last_login: '2026-01-29T08:00:00Z',
                },
                {
                    admin_id: 'a2',
                    email: 'manager.colombo@freshcart.com',
                    full_name: 'Colombo Manager',
                    role: AdminRole.BRANCH_MANAGER,
                    branch_id: '44444444-4444-4444-4444-444444444444',
                    branch_name: 'Colombo Central',
                    is_active: true,
                    created_at: '2025-02-15T00:00:00Z',
                    last_login: '2026-01-28T14:00:00Z',
                },
                {
                    admin_id: 'a3',
                    email: 'staff.colombo@freshcart.com',
                    full_name: 'Colombo Staff',
                    role: AdminRole.STAFF,
                    branch_id: '44444444-4444-4444-4444-444444444444',
                    branch_name: 'Colombo Central',
                    is_active: true,
                    created_at: '2025-03-10T00:00:00Z',
                    last_login: '2026-01-29T09:00:00Z',
                },
                {
                    admin_id: 'a4',
                    email: 'inventory@freshcart.com',
                    full_name: 'Inventory Manager',
                    role: AdminRole.INVENTORY,
                    branch_id: null,
                    branch_name: null,
                    is_active: true,
                    created_at: '2025-04-01T00:00:00Z',
                    last_login: '2026-01-27T16:00:00Z',
                },
                {
                    admin_id: 'a5',
                    email: 'manager.kandy@freshcart.com',
                    full_name: 'Kandy Manager',
                    role: AdminRole.BRANCH_MANAGER,
                    branch_id: '55555555-5555-5555-5555-555555555555',
                    branch_name: 'Kandy City',
                    is_active: false,
                    created_at: '2025-05-20T00:00:00Z',
                    last_login: '2026-01-15T10:00:00Z',
                },
            ];

            setUsers(mockUsers);

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load users';
            console.error('Users error:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Filter users
    const filteredUsers = users.filter(user => {
        // Role filter
        if (roleFilter && user.role !== roleFilter) {
            return false;
        }
        
        // Branch filter
        if (branchFilter && user.branch_id !== branchFilter) {
            return false;
        }
        
        // Search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                user.full_name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)
            );
        }
        
        return true;
    });

    const handleDelete = (userId: string) => {
        setUsers(users.filter(u => u.admin_id !== userId));
        message.success('User deleted');
    };

    const handleToggleStatus = (userId: string) => {
        setUsers(users.map(u => 
            u.admin_id === userId ? { ...u, is_active: !u.is_active } : u
        ));
        message.success('User status updated');
    };

    const getRoleColor = (role: string): string => {
        const colors: Record<string, string> = {
            [AdminRole.SUPER_ADMIN]: 'red',
            [AdminRole.BRANCH_MANAGER]: 'blue',
            [AdminRole.STAFF]: 'green',
            [AdminRole.INVENTORY]: 'purple',
            [AdminRole.SUPPORT]: 'orange',
        };
        return colors[role] || 'default';
    };

    const columns: ColumnsType<AdminUser> = [
        {
            title: 'User',
            key: 'user',
            render: (_, record) => (
                <Space>
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: record.is_active ? '#1890ff' : '#d9d9d9' }} />
                    <Space orientation="vertical" size={0}>
                        <Text strong>{record.full_name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
                    </Space>
                </Space>
            ),
        },
        {
            title: 'Role',
            key: 'role',
            filters: Object.entries(AdminRoleLabels).map(([value, text]) => ({ text: text as string, value })),
            onFilter: (value, record) => record.role === value,
            render: (_, record) => (
                <Tag color={getRoleColor(record.role)}>
                    {AdminRoleLabels[record.role as keyof typeof AdminRoleLabels] || record.role}
                </Tag>
            ),
        },
        {
            title: 'Branch',
            key: 'branch',
            render: (_, record) => (
                record.branch_name ? (
                    <Tag icon={<ShopOutlined />}>{record.branch_name}</Tag>
                ) : (
                    <Text type="secondary">All Branches</Text>
                )
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
            title: 'Last Login',
            key: 'last_login',
            sorter: (a, b) => {
                if (!a.last_login) return 1;
                if (!b.last_login) return -1;
                return new Date(a.last_login).getTime() - new Date(b.last_login).getTime();
            },
            render: (_, record) => (
                record.last_login ? (
                    <Tooltip title={dayjs(record.last_login).format('YYYY-MM-DD HH:mm')}>
                        <Text>{dayjs(record.last_login).fromNow()}</Text>
                    </Tooltip>
                ) : (
                    <Text type="secondary">Never</Text>
                )
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
                            onClick={() => navigate(`/users/${record.admin_id}/edit`)}
                        />
                    </Tooltip>
                    <Tooltip title={record.is_active ? 'Deactivate' : 'Activate'}>
                        <Button 
                            type="text" 
                            icon={record.is_active ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                            onClick={() => handleToggleStatus(record.admin_id)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete this user?"
                        description="This action cannot be undone."
                        onConfirm={() => handleDelete(record.admin_id)}
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Delete">
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" tip="Loading users..." />
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
                            <UserOutlined />
                            Admin Users
                        </Space>
                    </Title>
                    <Text type="secondary">Manage admin users and their permissions</Text>
                </div>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/users/new')}
                >
                    Add Admin User
                </Button>
            </div>

            {error && (
                <Alert message={error} type="warning" showIcon closable style={{ marginBottom: '24px' }} />
            )}

            {/* Filters */}
            <Card style={{ marginBottom: '24px' }}>
                <Space wrap size="middle">
                    <Search
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: 250 }}
                        allowClear
                        prefix={<SearchOutlined />}
                    />
                    <Select
                        placeholder="Filter by role"
                        value={roleFilter}
                        onChange={setRoleFilter}
                        style={{ width: 180 }}
                        allowClear
                    >
                        {Object.entries(AdminRoleLabels).map(([value, label]) => (
                            <Select.Option key={value} value={value}>{label as string}</Select.Option>
                        ))}
                    </Select>
                    <Select
                        placeholder="Filter by branch"
                        value={branchFilter}
                        onChange={setBranchFilter}
                        style={{ width: 180 }}
                        allowClear
                    >
                        {branches.map((branch) => (
                            <Select.Option key={branch.branch_id} value={branch.branch_id}>
                                {branch.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Space>
            </Card>

            {/* Users Table */}
            <Card>
                <Table
                    dataSource={filteredUsers}
                    columns={columns}
                    rowKey="admin_id"
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                />
            </Card>
        </div>
    );
};

export default AdminUserList;
