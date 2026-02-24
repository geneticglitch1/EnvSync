import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AuthSessionProvider } from "@/components/session-provider";

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
  title: "EnvSync — Encrypted .env Collaboration for Teams",
  description:
    "Stop sending .env files over Slack. EnvSync is a CLI + web dashboard that gives your team a single encrypted source of truth for environment variables — with diffing, versioning, and real-time notifications. 100% self-hosted.",
  keywords: [
    "environment variables",
    "secrets management",
    "self-hosted",
    "encrypted",
    "CLI",
    "dotenv",
    "team collaboration",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
