import React from 'react';
import { Card, Tabs, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

const Settings: React.FC = () => {
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();

    const handleProfileUpdate = async (_values: any) => {
        try {
            // TODO: replace with real API call to update profile
            message.success('Profile updated successfully');
        } catch (error) {
            message.error('Failed to update profile');
        }
    };

    const handlePasswordChange = async (_values: any) => {
        try {
            // TODO: replace with real API call to change password
            message.success('Password changed successfully');
            passwordForm.resetFields();
        } catch (error) {
            message.error('Failed to change password');
        }
    };

    return (
        <div>
            <h1 style={{ marginBottom: 24 }}>Settings</h1>

            <Card>
                <Tabs defaultActiveKey="profile">
                    <TabPane tab="Profile" key="profile">
                        <Form
                            form={profileForm}
                            layout="vertical"
                            onFinish={handleProfileUpdate}
                            initialValues={{
                                name: 'Admin User',
                                email: 'admin@freshcart.com',
                                phone: '+1234567890',
                            }}
                            style={{ maxWidth: 600 }}
                        >
                            <Form.Item
                                label="Full Name"
                                name="name"
                                rules={[{ required: true, message: 'Please enter your name' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Full Name" />
                            </Form.Item>

                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Please enter your email' },
                                    { type: 'email', message: 'Please enter a valid email' },
                                ]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Email" disabled />
                            </Form.Item>

                            <Form.Item
                                label="Phone"
                                name="phone"
                            >
                                <Input placeholder="Phone Number" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Update Profile
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>

                    <TabPane tab="Change Password" key="password">
                        <Form
                            form={passwordForm}
                            layout="vertical"
                            onFinish={handlePasswordChange}
                            style={{ maxWidth: 600 }}
                        >
                            <Form.Item
                                label="Current Password"
                                name="currentPassword"
                                rules={[{ required: true, message: 'Please enter your current password' }]}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="Current Password" />
                            </Form.Item>

                            <Form.Item
                                label="New Password"
                                name="newPassword"
                                rules={[
                                    { required: true, message: 'Please enter your new password' },
                                    { min: 8, message: 'Password must be at least 8 characters' },
                                ]}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="New Password" />
                            </Form.Item>

                            <Form.Item
                                label="Confirm New Password"
                                name="confirmPassword"
                                dependencies={['newPassword']}
                                rules={[
                                    { required: true, message: 'Please confirm your new password' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Passwords do not match'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="Confirm New Password" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Change Password
                                </Button>
                            </Form.Item>
                        </Form>
                    </TabPane>

                    <TabPane tab="Notifications" key="notifications">
                        <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
                            <p>Notification settings will be available soon.</p>
                        </div>
                    </TabPane>

                    <TabPane tab="System" key="system">
                        <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
                            <p>System settings (Super Admin only) will be available soon.</p>
                        </div>
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default Settings;
