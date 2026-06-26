import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Alexandria, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { FontScaleProvider } from "@/components/font-scale-provider";
import { SessionProvider } from "next-auth/react";

// يطبّق حجم الخط المحفوظ قبل الرسم (يمنع وميض تغيّر الحجم عند التحميل).
const FONT_SCALE_INIT = `try{var s=localStorage.getItem('tadabbur-font-scale');var m=[90,100,110,120,132];var i=s===null?1:parseInt(s,10);if(!(i>=0&&i<m.length))i=1;document.documentElement.style.fontSize=m[i]+'%';}catch(e){}`;

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
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
    <html
      lang="ar"
      dir="rtl"
      className={`dark ${ibmPlexArabic.variable} ${alexandria.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: FONT_SCALE_INIT }} />
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <FontScaleProvider>
              {children}
              <Toaster />
              <SonnerToaster position="top-center" richColors />
            </FontScaleProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
