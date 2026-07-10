/**
 * Branch Management (Super Admin only)
 * Ant Design table with a create/edit modal, backed by TanStack Query against
 * /api/v1/admin/branches.
 *
 * The form aligns with the hyper-local architecture: Province → District are
 * dependent dropdowns (canonical SL geography), and "Coverage Areas" is a
 * multi-select of Post Offices sourced from the master directory
 * (/admin/locations) for the selected district. Selected post offices are sent
 * as `coverage_post_offices` and the backend syncs PostOfficeBranchMapping.
 */
import React, { useState } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Input,
    Select,
    Modal,
    Form,
    Switch,
    Popconfirm,
    App,
    Typography,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ShopOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchesApi } from '../../api/branches.api';
import type { Branch, BranchPayload } from '../../api/branches.api';
import { locationsApi } from '../../api/locations.api';
import { SL_PROVINCES, districtsForProvince } from '../../data/slLocations';

const { Title, Text } = Typography;
const { TextArea } = Input;

const BRANCHES_KEY = ['admin', 'branches'];

interface BranchFormValues {
    name: string;
    code: string;
    address?: string;
    province: string;
    district?: string;
    coverage_post_offices?: string[];
    phone?: string;
    is_active?: boolean;
}

const uniq = (arr: (string | null | undefined)[]): string[] =>
    Array.from(new Set(arr.filter((s): s is string => !!s)));

const BranchList: React.FC = () => {
    const { message } = App.useApp();
    const queryClient = useQueryClient();
    const [form] = Form.useForm<BranchFormValues>();

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Branch | null>(null);
    const [search, setSearch] = useState('');

    // Watch province/district so the dependent dropdowns + coverage query react.
    const provinceValue = Form.useWatch('province', form);
    const districtValue = Form.useWatch('district', form);

    const { data: branches = [], isLoading, isError } = useQuery({
        queryKey: BRANCHES_KEY,
        queryFn: branchesApi.list,
    });

    // Post Offices available for the currently-selected district (master list).
    const { data: postOffices = [], isFetching: poLoading } = useQuery({
        queryKey: ['admin', 'locations', districtValue],
        queryFn: () => locationsApi.list({ district: districtValue, active_only: true }),
        enabled: modalOpen && !!districtValue,
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: BRANCHES_KEY });
    };

    const createMutation = useMutation({
        mutationFn: (payload: BranchPayload) => branchesApi.create(payload),
        onSuccess: () => {
            message.success('Branch created.');
            closeModal();
            invalidate();
        },
        onError: (err: any) =>
            message.error(err.response?.data?.detail || 'Failed to create branch.'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<BranchPayload> }) =>
            branchesApi.update(id, payload),
        onSuccess: () => {
            message.success('Branch updated.');
            closeModal();
            invalidate();
        },
        onError: (err: any) =>
            message.error(err.response?.data?.detail || 'Failed to update branch.'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => branchesApi.remove(id),
        onSuccess: () => {
            message.success('Branch deleted.');
            invalidate();
        },
        onError: (err: any) =>
            message.error(err.response?.data?.detail || 'Failed to delete branch.'),
    });

    const openCreate = () => {
        setEditing(null);
        form.resetFields();
        form.setFieldsValue({ is_active: true });
        setModalOpen(true);
    };

    const openEdit = (branch: Branch) => {
        setEditing(branch);
        form.setFieldsValue({
            name: branch.name,
            code: branch.code,
            address: branch.address ?? '',
            province: branch.province,
            district: branch.district ?? undefined,
            coverage_post_offices: branch.coverage_post_offices ?? [],
            phone: branch.phone ?? '',
            is_active: branch.is_active,
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
        form.resetFields();
    };

    // When province changes the district (and thus coverage) no longer applies.
    const onProvinceChange = () => {
        form.setFieldsValue({ district: undefined, coverage_post_offices: [] });
    };

    // When district changes, the previous coverage selection is out of scope.
    const onDistrictChange = () => {
        form.setFieldsValue({ coverage_post_offices: [] });
    };

    const handleSubmit = async () => {
        const values = await form.validateFields();
        const payload: BranchPayload = {
            name: values.name.trim(),
            code: values.code.trim(),
            address: values.address?.trim() || null,
            province: values.province.trim(),
            district: values.district?.trim() || null,
            coverage_post_offices: values.coverage_post_offices ?? [],
            phone: values.phone?.trim() || null,
            is_active: values.is_active ?? true,
        };
        if (editing) {
            updateMutation.mutate({ id: editing.branch_id, payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const filtered = branches.filter(
        (b) =>
            b.name.toLowerCase().includes(search.toLowerCase()) ||
            b.code.toLowerCase().includes(search.toLowerCase()) ||
            (b.district ?? '').toLowerCase().includes(search.toLowerCase())
    );

    // Defensive: if a saved branch uses a province/district outside the canonical
    // list, still surface it as an option so the Select shows the current value.
    const provinceOptions = uniq([...SL_PROVINCES, editing?.province]).map((p) => ({
        label: p,
        value: p,
    }));
    const districtOptions = uniq([
        ...districtsForProvince(provinceValue),
        editing?.district,
    ]).map((d) => ({ label: d, value: d }));
    const postOfficeOptions = postOffices.map((po) => ({
        label: po.post_office,
        value: po.post_office,
    }));

    const columns: ColumnsType<Branch> = [
        {
            title: 'Branch',
            key: 'branch',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{record.name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Code: {record.code}
                    </Text>
                </Space>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Location',
            key: 'location',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text>
                        {record.district || '—'}
                        {record.province ? `, ${record.province}` : ''}
                    </Text>
                    {record.address && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.address}
                        </Text>
                    )}
                </Space>
            ),
        },
        {
            title: 'Coverage',
            key: 'coverage',
            render: (_, record) => {
                const pos = record.coverage_post_offices ?? [];
                if (pos.length === 0) return <Text type="secondary">—</Text>;
                const shown = pos.slice(0, 2);
                return (
                    <Space size={4} wrap>
                        {shown.map((po) => (
                            <Tag key={po} color="blue" style={{ marginInlineEnd: 0 }}>
                                {po}
                            </Tag>
                        ))}
                        {pos.length > shown.length && (
                            <Tag>+{pos.length - shown.length}</Tag>
                        )}
                    </Space>
                );
            },
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone: string | null) => phone || <span style={{ color: '#bbb' }}>—</span>,
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
            width: 170,
            render: (_, record) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete branch"
                        description="Branches with admins, inventory or mappings can't be deleted."
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => deleteMutation.mutate(record.branch_id)}
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
                    <Space>
                        <ShopOutlined />
                        Branches
                    </Space>
                </Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                    Add Branch
                </Button>
            </div>

            <Card>
                <Input
                    placeholder="Search by name, code or city"
                    allowClear
                    prefix={<SearchOutlined />}
                    style={{ width: 320, marginBottom: 16 }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <Table
                    rowKey="branch_id"
                    columns={columns}
                    dataSource={filtered}
                    loading={isLoading}
                    locale={{ emptyText: isError ? 'Failed to load branches.' : 'No branches yet.' }}
                    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Total ${t} branches` }}
                />
            </Card>

            <Modal
                title={editing ? 'Edit Branch' : 'New Branch'}
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={closeModal}
                okText={editing ? 'Save' : 'Create'}
                confirmLoading={createMutation.isPending || updateMutation.isPending}
                destroyOnHidden
                width={560}
            >
                <Form form={form} layout="vertical" initialValues={{ is_active: true }}>
                    <Form.Item
                        label="Branch Name"
                        name="name"
                        rules={[{ required: true, message: 'Name is required' }]}
                    >
                        <Input placeholder="e.g. Colombo Central" />
                    </Form.Item>

                    <Form.Item
                        label="Branch Code"
                        name="code"
                        rules={[
                            { required: true, message: 'Code is required' },
                            { min: 2, message: 'At least 2 characters' },
                        ]}
                    >
                        <Input placeholder="e.g. COL-CTR" />
                    </Form.Item>

                    <Form.Item
                        label="Province"
                        name="province"
                        rules={[{ required: true, message: 'Province is required' }]}
                    >
                        <Select
                            placeholder="Select province"
                            options={provinceOptions}
                            onChange={onProvinceChange}
                            showSearch
                            optionFilterProp="label"
                        />
                    </Form.Item>

                    <Form.Item
                        label="City / District"
                        name="district"
                        extra="Maps to the branch's district."
                    >
                        <Select
                            placeholder={provinceValue ? 'Select district' : 'Select a province first'}
                            options={districtOptions}
                            onChange={onDistrictChange}
                            disabled={!provinceValue}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Coverage Areas (Post Offices)"
                        name="coverage_post_offices"
                        extra={
                            districtValue
                                ? 'Post offices this branch delivers to. Manage the master list in Settings → Delivery Zones.'
                                : 'Select a district to choose its post offices.'
                        }
                    >
                        <Select
                            mode="multiple"
                            placeholder={districtValue ? 'Select post offices' : 'Select a district first'}
                            options={postOfficeOptions}
                            disabled={!districtValue}
                            loading={poLoading}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            notFoundContent={
                                poLoading
                                    ? 'Loading…'
                                    : 'No post offices for this district yet — add them in Settings → Delivery Zones.'
                            }
                        />
                    </Form.Item>

                    <Form.Item label="Address" name="address">
                        <TextArea rows={2} placeholder="Full address" />
                    </Form.Item>

                    <Form.Item label="Phone" name="phone">
                        <Input placeholder="+94 11 234 5678" />
                    </Form.Item>

                    <Form.Item label="Active" name="is_active" valuePropName="checked">
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BranchList;
