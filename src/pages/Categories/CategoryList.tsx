/**
 * Category Management (Admin Module 7.4)
 * Paginated table of categories with modal-based create/edit and delete.
 * Data layer is TanStack Query against /api/v1/admin/categories.
 */
import React, { useState } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Input,
    Modal,
    Form,
    Switch,
    Popconfirm,
    App,
    Typography,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../../api/categories.api';
import type { Category, CategoryPayload } from '../../api/categories.api';

const { Title } = Typography;

// "Organic Fruits" -> "organic-fruits"
const slugify = (text: string): string =>
    text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const CATEGORIES_KEY = ['admin', 'categories'];

const CategoryList: React.FC = () => {
    const { message } = App.useApp();
    const queryClient = useQueryClient();
    const [form] = Form.useForm<CategoryPayload>();

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [search, setSearch] = useState('');
    const [slugTouched, setSlugTouched] = useState(false);

    const {
        data: categories = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: CATEGORIES_KEY,
        queryFn: categoriesApi.list,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });

    const createMutation = useMutation({
        mutationFn: (payload: CategoryPayload) => categoriesApi.create(payload),
        onSuccess: () => {
            message.success('Category created.');
            closeModal();
            invalidate();
        },
        onError: (err: any) =>
            message.error(err.response?.data?.detail || 'Failed to create category.'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<CategoryPayload> }) =>
            categoriesApi.update(id, payload),
        onSuccess: () => {
            message.success('Category updated.');
            closeModal();
            invalidate();
        },
        onError: (err: any) =>
            message.error(err.response?.data?.detail || 'Failed to update category.'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => categoriesApi.remove(id),
        onSuccess: () => {
            message.success('Category deleted.');
            invalidate();
        },
        onError: (err: any) =>
            message.error(err.response?.data?.detail || 'Failed to delete category.'),
    });

    const openCreate = () => {
        setEditing(null);
        setSlugTouched(false);
        form.resetFields();
        form.setFieldsValue({ is_active: true });
        setModalOpen(true);
    };

    const openEdit = (record: Category) => {
        setEditing(record);
        setSlugTouched(true); // don't auto-overwrite an existing slug
        form.setFieldsValue({
            name: record.name,
            slug: record.slug,
            description: record.description ?? '',
            is_active: record.is_active,
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
        form.resetFields();
    };

    const handleSubmit = async () => {
        const values = await form.validateFields();
        const payload: CategoryPayload = {
            name: values.name.trim(),
            slug: (values.slug || slugify(values.name)).trim(),
            description: values.description?.trim() || null,
            is_active: values.is_active ?? true,
        };
        if (editing) {
            updateMutation.mutate({ id: editing.category_id, payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const filtered = categories.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.slug.toLowerCase().includes(search.toLowerCase())
    );

    const columns: ColumnsType<Category> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug',
            render: (slug: string) => <Tag>{slug}</Tag>,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (d: string | null) => d || <span style={{ color: '#bbb' }}>—</span>,
        },
        {
            title: 'Products',
            dataIndex: 'product_count',
            key: 'product_count',
            width: 100,
            align: 'center',
            render: (count: number = 0) => <Tag color="geekblue">{count}</Tag>,
            sorter: (a, b) => (a.product_count ?? 0) - (b.product_count ?? 0),
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 110,
            render: (active: boolean) => (
                <Tag color={active ? 'green' : 'default'}>{active ? 'Active' : 'Inactive'}</Tag>
            ),
            filters: [
                { text: 'Active', value: true },
                { text: 'Inactive', value: false },
            ],
            onFilter: (val, record) => record.is_active === val,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 160,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => openEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete category"
                        description="Categories with products cannot be deleted."
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => deleteMutation.mutate(record.category_id)}
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div
                style={{
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Title level={3} style={{ margin: 0 }}>
                    Categories
                </Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                    Add Category
                </Button>
            </div>

            <Card>
                <Input
                    placeholder="Search by name or slug"
                    allowClear
                    prefix={<SearchOutlined />}
                    style={{ width: 320, marginBottom: 16 }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <Table
                    rowKey="category_id"
                    columns={columns}
                    dataSource={filtered}
                    loading={isLoading}
                    locale={{
                        emptyText: isError ? 'Failed to load categories.' : 'No categories yet.',
                    }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (t) => `Total ${t} categories`,
                    }}
                />
            </Card>

            <Modal
                title={editing ? 'Edit Category' : 'New Category'}
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={closeModal}
                okText={editing ? 'Save' : 'Create'}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" initialValues={{ is_active: true }}>
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'Name is required' }]}
                    >
                        <Input
                            placeholder="e.g. Fresh Fruits"
                            onChange={(e) => {
                                if (!slugTouched) {
                                    form.setFieldValue('slug', slugify(e.target.value));
                                }
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Slug"
                        name="slug"
                        rules={[
                            { required: true, message: 'Slug is required' },
                            {
                                pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                                message: 'Lowercase letters, numbers and hyphens only',
                            },
                        ]}
                        extra="Used in URLs. Auto-generated from the name; edit if needed."
                    >
                        <Input
                            placeholder="fresh-fruits"
                            onChange={() => setSlugTouched(true)}
                        />
                    </Form.Item>

                    <Form.Item label="Description" name="description">
                        <Input.TextArea rows={3} placeholder="Optional description" />
                    </Form.Item>

                    <Form.Item label="Active" name="is_active" valuePropName="checked">
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryList;
