import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Google Fonts (Next.js auto optimize)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Default metadata (SEO)
export const metadata: Metadata = {
  metadataBase: new URL("https://cryonx.work"),
  title: {
    default: "CryonX IDE",
    template: "%s | CryonX",
  },
  description:
    "CryonX IDE – A blockchain-ready online Move smart contract IDE with templates, wallet integration, and testnet runner.",
  keywords: [
    "CryonX",
    "Move",
    "Cedra Network",
    "Blockchain IDE",
    "Smart Contract",
  ],
  authors: [{ name: "CryonX Team" }],
  icons: {
  icon: "/favicon.svg",
  shortcut: "/favicon.svg",
  apple: "/apple-touch-icon.png",
},
  openGraph: {
    title: "CryonX IDE",
    description:
      "Write, deploy, and test Move smart contracts directly in your browser with CryonX IDE.",
    url: "https://cryonx.work",
    siteName: "CryonX IDE",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CryonX IDE",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* favicon + meta sẽ được Next.js auto inject từ metadata */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-gray-100`}
      >
        {children}
      </body>
    </html>
  );
}
