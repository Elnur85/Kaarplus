/**
 * SEO & JSON-LD Helpers
 */

interface Vehicle {
    id: string;
    make: string;
    model: string;
    variant?: string;
    year: number;
    price: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    bodyType: string;
    description?: string;
    images?: { url: string }[];
    colorExterior?: string;
    powerKw?: number;
    location?: string;
}

export function generateOrganizationJsonLd() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Kaarplus",
        "url": "https://kaarplus.ee",
        "logo": "https://kaarplus.ee/logo.png",
        "sameAs": [
            "https://facebook.com/kaarplus",
            "https://instagram.com/kaarplus"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+372-000-0000",
            "contactType": "customer service",
            "areaServed": "EE",
            "availableLanguage": ["Estonian", "Russian", "English"]
        }
    };
}

export function generateWebsiteJsonLd() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Kaarplus",
        "url": "https://kaarplus.ee",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://kaarplus.ee/listings?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };
}

export function generateVehicleJsonLd(vehicle: Vehicle) {
    const title = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.variant || ""}`;
    const url = `https://kaarplus.ee/listings/${vehicle.id}`;
    const images = vehicle.images?.map(img => img.url) || [];

    return {
        "@context": "https://schema.org",
        "@type": "Car",
        "name": title,
        "description": vehicle.description || `Müüa ${title}. Läbisõit: ${vehicle.mileage} km, kütus: ${vehicle.fuelType}, käigukast: ${vehicle.transmission}.`,
        "image": images,
        "url": url,
        "brand": {
            "@type": "Brand",
            "name": vehicle.make
        },
        "model": vehicle.model,
        "vehicleModelDate": vehicle.year,
        "bodyType": vehicle.bodyType,
        "fuelType": vehicle.fuelType,
        "vehicleTransmission": vehicle.transmission,
        "mileageFromOdometer": {
            "@type": "QuantitativeValue",
            "value": vehicle.mileage,
            "unitCode": "KMT"
        },
        "color": vehicle.colorExterior,
        "enginePower": vehicle.powerKw ? {
            "@type": "QuantitativeValue",
            "value": vehicle.powerKw,
            "unitCode": "KWT"
        } : undefined,
        "offers": {
            "@type": "Offer",
            "price": vehicle.price,
            "priceCurrency": "EUR",
            "availability": "https://schema.org/InStock",
            "url": url,
            "areaServed": "EE"
        },
        "itemCondition": "https://schema.org/UsedCondition"
    };
}

export function generateBreadcrumbJsonLd(items: { name: string; item: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.item
        }))
    };
}

export function generateFaqJsonLd(faqs: { question: string; answer: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };
}
