'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { PortalNav } from '@/src/components/layout/PortalNav';
import { FileText, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card';

interface Application {
    id: string;
    status: string;
    reason: string;
    experience: string;
    housing: string;
    hasYard: boolean;
    createdAt: string;
    reviewedAt: string | null;
    reviewNotes: string | null;
    pet: {
        id: string;
        name: string;
        species: string;
        breed: string | null;
        imageUrl: string | null;
    };
}

export default function AdopterApplicationsPage() {
    const { data: session } = useSession();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await fetch('/api/applications');
            const data = await response.json();
            setApplications(data.applications || []);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Clock className="w-5 h-5 text-amber-600" />;
            case 'APPROVED':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'REJECTED':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <FileText className="w-5 h-5 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-amber-100 text-amber-800';
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-amber-50">
            <PortalNav />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-amber-900 mb-2">
                        My Applications
                    </h1>
                    <p className="text-lg text-gray-600">
                        Track your adoption applications
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Loading applications...</p>
                    </div>
                ) : applications.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-amber-300" />
                            <p className="text-lg font-medium mb-2">No applications yet</p>
                            <p className="text-sm text-gray-600">
                                Start by discovering pets and submitting an application!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <Card key={app.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-16 rounded-lg bg-amber-100 flex items-center justify-center overflow-hidden">
                                                {app.pet.imageUrl ? (
                                                    <img src={app.pet.imageUrl} alt={app.pet.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <FileText className="w-8 h-8 text-amber-600" />
                                                )}
                                            </div>
                                            <div>
                                                <CardTitle>{app.pet.name}</CardTitle>
                                                <CardDescription>
                                                    {app.pet.species} • {app.pet.breed || 'Mixed Breed'}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(app.status)}
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-semibold text-sm mb-1">Why I want to adopt:</h4>
                                            <p className="text-sm text-gray-600">{app.reason}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm mb-1">My experience:</h4>
                                            <p className="text-sm text-gray-600">{app.experience}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 text-sm text-gray-600">
                                        <span>Housing: {app.housing}</span>
                                        <span>•</span>
                                        <span>{app.hasYard ? 'Has Yard' : 'No Yard'}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            Applied {new Date(app.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {app.reviewNotes && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                                            <h4 className="font-semibold text-sm mb-1">Staff Notes:</h4>
                                            <p className="text-sm text-gray-600">{app.reviewNotes}</p>
                                        </div>
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
