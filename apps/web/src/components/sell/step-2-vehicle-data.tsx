"use client";

import { useFormContext } from "react-hook-form";
import { SellFormValues } from "@/schemas/sell-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { EquipmentCheckboxes } from "./equipment-checkboxes";
import { UseFormReturn } from "react-hook-form";

import { useTranslation } from "react-i18next";

interface Step2VehicleDataProps {
    form: UseFormReturn<SellFormValues>;
}

export function Step2VehicleData({ form }: Step2VehicleDataProps) {
    const { t } = useTranslation('sell');
    const { register, formState: { errors }, watch, setValue } = form;

    const makes = ["Audi", "BMW", "Mercedes-Benz", "Toyota", "Volkswagen", "Volvo", "Tesla", "Porsche"];
    const fuelTypes = ["Bensiin", "Diisel", "Hübriid", "Elekter", "CNG", "LPG"];
    const transmissions = ["Manuaal", "Automaat"];
    const driveTypes = ["Esivedu", "Tagavedu", "Nelivedu (AWD)", "Nelivedu (4WD)"];
    const conditions = ["Uus", "Uueväärne", "Kasutatud", "Vigastatud"];

    return (
        <div className="space-y-12">
            <section className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                    {t('step2.sections.main')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="make">{t('step2.labels.make')}</Label>
                        <Select onValueChange={(v) => setValue("make", v, { shouldValidate: true })} defaultValue={watch("make")}>
                            <SelectTrigger className={errors.make ? "border-destructive text-destructive" : ""}>
                                <SelectValue placeholder={t('step2.placeholders.make')} />
                            </SelectTrigger>
                            <SelectContent>
                                {makes.map((m) => (
                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.make && <p className="text-xs text-destructive">{errors.make.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="model">{t('step2.labels.model')}</Label>
                        <Input
                            id="model"
                            placeholder={t('step2.placeholders.model')}
                            {...register("model")}
                            className={errors.model ? "border-destructive" : ""}
                        />
                        {errors.model && <p className="text-xs text-destructive">{errors.model.message}</p>}
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
                            className={errors.year ? "border-destructive" : ""}
                        />
                        {errors.year && <p className="text-xs text-destructive">{errors.year.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">{t('step2.labels.price')}</Label>
                        <div className="relative">
                            <Input
                                id="price"
                                type="number"
                                placeholder={t('step2.placeholders.price')}
                                {...register("price")}
                                className={cn("pl-8", errors.price ? "border-destructive" : "")}
                            />
                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">€</span>
                        </div>
                        {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
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
                            className={errors.mileage ? "border-destructive" : ""}
                        />
                        {errors.mileage && <p className="text-xs text-destructive">{errors.mileage.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">{t('step2.labels.location')}</Label>
                        <Input
                            id="location"
                            placeholder={t('step2.placeholders.location')}
                            {...register("location")}
                            className={errors.location ? "border-destructive" : ""}
                        />
                        {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
                    </div>
                </div>
            </section>

            <section className="space-y-6 pt-6 border-t">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                    {t('step2.sections.specs')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="fuelType">{t('step2.labels.fuelType')}</Label>
                        <Select onValueChange={(v) => setValue("fuelType", v, { shouldValidate: true })} defaultValue={watch("fuelType")}>
                            <SelectTrigger className={errors.fuelType ? "border-destructive text-destructive" : ""}>
                                <SelectValue placeholder={t('step2.placeholders.fuel')} />
                            </SelectTrigger>
                            <SelectContent>
                                {fuelTypes.map((f) => (
                                    <SelectItem key={f} value={f}>{t(`options.fuel.${f}`)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.fuelType && <p className="text-xs text-destructive">{errors.fuelType.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="transmission">{t('step2.labels.transmission')}</Label>
                        <Select onValueChange={(v) => setValue("transmission", v, { shouldValidate: true })} defaultValue={watch("transmission")}>
                            <SelectTrigger className={errors.transmission ? "border-destructive text-destructive" : ""}>
                                <SelectValue placeholder={t('step2.placeholders.transmission')} />
                            </SelectTrigger>
                            <SelectContent>
                                {transmissions.map((t_item) => (
                                    <SelectItem key={t_item} value={t_item}>{t(`options.transmission.${t_item}`)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.transmission && <p className="text-xs text-destructive">{errors.transmission.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="powerKw">{t('step2.labels.powerKw')}</Label>
                        <div className="relative">
                            <Input
                                id="powerKw"
                                type="number"
                                placeholder="0"
                                {...register("powerKw")}
                                className={errors.powerKw ? "border-destructive" : ""}
                            />
                            <div className="absolute right-3 top-2.5 text-xs text-muted-foreground bg-background px-1">
                                {watch("powerKw") ? t('step2.labels.powerHj', { count: Math.round(Number(watch("powerKw")) * 1.341) }) : "— hj"}
                            </div>
                        </div>
                        {errors.powerKw && <p className="text-xs text-destructive">{errors.powerKw.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="driveType">{t('step2.labels.driveType')}</Label>
                        <Select onValueChange={(v) => setValue("driveType", v, { shouldValidate: true })} defaultValue={watch("driveType")}>
                            <SelectTrigger className={errors.driveType ? "border-destructive text-destructive" : ""}>
                                <SelectValue placeholder={t('step2.placeholders.drive')} />
                            </SelectTrigger>
                            <SelectContent>
                                {driveTypes.map((d) => (
                                    <SelectItem key={d} value={d}>{t(`options.drive.${d}`)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.driveType && <p className="text-xs text-destructive">{errors.driveType.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="doors">{t('step2.labels.doors')}</Label>
                        <Select onValueChange={(v) => setValue("doors", Number(v), { shouldValidate: true })} defaultValue={watch("doors")?.toString()}>
                            <SelectTrigger className={errors.doors ? "border-destructive text-destructive" : ""}>
                                <SelectValue placeholder={t('step2.placeholders.doors')} />
                            </SelectTrigger>
                            <SelectContent>
                                {[2, 3, 4, 5].map((d) => (
                                    <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.doors && <p className="text-xs text-destructive">{errors.doors.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="seats">{t('step2.labels.seats')}</Label>
                        <Select onValueChange={(v) => setValue("seats", Number(v), { shouldValidate: true })} defaultValue={watch("seats")?.toString()}>
                            <SelectTrigger className={errors.seats ? "border-destructive text-destructive" : ""}>
                                <SelectValue placeholder={t('step2.placeholders.seats')} />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => (
                                    <SelectItem key={s} value={s.toString()}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.seats && <p className="text-xs text-destructive">{errors.seats.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="colorExterior">{t('step2.labels.colorExterior')}</Label>
                        <Input
                            id="colorExterior"
                            placeholder={t('step2.placeholders.color')}
                            {...register("colorExterior")}
                            className={errors.colorExterior ? "border-destructive" : ""}
                        />
                        {errors.colorExterior && <p className="text-xs text-destructive">{errors.colorExterior.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="condition">{t('step2.labels.condition')}</Label>
                        <Select onValueChange={(v) => setValue("condition", v, { shouldValidate: true })} defaultValue={watch("condition")}>
                            <SelectTrigger className={errors.condition ? "border-destructive text-destructive" : ""}>
                                <SelectValue placeholder={t('step2.placeholders.condition')} />
                            </SelectTrigger>
                            <SelectContent>
                                {conditions.map((c) => (
                                    <SelectItem key={c} value={c}>{t(`options.condition.${c}`)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.condition && <p className="text-xs text-destructive">{errors.condition.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="vin">{t('step2.labels.vin')}</Label>
                        <Input
                            id="vin"
                            placeholder={t('step2.placeholders.vin')}
                            {...register("vin")}
                            className={cn("uppercase", errors.vin ? "border-destructive" : "")}
                        />
                        {errors.vin && <p className="text-xs text-destructive">{errors.vin.message}</p>}
                    </div>
                </div>
            </section>

            <section className="space-y-6 pt-6 border-t">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                    {t('step2.sections.features')}
                </h3>
                <EquipmentCheckboxes form={form} />
            </section>

            <section className="space-y-6 pt-6 border-t">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
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
                    <p className="text-[10px] text-right text-muted-foreground">
                        {t('step2.charCount', { count: watch("description")?.length || 0 })}
                    </p>
                </div>
            </section>
        </div>
    );
}


import { cn } from "@/lib/utils";
