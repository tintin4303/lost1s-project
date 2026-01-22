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

    useEffect(() => {
        fetchPet();
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

                            {!showApplicationForm && (
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={() => setShowApplicationForm(true)}
                                >
                                    Apply to Adopt {pet.name}
                                </Button>
                            )}
                        </CardContent>
                    </Card>

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
