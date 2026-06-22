import type { Metadata } from "next";
import { Cairo, Amiri, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

const ibmMono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "مرسم تدبر · منصة تتبع أخطاء الفريق",
  description:
    "منصة تفاعلية لتتبع أخطاء بيانات المصادر والمراجع من برنامج مندلي، وأخطاء النمط CSL، وأخطاء إضافة الوورد، والملاحظات والمقترحات، مع لوحة إحصائية وتصدير Excel احترافي.",
  keywords: [
    "مندلي",
    "CSL",
    "تدبر",
    "تتبع الأخطاء",
    "الفريق",
    "المكتبة الشاملة",
    "Excel",
  ],
  authors: [{ name: "Tadabbur Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${amiri.variable} ${ibmMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
