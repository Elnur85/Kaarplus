import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
    title: "Lähtesta parool | Kaarplus",
    description: "Lähtesta oma Kaarplus konto parool",
};

export default function ResetPasswordPage() {
    return (
        <div className="w-full">
            <ResetPasswordForm />
        </div>
    );
}
