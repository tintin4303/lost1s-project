'use client';

import { useSession } from 'next-auth/react';
import { PortalNav } from '@/src/components/layout/PortalNav';
import { DollarSign, TrendingUp, Award, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';

export default function DonorDashboardPage() {
    const { data: session } = useSession();

    return (
        <div className="min-h-screen bg-amber-50">
            <PortalNav />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-amber-900 mb-2">
                        Donor Dashboard
                    </h1>
                    <p className="text-lg text-gray-600">
                        Thank you for your support, {session?.user?.name}!
                    </p>
                </div>

                {/* Donation Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
                            <DollarSign className="w-4 h-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">$0</div>
                            <p className="text-xs text-gray-600">All time</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <CardTitle className="text-sm font-medium">This Month</CardTitle>
                            <TrendingUp className="w-4 h-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">$0</div>
                            <p className="text-xs text-gray-600">January 2026</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Leaderboard Rank</CardTitle>
                            <Award className="w-4 h-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">-</div>
                            <p className="text-xs text-gray-600">Start donating!</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Pets Helped</CardTitle>
                            <Heart className="w-4 h-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">0</div>
                            <p className="text-xs text-gray-600">Through donations</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Make a Donation */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Make a Donation</CardTitle>
                            <CardDescription>
                                Support our mission to help pets find loving homes
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <Button variant="outline" className="h-20 flex flex-col">
                                    <span className="text-2xl font-bold">$10</span>
                                    <span className="text-xs">Food</span>
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col">
                                    <span className="text-2xl font-bold">$25</span>
                                    <span className="text-xs">Medical</span>
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col">
                                    <span className="text-2xl font-bold">$50</span>
                                    <span className="text-xs">General</span>
                                </Button>
                            </div>
                            <Button className="w-full">Custom Amount</Button>
                            <p className="text-xs text-center text-gray-500">
                                Donation processing coming soon!
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Donation History</CardTitle>
                            <CardDescription>Your contribution timeline</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-gray-500">
                                <DollarSign className="w-12 h-12 mx-auto mb-3 text-amber-300" />
                                <p>No donations yet</p>
                                <p className="text-sm mt-2">Make your first donation to get started!</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
