'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { PortalNav } from '@/src/components/layout/PortalNav';
import { Heart, Calendar, MapPin, Check, X } from 'lucide-react';
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
}

export default function AdopterDiscoverPage() {
    const { data: session } = useSession();
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchPets();
    }, [filter]);

    const fetchPets = async () => {
        try {
            const url = filter === 'ALL'
                ? '/api/pets?status=AVAILABLE'
                : `/api/pets?status=AVAILABLE&species=${filter}`;

            const response = await fetch(url);
            const data = await response.json();
            setPets(data.pets || []);
        } catch (error) {
            console.error('Error fetching pets:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-amber-50">
            <PortalNav />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-amber-900 mb-2">
                        Discover Pets
                    </h1>
                    <p className="text-lg text-gray-600">
                        Find your perfect companion
                    </p>
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
                        variant={filter === 'DOG' ? 'default' : 'outline'}
                        onClick={() => setFilter('DOG')}
                    >
                        Dogs
                    </Button>
                    <Button
                        variant={filter === 'CAT' ? 'default' : 'outline'}
                        onClick={() => setFilter('CAT')}
                    >
                        Cats
                    </Button>
                    <Button
                        variant={filter === 'BIRD' ? 'default' : 'outline'}
                        onClick={() => setFilter('BIRD')}
                    >
                        Birds
                    </Button>
                    <Button
                        variant={filter === 'OTHER' ? 'default' : 'outline'}
                        onClick={() => setFilter('OTHER')}
                    >
                        Other
                    </Button>
                </div>

                {/* Pet Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Loading pets...</p>
                    </div>
                ) : pets.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Heart className="w-16 h-16 mx-auto mb-4 text-amber-300" />
                            <p className="text-lg font-medium mb-2">No pets available</p>
                            <p className="text-sm text-gray-600">
                                Check back soon for new arrivals!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pets.map((pet) => (
                            <Card key={pet.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="h-48 bg-amber-100 flex items-center justify-center">
                                    {pet.imageUrl ? (
                                        <img
                                            src={pet.imageUrl}
                                            alt={pet.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Heart className="w-16 h-16 text-amber-300" />
                                    )}
                                </div>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        {pet.name}
                                        <span className="text-sm font-normal text-gray-600">
                                            {pet.species}
                                        </span>
                                    </CardTitle>
                                    <CardDescription>
                                        {pet.breed || 'Mixed Breed'} • {pet.age}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-2">
                                        {pet.vaccinated && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                                <Check className="w-3 h-3" /> Vaccinated
                                            </span>
                                        )}
                                        {pet.spayed && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                <Check className="w-3 h-3" /> Spayed/Neutered
                                            </span>
                                        )}
                                    </div>
                                    {pet.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {pet.description}
                                        </p>
                                    )}
                                    <Link href={`/adopter/pets/${pet.id}`}>
                                        <Button className="w-full">
                                            View Details & Apply
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
