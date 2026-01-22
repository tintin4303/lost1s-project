'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { LogOut, Heart, Users, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

export function PortalNav() {
    const { data: session } = useSession();

    if (!session) return null;

    const role = session.user.role;

    const navLinks = {
        ADOPTER: [
            { href: '/adopter/discover', label: 'Discover Pets', icon: Heart },
            { href: '/adopter/applications', label: 'My Applications', icon: Users },
        ],
        STAFF: [
            { href: '/staff/dashboard', label: 'Dashboard', icon: HomeIcon },
            { href: '/staff/pets', label: 'Manage Pets', icon: Heart },
            { href: '/staff/applications', label: 'Applications', icon: Users },
        ],
        DONOR: [
            { href: '/donor/dashboard', label: 'Dashboard', icon: HomeIcon },
            { href: '/donor/donate', label: 'Make Donation', icon: Heart },
            { href: '/donor/leaderboard', label: 'Leaderboard', icon: Users },
        ],
    };

    const links = navLinks[role as keyof typeof navLinks] || [];

    return (
        <nav className="bg-white border-b border-amber-200">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <Link href="/" className="text-2xl font-bold text-amber-900">
                            Lost1s
                        </Link>
                        <div className="hidden md:flex space-x-4">
                            {links.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center gap-2 px-3 py-2 rounded-md text-amber-900 hover:bg-amber-50 transition-colors"
                                    >
                                        <Icon className="w-4 h-4" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            {session.user.name} ({role})
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                                await signOut({ redirect: false });
                                window.location.href = '/';
                            }}
                            className="flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
