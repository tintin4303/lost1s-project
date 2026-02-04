'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

interface Log {
    id: string;
    incident: string;
    action: string;
    status: string;
    createdAt: string;
    resolvedAt?: string;
    user: {
        name: string;
        email: string;
    };
    resolver?: {
        username: string;
    };
}

export default function SecurityLogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/admin/security-logs');
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resolveLog = async (logId: string) => {
        if (!confirm('Mark this incident as RESOLVED? This will record you as the resolver.')) return;

        setProcessingId(logId);
        try {
            const res = await fetch(`/api/admin/security-logs/${logId}/resolve`, {
                method: 'PATCH'
            });

            if (res.ok) {
                const updatedLog = await res.json();
                // Update local state
                setLogs(logs.map(log => log.id === logId ? {
                    ...log,
                    status: 'RESOLVED',
                    resolvedAt: updatedLog.resolvedAt,
                    resolver: updatedLog.resolver
                } : log));
            } else {
                alert('Failed to resolve log');
            }
        } catch (error) {
            console.error('Error resolving log', error);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Security Logs</h1>
                <p className="text-slate-500">Audit trail of security incidents and their resolution.</p>
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
                                        <th className="p-4 font-medium">Incident / Action</th>
                                        <th className="p-4 font-medium">User Caused</th>
                                        <th className="p-4 font-medium">Date</th>
                                        <th className="p-4 font-medium">Status / Resolver</th>
                                        <th className="p-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-500">
                                                No security incidents found.
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50/50">
                                                <td className="p-4">
                                                    <div className="font-medium text-slate-900">{log.incident}</div>
                                                    <div className="text-slate-500 text-xs">{log.action}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-slate-900">{log.user.name}</div>
                                                    <div className="text-slate-500 text-xs">{log.user.email}</div>
                                                </td>
                                                <td className="p-4 text-slate-600">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </td>
                                                <td className="p-4">
                                                    {log.status === 'RESOLVED' ? (
                                                        <div className="flex flex-col gap-1 items-start">
                                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                                                                RESOLVED
                                                            </Badge>
                                                            <span className="text-[10px] text-slate-500">
                                                                by {log.resolver?.username}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
                                                            OPEN
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    {log.status !== 'RESOLVED' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                                                            disabled={processingId === log.id}
                                                            onClick={() => resolveLog(log.id)}
                                                        >
                                                            {processingId === log.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <><CheckCircle className="h-4 w-4 mr-1" /> Resolve</>
                                                            )}
                                                        </Button>
                                                    )}
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
