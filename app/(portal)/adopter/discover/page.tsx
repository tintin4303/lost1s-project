'use client';

import { useSession } from 'next-auth/react';
import { PortalNav } from '@/src/components/layout/PortalNav';
import { Heart, FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card';

export default function AdopterDiscoverPage() {
    const { data: session } = useSession();

    return (
        <div className="min-h-screen bg-amber-50">
            <PortalNav />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-amber-900 mb-2">
                        Welcome, {session?.user?.name}!
                    </h1>
                    <p className="text-lg text-gray-600">
                        Find your perfect companion from our available pets
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Available Pets</CardTitle>
                            <Heart className="w-4 h-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">12</div>
                            <p className="text-xs text-gray-600">Ready for adoption</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">My Applications</CardTitle>
                            <FileText className="w-4 h-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">0</div>
                            <p className="text-xs text-gray-600">Pending review</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                            <Calendar className="w-4 h-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">0</div>
                            <p className="text-xs text-gray-600">Scheduled</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Pet Discovery Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Discover Pets</CardTitle>
                        <CardDescription>
                            Browse our available pets looking for their forever homes
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12 text-gray-500">
                            <Heart className="w-16 h-16 mx-auto mb-4 text-amber-300" />
                            <p className="text-lg font-medium mb-2">Pet listings coming soon!</p>
                            <p className="text-sm">
                                We're working on bringing you the best pet discovery experience.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
