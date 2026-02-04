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

                // 1. Try finding user by email
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (user) {
                    // Check if user is blacklisted
                    if (user.isBlacklisted) {
                        throw new Error('Account has been suspended');
                    }

                    // Verify password
                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isPasswordValid) {
                        // LOG: Failed Login Attempt
                        await prisma.securityLog.create({
                            data: {
                                userId: user.id,
                                incident: 'LOGIN_FAILURE',
                                action: `User ${user.name} failed password attempt`,
                                status: 'OPEN'
                            }
                        });
                        throw new Error('Invalid password');
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        additionalRole: user.additionalRole,
                    };
                }

                // 2. Try finding Admin by username (using email field as username input)
                const admin = await prisma.admin.findUnique({
                    where: { username: credentials.email },
                });

                if (admin) {
                    const isPasswordValid = await bcrypt.compare(credentials.password, admin.password);
                    if (!isPasswordValid) {
                        // LOG: Admin Failed Login Attempt
                        // Admins are not Users in this schema, so we can't link to `userId`.
                        // However, the schema REQUIRES `userId`. 
                        // We will skip logging for Admin entity failures for now to avoid schema violation,
                        // or we need to relax the schema.
                        // Given the instruction "triggers of security logs", 
                        // I will skip this for the separate Admin entity since it has no `userId` linkage.
                        throw new Error('Invalid password');
                    }

                    return {
                        id: admin.id,
                        email: `${admin.username}@admin.local`,
                        name: admin.username,
                        role: 'ADMIN',
                        additionalRole: null,
                    };
                }

                throw new Error('No user found');
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // Add user role to token on sign in
            if (user) {
                token.role = user.role;
                token.additionalRole = user.additionalRole;
                token.id = user.id as string;
            } else if (token.id) {
                // Fetch fresh data from DB to ensure roles are up-to-date
                if (token.role === 'ADMIN') {
                    const freshAdmin = await prisma.admin.findUnique({
                        where: { id: token.id as string },
                    });
                    // Note: We don't update role here because Admin role is static 'ADMIN' and not in DB field
                } else {
                    const freshUser = await prisma.user.findUnique({
                        where: { id: token.id as string },
                        select: { role: true, additionalRole: true }
                    });

                    if (freshUser) {
                        token.role = freshUser.role;
                        token.additionalRole = freshUser.additionalRole;
                    }
                }
            }
            return token;
        },
        async session({ session, token }) {
            // Add role and id to session
            if (session.user) {
                session.user.role = token.role;
                session.user.additionalRole = token.additionalRole;
                session.user.id = token.id;
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
