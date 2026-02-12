import { PrismaClient, UserRole, ListingStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seed started...');

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@kaarplus.ee' },
        update: {},
        create: {
            email: 'admin@kaarplus.ee',
            name: 'Admin User',
            role: UserRole.ADMIN,
            passwordHash: 'hashed_password_here', // In real app, use bcrypt
        },
    });

    // Create Dealer
    const dealer = await prisma.user.upsert({
        where: { email: 'dealer@example.ee' },
        update: {},
        create: {
            email: 'dealer@example.ee',
            name: 'Tallinn Autos',
            role: UserRole.DEALERSHIP,
            dealershipId: 'tallinn-autos-1',
        },
    });

    // Create Individual Seller
    const seller = await prisma.user.upsert({
        where: { email: 'seller@example.ee' },
        update: {},
        create: {
            email: 'seller@example.ee',
            name: 'Jaan Tamm',
            role: UserRole.INDIVIDUAL_SELLER,
        },
    });

    // Create sample listings
    await prisma.listing.create({
        data: {
            userId: dealer.id,
            make: 'BMW',
            model: '3 Series',
            variant: '320d xDrive',
            year: 2022,
            mileage: 45000,
            price: 35900,
            bodyType: 'Sedan',
            fuelType: 'Diesel',
            transmission: 'Automatic',
            powerKw: 140,
            driveType: 'AWD',
            colorExterior: 'Black',
            condition: 'Used',
            location: 'Tallinn',
            status: ListingStatus.ACTIVE,
            publishedAt: new Date(),
            features: {
                comfort: ['Leather Seats', 'Navigation', 'Cruise Control'],
                safety: ['ABS', 'Airbags', 'Lane Assist'],
                exterior: ['Alloy Wheels', 'LED Headlights'],
            },
        },
    });

    await prisma.listing.create({
        data: {
            userId: seller.id,
            make: 'Volkswagen',
            model: 'Golf',
            variant: 'GTI',
            year: 2019,
            mileage: 82000,
            price: 24500,
            bodyType: 'Hatchback',
            fuelType: 'Petrol',
            transmission: 'Manual',
            powerKw: 180,
            driveType: 'FWD',
            colorExterior: 'Red',
            condition: 'Used',
            location: 'Tartu',
            status: ListingStatus.ACTIVE,
            publishedAt: new Date(),
            features: {
                comfort: ['Sport Seats', 'Bluetooth'],
                safety: ['ABS', 'Park Assist'],
            },
        },
    });

    console.log('Seed finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
