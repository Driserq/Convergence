import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Consum – Content-to-Action Engine",
  description: "Transform YouTube videos and long-form content into actionable habit blueprints in minutes.",
  metadataBase: new URL("https://consum.app"),
  icons: {
    icon: "/logo_fav.svg",
    apple: "/logo_fav.svg",
  },
  openGraph: {
    title: "Consum – Content-to-Action Engine",
    description: "Transform YouTube videos and long-form content into actionable habit blueprints in minutes.",
    url: "https://consum.app",
    siteName: "Consum",
    images: [
      {
        url: "/logo_fav.svg",
        width: 512,
        height: 512,
        alt: "Consum logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Consum – Content-to-Action Engine",
    description: "Transform YouTube videos and long-form content into actionable habit blueprints in minutes.",
    images: ["/logo_fav.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-T4LW5L7BKL"
          async
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-T4LW5L7BKL');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
