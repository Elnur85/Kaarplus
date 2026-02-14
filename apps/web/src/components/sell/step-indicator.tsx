"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
    id: number;
    name: string;
}

interface StepIndicatorProps {
    currentStep: number;
    steps: Step[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
    return (
        <div className="mb-12">
            <div className="flex items-center justify-between relative">
                {steps.map((step, index) => {
                    const isCompleted = currentStep > step.id;
                    const isActive = currentStep === step.id;
                    const isLast = index === steps.length - 1;

                    return (
                        <div key={step.id} className="flex flex-1 items-center last:flex-none">
                            <div className="flex flex-col items-center z-10 bg-background px-2">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                                        isCompleted
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : isActive
                                                ? "bg-primary text-white shadow-lg shadow-primary/20 ring-4 ring-primary/20"
                                                : "bg-background border-2 border-muted text-muted-foreground"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check size={18} />
                                    ) : (
                                        <span className="text-sm font-bold">{step.id}</span>
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "text-[10px] font-bold mt-2 uppercase tracking-wider",
                                        isActive || isCompleted ? "text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    {step.name}
                                </span>
                            </div>
                            {!isLast && (
                                <div
                                    className={cn(
                                        "h-0.5 flex-grow -mx-2 transition-colors duration-500",
                                        isCompleted ? "bg-primary" : "bg-muted"
                                    )}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
