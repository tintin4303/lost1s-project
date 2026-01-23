'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Heart, Home as HomeIcon, Users } from 'lucide-react';

export default function Home() {
  const { data: session } = useSession();

  // Determine portal URL based on role
  const getPortalUrl = () => {
    if (!session?.user?.role) return '/register';

    const role = session.user.role;
    if (role === 'ADOPTER') return '/adopter/discover';
    if (role === 'STAFF') return '/staff/dashboard';
    if (role === 'DONOR') return '/donor/dashboard';
    return '/register';
  };

  const portalUrl = getPortalUrl();
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 relative">
      {/* Session Header */}
      {isLoggedIn && session?.user && (
        <div className="absolute top-0 left-0 w-full p-4 z-10">
          <div className="container mx-auto flex justify-end">
            <div className="bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full border border-amber-200 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow duration-200">
              <p className="text-amber-900 text-sm">
                Hello, <span className="font-semibold">{session.user.name}</span>
              </p>
              <span className="h-4 w-px bg-amber-200"></span>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                {session.user.role}
                {(session.user as any).additionalRole && (
                  <> | {(session.user as any).additionalRole}</>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 pt-32">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold text-amber-900 tracking-tight">
            Lost1s
          </h1>
          <p className="text-2xl text-amber-800 max-w-2xl mx-auto">
            Helping pets find their forever homes through digital adoption management
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {isLoggedIn ? (
              <Link
                href={portalUrl}
                className="inline-flex items-center justify-center rounded-md bg-amber-600 px-8 py-3 text-lg font-medium text-white hover:bg-amber-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                Go to My Portal
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-md bg-amber-600 px-8 py-3 text-lg font-medium text-white hover:bg-amber-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-md border-2 border-amber-900 bg-transparent px-8 py-3 text-lg font-medium text-amber-900 hover:bg-amber-50 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-8 shadow-md border border-amber-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex justify-center mb-4">
              <Heart className="w-12 h-12 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-amber-900 text-center mb-3">
              For Adopters
            </h3>
            <p className="text-gray-600 text-center">
              Browse available pets, submit applications, and schedule meet-and-greets with your future companion.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-md border border-amber-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex justify-center mb-4">
              <Users className="w-12 h-12 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-amber-900 text-center mb-3">
              For Donors
            </h3>
            <p className="text-gray-600 text-center">
              Support our mission through donations and see your impact on the leaderboard.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-md border border-amber-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex justify-center mb-4">
              <HomeIcon className="w-12 h-12 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-amber-900 text-center mb-3">
              For Staff
            </h3>
            <p className="text-gray-600 text-center">
              Manage pet profiles, review applications, and coordinate adoptions efficiently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
