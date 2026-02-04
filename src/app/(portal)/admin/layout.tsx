'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/src/components/ui/Button';
import { Shield, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Admin Navbar */}
            <nav className="bg-amber-900 text-white p-4 shadow-md z-10">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/admin/dashboard" className="flex items-center gap-2 hover:text-amber-200 transition-colors">
                        <Shield className="h-6 w-6 text-amber-400" />
                        <span className="font-bold text-xl">Lost1s Admin Console</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-amber-200">Logged in as {session.user?.name}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-amber-800"
                            onClick={() => signOut({ callbackUrl: '/' })}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
