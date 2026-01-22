'use client';

import { useSession } from 'next-auth/react';
import { PortalNav } from '@/src/components/layout/PortalNav';
import { Heart, Users, FileCheck, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card';

export default function StaffDashboardPage() {
    const { data: session } = useSession();

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
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
                            <Heart className="w-4 h-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">12</div>
                            <p className="text-xs text-gray-600">In shelter</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                            <FileCheck className="w-4 h-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">0</div>
                            <p className="text-xs text-gray-600">Need review</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Adopters</CardTitle>
                            <Users className="w-4 h-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">1</div>
                            <p className="text-xs text-gray-600">Registered</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">0</div>
                            <p className="text-xs text-gray-600">Active</p>
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
                            <div className="text-center py-8 text-gray-500">
                                <FileCheck className="w-12 h-12 mx-auto mb-3 text-amber-300" />
                                <p>No applications yet</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common tasks</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <button className="w-full text-left px-4 py-3 rounded-md bg-amber-100 hover:bg-amber-200 transition-colors">
                                <p className="font-medium text-amber-900">Add New Pet</p>
                                <p className="text-sm text-gray-600">Register a new pet in the system</p>
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-md bg-amber-100 hover:bg-amber-200 transition-colors">
                                <p className="font-medium text-amber-900">Review Applications</p>
                                <p className="text-sm text-gray-600">Process pending adoption requests</p>
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-md bg-amber-100 hover:bg-amber-200 transition-colors">
                                <p className="font-medium text-amber-900">View Reports</p>
                                <p className="text-sm text-gray-600">Generate shelter statistics</p>
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
