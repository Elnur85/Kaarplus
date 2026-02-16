import Link from "next/link";
import Image from "next/image";

export function PopularBrands() {
    const brands = [
        { name: "BMW", count: 1240, logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg" },
        { name: "Mercedes-Benz", count: 890, logo: "https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Benz_Logo_2010.svg" },
        { name: "Audi", count: 750, logo: "https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg" },
        { name: "Volkswagen", count: 1100, logo: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg" },
        { name: "Toyota", count: 620, logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_car_logo.svg" },
        { name: "Volvo", count: 480, logo: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Volvo_logo.svg" },
        { name: "Ford", count: 350, logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_logo_flat.svg" },
        { name: "Skoda", count: 420, logo: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Skoda_logo_2022.svg" },
    ];

    return (
        <section className="container py-16 px-4 md:px-6">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold">Populaarsed margid</h2>
                    <p className="text-muted-foreground">Sirvi sõidukeid eelistatud tootja järgi</p>
                </div>
                <Link href="/listings" className="text-primary font-medium hover:underline">
                    Vaata kõiki
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
                {brands.map((brand) => (
                    <Link
                        key={brand.name}
                        href={`/listings?make=${brand.name.toLowerCase()}`}
                        className="flex flex-col items-center p-4 bg-white rounded-xl border border-border hover:shadow-md transition-shadow group"
                    >
                        <div className="relative h-12 w-12 mb-3 grayscale group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100">
                            <Image
                                src={brand.logo}
                                alt={brand.name}
                                fill
                                className="object-contain"
                                sizes="48px"
                            />
                        </div>
                        <span className="font-semibold text-sm">{brand.name}</span>
                        <span className="text-xs text-muted-foreground">{brand.count} kuulutust</span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
