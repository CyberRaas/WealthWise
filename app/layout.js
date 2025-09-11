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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-poppins antialiased`}
      >
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
