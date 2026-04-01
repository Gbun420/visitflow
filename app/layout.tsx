import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PayrollPal Malta — AI Payroll for Maltese Businesses",
  description: "Fully automated payroll, tax, and social security compliance for Malta. AI drives calculations, submissions, and optimizations.",
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
    <html lang="en">
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)} suppressHydrationWarning>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
