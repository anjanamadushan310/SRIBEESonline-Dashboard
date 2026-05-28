import React, { useState, useMemo } from 'react';
import { Layout, Menu, theme, Tag } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    ShoppingOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BarChartOutlined,
    SettingOutlined,
    MobileOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { usePermissions } from '../../hooks/usePermissions';
import { ROLE_NAMES, AdminRole } from '../../types/admin.types';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const { canAccessRoute, role } = usePermissions();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // Define all menu items with their required permissions
    const allMenuItems: MenuProps['items'] = useMemo(() => [
        {
            key: '/',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/products',
            icon: <ShoppingOutlined />,
            label: 'Products',
        },
        {
            key: '/orders',
            icon: <ShoppingCartOutlined />,
            label: 'Orders',
        },
        {
            key: '/customers',
            icon: <UserOutlined />,
            label: 'Customers',
        },
        {
            key: '/analytics',
            icon: <BarChartOutlined />,
            label: 'Analytics',
        },
        {
            key: '/settings',
            icon: <SettingOutlined />,
            label: 'Settings',
            children: [
                {
                    key: '/settings',
                    label: 'General',
                },
                // App Settings - Only visible to Super Admin
                ...(user?.role === AdminRole.SUPER_ADMIN ? [{
                    key: '/settings/app',
                    icon: <MobileOutlined />,
                    label: 'App Settings',
                }] : []),
            ],
        },
    ], [user?.role]);

    // Filter menu items based on user permissions
    const menuItems = useMemo(() => {
        return allMenuItems.filter((item) => {
            if (!item || typeof item.key !== 'string') return false;
            return canAccessRoute(item.key);
        });
    }, [allMenuItems, canAccessRoute]);

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        navigate(e.key);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div
                    style={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: collapsed ? 16 : 20,
                        fontWeight: 'bold',
                    }}
                >
                    {collapsed ? 'FC' : 'FreshCart'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: '0 24px',
                        background: colorBgContainer,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                            className: 'trigger',
                            onClick: () => setCollapsed(!collapsed),
                            style: { fontSize: 18, cursor: 'pointer' },
                        })}
                        <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {user?.branch_name && (
                            <Tag color="blue">{user.branch_name}</Tag>
                        )}
                        {role && (
                            <Tag color="green">{ROLE_NAMES[role]}</Tag>
                        )}
                        <span>Welcome, {user?.full_name || 'Admin'}</span>
                        <LogoutOutlined
                            onClick={handleLogout}
                            style={{ fontSize: 18, cursor: 'pointer' }}
                        />
                    </div>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
