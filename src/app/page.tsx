'use client';
import { WalletProvider } from '@/components/wallet/WalletTest';
import ConnectWalletButton from '@/components/wallet/walletbutton';

export default function Home() {
  return (
    <WalletProvider>
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">Wallet Connection Test</h1>
        <ConnectWalletButton />
      </main>
    </WalletProvider>
  );
}