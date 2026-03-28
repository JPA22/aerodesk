import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { LanguageProvider } from "@/components/providers/language-provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AeroDesk — The Modern Marketplace for Pre-Owned Aircraft",
    template: "%s | AeroDesk",
  },
  description:
    "Buy and sell aircraft with confidence. AI-powered valuations, 160+ models, verified dealers. Browse jets, turboprops, pistons, and helicopters.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://aerodesk.com.br"),
  openGraph: {
    type: "website",
    siteName: "AeroDesk",
    title: "AeroDesk — The Modern Marketplace for Pre-Owned Aircraft",
    description:
      "Buy and sell aircraft with confidence. AI-powered valuations, 160+ models, verified dealers.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AeroDesk — The Modern Marketplace for Pre-Owned Aircraft",
    description:
      "Buy and sell aircraft with confidence. AI-powered valuations, 160+ models, verified dealers.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased">
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
