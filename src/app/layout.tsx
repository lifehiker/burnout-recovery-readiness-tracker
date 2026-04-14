import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Burnout Tracker: Recovery Ready',
  description: 'Daily stress, sleep, energy & readiness check-in. Track burnout risk and recovery readiness in 30 seconds.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={dmSans.variable}>
      <body className={dmSans.className}>{children}</body>
    </html>
  );
}
