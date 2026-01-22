'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { PortalNav } from '@/src/components/layout/PortalNav';
import { Heart, Plus, Edit, Trash2, Calendar, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
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
    _count?: {
        applications: number;
    };
}

export default function StaffPetsPage() {
    const { data: session } = useSession();
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [showAddModal, setShowAddModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [ageInput, setAgeInput] = useState('1');
    const [formData, setFormData] = useState({
        name: '',
        species: 'DOG' as 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'OTHER',
        breed: '',
        age: 1,
        vaccinated: false,
        spayed: false,
        description: '',
        imageUrl: '',
    });

    useEffect(() => {
        fetchPets();
    }, [filter]);

    const fetchPets = async () => {
        try {
            const url = filter === 'ALL'
                ? '/api/pets?status=AVAILABLE'
                : `/api/pets?status=${filter}`;

            const response = await fetch(url);
            const data = await response.json();
            setPets(data.pets || []);
        } catch (error) {
            console.error('Error fetching pets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to Cloudinary
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setFormData(prev => ({ ...prev, imageUrl: data.url }));
            }
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/pets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setShowAddModal(false);
                setImagePreview(null);
                setAgeInput('1');
                setFormData({
                    name: '',
                    species: 'DOG',
                    breed: '',
                    age: 1,
                    vaccinated: false,
                    spayed: false,
                    description: '',
                    imageUrl: '',
                });
                fetchPets(); // Refresh list
            }
        } catch (error) {
            console.error('Error adding pet:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE':
                return 'bg-green-100 text-green-800';
            case 'ADOPTED':
                return 'bg-blue-100 text-blue-800';
            case 'PENDING':
                return 'bg-amber-100 text-amber-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-amber-50">
            <PortalNav />
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-amber-900 mb-2">
                            Manage Pets
                        </h1>
                        <p className="text-lg text-gray-600">
                            View and manage all pets in the shelter
                        </p>
                    </div>
                    <Button className="flex items-center gap-2" onClick={() => setShowAddModal(true)}>
                        <Plus className="w-4 h-4" />
                        Add New Pet
                    </Button>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-3 mb-8">
                    <Button
                        variant={filter === 'ALL' ? 'default' : 'outline'}
                        onClick={() => setFilter('ALL')}
                    >
                        All Pets
                    </Button>
                    <Button
                        variant={filter === 'AVAILABLE' ? 'default' : 'outline'}
                        onClick={() => setFilter('AVAILABLE')}
                    >
                        Available
                    </Button>
                    <Button
                        variant={filter === 'ADOPTED' ? 'default' : 'outline'}
                        onClick={() => setFilter('ADOPTED')}
                    >
                        Adopted
                    </Button>
                    <Button
                        variant={filter === 'PENDING' ? 'default' : 'outline'}
                        onClick={() => setFilter('PENDING')}
                    >
                        Pending
                    </Button>
                </div>

                {/* Pet List */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Loading pets...</p>
                    </div>
                ) : pets.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Heart className="w-16 h-16 mx-auto mb-4 text-amber-300" />
                            <p className="text-lg font-medium mb-2">No pets found</p>
                            <p className="text-sm text-gray-600">
                                {filter === 'ALL' ? 'Add your first pet to get started' : `No ${filter.toLowerCase()} pets`}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {pets.map((pet) => (
                            <Card key={pet.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 rounded-lg bg-amber-100 flex items-center justify-center overflow-hidden">
                                                {pet.imageUrl ? (
                                                    <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Heart className="w-10 h-10 text-amber-600" />
                                                )}
                                            </div>
                                            <div>
                                                <CardTitle className="text-2xl">{pet.name}</CardTitle>
                                                <CardDescription className="text-base">
                                                    {pet.species} • {pet.breed || 'Mixed Breed'} • {pet.age}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pet.status)}`}>
                                                {pet.status}
                                            </span>
                                            <Link href={`/staff/pets/${pet.id}`}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    View
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-6 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            Intake: {new Date(pet.intakeDate).toLocaleDateString()}
                                        </span>
                                        {pet.vaccinated && (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                                Vaccinated
                                            </span>
                                        )}
                                        {pet.spayed && (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                                Spayed/Neutered
                                            </span>
                                        )}
                                        {pet._count && pet._count.applications > 0 && (
                                            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">
                                                {pet._count.applications} Application{pet._count.applications !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                    {pet.description && (
                                        <p className="mt-3 text-gray-600 line-clamp-2">{pet.description}</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Add Pet Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <CardHeader>
                                <CardTitle>Add New Pet</CardTitle>
                                <CardDescription>Enter the pet information</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Name *</label>
                                            <input
                                                type="text"
                                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Species *</label>
                                            <select
                                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                                                value={formData.species}
                                                onChange={(e) => setFormData({ ...formData, species: e.target.value as any })}
                                            >
                                                <option value="DOG">Dog</option>
                                                <option value="CAT">Cat</option>
                                                <option value="BIRD">Bird</option>
                                                <option value="RABBIT">Rabbit</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Breed</label>
                                            <input
                                                type="text"
                                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                                                value={formData.breed}
                                                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Age (years) *</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="30"
                                                className="w-full rounded-md border border-gray-300 px-3 py-2"
                                                value={ageInput}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setAgeInput(value);
                                                    const numValue = value === '' ? 0 : parseInt(value) || 0;
                                                    setFormData({ ...formData, age: numValue });
                                                }}
                                                onBlur={() => {
                                                    if (ageInput === '' || parseInt(ageInput) < 0) {
                                                        setAgeInput('0');
                                                        setFormData({ ...formData, age: 0 });
                                                    }
                                                }}
                                                onWheel={(e) => e.currentTarget.blur()}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Description</label>
                                        <textarea
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 min-h-[100px]"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Pet Image</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                                            disabled={uploading}
                                        />
                                        {uploading && (
                                            <p className="text-sm text-amber-600 mt-1">Uploading image...</p>
                                        )}
                                        {imagePreview && (
                                            <div className="mt-2">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-32 h-32 object-cover rounded-md border border-gray-300"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.vaccinated}
                                                onChange={(e) => setFormData({ ...formData, vaccinated: e.target.checked })}
                                                className="rounded"
                                            />
                                            <span className="text-sm">Vaccinated</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.spayed}
                                                onChange={(e) => setFormData({ ...formData, spayed: e.target.checked })}
                                                className="rounded"
                                            />
                                            <span className="text-sm">Spayed/Neutered</span>
                                        </label>
                                    </div>
                                </CardContent>
                                <div className="flex gap-3 p-6 pt-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowAddModal(false)}
                                        disabled={submitting}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={submitting} className="flex-1">
                                        {submitting ? 'Adding...' : 'Add Pet'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
