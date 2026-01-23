'use client';

import { useEffect, useState } from 'react';
import { PortalNav } from '@/src/components/layout/PortalNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Calendar, MapPin, Clock, XCircle, Heart, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Schedule {
    id: string;
    petId: string;
    userId: string;
    date: string;
    timeSlot: string;
    location: string;
    notes: string | null;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
    pet: {
        name: string;
        species: string;
        imageUrl: string | null;
    };
}

export default function AdopterSchedulesPage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const response = await fetch('/api/schedules');
            const data = await response.json();
            setSchedules(data.schedules || []);
        } catch (error) {
            console.error('Error fetching schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this meeting?')) return;

        try {
            const response = await fetch(`/api/schedules/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'CANCELLED' })
            });

            if (response.ok) {
                fetchSchedules(); // Refresh list
            } else {
                alert('Failed to cancel meeting');
            }
        } catch (error) {
            console.error('Error cancelling schedule:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-800';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CANCELLED': return 'bg-gray-100 text-gray-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-amber-50">
            <PortalNav />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-amber-900 mb-2">My Schedules & Meetings</h1>
                    <p className="text-lg text-gray-600">Track your upcoming meetings with our pets</p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Loading schedules...</p>
                    </div>
                ) : schedules.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Calendar className="w-16 h-16 mx-auto mb-4 text-amber-300" />
                            <p className="text-lg font-medium mb-2">No meetings scheduled yet</p>
                            <p className="text-sm text-gray-600 mb-6">Found a pet you like? Schedule a meeting to get started!</p>
                            <Link href="/adopter/discover">
                                <Button>Discover Pets</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {schedules.map((schedule) => (
                            <Card key={schedule.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3 border-b border-gray-100">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl text-amber-900">{schedule.pet.name}</CardTitle>
                                            <CardDescription>{schedule.pet.species}</CardDescription>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(schedule.status)}`}>
                                            {schedule.status}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-amber-500" />
                                            <span>{new Date(schedule.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-amber-500" />
                                            <span>{schedule.timeSlot}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-amber-500" />
                                            <span>{schedule.location}</span>
                                        </div>
                                        {schedule.notes && (
                                            <div className="bg-amber-50 p-2 rounded text-xs italic">
                                                "{schedule.notes}"
                                            </div>
                                        )}
                                    </div>

                                    {(schedule.status === 'PENDING' || schedule.status === 'CONFIRMED') && (
                                        <Button
                                            variant="destructive"
                                            className="w-full text-xs"
                                            onClick={() => handleCancel(schedule.id)}
                                        >
                                            Cancel Meeting
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
