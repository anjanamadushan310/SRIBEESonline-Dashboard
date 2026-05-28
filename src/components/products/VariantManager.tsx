/**
 * VariantManager Component
 * Dynamic UI for managing product variants with branch-specific pricing/stock
 */

import React, { useState, useCallback } from 'react';
import { 
    Card, 
    Table, 
    Button, 
    Input, 
    InputNumber, 
    Space, 
    Typography, 
    Tag, 
    Modal, 
    Form, 
    Tooltip,
    Switch,
    Row,
    Col,
    Empty,
    Popconfirm,
    message,
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    CopyOutlined,
    DollarOutlined,
    InboxOutlined,
    ShopOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from '@ant-design/icons';
import type { ProductVariant, BranchVariantStock } from '../../types/product.types';
import { useBranchStore } from '../../store/branchStore';
import { useAuthStore } from '../../store/authStore';

const { Text, Title } = Typography;

interface VariantManagerProps {
    variants: ProductVariant[];
    onChange: (variants: ProductVariant[]) => void;
    disabled?: boolean;
    productId?: string;
}

const VariantManager: React.FC<VariantManagerProps> = ({
    variants,
    onChange,
    disabled = false,
    productId,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
    const [isBranchStockModalOpen, setIsBranchStockModalOpen] = useState(false);
    const [selectedVariantForStock, setSelectedVariantForStock] = useState<ProductVariant | null>(null);
    const [form] = Form.useForm();
    const [branchStockForm] = Form.useForm();

    const { branches } = useBranchStore();
    const user = useAuthStore((state) => state.user);
    const isSuperAdmin = user?.role === 'super_admin';

    // Generate a unique SKU
    const generateSKU = useCallback((type: string, value: string): string => {
        const prefix = productId?.slice(0, 4).toUpperCase() || 'PRD';
        const typeCode = type.slice(0, 2).toUpperCase();
        const valueCode = value.replace(/\s+/g, '').slice(0, 3).toUpperCase();
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `${prefix}-${typeCode}-${valueCode}-${random}`;
    }, [productId]);

    // Open modal for adding new variant
    const handleAddVariant = () => {
        setEditingVariant(null);
        form.resetFields();
        form.setFieldsValue({
            is_active: true,
            price: 0,
        });
        setIsModalOpen(true);
    };

    // Open modal for editing variant
    const handleEditVariant = (variant: ProductVariant) => {
        setEditingVariant(variant);
        form.setFieldsValue({
            name: variant.name,
            sku: variant.sku,
            price: variant.price || 0,
            stock_quantity: variant.stock_quantity || 0,
            is_active: variant.is_active,
        });
        setIsModalOpen(true);
    };

    // Save variant
    const handleSaveVariant = () => {
        form.validateFields().then((values) => {
            const newVariant: ProductVariant = {
                variant_id: editingVariant?.variant_id || `temp-${Date.now()}`,
                product_id: productId || '',
                name: values.name,
                sku: values.sku || generateSKU('VAR', values.name),
                price: values.price || 0,
                stock_quantity: values.stock_quantity || 0,
                is_active: values.is_active,
                is_default: editingVariant?.is_default || false,
                display_order: editingVariant?.display_order || variants.length + 1,
                options: editingVariant?.options || [],
                branch_stock: editingVariant?.branch_stock || [],
            };

            if (editingVariant) {
                // Update existing
                onChange(variants.map((v) => v.variant_id === editingVariant.variant_id ? newVariant : v));
                message.success('Variant updated');
            } else {
                // Add new
                onChange([...variants, newVariant]);
                message.success('Variant added');
            }

            setIsModalOpen(false);
            form.resetFields();
        });
    };

    // Delete variant
    const handleDeleteVariant = (variantId: string) => {
        onChange(variants.filter((v) => v.variant_id !== variantId));
        message.success('Variant removed');
    };

    // Duplicate variant
    const handleDuplicateVariant = (variant: ProductVariant) => {
        const newVariant: ProductVariant = {
            ...variant,
            variant_id: `temp-${Date.now()}`,
            sku: generateSKU('VAR', variant.name),
            name: `${variant.name} (Copy)`,
            display_order: variants.length + 1,
        };
        onChange([...variants, newVariant]);
        message.success('Variant duplicated');
    };

    // Open branch stock modal
    const handleManageBranchStock = (variant: ProductVariant) => {
        setSelectedVariantForStock(variant);
        
        // Prepare form values from existing branch stock
        const branchStockValues: Record<string, { stock: number; reserved?: number }> = {};
        variant.branch_stock?.forEach((bs) => {
            branchStockValues[bs.branch_id] = {
                stock: bs.stock_quantity,
                reserved: bs.reserved_quantity,
            };
        });
        
        branchStockForm.setFieldsValue({ branches: branchStockValues });
        setIsBranchStockModalOpen(true);
    };

    // Save branch stock
    const handleSaveBranchStock = () => {
        branchStockForm.validateFields().then((values) => {
            if (!selectedVariantForStock) return;

            const branchStock: BranchVariantStock[] = Object.entries(values.branches || {})
                .filter(([, data]) => data && (data as { stock?: number }).stock !== undefined)
                .map(([branchId, data]) => {
                    const stockData = data as { stock: number; reserved?: number };
                    return {
                        branch_id: branchId,
                        branch_name: branches.find(b => b.branch_id === branchId)?.name || '',
                        stock_quantity: stockData.stock,
                        reserved_quantity: stockData.reserved || 0,
                        low_stock_threshold: 5,
                        is_low_stock: stockData.stock < 5,
                    };
                });

            const updatedVariant: ProductVariant = {
                ...selectedVariantForStock,
                branch_stock: branchStock,
            };

            onChange(variants.map((v) => v.variant_id === selectedVariantForStock.variant_id ? updatedVariant : v));
            message.success('Branch stock updated');
            setIsBranchStockModalOpen(false);
        });
    };

    // Calculate total stock across branches
    const getTotalStock = (variant: ProductVariant): number => {
        if (variant.branch_stock && variant.branch_stock.length > 0) {
            return variant.branch_stock.reduce((sum, bs) => sum + bs.stock_quantity, 0);
        }
        return variant.stock_quantity || 0;
    };

    // Table columns
    const columns = [
        {
            title: 'Variant',
            key: 'variant',
            render: (_: unknown, record: ProductVariant) => (
                <Space orientation="vertical" size={0}>
                    <Space>
                        <Tag color="blue">{record.is_default ? 'Default' : 'Variant'}</Tag>
                        <Text strong>{record.name}</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>SKU: {record.sku}</Text>
                </Space>
            ),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            render: (value: number) => (
                <Text style={{ color: '#52c41a' }}>
                    ${value?.toFixed(2) || '0.00'}
                </Text>
            ),
        },
        {
            title: 'Total Stock',
            key: 'stock',
            width: 120,
            render: (_: unknown, record: ProductVariant) => {
                const total = getTotalStock(record);
                return (
                    <Space>
                        <InboxOutlined />
                        <Text style={{ color: total < 10 ? '#ff4d4f' : undefined }}>
                            {total}
                        </Text>
                        {isSuperAdmin && record.branch_stock && record.branch_stock.length > 0 && (
                            <Tooltip title={`In ${record.branch_stock.length} branch(es)`}>
                                <Tag color="purple" style={{ fontSize: 11 }}>
                                    <ShopOutlined /> {record.branch_stock.length}
                                </Tag>
                            </Tooltip>
                        )}
                    </Space>
                );
            },
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 100,
            render: (isActive: boolean) => (
                isActive ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>Active</Tag>
                ) : (
                    <Tag color="default" icon={<CloseCircleOutlined />}>Inactive</Tag>
                )
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 180,
            render: (_: unknown, record: ProductVariant) => (
                <Space>
                    <Tooltip title="Edit">
                        <Button 
                            size="small" 
                            icon={<EditOutlined />} 
                            onClick={() => handleEditVariant(record)}
                            disabled={disabled}
                        />
                    </Tooltip>
                    {isSuperAdmin && (
                        <Tooltip title="Manage Branch Stock">
                            <Button 
                                size="small" 
                                icon={<ShopOutlined />} 
                                onClick={() => handleManageBranchStock(record)}
                                disabled={disabled}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="Duplicate">
                        <Button 
                            size="small" 
                            icon={<CopyOutlined />} 
                            onClick={() => handleDuplicateVariant(record)}
                            disabled={disabled}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete this variant?"
                        description="This action cannot be undone."
                        onConfirm={() => handleDeleteVariant(record.variant_id)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Delete">
                            <Button 
                                size="small" 
                                danger 
                                icon={<DeleteOutlined />}
                                disabled={disabled}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                    <Title level={5} style={{ margin: 0 }}>Product Variants</Title>
                    <Tag>{variants.length} variant(s)</Tag>
                </Space>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={handleAddVariant}
                    disabled={disabled}
                >
                    Add Variant
                </Button>
            </div>

            {/* Variants Table */}
            {variants.length > 0 ? (
                <Table
                    dataSource={variants}
                    columns={columns}
                    rowKey="variant_id"
                    pagination={false}
                    size="middle"
                />
            ) : (
                <Card>
                    <Empty 
                        description="No variants added yet"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button type="primary" onClick={handleAddVariant} disabled={disabled}>
                            Add First Variant
                        </Button>
                    </Empty>
                </Card>
            )}

            {/* Add/Edit Variant Modal */}
            <Modal
                title={editingVariant ? 'Edit Variant' : 'Add New Variant'}
                open={isModalOpen}
                onOk={handleSaveVariant}
                onCancel={() => setIsModalOpen(false)}
                okText={editingVariant ? 'Update' : 'Add'}
                width={500}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Variant Name"
                        rules={[{ required: true, message: 'Please enter variant name' }]}
                    >
                        <Input placeholder="e.g., Large Red" />
                    </Form.Item>

                    <Form.Item
                        name="sku"
                        label="SKU (Optional)"
                        extra="Leave empty to auto-generate"
                    >
                        <Input placeholder="e.g., PRD-SZ-LRG-X1Y2" />
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label="Price"
                        rules={[{ required: true, message: 'Please enter price' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            prefix={<DollarOutlined />}
                            placeholder="0.00"
                            step={0.01}
                            min={0}
                        />
                    </Form.Item>

                    <Form.Item
                        name="stock_quantity"
                        label="Stock Quantity"
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            prefix={<InboxOutlined />}
                            placeholder="0"
                            min={0}
                        />
                    </Form.Item>

                    <Form.Item
                        name="is_active"
                        label="Status"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Branch Stock Modal */}
            <Modal
                title={
                    <Space>
                        <ShopOutlined />
                        <span>Manage Branch Stock - {selectedVariantForStock?.name}</span>
                    </Space>
                }
                open={isBranchStockModalOpen}
                onOk={handleSaveBranchStock}
                onCancel={() => setIsBranchStockModalOpen(false)}
                okText="Save"
                width={600}
            >
                <Form form={branchStockForm} layout="vertical">
                    <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                        Set stock levels for each branch.
                    </Text>
                    
                    {branches.map((branch) => (
                        <Card key={branch.branch_id} size="small" style={{ marginBottom: 12 }}>
                            <Row gutter={16} align="middle">
                                <Col span={10}>
                                    <Space>
                                        <ShopOutlined />
                                        <Text strong>{branch.name}</Text>
                                    </Space>
                                </Col>
                                <Col span={7}>
                                    <Form.Item
                                        name={['branches', branch.branch_id, 'stock']}
                                        label="Stock"
                                        style={{ marginBottom: 0 }}
                                    >
                                        <InputNumber 
                                            min={0} 
                                            placeholder="0" 
                                            style={{ width: '100%' }}
                                            prefix={<InboxOutlined />}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={7}>
                                    <Form.Item
                                        name={['branches', branch.branch_id, 'reserved']}
                                        label="Reserved"
                                        style={{ marginBottom: 0 }}
                                    >
                                        <InputNumber 
                                            min={0} 
                                            placeholder="0" 
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    ))}

                    {branches.length === 0 && (
                        <Empty description="No branches available" />
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default VariantManager;
