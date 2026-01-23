'use client';

import { useEffect, useState } from 'react';
import { PortalNav } from '@/src/components/layout/PortalNav';
import { Card, CardContent } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Calendar, MapPin, Clock, CheckCircle, XCircle, User, Archive } from 'lucide-react';

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
    };
    user: {
        name: string;
        email: string;
    };
}

export default function StaffSchedulesPage() {
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

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/schedules/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                fetchSchedules();
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating schedule:', error);
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
                    <h1 className="text-4xl font-bold text-amber-900 mb-2">Manage Schedules</h1>
                    <p className="text-lg text-gray-600">Review and manage meeting requests</p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Loading schedules...</p>
                    </div>
                ) : schedules.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <p className="text-lg font-medium text-gray-600">No schedules found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {schedules.map((schedule) => (
                            <Card key={schedule.id} className="overflow-hidden">
                                <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(schedule.status)}`}>
                                                {schedule.status}
                                            </span>
                                            <span className="text-sm text-gray-400">ID: {schedule.id.slice(-6)}</span>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-500" />
                                                    {schedule.user.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 ml-6">{schedule.user.email}</p>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">Pet: {schedule.pet.name}</h3>
                                                <p className="text-sm text-gray-500">{schedule.pet.species}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2 bg-amber-50 p-3 rounded">
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
                                                <div className="w-full text-xs italic border-t border-gray-200 pt-2 mt-1">
                                                    Note: &quot;{schedule.notes}&quot;
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 min-w-[140px]">
                                        {schedule.status === 'PENDING' && (
                                            <>
                                                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={() => updateStatus(schedule.id, 'CONFIRMED')}>
                                                    <CheckCircle className="w-4 h-4 mr-2" /> Confirm
                                                </Button>
                                                <Button size="sm" variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateStatus(schedule.id, 'REJECTED')}>
                                                    <XCircle className="w-4 h-4 mr-2" /> Reject
                                                </Button>
                                            </>
                                        )}
                                        {schedule.status === 'CONFIRMED' && (
                                            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => updateStatus(schedule.id, 'COMPLETED')}>
                                                <Archive className="w-4 h-4 mr-2" /> Complete
                                            </Button>
                                        )}
                                        {schedule.status === 'COMPLETED' && (
                                            <div className="text-center text-sm font-medium text-green-600 flex items-center justify-center gap-1">
                                                <CheckCircle className="w-4 h-4" /> Completed
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
