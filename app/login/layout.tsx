import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login – PayrollPal Malta",
  description: "Access your PayrollPal Malta dashboard.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
