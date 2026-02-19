"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
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

// Step 2 required fields for validation
const STEP_2_REQUIRED_FIELDS: (keyof SellFormValues)[] = [
    "contactName",
    "contactEmail",
    "contactPhone",
    "make",
    "model",
    "year",
    "mileage",
    "price",
    "location",
    "bodyType",
    "fuelType",
    "transmission",
    "powerKw",
    "driveType",
    "doors",
    "seats",
    "colorExterior",
    "condition",
];

export function SellWizard() {
    const { t } = useTranslation('sell');
    const { data: session } = useSession();
    const { toast } = useToast();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [listingId, setListingId] = useState<string | null>(null);
    const [images, setImages] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [validationAttempted, setValidationAttempted] = useState(false);

    const steps = [
        { id: 1, name: t('steps.type') },
        { id: 2, name: t('steps.data') },
        { id: 3, name: t('steps.photos') },
        { id: 4, name: t('steps.confirmation') },
    ];

    const form = useForm({
        resolver: zodResolver(sellFormSchema),
        mode: "onChange",
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
            price: 0,
            location: "",
            fuelType: "",
            transmission: "",
            powerKw: 0,
            driveType: "",
            doors: 4,
            seats: 5,
            colorExterior: "",
            condition: "",
            vin: "",
            variant: "",
            colorInterior: "",
            description: "",
        } as SellFormValues,
    });

    // Update form values when session loads
    useEffect(() => {
        if (session?.user) {
            if (session.user.name) {
                form.setValue("contactName", session.user.name);
            }
            if (session.user.email) {
                form.setValue("contactEmail", session.user.email);
            }
        }
    }, [session, form]);

    const scrollToFirstError = () => {
        setTimeout(() => {
            const firstErrorElement = document.querySelector('[data-error="true"]');
            if (firstErrorElement) {
                firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add a highlight effect
                firstErrorElement.classList.add('ring-2', 'ring-destructive', 'ring-offset-2');
                setTimeout(() => {
                    firstErrorElement.classList.remove('ring-2', 'ring-destructive', 'ring-offset-2');
                }, 2000);
            }
        }, 100);
    };

    const nextStep = async () => {
        let isValid = false;
        setValidationAttempted(true);

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
            // Trigger validation for required fields only
            const result = await form.trigger(STEP_2_REQUIRED_FIELDS);
            isValid = result;

            if (!isValid) {
                const errors = form.formState.errors;
                const errorFields = Object.keys(errors);

                toast({
                    variant: "destructive",
                    title: t('toasts.errorTitle'),
                    description: errorFields.length > 0
                        ? `${t('toasts.fillRequired')} (${errorFields.length} ${t('toasts.fieldsError')})`
                        : t('toasts.fillRequired'),
                });

                scrollToFirstError();
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
            setValidationAttempted(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => prev - 1);
        setValidationAttempted(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const uploadToS3 = async (file: File, listingId: string): Promise<string> => {
        // 1. Get presigned URL
        const presignRes = await fetch(`/api/v1/uploads/presign`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
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

            // Helper to nullify empty strings for optional fields
            const cleanValue = (val: any) => (typeof val === 'string' && val.trim() === '' ? null : val);

            const listingData = {
                make: values.make,
                model: values.model,
                variant: cleanValue(values.variant),
                year: Number(values.year),
                vin: cleanValue(values.vin),
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
                colorInterior: cleanValue(values.colorInterior),
                condition: values.condition,
                description: cleanValue(values.description),
                features: values.features,
                location: values.location,
            };

            // 2. Create Listing
            const res = await fetch(`/api/v1/listings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(listingData),
            });

            if (!res.ok) {
                const errorData = await res.json();

                // Detailed error message for validation errors
                let errorMessage = errorData.error || errorData.message || t('toasts.createError');

                // If there are specific validation details, map them to form fields
                if (errorData.details && Array.isArray(errorData.details)) {
                    let firstErrorStep = 4;
                    const STEP_1_FIELDS = ["bodyType"];

                    errorData.details.forEach((d: any) => {
                        // Map field names if they differ
                        const fieldName = d.field as keyof SellFormValues;
                        form.setError(fieldName, {
                            type: "server",
                            message: d.message
                        });

                        // Determine the earliest step with an error
                        if (STEP_1_FIELDS.includes(d.field)) {
                            firstErrorStep = Math.min(firstErrorStep, 1);
                        } else if (d.field !== "images") {
                            firstErrorStep = Math.min(firstErrorStep, 2);
                        } else {
                            firstErrorStep = Math.min(firstErrorStep, 3);
                        }
                    });

                    // Redirect user to the first step that has an error
                    if (firstErrorStep < 4) {
                        setCurrentStep(firstErrorStep);
                        setValidationAttempted(true);
                        scrollToFirstError();
                    }

                    const detailMessages = errorData.details.map((d: any) => `${d.field}: ${d.message}`);
                    errorMessage = `${errorMessage}\n\n• ${detailMessages.join('\n• ')}`;
                }

                throw new Error(errorMessage);
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
            const attachRes = await fetch(`/api/v1/listings/${newListingId}/images`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
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

            // Try to parse the error message if it's JSON (sometimes happens with server errors)
            let errorMessage = error.message || t('toasts.saveError');

            // If it's a validation error from our custom fetch logic, we might have mapped details already
            // but let's make it more robust by checking if message contains bullet points (our previous formatting)
            // or if we can extract structured data.

            toast({
                variant: "destructive",
                title: t('toasts.errorTitle'),
                description: errorMessage,
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
        <FormProvider {...form}>
            <div className="space-y-8">
                <StepIndicator currentStep={currentStep} steps={steps} />

                <div className={cn(
                    "bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300",
                    validationAttempted && "ring-1 ring-destructive/20"
                )}>
                    <div className="p-8 md:p-12">
                        {currentStep === 1 && (
                            <Step1VehicleType
                                selectedType={form.watch("bodyType")}
                                onSelect={(type) => form.setValue("bodyType", type, { shouldValidate: true })}
                            />
                        )}

                        {currentStep === 2 && (
                            <Step2VehicleData validationAttempted={validationAttempted} />
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
                                <Button
                                    onClick={nextStep}
                                    className="px-8 font-bold gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                                >
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
        </FormProvider>
    );
}
