import { Poppins } from "next/font/google";
import "./globals.css";
import ClientProviders from '@/components/providers/ClientProviders'

// Poppins font - clean, modern, highly readable for financial apps
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata = {
  title: "WealthWise ",
  description: "AI-powered personal finance management and budgeting application",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WealthWise'
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#10b981' },
    { media: '(prefers-color-scheme: dark)', color: '#059669' }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* PWA Support */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="WealthWise" />
        
        {/* Prevent auto-zoom on iOS when focusing inputs */}
        <meta name="format-detection" content="telephone=no" />
        
        {/* Safe area insets for notched devices */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        className={`${poppins.variable} font-poppins antialiased touch-manipulation`}
      >
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
