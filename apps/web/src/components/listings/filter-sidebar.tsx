"use client";

import { useEffect, useState } from "react";
import { useFilterStore } from "@/store/use-filter-store";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Trash2, RotateCcw, SlidersHorizontal } from "lucide-react";

export function FilterSidebar() {
    const filters = useFilterStore();
    const [makes, setMakes] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const currentMake = filters.make;

    // Fetch makes on mount
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/makes`)
            .then((res) => res.json())
            .then((json) => setMakes(json.data || []))
            .catch(console.error);
    }, []);

    // Fetch models when make changes
    useEffect(() => {
        let cancelled = false;
        if (!currentMake) {
            // No fetch needed, but we still want to reset via the cleanup
            return () => { cancelled = true; };
        }
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/models?make=${currentMake}`)
            .then((res) => res.json())
            .then((json) => {
                if (!cancelled) setModels(json.data || []);
            })
            .catch(console.error);
        return () => {
            cancelled = true;
            setModels([]);
        };
    }, [currentMake]);

    const fuelTypes = ["Bensiin", "Diisel", "Hübriid", "Elekter", "Gaas"];
    const bodyTypes = ["Sedaan", "Universaal", "Maastur", "Kupee", "Kabriolett", "Mahtuniversaal", "Pikap", "Väikeautod"];

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm h-fit">
            <div className="p-5 border-b border-border flex items-center justify-between bg-card text-foreground">
                <h2 className="font-bold flex items-center gap-2">
                    <SlidersHorizontal size={18} className="text-primary" /> Filtrid
                </h2>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-semibold text-primary hover:text-primary/80 hover:bg-primary/5 p-0 h-auto"
                    onClick={filters.resetFilters}
                >
                    <RotateCcw size={12} className="mr-1" /> Lähtesta
                </Button>
            </div>

            <div className="p-5 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                {/* Make & Model */}
                <div className="space-y-3">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mark ja mudel</Label>
                    <Select value={filters.make} onValueChange={(val) => filters.setFilter("make", val)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Kõik margid" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Kõik margid</SelectItem>
                            {makes.map((make) => (
                                <SelectItem key={make} value={make}>{make}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.model}
                        onValueChange={(val) => filters.setFilter("model", val)}
                        disabled={!filters.make}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Kõik mudelid" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Kõik mudelid</SelectItem>
                            {models.map((model) => (
                                <SelectItem key={model} value={model}>{model}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Separator />

                {/* Price Range */}
                <div className="space-y-4">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hind (€)</Label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Min"
                            value={filters.priceMin}
                            onChange={(e) => filters.setFilter("priceMin", e.target.value)}
                            className="text-sm"
                        />
                        <Input
                            placeholder="Max"
                            value={filters.priceMax}
                            onChange={(e) => filters.setFilter("priceMax", e.target.value)}
                            className="text-sm"
                        />
                    </div>
                </div>

                <Separator />

                {/* Year Range */}
                <div className="space-y-4">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Aasta</Label>
                    <div className="flex gap-2">
                        <Select value={filters.yearMin} onValueChange={(val) => filters.setFilter("yearMin", val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Alates" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filters.yearMax} onValueChange={(val) => filters.setFilter("yearMax", val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Kuni" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Separator />

                {/* Fuel Type */}
                <div className="space-y-3">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Kütus</Label>
                    <div className="space-y-2">
                        {fuelTypes.map((fuel) => (
                            <div key={fuel} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`fuel-${fuel}`}
                                    checked={filters.fuelType.includes(fuel)}
                                    onCheckedChange={() => filters.toggleFuelType(fuel)}
                                />
                                <label
                                    htmlFor={`fuel-${fuel}`}
                                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    {fuel}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* Transmission */}
                <div className="space-y-3">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Käigukast</Label>
                    <RadioGroup value={filters.transmission} onValueChange={(val) => filters.setFilter("transmission", val)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="t-all" />
                            <Label htmlFor="t-all" className="text-sm font-normal">Kõik</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="automatic" id="t-auto" />
                            <Label htmlFor="t-auto" className="text-sm font-normal">Automaat</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="manual" id="t-manual" />
                            <Label htmlFor="t-manual" className="text-sm font-normal">Manuaal</Label>
                        </div>
                    </RadioGroup>
                </div>

                <Separator />

                {/* Body Type */}
                <div className="space-y-3">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Keretüüp</Label>
                    <div className="grid grid-cols-1 gap-2">
                        {bodyTypes.map((body) => (
                            <div key={body} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`body-${body}`}
                                    checked={filters.bodyType.includes(body)}
                                    onCheckedChange={() => filters.toggleBodyType(body)}
                                />
                                <label
                                    htmlFor={`body-${body}`}
                                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    {body}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-5 bg-muted/50">
                <Button className="w-full font-bold shadow-md shadow-primary/20">
                    Näita tulemusi
                </Button>
            </div>
        </div>
    );
}
