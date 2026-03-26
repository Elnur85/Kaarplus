"use client";

import { useFormContext } from "react-hook-form";
import { SellFormValues } from "@/schemas/sell-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { EquipmentCheckboxes } from "./equipment-checkboxes";
import { cn } from "@/lib/utils";

import { useTranslation } from "react-i18next";
import { SellReferenceData } from "@/lib/sell-reference-data";

interface Step2VehicleDataProps {
    validationAttempted?: boolean;
    referenceData: SellReferenceData;
    models: string[];
    isLoadingModels: boolean;
    modelError: Error | null;
    onRetryModels: () => void;
}

export function Step2VehicleData({
    validationAttempted,
    referenceData,
    models,
    isLoadingModels,
    modelError,
    onRetryModels,
}: Step2VehicleDataProps) {
    const { t } = useTranslation('sell');
    const { register, formState: { errors }, watch, setValue } = useFormContext<SellFormValues>();
    const selectedMake = watch("make");
    const selectedModel = watch("model");
    const conditions = [...referenceData.conditions];
    const isModelDisabled =
        !selectedMake || isLoadingModels || Boolean(modelError) || models.length === 0;

    const hasError = (fieldName: keyof SellFormValues) => {
        return validationAttempted && errors[fieldName];
    };

    const renderError = (fieldName: keyof SellFormValues) => {
        const message = errors[fieldName]?.message;

        if (!message) {
            return null;
        }

        return (
            <p className="text-xs text-destructive">
                {t(String(message), { defaultValue: String(message) })}
            </p>
        );
    };

    const renderModelState = () => {
        if (!selectedMake) {
            return (
                <p className="text-xs text-muted-foreground">
                    {t("step2.modelState.selectMakeFirst")}
                </p>
            );
        }

        if (isLoadingModels) {
            return (
                <p className="text-xs text-muted-foreground">
                    {t("step2.modelState.loading")}
                </p>
            );
        }

        if (modelError) {
            return (
                <div className="flex items-center gap-2 text-xs text-destructive">
                    <span>{t("step2.modelState.error")}</span>
                    <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-xs"
                        onClick={onRetryModels}
                    >
                        {t("common:errorBoundary.retry")}
                    </Button>
                </div>
            );
        }

        if (models.length === 0) {
            return (
                <p className="text-xs text-muted-foreground">
                    {t("step2.modelState.empty")}
                </p>
            );
        }

        return null;
    };

    return (
        <div className="space-y-12">
            {/* Contact Info Section */}
            <section className="space-y-6" data-error={hasError("contactName") || hasError("contactEmail") || hasError("contactPhone") ? "true" : undefined}>
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                    {t('step2.sections.contact')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="contactName">{t('step2.labels.contactName')}</Label>
                        <Input
                            id="contactName"
                            placeholder={t('step2.placeholders.contactName')}
                            {...register("contactName")}
                            className={cn(hasError("contactName") && "border-destructive ring-1 ring-destructive")}
                        />
                        {renderError("contactName")}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contactEmail">{t('step2.labels.contactEmail')}</Label>
                        <Input
                            id="contactEmail"
                            type="email"
                            placeholder={t('step2.placeholders.contactEmail')}
                            {...register("contactEmail")}
                            className={cn(hasError("contactEmail") && "border-destructive ring-1 ring-destructive")}
                        />
                        {renderError("contactEmail")}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contactPhone">{t('step2.labels.contactPhone')}</Label>
                        <Input
                            id="contactPhone"
                            placeholder={t('step2.placeholders.contactPhone')}
                            {...register("contactPhone")}
                            className={cn(hasError("contactPhone") && "border-destructive ring-1 ring-destructive")}
                        />
                        {renderError("contactPhone")}
                    </div>
                </div>
            </section>

            {/* Main Info Section */}
            <section className="space-y-6 pt-6 border-t" data-error={hasError("make") || hasError("model") ? "true" : undefined}>
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                    {t('step2.sections.main')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="make">{t('step2.labels.make')}</Label>
                        <Select
                            onValueChange={(value) => {
                                setValue("make", value, { shouldValidate: true });
                                setValue("model", "", { shouldValidate: true });
                            }}
                            value={selectedMake}
                        >
                            <SelectTrigger className={cn(hasError("make") && "border-destructive ring-1 ring-destructive")}>
                                <SelectValue placeholder={t('step2.placeholders.make')} />
                            </SelectTrigger>
                            <SelectContent>
                                {referenceData.makes.map((m) => (
                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {renderError("make")}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="model">{t('step2.labels.model')}</Label>
                        <Select
                            onValueChange={(value) => setValue("model", value, { shouldValidate: true })}
                            value={selectedModel}
                            disabled={isModelDisabled}
                        >
                            <SelectTrigger className={cn(hasError("model") && "border-destructive ring-1 ring-destructive")}>
                                <SelectValue placeholder={t('step2.placeholders.model')} />
                            </SelectTrigger>
                            <SelectContent>
                                {models.map((model) => (
                                    <SelectItem key={model} value={model}>
                                        {model}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {renderError("model")}
                        {renderModelState()}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="variant">{t('step2.labels.variant')}</Label>
                        <Input
                            id="variant"
                            placeholder={t('step2.placeholders.variant')}
                            {...register("variant")}
                        />
                    </div >

                    <div className="space-y-2">
                        <Label htmlFor="year">{t('step2.labels.year')}</Label>
                        <Input
                            id="year"
                            type="number"
                            placeholder={t('step2.placeholders.year')}
                            {...register("year")}
                            className={cn(hasError("year") && "border-destructive ring-1 ring-destructive")}
                        />
                        {renderError("year")}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">{t('step2.labels.price')}</Label>
                        <div className="relative">
                            <Input
                                id="price"
                                type="number"
                                placeholder={t('step2.placeholders.price')}
                                {...register("price")}
                                className={cn("pl-8", hasError("price") && "border-destructive ring-1 ring-destructive")}
                            />
                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">€</span>
                        </div>
                        {renderError("price")}
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50 h-[58px]">
                        <Label htmlFor="priceVatIncluded" className="cursor-pointer">{t('step2.labels.priceVatIncluded')}</Label>
                        <Switch
                            id="priceVatIncluded"
                            checked={watch("priceVatIncluded")}
                            onCheckedChange={(v) => setValue("priceVatIncluded", v)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="mileage">{t('step2.labels.mileage')}</Label>
                        <Input
                            id="mileage"
                            type="number"
                            placeholder={t('step2.placeholders.mileage')}
                            {...register("mileage")}
                            className={cn(hasError("mileage") && "border-destructive ring-1 ring-destructive")}
                        />
                        {renderError("mileage")}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">{t('step2.labels.location')}</Label>
                        <Select
                            onValueChange={(v) => setValue("location", v, { shouldValidate: true })}
                            value={watch("location")}
                        >
                            <SelectTrigger className={cn(hasError("location") && "border-destructive ring-1 ring-destructive")}>
                                <SelectValue placeholder={t('step2.placeholders.location')} />
                            </SelectTrigger>
                            <SelectContent>
                                {referenceData.locations.map((city) => (
                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {renderError("location")}
                    </div>
                </div>
            </section>

            {/* Technical Specs Section */}
            <section className="space-y-6 pt-6 border-t">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                    {t('step2.sections.specs')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="fuelType">{t('step2.labels.fuelType')}</Label>
                        <Select
                            onValueChange={(v) => setValue("fuelType", v, { shouldValidate: true })}
                            value={watch("fuelType")}
                        >
                            <SelectTrigger className={cn(hasError("fuelType") && "border-destructive ring-1 ring-destructive")}>
                                <SelectValue placeholder={t('step2.placeholders.fuel')} />
                            </SelectTrigger>
                            <SelectContent>
                                {referenceData.fuelTypes.map((f) => (
                                    <SelectItem key={f} value={f}>
                                        {t(`options.fuel.${f}`, { defaultValue: f })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {renderError("fuelType")}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="transmission">{t('step2.labels.transmission')}</Label>
                        <Select
                            onValueChange={(v) => setValue("transmission", v, { shouldValidate: true })}
                            value={watch("transmission")}
                        >
                            <SelectTrigger className={cn(hasError("transmission") && "border-destructive ring-1 ring-destructive")}>
                                <SelectValue placeholder={t('step2.placeholders.transmission')} />
                            </SelectTrigger>
                            <SelectContent>
                                {referenceData.transmissions.map((t_item) => (
                                    <SelectItem key={t_item} value={t_item}>
                                        {t(`options.transmission.${t_item}`, {
                                            defaultValue: t_item,
                                        })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {renderError("transmission")}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="powerKw">{t('step2.labels.powerKw')}</Label>
                        <div className="relative">
                            <Input
                                id="powerKw"
                                type="number"
                                placeholder={t('step2.placeholders.power')}
                                {...register("powerKw")}
                                className={cn(hasError("powerKw") && "border-destructive ring-1 ring-destructive")}
                            />
                            <div className="absolute right-3 top-2.5 text-xs text-muted-foreground bg-background px-1">
                                {watch("powerKw") ? t('step2.labels.powerHj', { count: Math.round(Number(watch("powerKw")) * 1.341) }) : t('step2.labels.powerHjEmpty')}
                            </div>
                        </div>
                        {renderError("powerKw")}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="driveType">{t('step2.labels.driveType')}</Label>
                        <Select
                            onValueChange={(v) => setValue("driveType", v, { shouldValidate: true })}
                            value={watch("driveType")}
                        >
                            <SelectTrigger className={cn(hasError("driveType") && "border-destructive ring-1 ring-destructive")}>
                                <SelectValue placeholder={t('step2.placeholders.drive')} />
                            </SelectTrigger>
                            <SelectContent>
                                {referenceData.driveTypes.map((d) => (
                                    <SelectItem key={d} value={d}>
                                        {t(`options.drive.${d}`, { defaultValue: d })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {renderError("driveType")}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="doors">{t('step2.labels.doors')}</Label>
                        <Select
                            onValueChange={(v) => setValue("doors", Number(v), { shouldValidate: true })}
                            value={watch("doors")?.toString()}
                        >
                            <SelectTrigger className={cn(hasError("doors") && "border-destructive ring-1 ring-destructive")}>
                                <SelectValue placeholder={t('step2.placeholders.doors')} />
                            </SelectTrigger>
                            <SelectContent>
                                {[2, 3, 4, 5].map((d) => (
                                    <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {renderError("doors")}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="seats">{t('step2.labels.seats')}</Label>
                        <Select
                            onValueChange={(v) => setValue("seats", Number(v), { shouldValidate: true })}
                            value={watch("seats")?.toString()}
                        >
                            <SelectTrigger className={cn(hasError("seats") && "border-destructive ring-1 ring-destructive")}>
                                <SelectValue placeholder={t('step2.placeholders.seats')} />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => (
                                    <SelectItem key={s} value={s.toString()}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {renderError("seats")}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="colorExterior">{t('step2.labels.colorExterior')}</Label>
                        <Select
                            onValueChange={(value) => setValue("colorExterior", value, { shouldValidate: true })}
                            value={watch("colorExterior")}
                        >
                            <SelectTrigger className={cn(hasError("colorExterior") && "border-destructive ring-1 ring-destructive")}>
                                <SelectValue placeholder={t('step2.placeholders.color')} />
                            </SelectTrigger>
                            <SelectContent>
                                {referenceData.colors.map((color) => (
                                    <SelectItem key={color} value={color}>
                                        {color}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {renderError("colorExterior")}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="colorInterior">{t('step2.labels.colorInterior')}</Label>
                        <Input
                            id="colorInterior"
                            placeholder={t('step2.placeholders.colorInterior')}
                            {...register("colorInterior")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="condition">{t('step2.labels.condition')}</Label>
                        <Select
                            onValueChange={(v) => setValue("condition", v, { shouldValidate: true })}
                            value={watch("condition")}
                        >
                            <SelectTrigger className={cn(hasError("condition") && "border-destructive ring-1 ring-destructive")}>
                                <SelectValue placeholder={t('step2.placeholders.condition')} />
                            </SelectTrigger>
                            <SelectContent>
                                {conditions.map((c) => (
                                    <SelectItem key={c} value={c}>{t(`options.condition.${c}`)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {renderError("condition")}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="vin">{t('step2.labels.vin')}</Label>
                        <Input
                            id="vin"
                            placeholder={t('step2.placeholders.vin')}
                            {...register("vin")}
                            className={cn("uppercase", errors.vin && "border-destructive ring-1 ring-destructive")}
                        />
                        {renderError("vin")}
                    </div>
                </div>
            </section>

            <section className="space-y-6 pt-6 border-t">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                    {t('step2.sections.features')}
                </h3>
                <EquipmentCheckboxes />
            </section>

            <section className="space-y-6 pt-6 border-t">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
                    {t('step2.sections.description')}
                </h3>
                <div className="space-y-2">
                    <Label htmlFor="description">{t('step2.labels.description')}</Label>
                    <Textarea
                        id="description"
                        placeholder={t('step2.placeholders.description')}
                        className="min-h-[150px]"
                        {...register("description")}
                    />
                    {renderError("description")}
                    <p className="text-[10px] text-right text-muted-foreground">
                        {t('step2.charCount', { count: watch("description")?.length || 0 })}
                    </p>
                </div>
            </section>
        </div>
    );
}
