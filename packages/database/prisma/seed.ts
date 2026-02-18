import { PrismaClient, UserRole, ListingStatus, AdUnitType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seed started...');

    const passwordHash = '$2b$10$Rci8sWp2x5wYiUr9Nt94Se6NsHYx52ToZJCXWzlfXnylu06vw8ca.'; // password123

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@kaarplus.ee' },
        update: { passwordHash },
        create: {
            email: 'admin@kaarplus.ee',
            name: 'Admin User',
            role: UserRole.ADMIN,
            passwordHash,
        },
    });

    // Create Dealer
    const dealer = await prisma.user.upsert({
        where: { email: 'dealer@example.ee' },
        update: { passwordHash },
        create: {
            email: 'dealer@example.ee',
            name: 'Tallinn Autos',
            role: UserRole.DEALERSHIP,
            dealershipId: 'tallinn-autos-1',
            passwordHash,
        },
    });

    // Create Individual Seller
    const seller = await prisma.user.upsert({
        where: { email: 'seller@example.ee' },
        update: { passwordHash },
        create: {
            email: 'seller@example.ee',
            name: 'Jaan Tamm',
            role: UserRole.INDIVIDUAL_SELLER,
            passwordHash,
        },
    });

    // Create Demo User for Mobile App Preview
    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@kaarplus.ee' },
        update: { passwordHash },
        create: {
            email: 'demo@kaarplus.ee',
            name: 'Demo User',
            role: UserRole.BUYER,
            passwordHash,
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
        const listing = await prisma.listing.create({
            data: {
                ...car,
                userId: seller.id,
                status: ListingStatus.ACTIVE,
                publishedAt: new Date(),
                features: {},
                images: {
                    create: [
                        { url: `https://images.unsplash.com/photo-1549317661-bd32c8ce0729?auto=format&fit=crop&q=80&w=800`, order: 0, verified: true },
                        { url: `https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800`, order: 1, verified: true }
                    ]
                }
            }
        });

        // Add first 3 cars as favorites for Demo User
        if (turboCars.indexOf(car) < 3) {
            await prisma.favorite.upsert({
                where: {
                    userId_listingId: {
                        userId: demoUser.id,
                        listingId: listing.id
                    }
                },
                update: {},
                create: {
                    userId: demoUser.id,
                    listingId: listing.id
                }
            });
        }
    }

    // Seed Ad Unit placements
    const adUnits = [
        { name: "Homepage Billboard", placementId: "HOME_BILLBOARD", type: AdUnitType.BANNER, width: 1200, height: 300, description: "Full-width banner after hero section" },
        { name: "Homepage Partners", placementId: "HOME_PARTNERS", type: AdUnitType.NATIVE, width: 1200, height: 200, description: "Featured partners section between categories" },
        { name: "Search Sidebar", placementId: "SEARCH_SIDEBAR", type: AdUnitType.BANNER, width: 300, height: 600, description: "Sidebar ad below filters (desktop only)" },
        { name: "Listing Native", placementId: "LISTING_NATIVE", type: AdUnitType.NATIVE, width: 400, height: 300, description: "Sponsored card injected in search results" },
        { name: "Detail Finance", placementId: "DETAIL_FINANCE", type: AdUnitType.BANNER, width: 300, height: 250, description: "Finance partner ad in detail sidebar" },
        { name: "Detail Footer", placementId: "DETAIL_FOOTER", type: AdUnitType.BANNER, width: 1200, height: 200, description: "Full-width banner before related cars" },
    ];

    for (const unit of adUnits) {
        await prisma.adUnit.upsert({
            where: { placementId: unit.placementId },
            update: { name: unit.name, type: unit.type, width: unit.width, height: unit.height, description: unit.description },
            create: unit,
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
