import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  metadataBase: new URL('https://payrollpal.mt'),
  authors: [{ name: "PayrollPal Malta" }],
  openGraph: {
    title: "PayrollPal Malta — AI-powered Payroll for Maltese SMEs",
    description: "Architected for precision. Secure, automated workforce capital management for the Maltese market.",
    url: "https://payrollpal.mt",
    siteName: "PayrollPal Malta",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PayrollPal Malta Enterprise Payroll",
      },
    ],
    locale: "en_MT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PayrollPal Malta — AI-powered Payroll for Maltese SMEs",
    description: "The international standard for Maltese payroll infrastructure.",
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
    <html lang="en" className="scroll-smooth">
      <body className={cn("min-h-screen bg-background font-sans antialiased text-foreground")} suppressHydrationWarning>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
