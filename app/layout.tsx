import type { Metadata } from "next";
import { Chakra_Petch, Saira } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/context";

const chakraPetch = Chakra_Petch({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const saira = Saira({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AlertFlow - Real-time Event Monitoring",
  description: "Monitor and track real-time events, alerts, and incidents in your area.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${chakraPetch.variable} ${saira.variable} antialiased`}
      >
        <LanguageProvider defaultLanguage="en">
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
