import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/components/auth/auth-provider';
import Header from '@/components/landing/header';
import CookieConsent from '@/components/ui/cookie-consent';

export const metadata: Metadata = {
  title: 'مبيعاتي | منصتك لإدارة المبيعات بسهولة',
  description: 'مبيعاتي يساعدك على تبسيط عملياتك وتعزيز مبيعاتك.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" style={{scrollBehavior:'smooth'}}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <Header />
          <CookieConsent />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
