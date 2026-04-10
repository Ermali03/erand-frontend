import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Klinika e Ortopedisë",
    template: "%s | Klinika e Ortopedisë",
  },
  description:
    "Platformë klinike për pranime, koordinim operacionesh, kartela pacientësh dhe dokumente lëshimi.",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  applicationName: "Klinika e Ortopedisë",
  keywords: [
    "ortopedi",
    "klinikë",
    "kartela mjekësore",
    "rrjedha e pacientit",
    "operacionet spitalore",
  ],
};

import { ClinicProvider } from "@/lib/clinic-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sq">
      <body className="min-h-screen font-sans antialiased">
        <ClinicProvider>{children}</ClinicProvider>
        <Analytics />
      </body>
    </html>
  );
}
