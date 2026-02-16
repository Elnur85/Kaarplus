"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sellFormSchema, SellFormValues } from "@/schemas/sell-form";
import { StepIndicator } from "./step-indicator";
import { Step1VehicleType } from "./step-1-vehicle-type";
import { Step2VehicleData } from "./step-2-vehicle-data";
import { Step3PhotoUpload } from "./step-3-photo-upload";
import { Step4Confirmation } from "./step-4-confirmation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useTranslation } from "react-i18next";

export function SellWizard() {
    const { t } = useTranslation('sell');
    const { data: session } = useSession();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [listingId, setListingId] = useState<string | null>(null);
    const [images, setImages] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

    const steps = [
        { id: 1, name: t('steps.type') },
        { id: 2, name: t('steps.data') },
        { id: 3, name: t('steps.photos') },
        { id: 4, name: t('steps.confirmation') },
    ];

    const form = useForm({
        resolver: zodResolver(sellFormSchema),
        defaultValues: {
            contactName: session?.user?.name || "",
            contactEmail: session?.user?.email || "",
            contactPhone: "",
            make: "",
            model: "",
            year: new Date().getFullYear(),
            priceVatIncluded: true,
            features: {},
            bodyType: "",
            mileage: 0,
        },
    });

    const nextStep = async () => {
        let isValid = false;

        if (currentStep === 1) {
            isValid = !!form.getValues("bodyType");
            if (!isValid) {
                toast({
                    variant: "destructive",
                    title: t('toasts.errorTitle'),
                    description: t('toasts.selectType'),
                });
            }
        } else if (currentStep === 2) {
            isValid = await form.trigger();
            if (!isValid) {
                toast({
                    variant: "destructive",
                    title: t('toasts.errorTitle'),
                    description: t('toasts.fillRequired'),
                });
            }
        } else if (currentStep === 3) {
            isValid = images.length >= 3;
            if (!isValid) {
                toast({
                    variant: "destructive",
                    title: t('toasts.errorTitle'),
                    description: t('toasts.minPhotos'),
                });
            }
        }

        if (isValid) {
            setCurrentStep((prev) => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => prev - 1);
        window.scrollTo(0, 0);
    };

    const uploadToS3 = async (file: File, listingId: string): Promise<string> => {
        // 1. Get presigned URL
        const presignRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/uploads/presign`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session?.user?.apiToken}`,
            },
            body: JSON.stringify({
                fileName: file.name,
                fileType: file.type,
                listingId: listingId,
            }),
        });

        if (!presignRes.ok) throw new Error(`Presign failed for ${file.name}`);
        const { uploadUrl, publicUrl } = await presignRes.json();

        // 2. Upload to S3
        const uploadRes = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": file.type,
            },
        });

        if (!uploadRes.ok) throw new Error(`Upload failed for ${file.name}`);

        return publicUrl;
    };

    const onSubmit = async () => {
        setIsSubmitting(true);
        try {
            // 1. Prepare data for API (WITHOUT images first)
            const values = form.getValues();
            const listingData = {
                make: values.make,
                model: values.model,
                variant: values.variant,
                year: Number(values.year),
                vin: values.vin,
                mileage: Number(values.mileage),
                price: Number(values.price),
                priceVatIncluded: values.priceVatIncluded,
                bodyType: values.bodyType,
                fuelType: values.fuelType,
                transmission: values.transmission,
                powerKw: Number(values.powerKw),
                driveType: values.driveType,
                doors: Number(values.doors),
                seats: Number(values.seats),
                colorExterior: values.colorExterior,
                colorInterior: values.colorInterior,
                condition: values.condition,
                description: values.description,
                features: values.features,
                location: values.location,
            };

            // 2. Create Listing
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.user?.apiToken}`,
                },
                body: JSON.stringify(listingData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || t('toasts.createError'));
            }

            const result = await res.json();
            const newListingId = result.data.id;
            setListingId(newListingId);

            // 3. Upload images to S3
            toast({
                title: t('toasts.uploadingTitle'),
                description: t('toasts.uploadingDesc', { count: images.length }),
            });

            const imageUrls = await Promise.all(
                images.map((file, index) => uploadToS3(file, newListingId).then(url => ({ url, order: index })))
            );

            // 4. Attach images to Listing
            const attachRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/${newListingId}/images`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.user?.apiToken}`,
                },
                body: JSON.stringify({ images: imageUrls }),
            });

            if (!attachRes.ok) {
                throw new Error(t('toasts.attachError'));
            }

            setCurrentStep(4);
            toast({
                title: t('toasts.successTitle'),
                description: t('toasts.successDesc'),
            });
        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: t('toasts.errorTitle'),
                description: error.message || t('toasts.saveError'),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (currentStep === 4 && listingId) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-8 md:p-12 transition-all">
                <Step4Confirmation listingId={listingId} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <StepIndicator currentStep={currentStep} steps={steps} />

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
                <div className="p-8 md:p-12">
                    {currentStep === 1 && (
                        <Step1VehicleType
                            selectedType={form.watch("bodyType")}
                            onSelect={(type) => form.setValue("bodyType", type, { shouldValidate: true })}
                        />
                    )}

                    {currentStep === 2 && (
                        <Step2VehicleData form={form as any} />
                    )}

                    {currentStep === 3 && (
                        <Step3PhotoUpload files={images} onFilesChange={setImages} />
                    )}
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={currentStep === 1 || isSubmitting}
                        className={cn("gap-2 font-bold", currentStep === 1 && "invisible")}
                    >
                        <ArrowLeft size={18} /> {t('buttons.back')}
                    </Button>

                    <div className="flex gap-4">
                        {currentStep < 3 ? (
                            <Button onClick={nextStep} className="px-8 font-bold gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                                {t('buttons.next')} <ArrowRight size={18} />
                            </Button>
                        ) : (
                            <Button
                                onClick={onSubmit}
                                disabled={isSubmitting || images.length < 3}
                                className="px-10 font-bold gap-2 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" /> {t('buttons.saving')}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} /> {t('buttons.publish')}
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <p className="text-center text-xs text-muted-foreground pt-4">
                {t('footer.termsText')}
            </p>
        </div>
    );
}

