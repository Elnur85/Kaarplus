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

const makes = ["Audi", "BMW", "Mercedes-Benz", "Toyota", "Volkswagen", "Volvo", "Tesla", "Porsche"];
const fuelTypes = ["Bensiin", "Diisel", "Hübriid", "Elekter", "CNG", "LPG"];
const transmissions = ["Manuaal", "Automaat"];
const driveTypes = ["Esivedu", "Tagavedu", "Nelivedu (AWD)", "Nelivedu (4WD)"];
const conditions = ["Uus", "Uueväärne", "Kasutatud", "Vigastatud"];

interface Step2VehicleDataProps {
    form: UseFormReturn<SellFormValues>;
}

export function Step2VehicleData({ form }: Step2VehicleDataProps) {
    const { register, formState: { errors }, watch, setValue } = form;

    return (
        <div className="space-y-12">
            <section className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                    Põhiandmed
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="make">Automark *</Label>
                        <Select onValueChange={(v) => setValue("make", v, { shouldValidate: true })} defaultValue={watch("make")}>
                            <SelectTrigger className={errors.make ? "border-destructive text-destructive" : ""}>
                                <SelectValue placeholder="Valige mark" />
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
                        <Label htmlFor="model">Mudel *</Label>
                        <Input
                            id="model"
                            placeholder="nt. 520d"
                            {...register("model")}
                            className={errors.model ? "border-destructive" : ""}
                        />
                        {errors.model && <p className="text-xs text-destructive">{errors.model.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="variant">Variant / Lisanimetus</Label>
                        <Input
                            id="variant"
                            placeholder="nt. xDrive Luxury Line"
                            {...register("variant")}
                        />
                    </div >

                    <div className="space-y-2">
                        <Label htmlFor="year">Aasta *</Label>
                        <Input
                            id="year"
                            type="number"
                            placeholder="2024"
                            {...register("year")}
                            className={errors.year ? "border-destructive" : ""}
                        />
                        {errors.year && <p className="text-xs text-destructive">{errors.year.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">Hind (€) *</Label>
                        <div className="relative">
                            <Input
                                id="price"
                                type="number"
                                placeholder="0"
                                {...register("price")}
                                className={cn("pl-8", errors.price ? "border-destructive" : "")}
                            />
                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">€</span>
                        </div>
                        {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50 h-[58px]">
                        <Label htmlFor="priceVatIncluded" className="cursor-pointer">KM-ga hind</Label>
                        <Switch
                            id="priceVatIncluded"
                            checked={watch("priceVatIncluded")}
                            onCheckedChange={(v) => setValue("priceVatIncluded", v)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="mileage">Läbisõit (km) *</Label>
                        <Input
                            id="mileage"
                            type="number"
                            placeholder="0"
                            {...register("mileage")}
                            className={errors.mileage ? "border-destructive" : ""}
                        />
                        {errors.mileage && <p className="text-xs text-destructive">{errors.mileage.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Asukoht (Linn/Maakond) *</Label>
                        <Input
                            id="location"
                            placeholder="nt. Tallinn, Harjumaa"
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
                    Tehnilised andmed
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="fuelType">Kütus *</Label>
                        <Select onValueChange={(v) => setValue("fuelType", v, { shouldValidate: true })} defaultValue={watch("fuelType")}>
                            <SelectTrigger className={errors.fuelType ? "border-destructive text-destructive" : ""}>
                                <SelectValue placeholder="Valige kütus" />
                            </SelectTrigger>
                            <SelectContent>
                                {fuelTypes.map((f) => (
                                    <SelectItem key={f} value={f}>{f}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.fuelType && <p className="text-xs text-destructive">{errors.fuelType.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="transmission">Käigukast *</Label>
                        <Select onValueChange={(v) => setValue("transmission", v, { shouldValidate: true })} defaultValue={watch("transmission")}>
                            <SelectTrigger className={errors.transmission ? "border-destructive text-destructive" : ""}>
                                <SelectValue placeholder="Valige käigukast" />
                            </SelectTrigger>
                            <SelectContent>
                                {transmissions.map((t) => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.transmission && <p className="text-xs text-destructive">{errors.transmission.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="powerKw">Võimsus (kW) *</Label>
                        <div className="relative">
                            <Input
                                id="powerKw"
                                type="number"
                                placeholder="0"
                                {...register("powerKw")}
                                className={errors.powerKw ? "border-destructive" : ""}
                            />
                            <div className="absolute right-3 top-2.5 text-xs text-muted-foreground bg-background px-1">
                                {watch("powerKw") ? `${Math.round(Number(watch("powerKw")) * 1.341)} hj` : "— hj"}
                            </div>
                        </div>
                        {errors.powerKw && <p className="text-xs text-destructive">{errors.powerKw.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="driveType">Vedu *</Label>
                        <Select onValueChange={(v) => setValue("driveType", v, { shouldValidate: true })} defaultValue={watch("driveType")}>
                            <SelectTrigger className={errors.driveType ? "border-destructive text-destructive" : ""}>
                                <SelectValue placeholder="Valige vedu" />
                            </SelectTrigger>
                            <SelectContent>
                                {driveTypes.map((d) => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.driveType && <p className="text-xs text-destructive">{errors.driveType.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="doors">Uksed *</Label>
                        <Select onValueChange={(v) => setValue("doors", Number(v), { shouldValidate: true })} defaultValue={watch("doors")?.toString()}>
                            <SelectTrigger className={errors.doors ? "border-destructive text-destructive" : ""}>
                                <SelectValue placeholder="Arv" />
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
                        <Label htmlFor="seats">Istekohad *</Label>
                        <Select onValueChange={(v) => setValue("seats", Number(v), { shouldValidate: true })} defaultValue={watch("seats")?.toString()}>
                            <SelectTrigger className={errors.seats ? "border-destructive text-destructive" : ""}>
                                <SelectValue placeholder="Arv" />
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
                        <Label htmlFor="colorExterior">Välisvärv *</Label>
                        <Input
                            id="colorExterior"
                            placeholder="nt. Must metallik"
                            {...register("colorExterior")}
                            className={errors.colorExterior ? "border-destructive" : ""}
                        />
                        {errors.colorExterior && <p className="text-xs text-destructive">{errors.colorExterior.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="condition">Seisukord *</Label>
                        <Select onValueChange={(v) => setValue("condition", v, { shouldValidate: true })} defaultValue={watch("condition")}>
                            <SelectTrigger className={errors.condition ? "border-destructive text-destructive" : ""}>
                                <SelectValue placeholder="Valige seisukord" />
                            </SelectTrigger>
                            <SelectContent>
                                {conditions.map((c) => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.condition && <p className="text-xs text-destructive">{errors.condition.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="vin">VIN-kood (17 tähemärki)</Label>
                        <Input
                            id="vin"
                            placeholder="VIN1234567890ABCD"
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
                    Varustus
                </h3>
                <EquipmentCheckboxes form={form} />
            </section>

            <section className="space-y-6 pt-6 border-t">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                    Kirjeldus
                </h3>
                <div className="space-y-2">
                    <Label htmlFor="description">Lühiajalugu, hooldusinfo jms</Label>
                    <Textarea
                        id="description"
                        placeholder="Räägi oma autost lähemalt..."
                        className="min-h-[150px]"
                        {...register("description")}
                    />
                    <p className="text-[10px] text-right text-muted-foreground">
                        {watch("description")?.length || 0} / 5000 tähemärki
                    </p>
                </div>
            </section>
        </div>
    );
}

import { cn } from "@/lib/utils";
