import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import { JsonLd } from "@/components/shared/json-ld";
import { Toaster } from "@/components/ui/toaster";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import { generateOrganizationJsonLd } from "@/lib/seo";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Autode ost ja müük Eestis`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "et_EE",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Autode ost ja müük Eestis`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Autode ost ja müük Eestis`,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationJsonLd = generateOrganizationJsonLd();

  return (
    <html lang="et" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <JsonLd data={organizationJsonLd} />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
