'use client';

import { useSession, signOut } from 'next-auth/react';
import { PortalNav } from '@/src/components/layout/PortalNav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { User, Shield, AlertTriangle, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function StaffProfilePage() {
    const { data: session } = useSession();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure? This will PERMANENTLY delete your account and ALL associated applications and schedules. This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch('/api/user/me', {
                method: 'DELETE',
            });

            if (response.ok) {
                await signOut({ callbackUrl: '/' });
            } else {
                alert('Failed to delete account');
                setIsDeleting(false);
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            setIsDeleting(false);
        }
    };

    if (!session) return null;

    return (
        <div className="min-h-screen bg-amber-50">
            <PortalNav />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold text-amber-900 mb-2">My Profile</h1>
                        <p className="text-lg text-gray-600">Manage your account and privacy</p>
                    </div>

                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                                <User className="h-8 w-8 text-amber-600" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">{session.user.name}</CardTitle>
                                <CardDescription>{session.user.email}</CardDescription>
                                <div className="mt-2 text-xs font-mono bg-gray-100 px-2 py-1 rounded inline-block text-gray-500">
                                    ID: {session.user.id}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                <div className="p-4 bg-white border border-gray-100 rounded-lg text-center">
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Role</h3>
                                    <p className="text-lg font-bold text-amber-900">{session.user.role}</p>
                                </div>
                                <div className="p-4 bg-white border border-gray-100 rounded-lg text-center">
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                                    <p className="text-lg font-bold text-green-600">Active</p>
                                </div>
                                <div className="p-4 bg-white border border-gray-100 rounded-lg text-center">
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Department</h3>
                                    <p className="text-lg font-bold text-gray-700">General</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone - Demonstrating Cascade Delete */}
                    <Card className="border-red-100">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-700">
                                <Shield className="h-5 w-5" />
                                Danger Zone
                            </CardTitle>
                            <CardDescription>
                                Irreversible account actions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                                    <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        Cascade Delete Warning (Total Participation)
                                    </h4>
                                    <p className="text-sm text-red-800 mb-4">
                                        Deleting your account will trigger a <strong>Cascade Delete</strong>.
                                        Because Schedules and Applications exhibit <strong>Total Participation</strong> (dependency) on a User,
                                        they cannot exist without you. Deleting your User record will automatically wipe all your linked data.
                                    </p>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting}
                                        className="w-full sm:w-auto"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {isDeleting ? 'Deleting...' : 'Delete My Account'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
