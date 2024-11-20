'use client';

import { WalletProvider } from '../contexts/WalletProvider';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/Header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <WalletProvider>
          <div className='flex h-screen'>
            <div className='flex flex-1 flex-col'>
              <Header onSearch={() => {}} searchQuery='' />
              <main className='flex-1'>{children}</main>
            </div>
          </div>
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  );
}
