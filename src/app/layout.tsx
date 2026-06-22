import type { Metadata } from "next";
import { Tajawal, Alexandria, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  display: "swap",
});

const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
        className={`${tajawal.variable} ${alexandria.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
