import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/components/wallet/WalletTest';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PolkaDrive',
  description: 'Decentralized File Storage',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}