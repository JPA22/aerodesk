import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AeroDesk — Pre-Owned Aircraft Marketplace",
  description: "Buy and sell pre-owned aircraft in Brazil and Latin America.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="antialiased">
          <AuthProvider>{children}</AuthProvider>
        </body>
    </html>
  );
}
