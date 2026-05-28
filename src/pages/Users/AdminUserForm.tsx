/**
 * Admin User Form Page
 * Create or edit admin users
 */

import React, { useEffect, useState } from 'react';
import { 
    Card, 
    Form, 
    Input, 
    Select, 
    Button, 
    Space, 
    Typography,
    Switch,
    Divider,
    Alert,
    Spin,
    message,
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    LockOutlined,
    SaveOutlined,
    ArrowLeftOutlined,
    ShopOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useBranchStore } from '../../store/branchStore';
import { AdminRole } from '../../types/admin.types';

const { Title, Text } = Typography;

// Role labels for display
const AdminRoleLabels: Record<string, string> = {
    [AdminRole.SUPER_ADMIN]: 'Super Admin',
    [AdminRole.BRANCH_MANAGER]: 'Branch Manager',
    [AdminRole.STAFF]: 'Staff',
    [AdminRole.SUPPORT]: 'Support',
    [AdminRole.INVENTORY]: 'Inventory Manager',
};

interface AdminUserFormData {
    email: string;
    full_name: string;
    password?: string;
    role: string;
    branch_id: string | null;
    is_active: boolean;
}

const AdminUserForm: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = !!id && id !== 'new';
    
    const { branches } = useBranchStore();
    const [form] = Form.useForm<AdminUserFormData>();
    
    const selectedRole = Form.useWatch('role', form);
    const requiresBranch = selectedRole === AdminRole.BRANCH_MANAGER || selectedRole === AdminRole.STAFF;

    useEffect(() => {
        if (isEditing) {
            fetchUser();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isEditing]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            setError(null);

            // Mock fetch - in production, fetch from API
            // Simulating API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Mock user data
            const mockUser: AdminUserFormData = {
                email: 'manager.colombo@freshcart.com',
                full_name: 'Colombo Manager',
                role: AdminRole.BRANCH_MANAGER,
                branch_id: '44444444-4444-4444-4444-444444444444',
                is_active: true,
            };

            form.setFieldsValue(mockUser);

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load user';
            console.error('Fetch user error:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values: AdminUserFormData) => {
        try {
            setSubmitting(true);
            setError(null);

            // In production, call API to create/update user
            console.log('Submitting user:', values);
            
            // Simulating API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            message.success(isEditing ? 'User updated successfully' : 'User created successfully');
            navigate('/users');

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save user';
            console.error('Submit error:', err);
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" tip="Loading user..." />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <Button 
                    type="text" 
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/users')}
                    style={{ marginBottom: 8 }}
                >
                    Back to Users
                </Button>
                <Title level={2} style={{ margin: 0 }}>
                    <Space>
                        <UserOutlined />
                        {isEditing ? 'Edit Admin User' : 'Create Admin User'}
                    </Space>
                </Title>
                <Text type="secondary">
                    {isEditing ? 'Update user details and permissions' : 'Add a new admin user to the system'}
                </Text>
            </div>

            {error && (
                <Alert message={error} type="error" showIcon closable style={{ marginBottom: '24px' }} />
            )}

            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        is_active: true,
                        role: AdminRole.STAFF,
                    }}
                >
                    {/* Basic Information */}
                    <Title level={5}>Basic Information</Title>
                    
                    <Form.Item
                        name="full_name"
                        label="Full Name"
                        rules={[
                            { required: true, message: 'Please enter full name' },
                            { min: 2, message: 'Name must be at least 2 characters' },
                        ]}
                    >
                        <Input 
                            prefix={<UserOutlined />} 
                            placeholder="Enter full name" 
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                            { required: true, message: 'Please enter email address' },
                            { type: 'email', message: 'Please enter a valid email' },
                        ]}
                    >
                        <Input 
                            prefix={<MailOutlined />} 
                            placeholder="Enter email address" 
                            size="large"
                            disabled={isEditing}
                        />
                    </Form.Item>

                    {!isEditing && (
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                { required: true, message: 'Please enter password' },
                                { min: 8, message: 'Password must be at least 8 characters' },
                            ]}
                        >
                            <Input.Password 
                                prefix={<LockOutlined />} 
                                placeholder="Enter password" 
                                size="large"
                            />
                        </Form.Item>
                    )}

                    <Divider />

                    {/* Role & Branch */}
                    <Title level={5}>Role & Permissions</Title>
                    
                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: 'Please select a role' }]}
                    >
                        <Select size="large" placeholder="Select role">
                            {Object.entries(AdminRoleLabels).map(([value, label]) => (
                                <Select.Option key={value} value={value}>{label as string}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="branch_id"
                        label="Assigned Branch"
                        rules={[
                            { 
                                required: requiresBranch, 
                                message: 'Branch is required for Manager and Staff roles' 
                            },
                        ]}
                        extra={
                            !requiresBranch 
                                ? 'Super Admin and Inventory roles have access to all branches' 
                                : 'This user will only have access to the selected branch'
                        }
                    >
                        <Select 
                            size="large" 
                            placeholder="Select branch"
                            allowClear={!requiresBranch}
                            disabled={!requiresBranch && selectedRole !== undefined}
                            suffixIcon={<ShopOutlined />}
                        >
                            {branches.map((branch) => (
                                <Select.Option key={branch.branch_id} value={branch.branch_id}>
                                    {branch.name} - {branch.district}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Divider />

                    {/* Status */}
                    <Title level={5}>Account Status</Title>
                    
                    <Form.Item
                        name="is_active"
                        label="Active"
                        valuePropName="checked"
                        extra="Inactive users cannot log in to the admin dashboard"
                    >
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>

                    <Divider />

                    {/* Actions */}
                    <Form.Item>
                        <Space>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                icon={<SaveOutlined />}
                                loading={submitting}
                                size="large"
                            >
                                {isEditing ? 'Update User' : 'Create User'}
                            </Button>
                            <Button 
                                onClick={() => navigate('/users')}
                                size="large"
                            >
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default AdminUserForm;
