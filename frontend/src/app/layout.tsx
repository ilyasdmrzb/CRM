import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SolarCRM | Enterprise CRM",
  description: "Advanced Sales Management System for Solar Energy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#1E293B',
            color: '#fff',
            border: '1px solid #334155',
          },
        }} />
      </body>
    </html>
  );
}
