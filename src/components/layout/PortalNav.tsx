'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { LogOut, Heart, Users, Home as HomeIcon, Menu, X } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

export function PortalNav() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <nav className="bg-white border-b border-amber-200 shadow-sm sticky top-0 z-40 backdrop-blur-sm bg-white/95">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo with hover effect */}
                    <Link
                        href="/"
                        className="text-2xl font-bold text-amber-900 transition-all duration-200 hover:text-amber-700 hover:scale-105 transform"
                    >
                        Lost1s
                    </Link>

                    <div className="flex items-center gap-4">
                        {/* User Info with subtle animation */}
                        <div>
                            {/* Desktop View Pill */}
                            <div className="hidden sm:flex bg-amber-50/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-amber-200 shadow-sm items-center gap-3 hover:shadow-md transition-all duration-200">
                                <span className="text-sm font-semibold text-amber-900">
                                    {session.user.name}
                                </span>
                                <span className="h-3 w-px bg-amber-200"></span>
                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">
                                    {role}
                                </span>
                            </div>

                            {/* Mobile View Pill */}
                            <div className="sm:hidden flex bg-amber-50/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-amber-200 shadow-sm items-center gap-2 mr-2">
                                <span className="text-xs font-semibold text-amber-900">
                                    {session.user.name}
                                </span>
                                <span className="h-3 w-px bg-amber-200"></span>
                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">
                                    {role}
                                </span>
                            </div>
                        </div>

                        {/* Hamburger Button with smooth rotation */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg text-amber-900 hover:bg-amber-50 transition-all duration-200 hover:shadow-md active:scale-95 transform cursor-pointer"
                            aria-label="Toggle menu"
                        >
                            <div className="relative w-6 h-6">
                                <Menu
                                    className={`w-6 h-6 absolute transition-all duration-300 ${isMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`}
                                />
                                <X
                                    className={`w-6 h-6 absolute transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}
                                />
                            </div>
                        </button>
                    </div>
                </div>

                {/* Dropdown Menu with slide animation */}
                <div className={`
                    absolute right-4 mt-2 w-64 bg-white border border-amber-200 rounded-xl shadow-xl z-50
                    transition-all duration-300 origin-top-right
                    ${isMenuOpen
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                    }
                `}>
                    <div className="py-2">
                        {/* Navigation links with stagger animation */}
                        {links.map((link, index) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 text-amber-900 
                                        hover:bg-amber-50 transition-all duration-200
                                        hover:bg-amber-50 transition-all duration-200
                                        hover:translate-x-[2px] transform
                                        group
                                        ${isMenuOpen ? 'animate-slideIn' : ''}
                                    `}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                                    <span className="font-medium">{link.label}</span>
                                </Link>
                            );
                        })}

                        {/* Logout button */}
                        <div className="border-t border-amber-100 mt-2 pt-2 px-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                    await signOut({ redirect: false });
                                    window.location.href = '/';
                                }}
                                className="flex items-center gap-2 w-full justify-center group"
                            >
                                <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay for closing menu */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 top-16 bg-black/20 backdrop-blur-sm z-30 transition-opacity duration-300"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out forwards;
                }
            `}</style>
        </nav>
    );
}
