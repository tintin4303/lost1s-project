'use client';

import { useState, useEffect } from 'react';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/Card';
import { Users, FileText } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [userCount, setUserCount] = useState<number | null>(null);
    const [openLogCount, setOpenLogCount] = useState<number | null>(null);

    useEffect(() => {
        // Fetch users
        fetch('/api/admin/users')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setUserCount(data.length);
                }
            })
            .catch(err => console.error(err));

        // Fetch security logs
        fetch('/api/admin/security-logs')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const openLogs = data.filter((log: { status: string }) => log.status === 'OPEN');
                    setOpenLogCount(openLogs.length);
                }
            })
            .catch(err => console.error(err));
    }, []);

    if (!session) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-amber-900 mb-8">Lost1s Admin Console</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* User Management Card */}
                <Link href="/admin/users" className="block group">
                    <Card className="h-full hover:shadow-lg transition-shadow border-amber-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-800 group-hover:text-amber-600 transition-colors">
                                <Users className="h-5 w-5" />
                                User Management
                            </CardTitle>
                            <CardDescription>View, manage, and ban users.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-slate-700 group-hover:text-amber-700">
                                {userCount !== null ? userCount : '--'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">Total Users</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Security Logs Card */}
                <Link href="/admin/security-logs" className="block group">
                    <Card className="h-full hover:shadow-lg transition-shadow border-amber-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-800 group-hover:text-red-600 transition-colors">
                                <FileText className="h-5 w-5" />
                                Security Logs
                            </CardTitle>
                            <CardDescription>Review and resolve security incidents.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-slate-700 group-hover:text-red-700">
                                {openLogCount !== null ? openLogCount : '--'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">Open Incidents</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
