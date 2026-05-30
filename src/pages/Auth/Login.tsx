import React, { useState } from 'react';
import { Form, Input, Button, Card, App, Select, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { DEMO_USERS } from '../../types/admin.types';

const { Option } = Select;

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [selectedDemo, setSelectedDemo] = useState<string>('');
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const { message } = App.useApp();

    const onFinish = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            const response = await authApi.login(values);

            if (response.success) {
                login(response.data.admin, response.data.token);
                message.success('Login successful!');
                navigate('/');
            } else {
                message.error('Login failed. Please check your credentials.');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            message.error(error.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoSelect = (value: string) => {
        setSelectedDemo(value);
        const demoUser = DEMO_USERS[value as keyof typeof DEMO_USERS];
        if (demoUser) {
            form.setFieldsValue({
                email: demoUser.email,
                password: demoUser.password,
            });
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
        >
            <Card
                title={
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ margin: 0, fontSize: 28 }}>🛒 FreshCart</h1>
                        <p style={{ margin: '8px 0 0', color: '#666' }}>Admin Dashboard</p>
                    </div>
                }
                style={{ width: 450, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            >
                <Alert
                    title="Role-Based Access Control Enabled"
                    description="Select a demo role below to test different permission levels"
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />

                <Form
                    form={form}
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    size="large"
                >
                    <Form.Item label="Quick Demo Login">
                        <Select
                            placeholder="Select a demo role"
                            onChange={handleDemoSelect}
                            value={selectedDemo || undefined}
                        >
                            <Option value="superAdmin">
                                🔑 Super Admin - Full Access
                            </Option>
                            <Option value="branchManager">
                                🏪 Branch Manager - Branch Management
                            </Option>
                            <Option value="staff">
                                👤 Staff - Basic Operations
                            </Option>
                            <Option value="support">
                                💬 Support - Customer Support
                            </Option>
                            <Option value="inventory">
                                📦 Inventory - Stock Management
                            </Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email!' },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Email"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                        >
                            Log in
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                    <p style={{ margin: 0, fontSize: 12, color: '#666', fontWeight: 'bold' }}>
                        Demo Credentials:
                    </p>
                    {Object.entries(DEMO_USERS).map(([key, user]) => (
                        <div key={key} style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                            <strong>{user.name}:</strong> {user.email} / {user.password}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default Login;
