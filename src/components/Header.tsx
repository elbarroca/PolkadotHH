'use client'

import { Folder, Search, Wallet } from 'lucide-react';
import { useWallet } from '../contexts/WalletProvider';
import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';

export const Header = () => {
  const { connectWallet, disconnectWallet, activeAccount } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const truncateAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <div className="flex items-center space-x-4">
        <Folder className="h-8 w-8 text-blue-500" />
        <h1 className="text-2xl font-bold">PolkaDrive</h1>
      </div>
      <div className="flex-1 px-6">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search files" className="pl-8" />
        </div>
      </div>
      {activeAccount ? (
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">
            {`${activeAccount.slice(0, 6)}...${activeAccount.slice(-4)}`}
          </span>
          <Button
            variant="destructive"
            onClick={handleDisconnect}
            className="text-sm"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Disconnect
          </Button>
        </div>
      ) : (
        <Button
          variant="default"
          onClick={handleConnect}
          disabled={isConnecting}
          className="text-sm"
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}
    </header>
  );
};