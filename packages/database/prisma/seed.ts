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
    const turboCars = [
        { make: 'Mercedes-Benz', model: 'E 220', variant: 'AMG Line', year: 2018, mileage: 125000, price: 32500, bodyType: 'Sedan', fuelType: 'Diesel', transmission: 'Automatic', powerKw: 143, driveType: 'RWD', colorExterior: 'Silver', condition: 'Used', location: 'Tallinn', description: 'Väga heas korras Mercedes. AMG pakett, hooldatud regulaarselt esinduses.' },
        { make: 'Toyota', model: 'Land Cruiser Prado', variant: '70th Anniversary', year: 2021, mileage: 45000, price: 58900, bodyType: 'SUV', fuelType: 'Diesel', transmission: 'Automatic', powerKw: 150, driveType: 'AWD', colorExterior: 'Black', condition: 'Used', location: 'Harjumaa', description: 'Võimas ja usaldusväärne maastur. 7-kohaline.' },
        { make: 'Hyundai', model: 'Elantra', variant: 'Limited', year: 2021, mileage: 32000, price: 21500, bodyType: 'Sedan', fuelType: 'Petrol', transmission: 'Automatic', powerKw: 110, driveType: 'FWD', colorExterior: 'White', condition: 'Used', location: 'Tallinn', description: 'Ökonoomne ja kaasaegne auto. Kehtiv garantii.' },
        { make: 'Kia', model: 'Sportage', variant: 'TX', year: 2022, mileage: 15000, price: 34900, bodyType: 'SUV', fuelType: 'Petrol', transmission: 'Automatic', powerKw: 132, driveType: 'AWD', colorExterior: 'Grey', condition: 'Used', location: 'Tartu', description: 'Peaaegu uus auto. Rikkalik varustus.' },
        { make: 'BMW', model: 'X5', variant: 'xDrive40i', year: 2019, mileage: 78000, price: 52000, bodyType: 'SUV', fuelType: 'Petrol', transmission: 'Automatic', powerKw: 250, driveType: 'AWD', colorExterior: 'Blue', condition: 'Used', location: 'Tallinn', description: 'Väga kiire ja mugav maastur. M-pakett.' },
        { make: 'Audi', model: 'A6', variant: '50 TDI quattro', year: 2020, mileage: 95000, price: 41500, bodyType: 'Sedan', fuelType: 'Diesel', transmission: 'Automatic', powerKw: 210, driveType: 'AWD', colorExterior: 'Black', condition: 'Used', location: 'Pärnu', description: 'Premium klassi sedaan. Suurepärane kiirendus.' },
        { make: 'Lexus', model: 'GX 460', variant: 'Luxury', year: 2021, mileage: 28000, price: 75000, bodyType: 'SUV', fuelType: 'Petrol', transmission: 'Automatic', powerKw: 221, driveType: 'AWD', colorExterior: 'Pearl White', condition: 'Used', location: 'Tallinn', description: 'Luksuslik ja vastupidav maastur. Ideaalses korras.' },
        { make: 'Porsche', model: 'Cayenne', variant: 'Coupe', year: 2023, mileage: 5000, price: 115000, bodyType: 'SUV', fuelType: 'Petrol', transmission: 'Automatic', powerKw: 250, driveType: 'AWD', colorExterior: 'Crayon', condition: 'Used', location: 'Tallinn', description: 'Praktiliselt uus auto. Sport Chrono pakett.' },
        { make: 'Nissan', model: 'X-Trail', variant: 'Tekna', year: 2017, mileage: 142000, price: 16900, bodyType: 'SUV', fuelType: 'Petrol', transmission: 'Automatic', powerKw: 126, driveType: 'FWD', colorExterior: 'Brown', condition: 'Used', location: 'Narva', description: 'Hea pereauto. Palju lisasid. Ökonoomne.' },
        { make: 'Toyota', model: 'Camry', variant: 'Executive', year: 2022, mileage: 22000, price: 36500, bodyType: 'Sedan', fuelType: 'Hybrid', transmission: 'Automatic', powerKw: 160, driveType: 'FWD', colorExterior: 'Grey', condition: 'Used', location: 'Tallinn', description: 'Väga ökonoomne hübriid. Hooldusajalugu Toyota esinduses.' }
    ];

    for (const car of turboCars) {
        await prisma.listing.create({
            data: {
                ...car,
                userId: seller.id,
                status: ListingStatus.ACTIVE,
                publishedAt: new Date(),
                features: {},
                images: {
                    create: [
                        { url: `https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800`, order: 0, verified: true },
                        { url: `https://images.unsplash.com/photo-1494976388531-d11e99518c01?auto=format&fit=crop&q=80&w=800`, order: 1, verified: true }
                    ]
                }
            }
        });
    }

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
