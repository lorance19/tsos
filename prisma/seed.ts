import { PrismaClient, Role } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database seed...');

    // First, ensure we have a ROOT user to use as createdBy
    let rootUser = await prisma.user.findFirst({
        where: { role: Role.ROOT }
    });

    if (!rootUser) {
        console.log('No ROOT user found. Creating seed admin user...');
        rootUser = await prisma.user.create({
            data: {
                email: 'admin@seed.com',
                firstName: 'Seed',
                lastName: 'Admin',
                role: Role.ROOT,
                isActive: true,
            }
        });
        console.log('✓ Seed admin user created');
    } else {
        console.log('✓ Found existing ROOT user:', rootUser.email);
    }

    const createdBy = {
        userId: rootUser.id,
        name: `${rootUser.firstName} ${rootUser.lastName}`,
        role: rootUser.role
    };

    // Read products JSON file
    const productsPath = path.join(__dirname, 'seed-data', 'products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

    console.log(`\nSeeding ${productsData.length} products...`);

    // Insert products
    for (const product of productsData) {
        try {
            const existingProduct = await prisma.product.findFirst({
                where: { code: product.code }
            });

            if (existingProduct) {
                console.log(`⊘ Product "${product.name}" (${product.code}) already exists - skipping`);
                continue;
            }

            await prisma.product.create({
                data: {
                    ...product,
                    createdBy: createdBy
                }
            });

            console.log(`✓ Created product: ${product.name} (${product.code})`);
        } catch (error) {
            console.error(`✗ Failed to create product ${product.name}:`, error);
        }
    }

    console.log('\n✓ Database seeding completed!');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });