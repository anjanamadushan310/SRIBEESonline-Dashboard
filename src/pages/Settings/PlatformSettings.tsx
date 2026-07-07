/**
 * Platform Settings (Module 7.6) — Super Admin only.
 * Data-driven configuration that removes hardcoded values (delivery fee, tax
 * rate, splash video URL). TanStack Query against /api/v1/admin/settings.
 */
import React, { useEffect } from 'react';
import {
    Card,
    Form,
    InputNumber,
    Input,
    Button,
    Space,
    Typography,
    Skeleton,
    Alert,
    App,
} from 'antd';
import { SaveOutlined, DollarOutlined, MobileOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../api/settings.api';
import type { PlatformSettings as PlatformSettingsType } from '../../api/settings.api';

const { Title, Text } = Typography;

const SETTINGS_KEY = ['admin', 'platformSettings'];

const PlatformSettings: React.FC = () => {
    const { message } = App.useApp();
    const queryClient = useQueryClient();
    const [form] = Form.useForm<PlatformSettingsType>();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: SETTINGS_KEY,
        queryFn: settingsApi.get,
    });

    useEffect(() => {
        if (data) {
            form.setFieldsValue({
                flat_delivery_fee: data.flat_delivery_fee,
                order_tax_rate_percent: data.order_tax_rate_percent,
                splash_video_url: data.splash_video_url ?? undefined,
            });
        }
    }, [data, form]);

    const saveMutation = useMutation({
        mutationFn: (payload: Partial<PlatformSettingsType>) => settingsApi.update(payload),
        onSuccess: (updated) => {
            message.success('Settings saved.');
            queryClient.setQueryData(SETTINGS_KEY, updated);
        },
        onError: (err: any) =>
            message.error(err.response?.data?.detail || 'Failed to save settings.'),
    });

    const handleSave = async () => {
        const values = await form.validateFields();
        saveMutation.mutate({
            flat_delivery_fee: values.flat_delivery_fee,
            order_tax_rate_percent: values.order_tax_rate_percent,
            splash_video_url: values.splash_video_url?.trim() || null,
        });
    };

    if (isError) {
        return (
            <Alert
                type="error"
                showIcon
                message="Failed to load settings"
                description={(error as any)?.response?.data?.detail || 'Please try again.'}
            />
        );
    }

    return (
        <div style={{ maxWidth: 760 }}>
            <Title level={3} style={{ marginTop: 0 }}>
                Platform Settings
            </Title>
            <Text type="secondary">
                Global configuration used across checkout and the mobile app.
            </Text>

            {isLoading ? (
                <Card style={{ marginTop: 16 }}>
                    <Skeleton active paragraph={{ rows: 6 }} />
                </Card>
            ) : (
                <Form form={form} layout="vertical" style={{ marginTop: 16 }} requiredMark={false}>
                    <Card
                        title={
                            <Space>
                                <DollarOutlined />
                                Checkout &amp; Pricing
                            </Space>
                        }
                        style={{ marginBottom: 16 }}
                    >
                        <Form.Item
                            label="Flat Delivery Fee"
                            name="flat_delivery_fee"
                            rules={[{ required: true, message: 'Enter a delivery fee' }]}
                            extra="Applied to every non-empty cart at checkout."
                        >
                            <InputNumber
                                min={0}
                                step={10}
                                style={{ width: 240 }}
                                addonBefore="Rs"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Order Tax Rate"
                            name="order_tax_rate_percent"
                            rules={[{ required: true, message: 'Enter a tax rate' }]}
                            extra="Percentage applied to the discounted subtotal (0 = no tax)."
                        >
                            <InputNumber
                                min={0}
                                max={100}
                                step={0.5}
                                style={{ width: 240 }}
                                addonAfter="%"
                            />
                        </Form.Item>
                    </Card>

                    <Card
                        title={
                            <Space>
                                <MobileOutlined />
                                Mobile App Config
                            </Space>
                        }
                        style={{ marginBottom: 16 }}
                    >
                        <Form.Item
                            label="Splash Screen Video URL"
                            name="splash_video_url"
                            rules={[{ type: 'url', message: 'Enter a valid URL', warningOnly: false }]}
                            extra="Shown when the Flutter app launches. Leave blank to disable."
                        >
                            <Input placeholder="https://cdn.sribees.lk/splash.mp4" allowClear />
                        </Form.Item>
                    </Card>

                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        size="large"
                        loading={saveMutation.isPending}
                        onClick={handleSave}
                    >
                        Save Settings
                    </Button>
                </Form>
            )}
        </div>
    );
};

export default PlatformSettings;
