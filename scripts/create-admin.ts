
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('Usage: npx tsx scripts/create-admin.ts <username> <password>');
        process.exit(1);
    }

    const [username, password] = args;

    console.log(`Creating admin user "${username}"...`);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const admin = await prisma.admin.create({
            data: {
                username,
                password: hashedPassword,
            },
        });

        console.log(`✅ Admin created successfully!`);
        console.log(`ID: ${admin.id}`);
        console.log(`Username: ${admin.username}`);
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
