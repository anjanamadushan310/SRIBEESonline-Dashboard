/**
 * LowStockAlert Component
 * Shows low stock notifications with branch-specific filtering
 */

import React from 'react';
import { 
    Card, 
    List, 
    Tag, 
    Space, 
    Typography, 
    Progress, 
    Button,
    Avatar, 
    Tooltip,
    Empty,
    Dropdown,
} from 'antd';
import type { MenuProps } from 'antd';
import {
    WarningOutlined,
    ExclamationCircleOutlined,
    ShopOutlined,
    InboxOutlined,
    MoreOutlined,
    SendOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { LowStockAlert as LowStockAlertType } from '../../types/branch.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

interface LowStockAlertProps {
    alerts: LowStockAlertType[];
    loading?: boolean;
    showBranch?: boolean;
    onRequestTransfer?: (alert: LowStockAlertType) => void;
    onDismiss?: (alertId: string) => void;
    onViewProduct?: (productId: string) => void;
    maxItems?: number;
}

const LowStockAlertComponent: React.FC<LowStockAlertProps> = ({
    alerts,
    loading = false,
    showBranch = true,
    onRequestTransfer,
    onDismiss,
    onViewProduct,
    maxItems,
}) => {
    const navigate = useNavigate();

    const getSeverityConfig = (severity: LowStockAlertType['severity']) => {
        switch (severity) {
            case 'critical':
                return { color: '#ff4d4f', icon: <ExclamationCircleOutlined />, label: 'Critical', bgColor: '#fff1f0' };
            case 'warning':
                return { color: '#faad14', icon: <WarningOutlined />, label: 'Warning', bgColor: '#fffbe6' };
            default:
                return { color: '#1890ff', icon: <InboxOutlined />, label: 'Low', bgColor: '#e6f7ff' };
        }
    };

    const getStockPercentage = (current: number, min: number): number => {
        return Math.round((current / min) * 100);
    };

    const getProgressStatus = (percentage: number): 'exception' | 'normal' | 'success' => {
        if (percentage <= 25) return 'exception';
        if (percentage <= 50) return 'normal';
        return 'success';
    };

    const displayAlerts = maxItems ? alerts.slice(0, maxItems) : alerts;

    // Sort by severity (critical first) and then by stock level
    const sortedAlerts = [...displayAlerts].sort((a, b) => {
        const severityOrder = { critical: 0, warning: 1, low: 2 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
            return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return a.current_stock - b.current_stock;
    });

    const getMenuItems = (alert: LowStockAlertType): MenuProps['items'] => [
        {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'View Product',
            onClick: () => onViewProduct?.(alert.product_id) || navigate(`/products/${alert.product_id}`),
        },
        {
            key: 'transfer',
            icon: <SendOutlined />,
            label: 'Request Transfer',
            onClick: () => onRequestTransfer?.(alert),
        },
        {
            type: 'divider',
        },
        {
            key: 'dismiss',
            label: 'Dismiss Alert',
            onClick: () => onDismiss?.(alert.inventory_id),
            danger: true,
        },
    ];

    if (!alerts.length) {
        return (
            <Card>
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <Space orientation="vertical" size={0}>
                            <Text>No Low Stock Alerts</Text>
                            <Text type="secondary">All inventory levels are healthy</Text>
                        </Space>
                    }
                />
            </Card>
        );
    }

    return (
        <List
            loading={loading}
            dataSource={sortedAlerts}
            renderItem={(alert) => {
                const severityConfig = getSeverityConfig(alert.severity);
                const stockPercentage = getStockPercentage(alert.current_stock, alert.threshold);

                return (
                    <Card 
                        size="small" 
                        style={{ 
                            marginBottom: 12, 
                            borderLeft: `4px solid ${severityConfig.color}`,
                            backgroundColor: severityConfig.bgColor,
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            {/* Left: Product Info */}
                            <div style={{ flex: 1 }}>
                                <Space align="start">
                                    <Avatar 
                                        style={{ backgroundColor: severityConfig.color }}
                                        icon={severityConfig.icon}
                                    />
                                    <div>
                                        <Space>
                                            <Text strong>{alert.product_name}</Text>
                                            {alert.variant_name && (
                                                <Tag>{alert.variant_name}</Tag>
                                            )}
                                        </Space>
                                        {showBranch && alert.branch_name && (
                                            <div>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    <ShopOutlined /> {alert.branch_name}
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                </Space>
                            </div>

                            {/* Center: Stock Progress */}
                            <div style={{ flex: 1, padding: '0 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Progress 
                                        percent={stockPercentage}
                                        size="small"
                                        status={getProgressStatus(stockPercentage)}
                                        style={{ flex: 1, maxWidth: 150 }}
                                        format={() => ''}
                                    />
                                    <Text strong style={{ color: severityConfig.color }}>
                                        {alert.current_stock}
                                    </Text>
                                    <Text type="secondary">/ {alert.threshold}</Text>
                                </div>
                                <Tag 
                                    color={severityConfig.color} 
                                    icon={severityConfig.icon}
                                    style={{ marginTop: 4 }}
                                >
                                    {severityConfig.label}
                                </Tag>
                            </div>

                            {/* Right: Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {onRequestTransfer && (
                                    <Tooltip title="Request Stock Transfer">
                                        <Button 
                                            type="primary" 
                                            size="small" 
                                            icon={<SendOutlined />}
                                            onClick={() => onRequestTransfer(alert)}
                                        >
                                            Request
                                        </Button>
                                    </Tooltip>
                                )}
                                <Dropdown menu={{ items: getMenuItems(alert) }} trigger={['click']}>
                                    <Button type="text" icon={<MoreOutlined />} />
                                </Dropdown>
                            </div>
                        </div>
                    </Card>
                );
            }}
        />
    );
};

export default LowStockAlertComponent;
