'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PortalNav } from '@/src/components/layout/PortalNav';
import { Heart, Calendar, Check, X, ArrowLeft, Edit, Save } from 'lucide-react';
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
    applications: Array<{
        id: string;
        status: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
    }>;
}

export default function StaffPetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const router = useRouter();
    const [pet, setPet] = useState<Pet | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        species: 'DOG',
        breed: '',
        age: 'ADULT',
        vaccinated: false,
        spayed: false,
        status: 'AVAILABLE',
        imageUrl: '',
        description: '',
    });

    useEffect(() => {
        fetchPet();
    }, [unwrappedParams.id]);

    const fetchPet = async () => {
        try {
            const response = await fetch(`/api/pets/${unwrappedParams.id}`);
            const data = await response.json();
            setPet(data.pet);

            if (data.pet) {
                setFormData({
                    name: data.pet.name,
                    species: data.pet.species,
                    breed: data.pet.breed || '',
                    age: data.pet.age,
                    vaccinated: data.pet.vaccinated,
                    spayed: data.pet.spayed,
                    status: data.pet.status,
                    imageUrl: data.pet.imageUrl || '',
                    description: data.pet.description || '',
                });
            }
        } catch (error) {
            console.error('Error fetching pet:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`/api/pets/${unwrappedParams.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setEditing(false);
                fetchPet();
            }
        } catch (error) {
            console.error('Error updating pet:', error);
        } finally {
            setSaving(false);
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
                <Link href="/staff/pets" className="inline-flex items-center gap-2 text-amber-900 hover:text-amber-700 mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Pets
                </Link>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Pet Details */}
                    <Card>
                        <div className="h-96 bg-amber-100 flex items-center justify-center">
                            {(editing ? formData.imageUrl : pet.imageUrl) ? (
                                <img
                                    src={editing ? formData.imageUrl : pet.imageUrl!}
                                    alt={editing ? formData.name : pet.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Heart className="w-32 h-32 text-amber-300" />
                            )}
                        </div>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    {editing ? (
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="text-3xl font-bold mb-2"
                                        />
                                    ) : (
                                        <CardTitle className="text-3xl">{pet.name}</CardTitle>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => editing ? handleSave() : setEditing(true)}
                                    disabled={saving}
                                >
                                    {editing ? (
                                        <>
                                            <Save className="w-4 h-4 mr-1" />
                                            {saving ? 'Saving...' : 'Save'}
                                        </>
                                    ) : (
                                        <>
                                            <Edit className="w-4 h-4 mr-1" />
                                            Edit
                                        </>
                                    )}
                                </Button>
                            </div>
                            {!editing && (
                                <CardDescription className="text-lg">
                                    {pet.species} • {pet.breed || 'Mixed Breed'} • {pet.age}
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {editing ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Species</Label>
                                            <select
                                                value={formData.species}
                                                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                                                className="flex h-10 w-full rounded-md border border-amber-900/20 bg-white px-3 py-2 text-sm"
                                            >
                                                <option value="DOG">Dog</option>
                                                <option value="CAT">Cat</option>
                                                <option value="BIRD">Bird</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label>Age Group</Label>
                                            <select
                                                value={formData.age}
                                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                                className="flex h-10 w-full rounded-md border border-amber-900/20 bg-white px-3 py-2 text-sm"
                                            >
                                                <option value="PUPPY_KITTEN">Puppy/Kitten</option>
                                                <option value="YOUNG">Young</option>
                                                <option value="ADULT">Adult</option>
                                                <option value="SENIOR">Senior</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Breed</Label>
                                        <Input
                                            value={formData.breed}
                                            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                                            placeholder="e.g., Golden Retriever"
                                        />
                                    </div>

                                    <div>
                                        <Label>Status</Label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-amber-900/20 bg-white px-3 py-2 text-sm"
                                        >
                                            <option value="AVAILABLE">Available</option>
                                            <option value="PENDING">Pending</option>
                                            <option value="ADOPTED">Adopted</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.vaccinated}
                                                onChange={(e) => setFormData({ ...formData, vaccinated: e.target.checked })}
                                                className="h-4 w-4"
                                            />
                                            <span className="text-sm">Vaccinated</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.spayed}
                                                onChange={(e) => setFormData({ ...formData, spayed: e.target.checked })}
                                                className="h-4 w-4"
                                            />
                                            <span className="text-sm">Spayed/Neutered</span>
                                        </label>
                                    </div>

                                    <div>
                                        <Label>Image URL</Label>
                                        <Input
                                            value={formData.imageUrl}
                                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>

                                    <div>
                                        <Label>Description</Label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="flex min-h-[100px] w-full rounded-md border border-amber-900/20 bg-white px-3 py-2 text-sm"
                                            placeholder="Describe the pet..."
                                        />
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            setEditing(false);
                                            fetchPet();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <>
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
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Applications */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Applications</CardTitle>
                            <CardDescription>
                                {pet.applications?.length || 0} application{pet.applications?.length !== 1 ? 's' : ''} for this pet
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!pet.applications || pet.applications.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No applications yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pet.applications.map((app) => (
                                        <div key={app.id} className="p-3 bg-gray-50 rounded-md">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{app.user.name}</p>
                                                    <p className="text-sm text-gray-600">{app.user.email}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs ${app.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                                                        app.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
