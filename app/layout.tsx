import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Geist } from "next/font/google";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://payrollpal.mt'),
  title: "PayrollPal Malta — AI-powered Payroll for Maltese SMEs",
  description: "Automate your Malta payroll, tax, and social security compliance. AI-driven calculations, automated FS3/FS5 submissions, and intelligent optimizations.",
  keywords: ["payroll malta", "msss malta", "tax malta", "fs3 malta", "fs5 malta", "ai payroll"],
  authors: [{ name: "PayrollPal Malta" }],
  openGraph: {
    title: "PayrollPal Malta — AI-powered Payroll for Maltese SMEs",
    description: "Automate your Malta payroll, tax, and social security compliance with AI.",
    url: "https://payrollpal.mt",
    siteName: "PayrollPal Malta",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PayrollPal Malta",
      },
    ],
    locale: "en_MT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PayrollPal Malta — AI-powered Payroll for Maltese SMEs",
    description: "Automate your Malta payroll, tax, and social security compliance with AI.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={cn("min-h-screen bg-background font-sans antialiased")} suppressHydrationWarning>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
