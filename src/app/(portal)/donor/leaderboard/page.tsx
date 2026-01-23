'use client';

import { useEffect, useState } from 'react';
import { PortalNav } from '@/src/components/layout/PortalNav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/Card';
import { Trophy, Medal, Star, Crown, User } from 'lucide-react';

interface Donor {
    userId: string;
    name: string;
    totalAmount: number;
    role: string;
}

export default function DonorLeaderboardPage() {
    const [donors, setDonors] = useState<Donor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch('/api/donations?leaderboard=true');
            const data = await response.json();
            setDonors(data.leaderboard || []);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Crown className="w-8 h-8 text-yellow-500 fill-current" />;
            case 1: return <Medal className="w-8 h-8 text-gray-400 fill-current" />;
            case 2: return <Medal className="w-8 h-8 text-amber-700 fill-current" />;
            default: return <span className="text-xl font-bold text-gray-400 w-8 text-center">{index + 1}</span>;
        }
    };

    const getRankColor = (index: number) => {
        switch (index) {
            case 0: return 'bg-yellow-50 border-yellow-200';
            case 1: return 'bg-gray-50 border-gray-200';
            case 2: return 'bg-amber-50 border-amber-200';
            default: return 'bg-white border-gray-100';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <PortalNav />
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <span className="inline-block p-3 rounded-full bg-yellow-100 text-yellow-600 mb-4">
                        <Trophy className="w-8 h-8" />
                    </span>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Donor Hall of Fame</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Celebrating the incredible heroes whose generosity makes our mission possible.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Loading leaderboard...</p>
                        </div>
                    ) : donors.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <p className="text-lg text-gray-600">No donations yet. Be the first to donate!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {donors.map((donor, index) => (
                                <Card
                                    key={donor.userId}
                                    className={`transition-transform hover:scale-[1.01] ${getRankColor(index)} border-2`}
                                >
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="flex-shrink-0 w-12 flex justify-center">
                                                {getRankIcon(index)}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                                                    <User className="w-6 h-6 text-slate-500" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900">{donor.name}</h3>
                                                    <p className="text-sm text-slate-500">{donor.role || 'Donor'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-green-600">
                                                ${donor.totalAmount.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-slate-400">Total Contributions</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
