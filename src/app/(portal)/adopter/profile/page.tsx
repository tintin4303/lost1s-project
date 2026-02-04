'use client';

import { useSession, signOut } from 'next-auth/react';
import { PortalNav } from '@/src/components/layout/PortalNav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Dialog, DialogFooter } from '@/src/components/ui/Dialog';
import { User, Shield, AlertTriangle, Trash2, Activity } from 'lucide-react';
import { useState } from 'react';

export default function AdopterProfilePage() {
    const { data: session } = useSession();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDonorModal, setShowDonorModal] = useState(false);



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
                                    <p className="text-lg font-bold text-amber-900">
                                        {session.user.role}
                                        {session.user.additionalRole && (
                                            <span className="text-amber-700"> | {session.user.additionalRole}</span>
                                        )}
                                    </p>
                                </div>
                                <div className="p-4 bg-white border border-gray-100 rounded-lg text-center">
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                                    <p className="text-lg font-bold text-green-600">Active</p>
                                </div>
                                <div className="p-4 bg-white border border-gray-100 rounded-lg text-center">
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Joined</h3>
                                    <p className="text-lg font-bold text-gray-700">Recently</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Role Management - Switch to Donor */}
                    <Card className="border-blue-100">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-800">
                                <Activity className="h-5 w-5" />
                                Portal Access
                            </CardTitle>
                            <CardDescription>
                                Switch your portal view to access different features.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Adopter Portal Status */}
                                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                                    <div>
                                        <h4 className="font-semibold text-green-900">Adopter Portal</h4>
                                        <p className="text-sm text-green-700">Browse pets and manage applications.</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="bg-green-100 text-green-700 border-green-200"
                                        disabled
                                    >
                                        Active
                                    </Button>
                                </div>

                                {/* Donor Portal Status */}
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <div>
                                        <h4 className="font-semibold text-blue-900">Donor Portal</h4>
                                        <p className="text-sm text-blue-700">Make donations and view leaderboard.</p>
                                    </div>
                                    {(session.user.role === 'DONOR' || session.user.additionalRole === 'DONOR') ? (
                                        <Button
                                            variant="outline"
                                            className="bg-blue-100 text-blue-700 border-blue-200"
                                            disabled
                                        >
                                            Active
                                        </Button>
                                    ) : (
                                        <Button
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                            onClick={() => setShowDonorModal(true)}
                                        >
                                            Enable
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Dialog
                        isOpen={showDonorModal}
                        onClose={() => setShowDonorModal(false)}
                        title="Enable Donor Features?"
                        description="This will give you access to the Donor Portal where you can manage donations and view the leaderboard. You will keep your Adopter access."
                    >
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setShowDonorModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={async () => {
                                    try {
                                        const res = await fetch('/api/user/me', {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ role: 'DONOR' })
                                        });
                                        if (res.ok) {
                                            // Force reload to update session
                                            window.location.reload();
                                        }
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }}
                            >
                                Confirm
                            </Button>
                        </DialogFooter>
                    </Dialog>

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
