'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { Loader2, Ban, CheckCircle, Search } from 'lucide-react';
import { Input } from '@/src/components/ui/Input';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    additionalRole: string | null;
    isBlacklisted: boolean;
    createdAt: string;
    _count: {
        applications: number;
        donations: number;
    };
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleBan = async (userId: string, currentStatus: boolean) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'UNBAN' : 'BAN'} this user?`)) return;

        setProcessingId(userId);
        try {
            const res = await fetch(`/api/admin/users/${userId}/ban`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isBlacklisted: !currentStatus })
            });

            if (res.ok) {
                // Update local state
                setUsers(users.map(u => u.id === userId ? { ...u, isBlacklisted: !currentStatus } : u));
            } else {
                alert('Failed to update user status');
            }
        } catch (error) {
            console.error('Error banning user', error);
        } finally {
            setProcessingId(null);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
                    <p className="text-slate-500">View and manage system users</p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search users..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-600 border-b">
                                    <tr>
                                        <th className="p-4 font-medium">Name / Email</th>
                                        <th className="p-4 font-medium">Role</th>
                                        <th className="p-4 font-medium">Activity</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-500">
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50/50">
                                                <td className="p-4">
                                                    <div className="font-medium text-slate-900">{user.name}</div>
                                                    <div className="text-slate-500 text-xs">{user.email}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-1 flex-wrap">
                                                        <Badge variant="outline" className="text-[10px]">{user.role}</Badge>
                                                        {user.additionalRole && (
                                                            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                                                                {user.additionalRole}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-600">
                                                    <div className="text-xs">
                                                        <span className="font-medium">{user._count.applications}</span> applications
                                                    </div>
                                                    <div className="text-xs">
                                                        <span className="font-medium">{user._count.donations}</span> donations
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {user.isBlacklisted ? (
                                                        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
                                                            Banned
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                                                            Active
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Button
                                                        size="sm"
                                                        variant={user.isBlacklisted ? "outline" : "destructive"}
                                                        disabled={processingId === user.id}
                                                        onClick={() => toggleBan(user.id, user.isBlacklisted)}
                                                    >
                                                        {processingId === user.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : user.isBlacklisted ? (
                                                            <><CheckCircle className="h-4 w-4 mr-1" /> Unban</>
                                                        ) : (
                                                            <><Ban className="h-4 w-4 mr-1" /> Ban</>
                                                        )}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
