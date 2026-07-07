/**
 * Branch Inventory (Module 7.5)
 *
 * Branch-scoped stock table. The server (inject_branch_filter) already limits
 * rows to the caller's branch for Branch/Inventory Managers and returns all
 * branches for Super Admins; the response's `scope` tells us whether to show
 * the Branch column.
 */
import React, { useState } from 'react';
import {
    Card,
    Table,
    Tag,
    Space,
    Input,
    Button,
    Drawer,
    Form,
    InputNumber,
    Switch,
    Select,
    App,
    Typography,
    Descriptions,
} from 'antd';
import { EditOutlined, SearchOutlined, InboxOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import type { InventoryItem, InventoryUpdatePayload } from '../../api/inventory.api';
import { branchesApi } from '../../api/branches.api';
import { usePermissions } from '../../hooks/usePermissions';

const { Title, Text } = Typography;

const statusTag = (item: InventoryItem) => {
    if (item.stock_quantity <= 0) return <Tag color="red">Out of Stock</Tag>;
    if (item.is_low_stock) return <Tag color="red">Low Stock</Tag>;
    return <Tag color="green">In Stock</Tag>;
};

const BranchInventory: React.FC = () => {
    const { message } = App.useApp();
    const queryClient = useQueryClient();
    const { isSuperAdmin } = usePermissions();
    const [form] = Form.useForm<InventoryUpdatePayload>();

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [branchId, setBranchId] = useState<string | undefined>(undefined);
    const [editing, setEditing] = useState<InventoryItem | null>(null);

    // Branch options for the Super Admin branch filter (branches API is now live).
    const { data: branches = [] } = useQuery({
        queryKey: ['admin', 'branches'],
        queryFn: branchesApi.list,
        enabled: isSuperAdmin,
    });

    const queryKey = ['admin', 'inventory', { page, pageSize, search, lowStockOnly, branchId }];

    const { data, isLoading, isError } = useQuery({
        queryKey,
        queryFn: () =>
            inventoryApi.list({
                page,
                limit: pageSize,
                search: search || undefined,
                low_stock_only: lowStockOnly || undefined,
                branch_id: branchId, // ignored by the server for non-super admins
            }),
        placeholderData: keepPreviousData,
    });

    // Prefer the server's scope; fall back to the local role before data loads.
    const showBranchColumn = data?.scope.is_super_admin ?? isSuperAdmin;

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: InventoryUpdatePayload }) =>
            inventoryApi.update(id, payload),
        onSuccess: () => {
            message.success('Inventory updated.');
            setEditing(null);
            queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
        },
        onError: (err: any) =>
            message.error(err.response?.data?.detail || 'Failed to update inventory.'),
    });

    const openEdit = (item: InventoryItem) => {
        setEditing(item);
        form.setFieldsValue({
            stock_quantity: item.stock_quantity,
            reserved_quantity: item.reserved_quantity,
            low_stock_threshold: item.low_stock_threshold,
        });
    };

    const handleSave = async () => {
        const values = await form.validateFields();
        if (editing) {
            updateMutation.mutate({ id: editing.inventory_id, payload: values });
        }
    };

    const columns: ColumnsType<InventoryItem> = [
        {
            title: 'Product',
            dataIndex: 'product_name',
            key: 'product_name',
            render: (name: string) => <Text strong>{name}</Text>,
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            render: (sku: string | null) => sku || <span style={{ color: '#bbb' }}>—</span>,
        },
        ...(showBranchColumn
            ? [
                  {
                      title: 'Branch',
                      dataIndex: 'branch_name',
                      key: 'branch_name',
                      render: (name: string) => <Tag color="geekblue">{name}</Tag>,
                  } as ColumnsType<InventoryItem>[number],
              ]
            : []),
        {
            title: 'Stock',
            dataIndex: 'stock_quantity',
            key: 'stock_quantity',
            align: 'right',
            width: 90,
        },
        {
            title: 'Reserved',
            dataIndex: 'reserved_quantity',
            key: 'reserved_quantity',
            align: 'right',
            width: 100,
        },
        {
            title: 'Available',
            dataIndex: 'available_quantity',
            key: 'available_quantity',
            align: 'right',
            width: 100,
            render: (v: number) => (
                <Text strong style={{ color: v > 0 ? '#389e0d' : '#cf1322' }}>
                    {v}
                </Text>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            width: 130,
            render: (_, record) => statusTag(record),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>
                    Quick Edit
                </Button>
            ),
        },
    ];

    return (
        <div>
            <Title level={3} style={{ marginTop: 0 }}>
                <Space>
                    <InboxOutlined />
                    Branch Inventory
                </Space>
            </Title>

            <Card>
                <Space wrap style={{ marginBottom: 16 }}>
                    <Input.Search
                        placeholder="Search product or SKU…"
                        allowClear
                        enterButton={<SearchOutlined />}
                        style={{ width: 300 }}
                        onSearch={(value) => {
                            setPage(1);
                            setSearch(value);
                        }}
                    />
                    {showBranchColumn && (
                        <Select
                            placeholder="All branches"
                            style={{ width: 220 }}
                            allowClear
                            value={branchId}
                            onChange={(value) => {
                                setPage(1);
                                setBranchId(value);
                            }}
                            options={branches.map((b) => ({ label: b.name, value: b.branch_id }))}
                        />
                    )}
                    <Space>
                        <Text type="secondary">Low stock only</Text>
                        <Switch
                            checked={lowStockOnly}
                            onChange={(checked) => {
                                setPage(1);
                                setLowStockOnly(checked);
                            }}
                        />
                    </Space>
                </Space>

                <Table
                    rowKey="inventory_id"
                    columns={columns}
                    dataSource={data?.items ?? []}
                    loading={isLoading}
                    locale={{
                        emptyText: isError
                            ? 'Failed to load inventory.'
                            : 'No inventory items found.',
                    }}
                    pagination={{
                        current: page,
                        pageSize,
                        total: data?.total ?? 0,
                        showSizeChanger: true,
                        showTotal: (t) => `Total ${t} items`,
                        onChange: (nextPage, nextSize) => {
                            setPage(nextPage);
                            setPageSize(nextSize);
                        },
                    }}
                />
            </Card>

            <Drawer
                title="Quick Edit — Inventory"
                open={!!editing}
                onClose={() => setEditing(null)}
                width={420}
                destroyOnHidden
                extra={
                    <Space>
                        <Button onClick={() => setEditing(null)}>Cancel</Button>
                        <Button
                            type="primary"
                            loading={updateMutation.isPending}
                            onClick={handleSave}
                        >
                            Save
                        </Button>
                    </Space>
                }
            >
                {editing && (
                    <>
                        <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
                            <Descriptions.Item label="Product">
                                {editing.product_name}
                            </Descriptions.Item>
                            <Descriptions.Item label="SKU">
                                {editing.sku || '—'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Branch">
                                {editing.branch_name}
                            </Descriptions.Item>
                        </Descriptions>

                        <Form form={form} layout="vertical">
                            <Form.Item
                                label="Stock Quantity"
                                name="stock_quantity"
                                rules={[{ required: true, message: 'Enter stock quantity' }]}
                            >
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item
                                label="Reserved Quantity"
                                name="reserved_quantity"
                                rules={[{ required: true, message: 'Enter reserved quantity' }]}
                            >
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item
                                label="Low Stock Threshold"
                                name="low_stock_threshold"
                                rules={[{ required: true, message: 'Enter low-stock threshold' }]}
                                extra="Rows at or below this stock level are flagged 'Low Stock'."
                            >
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Form>
                    </>
                )}
            </Drawer>
        </div>
    );
};

export default BranchInventory;
