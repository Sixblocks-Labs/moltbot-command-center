import type { Metadata } from 'next';
import { Fraunces, Instrument_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { AuroraBackground } from '@/components/app/aurora';

const sans = Instrument_Sans({ subsets: ['latin'], variable: '--font-sans' });
const display = Fraunces({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: "Ryan's Command Center",
  description: 'Daily driver dashboard for working with Peter 💾',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} antialiased`}>
        <Providers>
          <AuroraBackground />
          {children}
        </Providers>
      </body>
    </html>
  );
}
