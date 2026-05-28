import React, { useState, useEffect } from 'react';
import { Table, Card, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

interface Customer {
    user_id: string;
    name: string;
    email: string;
    phone?: string;
    total_orders: number;
    total_spent: number;
    created_at: string;
}

const CustomerList: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            // API call would go here
            // const response = await customerApi.getAll();

            // Demo data
            const demoCustomers: Customer[] = [
                {
                    user_id: '1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '+1234567890',
                    total_orders: 15,
                    total_spent: 1250.50,
                    created_at: '2025-12-01T00:00:00Z',
                },
                {
                    user_id: '2',
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    phone: '+1234567891',
                    total_orders: 8,
                    total_spent: 680.25,
                    created_at: '2025-12-15T00:00:00Z',
                },
                {
                    user_id: '3',
                    name: 'Bob Johnson',
                    email: 'bob@example.com',
                    total_orders: 22,
                    total_spent: 2100.00,
                    created_at: '2025-11-20T00:00:00Z',
                },
            ];
            setCustomers(demoCustomers);
        } catch (error) {
            message.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnsType<Customer> = [
        {
            title: 'Customer',
            dataIndex: 'name',
            key: 'name',
            render: (name: string, record: Customer) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>
                        <UserOutlined style={{ marginRight: 8 }} />
                        {name}
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>{record.email}</div>
                    {record.phone && (
                        <div style={{ fontSize: 12, color: '#999' }}>{record.phone}</div>
                    )}
                </div>
            ),
        },
        {
            title: 'Total Orders',
            dataIndex: 'total_orders',
            key: 'total_orders',
            sorter: (a, b) => a.total_orders - b.total_orders,
        },
        {
            title: 'Total Spent',
            dataIndex: 'total_spent',
            key: 'total_spent',
            render: (amount: number) => `$${amount.toFixed(2)}`,
            sorter: (a, b) => a.total_spent - b.total_spent,
        },
        {
            title: 'Member Since',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
            sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        },
    ];

    return (
        <div>
            <h1 style={{ marginBottom: 16 }}>Customers</h1>

            <Card>
                <Table
                    columns={columns}
                    dataSource={customers}
                    rowKey="user_id"
                    loading={loading}
                    pagination={{
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} customers`,
                    }}
                />
            </Card>
        </div>
    );
};

export default CustomerList;
