import { cn, formatPrice } from "@/lib/utils";

interface PriceDisplayProps {
    price: number;
    includeVat?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
    variant?: "primary" | "slate";
    className?: string;
}

export function PriceDisplay({
    price,
    includeVat = true,
    size = "md",
    variant = "primary",
    className,
}: PriceDisplayProps) {
    const formatted = formatPrice(price, includeVat);
    // Split price and VAT indicator to style them differently if needed
    // formatPrice returns something like "20 000 € (km-ga)"

    // For now, simple implementation

    const sizeClasses = {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-2xl",
        xl: "text-2xl md:text-3xl",
    };

    const variantClasses = {
        primary: "text-primary",
        slate: "text-slate-900 dark:text-white",
    };

    return (
        <div className={cn("font-bold tabular-nums", sizeClasses[size], variantClasses[variant], className)}>
            {formatted}
        </div>
    );
}
