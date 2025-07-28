import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MSA Real Estate - Modern Property Listings UK',
  description: 'Find your perfect property with MSA Real Estate. Modern, mobile-first platform for property hunting in England with seamless application process.',
  keywords: ['real estate', 'property', 'rentals', 'UK', 'England', 'Northampton', 'Manchester', 'Birmingham', 'flats', 'apartments'],
  authors: [{ name: 'MSA Real Estate' }],
  creator: 'MSA Real Estate',
  publisher: 'MSA Real Estate',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Ads Tracking Tag */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17394102119"
          strategy="afterInteractive"
        />
        <Script id="google-ads-config" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17394102119');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
} 