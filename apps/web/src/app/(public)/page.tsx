import type { Metadata } from "next";
import { HeroSection } from "@/components/landing/hero-section";
import { VehicleCategories } from "@/components/landing/vehicle-categories";
import { CategoryGrid } from "@/components/landing/category-grid";
import { ValuePropositions } from "@/components/landing/value-propositions";
import { PopularBrands } from "@/components/landing/popular-brands";
import { ReviewsCarousel } from "@/components/landing/reviews-carousel";
import { StatisticsSection } from "@/components/landing/statistics-section";
import { FaqSection } from "@/components/landing/faq-section";
import { NewsletterSignup } from "@/components/landing/newsletter-signup";

import { JsonLd } from "@/components/shared/json-ld";
import { AdSlot } from "@/components/shared/ad-slot";
import { generateWebsiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Kaarplus | Autode ost ja müük Eestis - Elektri- ja hübriidautod",
  description:
    "Eesti kaasaegseim autode ost-müügi platvorm. Kontrollitud elektriautod, hübriidid ja sisepõlemismootoriga sõidukid. Turvalised tehingud ja usaldusväärsed müüjad.",
};

export default function HomePage() {
  const websiteJsonLd = generateWebsiteJsonLd();

  return (
    <main className="flex min-h-screen flex-col">
      <JsonLd data={websiteJsonLd} />
      {/* 1. Hero Section + Search Bar (integrated) */}
      <HeroSection />

      {/* Ad: Billboard after hero */}
      <AdSlot placementId="HOME_BILLBOARD" className="container px-4 -mt-4 mb-8" />

      {/* 2. Vehicle Categories (Buy / Electric / Hybrid tabs) */}
      <VehicleCategories />

      {/* 3. Category Grid (8 body types with icons) */}
      <CategoryGrid />

      {/* Ad: Featured Partners */}
      <AdSlot placementId="HOME_PARTNERS" className="container px-4 my-8" />

      {/* 4. Value Propositions (4 cards) */}
      <ValuePropositions />

      {/* 5. Popular Brands (8 brands) */}
      <PopularBrands />

      {/* 6. Customer Reviews (Carvago-style) */}
      <ReviewsCarousel />

      {/* 7. Statistics (Animated counters) */}
      <StatisticsSection />

      {/* 8. FAQ Accordion */}
      <FaqSection />

      {/* 9. Newsletter Signup */}
      <NewsletterSignup />
    </main>
  );
}
