'use client';

import { use, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PortalNav } from '@/src/components/layout/PortalNav';
import { Heart, Calendar, Check, X, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Label } from '@/src/components/ui/Label';
import Link from 'next/link';

interface Pet {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    age: string;
    vaccinated: boolean;
    spayed: boolean;
    status: string;
    imageUrl: string | null;
    description: string | null;
    intakeDate: string;
}

export default function PetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const { data: session } = useSession();
    const router = useRouter();
    const [pet, setPet] = useState<Pet | null>(null);
    const [loading, setLoading] = useState(true);
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        reason: '',
        experience: '',
        housing: 'HOUSE' as 'HOUSE' | 'APARTMENT' | 'CONDO' | 'OTHER',
        hasYard: false,
    });

    // Schedule Logic
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [scheduleData, setScheduleData] = useState({
        date: '',
        timeSlot: '',
        location: 'Shelter Main Hall',
        notes: ''
    });
    // const [mySchedules, setMySchedules] = useState<any[]>([]); // Unused
    const [hasMeeting, setHasMeeting] = useState(false); // Confirmed or Completed meeting logic

    useEffect(() => {
        if (unwrappedParams.id) {
            fetchPet();
            fetchMySchedules();
        }
    }, [unwrappedParams.id]);

    const fetchPet = async () => {
        try {
            const response = await fetch(`/api/pets/${unwrappedParams.id}`);
            const data = await response.json();
            setPet(data.pet);
        } catch (error) {
            console.error('Error fetching pet:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMySchedules = async () => {
        try {
            const res = await fetch('/api/schedules');
            const data = await res.json();
            if (data.schedules) {
                // setMySchedules(data.schedules);
                // Check if we have a qualified meeting for THIS pet
                const meeting = data.schedules.find((s: any) =>
                    s.petId === unwrappedParams.id &&
                    ['CONFIRMED', 'COMPLETED'].includes(s.status)
                );
                if (meeting) setHasMeeting(true);
            }
        } catch (e) {
            console.error('Error fetching schedules', e);
        }
    };

    const handleScheduleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/schedules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    petId: unwrappedParams.id,
                    ...scheduleData
                })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to schedule');
            } else {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    setShowScheduleForm(false);
                    fetchMySchedules(); // Refresh to update status
                }, 2000);
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    petId: unwrappedParams.id,
                    ...formData,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to submit application');
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/adopter/applications');
            }, 2000);
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-amber-50">
                <PortalNav />
                <div className="container mx-auto px-4 py-8 text-center">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!pet) {
        return (
            <div className="min-h-screen bg-amber-50">
                <PortalNav />
                <div className="container mx-auto px-4 py-8 text-center">
                    <p>Pet not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-amber-50">
            <PortalNav />
            <div className="container mx-auto px-4 py-8">
                <Link href="/adopter/discover" className="inline-flex items-center gap-2 text-amber-900 hover:text-amber-700 mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Discover
                </Link>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Pet Details */}
                    <Card>
                        <div className="h-96 bg-amber-100 flex items-center justify-center">
                            {pet.imageUrl ? (
                                <img
                                    src={pet.imageUrl}
                                    alt={pet.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Heart className="w-32 h-32 text-amber-300" />
                            )}
                        </div>
                        <CardHeader>
                            <CardTitle className="text-3xl">{pet.name}</CardTitle>
                            <CardDescription className="text-lg">
                                {pet.species} • {pet.breed || 'Mixed Breed'} • {pet.age}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2 flex-wrap">
                                {pet.vaccinated && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded">
                                        <Check className="w-4 h-4" /> Vaccinated
                                    </span>
                                )}
                                {pet.spayed && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                                        <Check className="w-4 h-4" /> Spayed/Neutered
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded">
                                    <Calendar className="w-4 h-4" /> Intake: {new Date(pet.intakeDate).toLocaleDateString()}
                                </span>
                            </div>

                            {pet.description && (
                                <div>
                                    <h3 className="font-semibold mb-2">About {pet.name}</h3>
                                    <p className="text-gray-600">{pet.description}</p>
                                </div>
                            )}

                            {!showApplicationForm && !showScheduleForm && (
                                <div className="space-y-3">
                                    <Button
                                        className="w-full"
                                        size="lg"
                                        disabled={!hasMeeting} // Block application if no meeting
                                        onClick={() => setShowApplicationForm(true)}
                                    >
                                        {hasMeeting ? `Apply to Adopt ${pet.name}` : `Meet ${pet.name} First`}
                                    </Button>

                                    {!hasMeeting && (
                                        <Button
                                            className="w-full"
                                            variant="outline"
                                            size="lg"
                                            onClick={() => setShowScheduleForm(true)}
                                        >
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Schedule a Meeting
                                        </Button>
                                    )}

                                    {!hasMeeting && (
                                        <p className="text-xs text-center text-gray-500">
                                            * You must have a confirmed meeting before applying.
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Schedule Form */}
                    {showScheduleForm && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Schedule a Meeting</CardTitle>
                                <CardDescription>Pick a time to come meet {pet.name} at the shelter.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {success ? (
                                    <div className="text-center py-8">
                                        <Check className="w-16 h-16 mx-auto mb-4 text-green-600" />
                                        <h3 className="text-xl font-semibold mb-2">Request Sent!</h3>
                                        <p className="text-gray-600">We will review your request shortly.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleScheduleSubmit} className="space-y-4">
                                        {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
                                        <div className="space-y-2">
                                            <Label>Date</Label>
                                            <Input
                                                type="date"
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                                value={scheduleData.date}
                                                onChange={e => setScheduleData({ ...scheduleData, date: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Time Slot</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                required
                                                value={scheduleData.timeSlot}
                                                onChange={e => setScheduleData({ ...scheduleData, timeSlot: e.target.value })}
                                            >
                                                <option value="">Select a time...</option>
                                                <option value="10:00 AM">10:00 AM</option>
                                                <option value="11:00 AM">11:00 AM</option>
                                                <option value="1:00 PM">01:00 PM</option>
                                                <option value="2:00 PM">02:00 PM</option>
                                                <option value="3:00 PM">03:00 PM</option>
                                                <option value="4:00 PM">04:00 PM</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Location</Label>
                                            <Input value={scheduleData.location} disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Notes (Optional)</Label>
                                            <Input
                                                value={scheduleData.notes}
                                                onChange={e => setScheduleData({ ...scheduleData, notes: e.target.value })}
                                                placeholder="Any special questions?"
                                            />
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowScheduleForm(false)}>Cancel</Button>
                                            <Button type="submit" className="flex-1" disabled={submitting}>Request Meeting</Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Application Form */}
                    {showApplicationForm && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Adoption Application</CardTitle>
                                <CardDescription>
                                    Tell us why you'd be a great match for {pet.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {success ? (
                                    <div className="text-center py-8">
                                        <Check className="w-16 h-16 mx-auto mb-4 text-green-600" />
                                        <h3 className="text-xl font-semibold mb-2">Application Submitted!</h3>
                                        <p className="text-gray-600">Redirecting to your applications...</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {error && (
                                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                                                {error}
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="reason">Why do you want to adopt {pet.name}? *</Label>
                                            <textarea
                                                id="reason"
                                                className="flex min-h-[100px] w-full rounded-md border border-amber-900/20 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
                                                placeholder="Tell us about your motivation (minimum 50 characters)"
                                                value={formData.reason}
                                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                                required
                                                minLength={50}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="experience">Your experience with pets *</Label>
                                            <textarea
                                                id="experience"
                                                className="flex min-h-[80px] w-full rounded-md border border-amber-900/20 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
                                                placeholder="Describe your experience (minimum 20 characters)"
                                                value={formData.experience}
                                                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                                required
                                                minLength={20}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="housing">Housing Type *</Label>
                                            <select
                                                id="housing"
                                                className="flex h-10 w-full rounded-md border border-amber-900/20 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
                                                value={formData.housing}
                                                onChange={(e) => setFormData({ ...formData, housing: e.target.value as any })}
                                            >
                                                <option value="HOUSE">House</option>
                                                <option value="APARTMENT">Apartment</option>
                                                <option value="CONDO">Condo</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="hasYard"
                                                checked={formData.hasYard}
                                                onChange={(e) => setFormData({ ...formData, hasYard: e.target.checked })}
                                                className="h-4 w-4 rounded border-amber-900/20"
                                            />
                                            <Label htmlFor="hasYard" className="cursor-pointer">
                                                I have a yard
                                            </Label>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => setShowApplicationForm(false)}
                                                disabled={submitting}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                className="flex-1"
                                                disabled={submitting}
                                            >
                                                {submitting ? 'Submitting...' : 'Submit'}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
