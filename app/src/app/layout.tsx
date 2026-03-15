import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digital Krishi Officer",
  description: "AI-powered agricultural advisory platform",
  manifest: "/manifest.json"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Playfair+Display:wght@600;700;800&display=swap'); :root { --font-display: 'Playfair Display', serif; --font-body: 'DM Sans', sans-serif; } body { font-family: var(--font-body); }`}</style>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
