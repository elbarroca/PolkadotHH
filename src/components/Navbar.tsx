'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { WalletModal } from './WalletModal';
import { useWallet } from '@/contexts/WalletProvider';
import type { ImportedAccount } from '@/contexts/WalletProvider';

export function Navbar() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<ImportedAccount[]>([]);
  const { getAvailableAccounts, connectWithAccount, activeAccount } = useWallet();

  const handleConnectWallet = async () => {
    try {
      const accounts = await getAvailableAccounts();
      setAvailableAccounts(accounts);
      setIsWalletModalOpen(true);
    } catch (error) {
      console.error('Failed to get accounts:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  const handleSelectAccount = async (account: ImportedAccount) => {
    try {
      await connectWithAccount(account);
      setIsWalletModalOpen(false);
    } catch (error) {
      console.error('Failed to connect with account:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  return (
    <nav className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        {/* Your other navbar items */}
      </div>
      
      <Button
        onClick={handleConnectWallet}
        variant="outline"
        className="ml-auto"
      >
        {activeAccount ? 
          `Connected: ${activeAccount.slice(0, 6)}...${activeAccount.slice(-4)}` : 
          'Connect Wallet'
        }
      </Button>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        accounts={availableAccounts}
        onSelectAccount={handleSelectAccount}
      />
    </nav>
  );
} 