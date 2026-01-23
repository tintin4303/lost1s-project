'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { PortalNav } from '@/src/components/layout/PortalNav';
import { FileText, Clock, CheckCircle, XCircle, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Label } from '@/src/components/ui/Label';

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
    user: {
        id: string;
        name: string;
        email: string;
    };
    linkedSchedule?: {
        status: string;
        date: string;
    };
}

export default function StaffApplicationsPage() {
    const { data: session } = useSession();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [reviewingId, setReviewingId] = useState<string | null>(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

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

    const handleReview = async (applicationId: string, status: 'APPROVED' | 'REJECTED') => {
        setSubmitting(true);
        try {
            const response = await fetch(`/api/applications/${applicationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status,
                    notes: reviewNotes,
                }),
            });

            if (response.ok) {
                setReviewingId(null);
                setReviewNotes('');
                fetchApplications(); // Refresh list
            }
        } catch (error) {
            console.error('Error reviewing application:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredApplications = applications.filter((app) => {
        if (filter === 'ALL') return true;
        return app.status === filter;
    });

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
                        Review Applications
                    </h1>
                    <p className="text-lg text-gray-600">
                        Manage adoption applications
                    </p>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-3 mb-8">
                    <Button
                        variant={filter === 'ALL' ? 'default' : 'outline'}
                        onClick={() => setFilter('ALL')}
                    >
                        All ({applications.length})
                    </Button>
                    <Button
                        variant={filter === 'PENDING' ? 'default' : 'outline'}
                        onClick={() => setFilter('PENDING')}
                    >
                        Pending ({applications.filter(a => a.status === 'PENDING').length})
                    </Button>
                    <Button
                        variant={filter === 'APPROVED' ? 'default' : 'outline'}
                        onClick={() => setFilter('APPROVED')}
                    >
                        Approved ({applications.filter(a => a.status === 'APPROVED').length})
                    </Button>
                    <Button
                        variant={filter === 'REJECTED' ? 'default' : 'outline'}
                        onClick={() => setFilter('REJECTED')}
                    >
                        Rejected ({applications.filter(a => a.status === 'REJECTED').length})
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Loading applications...</p>
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-amber-300" />
                            <p className="text-lg font-medium mb-2">No applications found</p>
                            <p className="text-sm text-gray-600">
                                {filter === 'ALL' ? 'No applications submitted yet' : `No ${filter.toLowerCase()} applications`}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredApplications.map((app) => (
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
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                    {app.linkedSchedule && (
                                        <div className="mt-2 flex items-center justify-end gap-2 text-xs">
                                            <span className="text-gray-500">Linked Meeting:</span>
                                            <span className={`px-2 py-0.5 rounded-full font-medium ${['CONFIRMED', 'COMPLETED'].includes(app.linkedSchedule.status)
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                                }`}>
                                                {app.linkedSchedule.status} ({new Date(app.linkedSchedule.date).toLocaleDateString()})
                                            </span>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <User className="w-4 h-4" />
                                        <span className="font-medium">{app.user.name}</span>
                                        <span>•</span>
                                        <span>{app.user.email}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(app.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-semibold text-sm mb-1">Reason for adoption:</h4>
                                            <p className="text-sm text-gray-600">{app.reason}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm mb-1">Pet experience:</h4>
                                            <p className="text-sm text-gray-600">{app.experience}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 text-sm">
                                        <span className="px-2 py-1 bg-gray-100 rounded">Housing: {app.housing}</span>
                                        <span className="px-2 py-1 bg-gray-100 rounded">{app.hasYard ? 'Has Yard' : 'No Yard'}</span>
                                    </div>

                                    {app.status === 'PENDING' && (
                                        reviewingId === app.id ? (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-md space-y-3">
                                                <div>
                                                    <Label htmlFor="notes">Review Notes (optional)</Label>
                                                    <textarea
                                                        id="notes"
                                                        className="flex min-h-[80px] w-full rounded-md border border-amber-900/20 bg-white px-3 py-2 text-sm mt-1"
                                                        placeholder="Add any notes for the applicant..."
                                                        value={reviewNotes}
                                                        onChange={(e) => setReviewNotes(e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setReviewingId(null);
                                                            setReviewNotes('');
                                                        }}
                                                        disabled={submitting}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-red-600 hover:bg-red-700"
                                                        onClick={() => handleReview(app.id, 'REJECTED')}
                                                        disabled={submitting}
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleReview(app.id, 'APPROVED')}
                                                        disabled={submitting}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => setReviewingId(app.id)}
                                            >
                                                Review Application
                                            </Button>
                                        )
                                    )}

                                    {app.reviewNotes && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                                            <h4 className="font-semibold text-sm mb-1">Review Notes:</h4>
                                            <p className="text-sm text-gray-600">{app.reviewNotes}</p>
                                            {app.reviewedAt && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Reviewed on {new Date(app.reviewedAt).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
}
