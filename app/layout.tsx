import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pip's Backpack",
  description:
    "A calm, therapeutic storytelling platform to help children recognise themselves through stories.",
  applicationName: "Pip's Backpack",
  appleWebApp: {
    capable: true,
    title: "Pip's Backpack",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF3E8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={`${nunito.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
