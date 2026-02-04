'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { PortalNav } from '@/src/components/layout/PortalNav';
import { Heart, FileCheck, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card';
import Link from 'next/link';

interface DashboardStats {
    totalPets: number;
    pendingApplications: number;
    pendingSchedules: number;
    recentApplications: Array<{
        id: string;
        status: string;
        createdAt: string;
        pet: { name: string; imageUrl: string | null };
        user: { name: string; email: string };
    }>;
}

export default function StaffDashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<DashboardStats>({
        totalPets: 0,
        pendingApplications: 0,
        pendingSchedules: 0,
        recentApplications: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/stats/dashboard');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-amber-50">
            <PortalNav />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-amber-900 mb-2">
                        Staff Dashboard
                    </h1>
                    <p className="text-lg text-gray-600">
                        Welcome back, {session?.user?.name}
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
                            <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors duration-200">
                                <Heart className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform duration-200" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900 group-hover:text-amber-700 transition-colors duration-200">
                                {loading ? '...' : stats.totalPets}
                            </div>
                            <p className="text-xs text-gray-600">In shelter</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                                <FileCheck className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900 group-hover:text-amber-700 transition-colors duration-200">
                                {loading ? '...' : stats.pendingApplications}
                            </div>
                            <p className="text-xs text-gray-600">Need review</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Pending Schedules</CardTitle>
                            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-200">
                                <Calendar className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform duration-200" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900 group-hover:text-amber-700 transition-colors duration-200">
                                {loading ? '...' : stats.pendingSchedules}
                            </div>
                            <p className="text-xs text-gray-600">Upcoming meetings</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Applications</CardTitle>
                            <CardDescription>Latest adoption applications</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8 text-gray-500">Loading...</div>
                            ) : stats.recentApplications && stats.recentApplications.length > 0 ? (
                                <div className="space-y-4">
                                    {stats.recentApplications.map((app) => (
                                        <div key={app.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                                                    {app.pet.imageUrl ? (
                                                        <img src={app.pet.imageUrl} alt={app.pet.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Heart className="h-5 w-5 text-amber-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-amber-900">{app.pet.name}</p>
                                                    <p className="text-xs text-gray-500">by {app.user.name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${app.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                    app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                                <p className="text-[10px] text-gray-400 mt-1">
                                                    {new Date(app.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <FileCheck className="w-12 h-12 mx-auto mb-3 text-amber-300" />
                                    <p>No recent applications</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common tasks</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 flex flex-col">
                            <Link href="/staff/pets">
                                <button className="w-full text-left px-4 py-2 rounded-lg bg-amber-100 hover:bg-amber-200 transition-all duration-200 hover:shadow-md hover:translate-x-[2px] transform group cursor-pointer">
                                    <p className="font-medium text-amber-900 group-hover:text-amber-800">Add New Pet</p>
                                    <p className="text-sm text-gray-600">Register a new pet in the system</p>
                                </button>
                            </Link>
                            <Link href="/staff/applications">
                                <button className="w-full text-left px-4 py-2 rounded-lg bg-amber-100 hover:bg-amber-200 transition-all duration-200 hover:shadow-md hover:translate-x-[2px] transform group cursor-pointer">
                                    <p className="font-medium text-amber-900 group-hover:text-amber-800">Review Applications</p>
                                    <p className="text-sm text-gray-600">Process pending adoption requests</p>
                                </button>
                            </Link>
                            <button className="w-full text-left px-4 py-2 rounded-lg bg-amber-100 hover:bg-amber-200 transition-all duration-200 hover:shadow-md hover:translate-x-[2px] transform group cursor-pointer">
                                <p className="font-medium text-amber-900 group-hover:text-amber-800">View Reports</p>
                                <p className="text-sm text-gray-600">Generate shelter statistics</p>
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
