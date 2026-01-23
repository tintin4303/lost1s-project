const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'staff_repro@example.com';
    console.log(`Elevating ${email} to STAFF...`);

    const user = await prisma.user.update({
        where: { email },
        data: { role: 'STAFF' }, // Intentionally NOT updating 'roles' to simulate the bug
    });

    console.log('User updated:', user);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
