import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

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
      <body className={cn("min-h-screen bg-background font-sans antialiased")} suppressHydrationWarning>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
