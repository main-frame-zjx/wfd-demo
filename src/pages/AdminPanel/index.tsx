// src/pages/AdminPanel/index.tsx
import React, { useState, useEffect } from 'react';
import { Button, Card, Table, Tabs, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { RouteComponentProps } from 'react-router-dom';

interface Registration {
    id: number;
    username: string;
    note: string;

}

interface MyUser {
    id: number;
    username: string;
    note: string;
    status: number;
    role: string;
}

interface AdminPanelProps extends RouteComponentProps { }

export const AdminPanel: React.FC<AdminPanelProps> = ({ history, location }) => {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [users, setUsers] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(false);

    // 获取待审批注册表
    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:5000/admin/registrations?approve=0&token=${token}`
            );

            if (!response.ok) throw new Error('获取数据失败');

            const data = await response.json();
            setRegistrations(data.array.map(([id, username, note]: any[]) => ({
                id, username, note
            })));
        } catch (err) {
            message.error('数据加载失败');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:5000/admin/getUsers?token=${token}`
            );

            if (!response.ok) throw new Error('获取数据失败');

            const data = await response.json();
            setUsers(data.array.map(([id, username, note, status, role]: any[]) => ({
                id, username, note, status, role
            })));
        } catch (err) {
            message.error('数据加载失败');
        } finally {
            setLoading(false);
        }
    };

    // 审批通过处理
    const handleApprove = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:5000/admin/approve?id=${id}&token=${token}`
            );

            if (!response.ok) throw new Error('操作失败');

            message.success('审批通过成功');
            fetchRegistrations(); // 刷新数据
            fetchUsers();
        } catch (err) {
            message.error('操作失败');
        }
    };

    const handleDisable = async (userId: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/admin/disable_user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${token}`
                },
                body: new URLSearchParams({ user_id: userId.toString() })
            });




            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || '操作失败');
            }

            message.success(result.message);
            fetchUsers(); // 刷新用户列表
        } catch (error) {
            message.error(error instanceof Error ? error.message : '未知错误');
        }
    };

    // 表格列定义
    const regColumns: ColumnsType<Registration> = [
        { title: '注册表ID', dataIndex: 'id' },
        { title: '用户名', dataIndex: 'username' },
        { title: '备注', dataIndex: 'note' },
        {
            title: '操作',
            render: (_, record) => (
                <>
                    <Button
                        type="primary"
                        onClick={() => handleApprove(record.id)}
                        style={{ marginRight: 8 }}
                    >
                        通过
                    </Button>
                    <Button danger>拒绝</Button>
                </>
            )
        }
    ];


    const userColumns: ColumnsType<MyUser> = [
        { title: '用户ID', dataIndex: 'id' },
        { title: '用户名', dataIndex: 'username' },
        { title: '备注', dataIndex: 'note' },
        {
            title: '用户状态',
            dataIndex: 'status',
            render: (status: number) => status === 0 ? '正常' : '已注销'
        },
        { title: '权限', dataIndex: 'role' },
        {
            title: '操作',
            render: (_, record) => (
                <>
                    <Button
                        type="primary"
                        style={{ marginRight: 8 }}
                    >
                        修改备注
                    </Button>
                    <Button danger
                        disabled={record.status === 1 || record.role === 'admin'}
                        title={record.role === 'admin' ? '管理员不可注销' :
                            record.status === 1 ? '用户已注销' : ''}
                        onClick={() => handleDisable(record.id)}
                    >
                        注销
                    </Button>
                </>
            )
        }
    ];

    useEffect(() => {
        fetchRegistrations();
        fetchUsers();
    }, []);

    return (
        <div style={{ padding: 20 }}>
            <Card title="管理员控制台">
                <Tabs defaultActiveKey="1">
                    <Tabs.TabPane tab="注册审批" key="1">
                        <Table
                            columns={regColumns}
                            dataSource={registrations}
                            loading={loading}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                        />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="用户管理" key="2">
                        <Table
                            columns={userColumns}
                            dataSource={users}
                            loading={loading}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                        />
                    </Tabs.TabPane>
                </Tabs>
            </Card>
        </div>
    );
};