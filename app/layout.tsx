import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ortopedia Clinic",
    template: "%s | Ortopedia Clinic",
  },
  description:
    "Orthopedic clinic workspace for admissions, surgery coordination, patient records, and discharge workflows.",
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
  applicationName: "Ortopedia Clinic",
  keywords: [
    "orthopedics",
    "clinic",
    "ehr",
    "patient workflow",
    "hospital operations",
  ],
};

import { ClinicProvider } from "@/lib/clinic-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <ClinicProvider>{children}</ClinicProvider>
        <Analytics />
      </body>
    </html>
  );
}
