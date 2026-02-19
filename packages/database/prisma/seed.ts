import { PrismaClient, UserRole, ListingStatus, AdUnitType } from '@prisma/client';

const prisma = new PrismaClient();

// Car data for realistic seeding
const CAR_DATA = {
    makes: [
        { name: 'BMW', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg', popularity: 100 },
        { name: 'Mercedes-Benz', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Benz_Logo_2010.svg', popularity: 95 },
        { name: 'Audi', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg', popularity: 90 },
        { name: 'Volkswagen', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg', popularity: 85 },
        { name: 'Toyota', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_car_logo.svg', popularity: 80 },
        { name: 'Volvo', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Volvo_logo.svg', popularity: 75 },
        { name: 'Tesla', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg', popularity: 70 },
        { name: 'Porsche', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Porsche_logo.svg', popularity: 65 },
        { name: 'Skoda', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Skoda_logo_2022.svg', popularity: 60 },
        { name: 'Ford', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_logo_flat.svg', popularity: 55 },
        { name: 'Hyundai', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Hyundai_Motor_Company_logo.svg', popularity: 50 },
        { name: 'Kia', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Kia_logo_2021.svg', popularity: 45 },
        { name: 'Lexus', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Lexus_logo_2023.svg', popularity: 40 },
        { name: 'Nissan', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Nissan_2020_logo.svg', popularity: 35 },
        { name: 'Honda', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Honda_logo.svg', popularity: 30 },
    ],
    models: {
        'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'X1', '1 Series', '7 Series', 'X6', '4 Series', '2 Series'],
        'Mercedes-Benz': ['C-Class', 'E-Class', 'A-Class', 'GLC', 'GLE', 'S-Class', 'CLA', 'GLA', 'G-Class', 'V-Class'],
        'Audi': ['A4', 'A6', 'Q5', 'A3', 'Q7', 'Q3', 'A5', 'e-tron', 'Q8', 'TT'],
        'Volkswagen': ['Golf', 'Passat', 'Tiguan', 'Polo', 'Touareg', 'Arteon', 'T-Roc', 'ID.4', 'Transporter', 'Jetta'],
        'Toyota': ['Corolla', 'RAV4', 'Camry', 'Yaris', 'Land Cruiser', 'C-HR', 'Prius', 'Hilux', 'Supra', 'Highlander'],
        'Volvo': ['XC60', 'XC90', 'V60', 'S60', 'XC40', 'V90', 'S90', 'C40', 'EX30', 'EX90'],
        'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'],
        'Porsche': ['911', 'Cayenne', 'Panamera', 'Macan', 'Taycan', 'Cayman', 'Boxster'],
        'Skoda': ['Octavia', 'Superb', 'Kodiaq', 'Karoq', 'Fabia', 'Scala', 'Enyaq', 'Kamiq'],
        'Ford': ['Focus', 'Fiesta', 'Kuga', 'Mondeo', 'Puma', 'Mustang', 'Explorer', 'Transit', 'Ranger'],
        'Hyundai': ['i30', 'Tucson', 'Kona', 'i20', 'Santa Fe', 'Bayon', 'IONIQ 5', 'i10', 'Venue'],
        'Kia': ['Ceed', 'Sportage', 'Sorento', 'Picanto', 'Stonic', 'Niro', 'EV6', 'XCeed', 'Proceed'],
        'Lexus': ['RX', 'NX', 'IS', 'ES', 'UX', 'LX', 'RC', 'LC', 'RZ'],
        'Nissan': ['Qashqai', 'Juke', 'X-Trail', 'Micra', 'Leaf', 'Navara', 'Ariya', 'Primera'],
        'Honda': ['Civic', 'CR-V', 'Jazz', 'HR-V', 'Accord', 'e', 'NSX', 'ZRV'],
    },
    // New hierarchical body types: category:subtype
    bodyTypes: [
        'passengerCar:sedan',
        'passengerCar:hatchback',
        'passengerCar:touring',
        'passengerCar:minivan',
        'passengerCar:coupe',
        'passengerCar:cabriolet',
        'passengerCar:pickup',
        'suv:touring',
        'suv:coupe',
        'commercialVehicle:commercial',
        'truck:saddle',
    ],
    fuelTypes: ['Petrol', 'Diesel', 'Hybrid', 'Electric'],
    transmissions: ['Manual', 'Automatic'],
    colors: ['Black', 'White', 'Silver', 'Grey', 'Blue', 'Red', 'Green', 'Brown', 'Beige', 'Yellow', 'Orange'],
    locations: ['Tallinn', 'Tartu', 'Pärnu', 'Narva', 'Harjumaa', 'Viljandi', 'Rakvere', 'Kuressaare', 'Jõhvi'],
};

// Sample car images from Unsplash
const CAR_IMAGES = [
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0729?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1606152421702-821294830f63?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1614200028447-906033bb56ee?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=1200',
];

// Features for each category
const CAR_FEATURES = {
    comfort: ['Leather Seats', 'Navigation System', 'Cruise Control', 'Climate Control', 'Heated Seats', 'Sunroof', 'Electric Seats', 'Memory Seats', 'Panoramic Roof', 'Ambient Lighting', 'Wireless Charging', 'Apple CarPlay', 'Android Auto'],
    safety: ['ABS', 'Airbags', 'Lane Assist', 'Blind Spot Monitor', 'Parking Sensors', 'Rear Camera', '360 Camera', 'Adaptive Cruise', 'Emergency Brake', 'Traction Control', 'Stability Control', 'ISOFIX', 'Tire Pressure Monitor'],
    exterior: ['Alloy Wheels', 'LED Headlights', 'Fog Lights', 'Roof Rails', 'Privacy Glass', 'Metallic Paint', 'Sport Package', 'Body Kit', 'Panoramic Sunroof', 'Power Tailgate', 'Tow Bar', 'Xenon Lights'],
};

// Estonian descriptions for listings
const ESTONIAN_DESCRIPTIONS = [
    'Väga heas korras auto. Hooldatud regulaarselt esinduses. Kõik hooldused tehtud õigel ajal.',
    'Sõidanud ainult linnas. Ei ole kunagi õnnetuses olnud. Originaal läbisõit.',
    'Ühe omaniku auto. Hooldusraamat esindusest. Kõik lisad olemas.',
    'Sportlik ja ökonoomne. Hea varustustase. Vahetatud õigeaegselt kõik kulumisosad.',
    'Pereauto, mida on hoolikalt kasutatud. Suur pagasiruum. Mugav pikemateks sõitudeks.',
    'Premium klassi auto. Luksuslik sisustus. Täisvarustus.',
    'Just vahetatud pidurikettad ja klotsid. Uued rehvid. Tehtud suur hooldus.',
    'Garantii kehtib veel 2 aastat. Hooldusvaba ajalugu.',
    'Eritellimusel tellitud värv. Unikaalne konfiguratsioon. Haruldane varustus.',
    'Sooduspakkumine! Kiire müük. Hind kokkuleppeline.',
];

function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFeatures() {
    return {
        comfort: getRandomItems(CAR_FEATURES.comfort, getRandomInt(3, 8)),
        safety: getRandomItems(CAR_FEATURES.safety, getRandomInt(4, 10)),
        exterior: getRandomItems(CAR_FEATURES.exterior, getRandomInt(2, 6)),
    };
}

function generatePrice(year: number, make: string): number {
    const basePrice = 15000;
    const yearFactor = (year - 2010) * 2000;
    const makeFactor = ['Porsche', 'Mercedes-Benz', 'BMW', 'Audi'].includes(make) ? 1.5 : 1;
    const randomFactor = getRandomInt(-5000, 15000);
    return Math.round((basePrice + yearFactor + randomFactor) * makeFactor / 100) * 100;
}

function generateListing(make: string, model: string, userId: string, status: ListingStatus = ListingStatus.ACTIVE) {
    const year = getRandomInt(2015, 2024);
    const bodyType = getRandomItem(CAR_DATA.bodyTypes);
    const fuelType = getRandomItem(CAR_DATA.fuelTypes);
    const transmission = fuelType === 'Electric' ? 'Automatic' : getRandomItem(CAR_DATA.transmissions);
    const price = generatePrice(year, make);
    const mileage = getRandomInt(5000, 200000);

    // Parse body type for doors/seats logic
    const isPassengerCar = bodyType.startsWith('passengerCar');
    const isSUV = bodyType.startsWith('suv');
    const isCoupe = bodyType.includes('coupe');

    return {
        userId,
        make,
        model,
        variant: `${getRandomInt(15, 50)} ${getRandomItem(['TDI', 'TSI', 'd', 'i', 'e', 'TFSI', 'CDI', 'BlueHDi', 'dCi'])}`,
        year,
        mileage,
        price,
        priceVatIncluded: Math.random() > 0.3,
        bodyType,
        fuelType,
        transmission,
        powerKw: getRandomInt(60, 400),
        driveType: getRandomItem(['FWD', 'RWD', 'AWD']),
        doors: isCoupe ? 2 : getRandomItem([3, 4, 5]),
        seats: isCoupe ? 2 : getRandomItem([4, 5, 7]),
        colorExterior: getRandomItem(CAR_DATA.colors),
        colorInterior: getRandomItem(['Black', 'Beige', 'Brown', 'Grey', 'Red']),
        condition: mileage < 10000 ? 'New' : 'Used',
        location: getRandomItem(CAR_DATA.locations),
        status,
        description: getRandomItem(ESTONIAN_DESCRIPTIONS),
        features: generateFeatures(),
        publishedAt: status === ListingStatus.ACTIVE ? new Date() : null,
        verifiedAt: status === ListingStatus.ACTIVE ? new Date() : null,
    };
}

async function main() {
    console.log('🌱 Starting comprehensive seed...');

    const passwordHash = '$2b$10$Rci8sWp2x5wYiUr9Nt94Se6NsHYx52ToZJCXWzlfXnylu06vw8ca.'; // password123

    // Create users with new USER role
    const admin = await prisma.user.upsert({
        where: { email: 'admin@kaarplus.ee' },
        update: {},
        create: {
            email: 'admin@kaarplus.ee',
            name: 'Admin User',
            role: UserRole.ADMIN,
            passwordHash,
        },
    });

    const dealer1 = await prisma.user.upsert({
        where: { email: 'tallinnautos@example.ee' },
        update: {},
        create: {
            email: 'tallinnautos@example.ee',
            name: 'Tallinn Autos OÜ',
            role: UserRole.DEALERSHIP,
            dealershipId: 'tallinn-autos-1',
            passwordHash,
            phone: '+372 5555 1111',
            address: 'Pärnu mnt 123, Tallinn',
            website: 'https://tallinnautos.ee',
            bio: 'Usaldusväärne autodealer Tallinnas. Pakume laia valikut kasutatud autosid ja professionaalset teenindust.',
        },
    });

    const dealer2 = await prisma.user.upsert({
        where: { email: 'premiumcars@example.ee' },
        update: {},
        create: {
            email: 'premiumcars@example.ee',
            name: 'Premium Cars Eesti',
            role: UserRole.DEALERSHIP,
            dealershipId: 'premium-cars-1',
            passwordHash,
            phone: '+372 5555 2222',
            address: 'Narva mnt 45, Tallinn',
            website: 'https://premiumcars.ee',
            bio: 'Premium klassi autode müük. Sertifitseeritud kasutatud autod garantiiga.',
        },
    });

    const dealer3 = await prisma.user.upsert({
        where: { email: 'tartuauto@example.ee' },
        update: {},
        create: {
            email: 'tartuauto@example.ee',
            name: 'Tartu Autokeskus',
            role: UserRole.DEALERSHIP,
            dealershipId: 'tartu-auto-1',
            passwordHash,
            phone: '+372 5555 3333',
            address: 'Ringtee 67, Tartu',
            website: 'https://tartuauto.ee',
            bio: 'Tartu suurim autodealer. Ostmine, müük, vahetus, liising.',
        },
    });

    // Regular users with USER role (can buy and sell)
    const seller1 = await prisma.user.upsert({
        where: { email: 'jaan.tamm@example.ee' },
        update: {},
        create: {
            email: 'jaan.tamm@example.ee',
            name: 'Jaan Tamm',
            role: UserRole.USER,
            passwordHash,
            phone: '+372 5123 4567',
        },
    });

    const seller2 = await prisma.user.upsert({
        where: { email: 'mari.kask@example.ee' },
        update: {},
        create: {
            email: 'mari.kask@example.ee',
            name: 'Mari Kask',
            role: UserRole.USER,
            passwordHash,
            phone: '+372 5234 5678',
        },
    });

    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@kaarplus.ee' },
        update: {},
        create: {
            email: 'demo@kaarplus.ee',
            name: 'Demo User',
            role: UserRole.USER,
            passwordHash,
        },
    });

    console.log('👤 Users created');

    // Generate listings - mix of ACTIVE and PENDING for variety
    const listings = [];
    const listingImages = [];

    // Create 80+ active listings across different makes and models
    const users = [dealer1, dealer2, dealer3, seller1, seller2];

    for (let i = 0; i < 80; i++) {
        const make = getRandomItem(CAR_DATA.makes).name;
        const model = getRandomItem(CAR_DATA.models[make as keyof typeof CAR_DATA.models] || CAR_DATA.models['BMW']);
        const user = getRandomItem(users);
        const status = Math.random() > 0.1 ? ListingStatus.ACTIVE : ListingStatus.PENDING;

        const listingData = generateListing(make, model, user.id, status);
        listings.push(listingData);
    }

    // Create the listings with images
    for (const listingData of listings) {
        const imageCount = getRandomInt(3, 8);
        const images = Array.from({ length: imageCount }, (_, i) => ({
            url: CAR_IMAGES[i % CAR_IMAGES.length] + `&listing=${Math.random().toString(36).substring(7)}`,
            order: i,
            verified: listingData.status === ListingStatus.ACTIVE,
        }));

        await prisma.listing.create({
            data: {
                ...listingData,
                images: {
                    create: images,
                },
            },
        });
    }

    console.log(`🚗 Created ${listings.length} listings with hierarchical body types`);

    // Create reviews for dealers
    const reviewers = [
        { name: 'Mari Tamm', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
        { name: 'Jüri Sepp', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
        { name: 'Anna Kuusk', image: 'https://randomuser.me/api/portraits/women/68.jpg' },
        { name: 'Toomas Kask', image: 'https://randomuser.me/api/portraits/men/45.jpg' },
        { name: 'Liina Rebane', image: 'https://randomuser.me/api/portraits/women/22.jpg' },
        { name: 'Kristjan Saar', image: 'https://randomuser.me/api/portraits/men/67.jpg' },
    ];

    const reviewTexts = [
        { text: 'Suurepärane kogemus. Auto oli täpselt selline nagu kirjeldatud, ja müüja oli väga professionaalne.', rating: 5 },
        { text: 'Ostmine oli lihtne ja kiire. Kontrollitud ajalugu andis kindlustunde. Soovitan!', rating: 4 },
        { text: 'Väga rahul ostuga. Kaarplus aitas leida ideaalse auto.', rating: 5 },
        { text: 'Professionaalne teenindus. Autoga on kõik korras, nagu lubatud.', rating: 5 },
        { text: 'Hea suhtlus müüjaga. Auto üleandmine toimus kiirelt.', rating: 4 },
        { text: 'Soovitan soojalt! Aus ja läbipaistev tehing.', rating: 5 },
        { text: 'Väga hea hinnang auto seisukorrale. Ei pettunud.', rating: 4 },
        { text: 'Suurepärane valik autosid ja hea klienditeenindus.', rating: 5 },
    ];

    // Create reviewer users and their reviews
    for (const reviewer of reviewers) {
        const user = await prisma.user.upsert({
            where: { email: `${reviewer.name.toLowerCase().replace(' ', '.')}@example.ee` },
            update: {},
            create: {
                email: `${reviewer.name.toLowerCase().replace(' ', '.')}@example.ee`,
                name: reviewer.name,
                role: UserRole.USER,
                passwordHash,
                image: reviewer.image,
            },
        });

        // Create 1-3 reviews per reviewer
        const reviewCount = getRandomInt(1, 3);
        for (let i = 0; i < reviewCount; i++) {
            const target = getRandomItem([dealer1, dealer2, dealer3, seller1, seller2]);
            const reviewData = getRandomItem(reviewTexts);

            await prisma.review.create({
                data: {
                    reviewerId: user.id,
                    targetId: target.id,
                    rating: reviewData.rating,
                    title: reviewData.rating === 5 ? 'Väga rahul' : 'Hea kogemus',
                    body: reviewData.text,
                    verified: Math.random() > 0.3,
                },
            });
        }
    }

    console.log('⭐ Reviews created');

    // Create favorites for demo user
    const activeListings = await prisma.listing.findMany({
        where: { status: ListingStatus.ACTIVE },
        take: 10,
        select: { id: true },
    });

    for (const listing of activeListings) {
        await prisma.favorite.upsert({
            where: {
                userId_listingId: {
                    userId: demoUser.id,
                    listingId: listing.id,
                },
            },
            update: {},
            create: {
                userId: demoUser.id,
                listingId: listing.id,
            },
        });
    }

    console.log('❤️ Favorites created for demo user');

    // Seed Ad Units
    const adUnits = [
        { name: 'Homepage Billboard', placementId: 'HOME_BILLBOARD', type: AdUnitType.BANNER, width: 1200, height: 300, description: 'Full-width banner after hero section' },
        { name: 'Homepage Partners', placementId: 'HOME_PARTNERS', type: AdUnitType.NATIVE, width: 1200, height: 200, description: 'Featured partners section between categories' },
        { name: 'Search Sidebar', placementId: 'SEARCH_SIDEBAR', type: AdUnitType.BANNER, width: 300, height: 600, description: 'Sidebar ad below filters (desktop only)' },
        { name: 'Listing Native', placementId: 'LISTING_NATIVE', type: AdUnitType.NATIVE, width: 400, height: 300, description: 'Sponsored card injected in search results' },
        { name: 'Detail Finance', placementId: 'DETAIL_FINANCE', type: AdUnitType.BANNER, width: 300, height: 250, description: 'Finance partner ad in detail sidebar' },
        { name: 'Detail Footer', placementId: 'DETAIL_FOOTER', type: AdUnitType.BANNER, width: 1200, height: 200, description: 'Full-width banner before related cars' },
    ];

    for (const unit of adUnits) {
        await prisma.adUnit.upsert({
            where: { placementId: unit.placementId },
            update: {},
            create: unit,
        });
    }

    console.log('📢 Ad units created');

    // Create newsletter subscribers
    const newsletterEmails = ['subscriber1@example.ee', 'subscriber2@example.ee', 'subscriber3@example.ee'];
    for (const email of newsletterEmails) {
        await prisma.newsletter.upsert({
            where: { email },
            update: {},
            create: {
                email,
                language: 'et',
                active: true,
            },
        });
    }

    console.log('📧 Newsletter subscribers created');

    console.log('✅ Seed completed successfully!');
    console.log(`
📊 Summary:
   - Users: 7 (1 admin, 3 dealers, 3 regular users + 6 reviewers)
   - Listings: ${listings.length} (mix of active and pending, with hierarchical body types)
   - Reviews: Multiple reviews for sellers
   - Favorites: ${activeListings.length} for demo user
   - Ad Units: ${adUnits.length}
    `);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
