import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HSAles | Sales CRM",
  description: "HSA Enerji için satış yönetim sistemi",
  icons: {
    icon: "/hsa-enerji-logo-cropped.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
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
