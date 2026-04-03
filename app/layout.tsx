import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://visitflow.io'),
  title: "VisitFlow — Enterprise Payroll Infrastructure",
  description: "Secure, asynchronous, and multi-tenant payroll systems for modern distributed teams. Zero-trust isolation and automated compliance.",
  keywords: ["enterprise payroll", "multi-tenant saas", "fintech infrastructure", "automated payroll", "zero-trust security"],
  authors: [{ name: "VisitFlow Technologies" }],
  openGraph: {
    title: "VisitFlow — Enterprise Payroll Infrastructure",
    description: "Architected for global scale. Secure, automated workforce capital management.",
    url: "https://visitflow.io",
    siteName: "VisitFlow",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VisitFlow Enterprise Payroll",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VisitFlow — Enterprise Payroll Infrastructure",
    description: "Architected for global scale. Secure, automated workforce capital management.",
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
