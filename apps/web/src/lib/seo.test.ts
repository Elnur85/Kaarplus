import { describe, it, expect } from 'vitest';
import {
    generateOrganizationJsonLd,
    generateWebsiteJsonLd,
    generateVehicleJsonLd,
    generateBreadcrumbJsonLd,
    generateFaqJsonLd,
} from './seo';

describe('SEO JSON-LD Generators', () => {
    describe('generateOrganizationJsonLd', () => {
        it('should generate valid organization schema', () => {
            const result = generateOrganizationJsonLd();
            
            expect(result['@context']).toBe('https://schema.org');
            expect(result['@type']).toBe('Organization');
            expect(result.name).toBe('Kaarplus');
            expect(result.url).toBe('https://kaarplus.ee');
            expect(result.logo).toBe('https://kaarplus.ee/logo.png');
            expect(result.sameAs).toContain('https://facebook.com/kaarplus');
            expect(result.sameAs).toContain('https://instagram.com/kaarplus');
        });

        it('should include contact point', () => {
            const result = generateOrganizationJsonLd();
            
            expect(result.contactPoint).toBeDefined();
            expect(result.contactPoint['@type']).toBe('ContactPoint');
            expect(result.contactPoint.areaServed).toBe('EE');
        });
    });

    describe('generateWebsiteJsonLd', () => {
        it('should generate valid website schema', () => {
            const result = generateWebsiteJsonLd();
            
            expect(result['@context']).toBe('https://schema.org');
            expect(result['@type']).toBe('WebSite');
            expect(result.name).toBe('Kaarplus');
            expect(result.url).toBe('https://kaarplus.ee');
        });

        it('should include search action', () => {
            const result = generateWebsiteJsonLd();
            
            expect(result.potentialAction).toBeDefined();
            expect(result.potentialAction['@type']).toBe('SearchAction');
            expect(result.potentialAction.target).toContain('{search_term_string}');
        });
    });

    describe('generateVehicleJsonLd', () => {
        const mockVehicle = {
            id: 'test-123',
            make: 'Toyota',
            model: 'Corolla',
            variant: 'Hybrid',
            year: 2020,
            price: 15000,
            mileage: 50000,
            fuelType: 'Hybrid',
            transmission: 'Automatic',
            bodyType: 'Sedan',
            description: 'Test description',
            images: [{ url: 'https://example.com/image1.jpg' }, { url: 'https://example.com/image2.jpg' }],
            colorExterior: 'Silver',
            powerKw: 90,
            location: 'Tallinn',
        };

        it('should generate valid car schema', () => {
            const result = generateVehicleJsonLd(mockVehicle);
            
            expect(result['@context']).toBe('https://schema.org');
            expect(result['@type']).toBe('Car');
            expect(result.name).toContain('Toyota');
            expect(result.name).toContain('Corolla');
        });

        it('should include all vehicle details', () => {
            const result = generateVehicleJsonLd(mockVehicle);
            
            expect(result.brand.name).toBe('Toyota');
            expect(result.model).toBe('Corolla');
            expect(result.vehicleModelDate).toBe(2020);
            expect(result.bodyType).toBe('Sedan');
            expect(result.fuelType).toBe('Hybrid');
            expect(result.vehicleTransmission).toBe('Automatic');
            expect(result.color).toBe('Silver');
        });

        it('should format mileage correctly', () => {
            const result = generateVehicleJsonLd(mockVehicle);
            
            expect(result.mileageFromOdometer).toEqual({
                '@type': 'QuantitativeValue',
                value: 50000,
                unitCode: 'KMT',
            });
        });

        it('should include engine power when provided', () => {
            const result = generateVehicleJsonLd(mockVehicle);
            
            expect(result.enginePower).toEqual({
                '@type': 'QuantitativeValue',
                value: 90,
                unitCode: 'KWT',
            });
        });

        it('should include offer information', () => {
            const result = generateVehicleJsonLd(mockVehicle);
            
            expect(result.offers['@type']).toBe('Offer');
            expect(result.offers.price).toBe(15000);
            expect(result.offers.priceCurrency).toBe('EUR');
            expect(result.offers.availability).toBe('https://schema.org/InStock');
        });

        it('should handle vehicle without optional fields', () => {
            const minimalVehicle = {
                id: 'test-456',
                make: 'Honda',
                model: 'Civic',
                year: 2019,
                price: 12000,
                mileage: 60000,
                fuelType: 'Petrol',
                transmission: 'Manual',
                bodyType: 'Hatchback',
            };

            const result = generateVehicleJsonLd(minimalVehicle as any);
            
            expect(result['@type']).toBe('Car');
            expect(result.image).toEqual([]);
            expect(result.enginePower).toBeUndefined();
        });

        it('should generate default description when not provided', () => {
            const vehicleWithoutDesc = { ...mockVehicle, description: undefined };
            const result = generateVehicleJsonLd(vehicleWithoutDesc);
            
            expect(result.description).toContain('Müüa');
            expect(result.description).toContain('Toyota');
            expect(result.description).toContain('50000 km');
        });
    });

    describe('generateBreadcrumbJsonLd', () => {
        it('should generate valid breadcrumb schema', () => {
            const items = [
                { name: 'Avaleht', item: 'https://kaarplus.ee' },
                { name: 'Kasutatud autod', item: 'https://kaarplus.ee/listings' },
                { name: 'Toyota', item: 'https://kaarplus.ee/listings?make=Toyota' },
            ];

            const result = generateBreadcrumbJsonLd(items);
            
            expect(result['@context']).toBe('https://schema.org');
            expect(result['@type']).toBe('BreadcrumbList');
            expect(result.itemListElement).toHaveLength(3);
        });

        it('should assign correct positions', () => {
            const items = [
                { name: 'Home', item: 'https://example.com' },
                { name: 'Category', item: 'https://example.com/cat' },
            ];

            const result = generateBreadcrumbJsonLd(items);
            
            expect(result.itemListElement[0].position).toBe(1);
            expect(result.itemListElement[1].position).toBe(2);
        });

        it('should handle empty items array', () => {
            const result = generateBreadcrumbJsonLd([]);
            
            expect(result.itemListElement).toEqual([]);
        });
    });

    describe('generateFaqJsonLd', () => {
        it('should generate valid FAQ schema', () => {
            const faqs = [
                { question: 'What is this?', answer: 'This is a test.' },
                { question: 'How does it work?', answer: 'It works well.' },
            ];

            const result = generateFaqJsonLd(faqs);
            
            expect(result['@context']).toBe('https://schema.org');
            expect(result['@type']).toBe('FAQPage');
            expect(result.mainEntity).toHaveLength(2);
        });

        it('should format questions correctly', () => {
            const faqs = [{ question: 'Test question?', answer: 'Test answer.' }];

            const result = generateFaqJsonLd(faqs);
            
            expect(result.mainEntity[0]['@type']).toBe('Question');
            expect(result.mainEntity[0].name).toBe('Test question?');
            expect(result.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
            expect(result.mainEntity[0].acceptedAnswer.text).toBe('Test answer.');
        });

        it('should handle empty FAQ array', () => {
            const result = generateFaqJsonLd([]);
            
            expect(result.mainEntity).toEqual([]);
        });
    });
});
