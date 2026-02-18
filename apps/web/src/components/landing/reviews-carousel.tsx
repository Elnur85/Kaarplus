"use client";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { StarRating } from "@/components/shared/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { Quote, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/constants";

interface Review {
    id: string;
    rating: number;
    title: string | null;
    body: string;
    createdAt: string;
    reviewer: {
        id: string;
        name: string | null;
        image: string | null;
    };
    car?: string;
}

export function ReviewsCarousel() {
    const { t } = useTranslation('home');
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/reviews/featured?limit=6`)
            .then((res) => res.json())
            .then((json) => {
                setReviews(json.data || []);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <section className="py-20 bg-slate-50 dark:bg-slate-900/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">{t('reviews.title')}</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">{t('reviews.subtitle')}</p>
                    </div>
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin text-primary h-8 w-8" />
                    </div>
                </div>
            </section>
        );
    }

    if (reviews.length === 0) {
        return (
            <section className="py-20 bg-slate-50 dark:bg-slate-900/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">{t('reviews.title')}</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">{t('reviews.subtitle')}</p>
                    </div>
                    <div className="text-center text-muted-foreground py-8">
                        {t('reviews.noReviews', { defaultValue: 'Hetkel ei ole ülevaateid' })}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-slate-50 dark:bg-slate-900/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">
                        {t('reviews.title')}
                    </h2>
                    <p className="text-slate-500 max-w-xl mx-auto">
                        {t('reviews.subtitle')}
                    </p>
                </div>

                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full max-w-5xl mx-auto"
                >
                    <CarouselContent className="-ml-4">
                        {reviews.map((review) => (
                            <CarouselItem key={review.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 h-full flex flex-col relative hover:shadow-lg transition-shadow">
                                    <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />
                                    <div className="flex items-center gap-4 mb-6">
                                        <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                                            <AvatarImage src={review.reviewer.image || undefined} alt={review.reviewer.name || ''} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                {review.reviewer.name?.[0] || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{review.reviewer.name}</p>
                                            {review.car && (
                                                <p className="text-xs font-semibold text-primary">{review.car}</p>
                                            )}
                                        </div>
                                    </div>
                                    <StarRating rating={review.rating} count={0} showCount={false} />
                                    <blockquote className="mt-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed flex-1">
                                        &quot;{review.body}&quot;
                                    </blockquote>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </section>
    );
}
