import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import SessionProvider from '@/components/providers/SessionProvider';
import { ToastProvider } from '@/components/ui/Toast';
import MainLayout from '@/components/layout/MainLayout';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'MediCore — Clinic Management System',
  description: 'Hospital and clinic management dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <body>
        <SessionProvider>
          <ToastProvider>
            <MainLayout>{children}</MainLayout>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
