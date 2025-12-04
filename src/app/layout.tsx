import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { SITE_CONFIG } from "@/config/site";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-jetbrains-mono",
    subsets: ["latin"],
});

const monaspace = localFont({
    src: "../fonts/monaspace/Monaspace-Neon-Var.woff2",
    variable: "--font-monaspace",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL(SITE_CONFIG.url),
    title: {
        default: SITE_CONFIG.name,
        template: `%s | ${SITE_CONFIG.name.split(" ")[0]}`,
    },
    description: SITE_CONFIG.description,
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
        apple: "/favicon.svg",
    },
    openGraph: {
        title: SITE_CONFIG.name,
        description:
            "Write, deploy, and test Move smart contracts directly in your browser with CryonX IDE.",
        url: SITE_CONFIG.url,
        siteName: SITE_CONFIG.name,
        images: [
            {
                url: "/favicon.svg",
                width: 1200,
                height: 630,
                alt: "CryonX IDE",
            },
        ],
        locale: "en_US",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={` ${monaspace.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
