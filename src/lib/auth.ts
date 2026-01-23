import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required');
                }

                // Find user by email
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    throw new Error('No user found with this email');
                }

                // Check if user is blacklisted
                if (user.isBlacklisted) {
                    throw new Error('Account has been suspended');
                }

                // Verify password
                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error('Invalid password');
                }

                // Return user object (password excluded)
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    additionalRole: (user as any).additionalRole,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // Add user role to token on sign in
            if (user) {
                token.role = (user as any).role;
                token.additionalRole = (user as any).additionalRole;
                token.id = user.id as string;
            } else if (token.id) {
                // Fetch fresh data from DB to ensure roles are up-to-date
                const freshUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { role: true, additionalRole: true }
                });

                if (freshUser) {
                    token.role = freshUser.role;
                    token.additionalRole = freshUser.additionalRole;
                }
            }
            return token;
        },
        async session({ session, token }) {
            // Add role and id to session
            if (session.user) {
                (session.user as any).role = token.role as string;
                (session.user as any).additionalRole = token.additionalRole as string | null;
                (session.user as any).id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
};
