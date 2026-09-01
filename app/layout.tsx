import type { Metadata } from "next";
import { Nunito, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Toaster } from "@/components/ui/sonner";

const nunito = Nunito({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Califica UV — Reseñas de profesores",
  description:
    "Plataforma anónima para que estudiantes de la Universidad del Valle compartan reseñas de sus profesores.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${nunito.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
