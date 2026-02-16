"use client";

import { useEffect, useRef, useState } from "react";
import { useFilterStore } from "@/store/use-filter-store";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RotateCcw, Search } from "lucide-react";
import { API_URL } from "@/lib/constants";

const fuelTypes = ["Bensiin", "Diisel", "Hübriid", "Elekter", "Gaas"];
const bodyTypes = [
    "Sedaan",
    "Universaal",
    "Maastur",
    "Kupee",
    "Kabriolett",
    "Mahtuniversaal",
    "Pikap",
    "Väikeautod",
];
const driveTypes = [
    { value: "FWD", label: "Esivedu (FWD)" },
    { value: "RWD", label: "Tagavedu (RWD)" },
    { value: "AWD", label: "Nelikvedu (AWD)" },
    { value: "4WD", label: "Nelikvedu (4WD)" },
];
const colorOptions = [
    "Must",
    "Valge",
    "Hall",
    "Hõbedane",
    "Sinine",
    "Punane",
    "Roheline",
    "Pruun",
    "Beež",
    "Kollane",
    "Oranž",
];
const doorOptions = ["2", "3", "4", "5"];
const seatOptions = ["2", "4", "5", "6", "7", "8+"];
const conditionOptions = [
    { value: "new", label: "Uus" },
    { value: "used", label: "Kasutatud" },
    { value: "certified", label: "Sertifitseeritud" },
];
const locationOptions = [
    "Tallinn",
    "Tartu",
    "Pärnu",
    "Narva",
    "Haapsalu",
    "Viljandi",
    "Rakvere",
    "Kuressaare",
    "Jõhvi",
];

export function AdvancedFilters() {
    const filters = useFilterStore();
    const [makes, setMakes] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const currentMake = filters.make;

    useEffect(() => {
        fetch(`${API_URL}/api/search/makes`)
            .then((res) => res.json())
            .then((json) => setMakes(json.data || []))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!currentMake || currentMake === "none") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setModels([]);
            return;
        }

        let cancelled = false;
        fetch(`${API_URL}/api/search/models?make=${currentMake}`)
            .then((res) => res.json())
            .then((json) => {
                if (!cancelled) setModels(json.data || []);
            })
            .catch(console.error);

        return () => {
            cancelled = true;
        };
    }, [currentMake]);

    const activeFilterCount = getActiveFilterCount(filters);

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-lg flex items-center gap-2">
                    <Search size={18} className="text-primary" />
                    Täppisotsing
                </h2>
                <div className="flex items-center gap-3">
                    {activeFilterCount > 0 && (
                        <span className="text-xs font-medium text-muted-foreground">
                            {activeFilterCount} filtrit
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs font-semibold text-primary hover:text-primary/80 hover:bg-primary/5 p-0 h-auto"
                        onClick={filters.resetFilters}
                    >
                        <RotateCcw size={12} className="mr-1" /> Lähtesta kõik
                    </Button>
                </div>
            </div>

            <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
                <Accordion
                    type="multiple"
                    defaultValue={["basic", "price", "year-mileage", "technical"]}
                    className="px-5"
                >
                    {/* Basic Search */}
                    <AccordionItem value="basic">
                        <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">
                            Põhiotsing
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3 pb-4">
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    Otsingusõna
                                </Label>
                                <Input
                                    placeholder="Otsi margi, mudeli, kirjelduse järgi..."
                                    value={filters.q}
                                    onChange={(e) => filters.setFilter("q", e.target.value)}
                                    className="text-sm"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    Mark
                                </Label>
                                <Select
                                    value={filters.make}
                                    onValueChange={(val) => {
                                        filters.setFilter("make", val);
                                        filters.setFilter("model", "");
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Kõik margid" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Kõik margid</SelectItem>
                                        {makes.map((make) => (
                                            <SelectItem key={make} value={make}>
                                                {make}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    Mudel
                                </Label>
                                <Select
                                    value={filters.model}
                                    onValueChange={(val) => filters.setFilter("model", val)}
                                    disabled={!filters.make || filters.make === "none"}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Kõik mudelid" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Kõik mudelid</SelectItem>
                                        {models.map((model) => (
                                            <SelectItem key={model} value={model}>
                                                {model}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Price */}
                    <AccordionItem value="price">
                        <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">
                            Hind
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                            <div className="flex gap-2 items-center">
                                <div className="relative flex-1">
                                    <Input
                                        placeholder="Min"
                                        value={filters.priceMin}
                                        onChange={(e) =>
                                            filters.setFilter("priceMin", e.target.value)
                                        }
                                        className="text-sm pr-7"
                                        type="number"
                                    />
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                        &euro;
                                    </span>
                                </div>
                                <span className="text-muted-foreground text-sm">-</span>
                                <div className="relative flex-1">
                                    <Input
                                        placeholder="Max"
                                        value={filters.priceMax}
                                        onChange={(e) =>
                                            filters.setFilter("priceMax", e.target.value)
                                        }
                                        className="text-sm pr-7"
                                        type="number"
                                    />
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                        &euro;
                                    </span>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Year & Mileage */}
                    <AccordionItem value="year-mileage">
                        <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">
                            Aasta ja läbisõit
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pb-4">
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    Aasta
                                </Label>
                                <div className="flex gap-2">
                                    <Select
                                        value={filters.yearMin}
                                        onValueChange={(val) =>
                                            filters.setFilter("yearMin", val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Alates" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Kõik</SelectItem>
                                            {Array.from(
                                                { length: 30 },
                                                (_, i) => new Date().getFullYear() - i
                                            ).map((y) => (
                                                <SelectItem key={y} value={y.toString()}>
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={filters.yearMax}
                                        onValueChange={(val) =>
                                            filters.setFilter("yearMax", val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Kuni" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Kõik</SelectItem>
                                            {Array.from(
                                                { length: 30 },
                                                (_, i) => new Date().getFullYear() - i
                                            ).map((y) => (
                                                <SelectItem key={y} value={y.toString()}>
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    Läbisõit (km)
                                </Label>
                                <div className="flex gap-2 items-center">
                                    <Input
                                        placeholder="Min"
                                        value={filters.mileageMin}
                                        onChange={(e) =>
                                            filters.setFilter("mileageMin", e.target.value)
                                        }
                                        className="text-sm"
                                        type="number"
                                    />
                                    <span className="text-muted-foreground text-sm">-</span>
                                    <Input
                                        placeholder="Max"
                                        value={filters.mileageMax}
                                        onChange={(e) =>
                                            filters.setFilter("mileageMax", e.target.value)
                                        }
                                        className="text-sm"
                                        type="number"
                                    />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Technical */}
                    <AccordionItem value="technical">
                        <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">
                            Tehniline
                        </AccordionTrigger>
                        <AccordionContent className="space-y-5 pb-4">
                            {/* Fuel Type */}
                            <div>
                                <Label className="text-xs text-muted-foreground mb-2 block">
                                    Kütus
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {fuelTypes.map((fuel) => (
                                        <div
                                            key={fuel}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={`adv-fuel-${fuel}`}
                                                checked={filters.fuelType.includes(fuel)}
                                                onCheckedChange={() =>
                                                    filters.toggleFuelType(fuel)
                                                }
                                            />
                                            <label
                                                htmlFor={`adv-fuel-${fuel}`}
                                                className="text-sm leading-none cursor-pointer"
                                            >
                                                {fuel}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Transmission */}
                            <div>
                                <Label className="text-xs text-muted-foreground mb-2 block">
                                    Käigukast
                                </Label>
                                <RadioGroup
                                    value={filters.transmission}
                                    onValueChange={(val) =>
                                        filters.setFilter("transmission", val)
                                    }
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="all" id="adv-t-all" />
                                        <Label
                                            htmlFor="adv-t-all"
                                            className="text-sm font-normal"
                                        >
                                            Kõik
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="automatic" id="adv-t-auto" />
                                        <Label
                                            htmlFor="adv-t-auto"
                                            className="text-sm font-normal"
                                        >
                                            Automaat
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="manual" id="adv-t-manual" />
                                        <Label
                                            htmlFor="adv-t-manual"
                                            className="text-sm font-normal"
                                        >
                                            Manuaal
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Body Type */}
                            <div>
                                <Label className="text-xs text-muted-foreground mb-2 block">
                                    Keretüüp
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {bodyTypes.map((body) => (
                                        <div
                                            key={body}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={`adv-body-${body}`}
                                                checked={filters.bodyType.includes(body)}
                                                onCheckedChange={() =>
                                                    filters.toggleBodyType(body)
                                                }
                                            />
                                            <label
                                                htmlFor={`adv-body-${body}`}
                                                className="text-sm leading-none cursor-pointer"
                                            >
                                                {body}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Drive Type */}
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    Veoskeem
                                </Label>
                                <Select
                                    value={filters.driveType}
                                    onValueChange={(val) =>
                                        filters.setFilter("driveType", val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Kõik" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Kõik</SelectItem>
                                        {driveTypes.map((dt) => (
                                            <SelectItem key={dt.value} value={dt.value}>
                                                {dt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Power */}
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    Võimsus (kW)
                                </Label>
                                <div className="flex gap-2 items-center">
                                    <Input
                                        placeholder="Min"
                                        value={filters.powerMin}
                                        onChange={(e) =>
                                            filters.setFilter("powerMin", e.target.value)
                                        }
                                        className="text-sm"
                                        type="number"
                                    />
                                    <span className="text-muted-foreground text-sm">-</span>
                                    <Input
                                        placeholder="Max"
                                        value={filters.powerMax}
                                        onChange={(e) =>
                                            filters.setFilter("powerMax", e.target.value)
                                        }
                                        className="text-sm"
                                        type="number"
                                    />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Appearance */}
                    <AccordionItem value="appearance">
                        <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">
                            Välimus
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3 pb-4">
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    Värvus
                                </Label>
                                <Select
                                    value={filters.color}
                                    onValueChange={(val) =>
                                        filters.setFilter("color", val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Kõik värvid" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Kõik värvid</SelectItem>
                                        {colorOptions.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    Uste arv
                                </Label>
                                <Select
                                    value={filters.doors}
                                    onValueChange={(val) =>
                                        filters.setFilter("doors", val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Kõik" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Kõik</SelectItem>
                                        {doorOptions.map((d) => (
                                            <SelectItem key={d} value={d}>
                                                {d}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    Istekohtade arv
                                </Label>
                                <Select
                                    value={filters.seats}
                                    onValueChange={(val) =>
                                        filters.setFilter("seats", val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Kõik" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Kõik</SelectItem>
                                        {seatOptions.map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* Condition & Location */}
                    <AccordionItem value="condition-location">
                        <AccordionTrigger className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">
                            Seisukord ja asukoht
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3 pb-4">
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    Seisukord
                                </Label>
                                <Select
                                    value={filters.condition}
                                    onValueChange={(val) =>
                                        filters.setFilter("condition", val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Kõik" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Kõik</SelectItem>
                                        {conditionOptions.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">
                                    Asukoht
                                </Label>
                                <Select
                                    value={filters.location}
                                    onValueChange={(val) =>
                                        filters.setFilter("location", val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Kogu Eesti" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Kogu Eesti</SelectItem>
                                        {locationOptions.map((loc) => (
                                            <SelectItem key={loc} value={loc}>
                                                {loc}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            <div className="p-5 border-t border-border bg-muted/50">
                <Button className="w-full font-bold shadow-md shadow-primary/20">
                    Näita tulemusi
                </Button>
            </div>
        </div>
    );
}

function getActiveFilterCount(filters: ReturnType<typeof useFilterStore.getState>): number {
    let count = 0;
    if (filters.make && filters.make !== "none") count++;
    if (filters.model && filters.model !== "none") count++;
    if (filters.q) count++;
    if (filters.priceMin) count++;
    if (filters.priceMax) count++;
    if (filters.yearMin && filters.yearMin !== "none") count++;
    if (filters.yearMax && filters.yearMax !== "none") count++;
    if (filters.fuelType.length > 0) count++;
    if (filters.transmission !== "all") count++;
    if (filters.bodyType.length > 0) count++;
    if (filters.color && filters.color !== "none") count++;
    if (filters.mileageMin) count++;
    if (filters.mileageMax) count++;
    if (filters.powerMin) count++;
    if (filters.powerMax) count++;
    if (filters.driveType && filters.driveType !== "none") count++;
    if (filters.doors && filters.doors !== "none") count++;
    if (filters.seats && filters.seats !== "none") count++;
    if (filters.condition && filters.condition !== "none") count++;
    if (filters.location && filters.location !== "none") count++;
    return count;
}
