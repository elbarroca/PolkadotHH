'use client'

import { Folder, Search, Wallet } from 'lucide-react';
import { useWallet } from '../contexts/WalletProvider';
import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export const Header = ({ onSearch, searchQuery }: HeaderProps) => {
  const { disconnectWallet, activeAccount, setShowModal } = useWallet();
  const [isConnecting ] = useState(false);

  const truncateAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  return (
    <header className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-10 py-6">
      <div className="flex items-center space-x-6">
        <div className="relative group">
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-700 opacity-50 blur group-hover:opacity-75 transition duration-200"></div>
          <Folder className="relative h-12 w-12 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
        </div>
        <h1 className="text-3xl font-bold text-gray-100">PolkaDrive</h1>
      </div>
      
      <div className="flex-1 px-8">
        <div className="relative group max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-hover:text-emerald-400 transition-colors" />
          <Input 
            placeholder="Search files" 
            className="w-full pl-11 bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-emerald-500 hover:border-gray-600 transition-all"
            onChange={(e) => onSearch(e.target.value)}
            value={searchQuery}
          />
        </div>
      </div>

      {activeAccount ? (
        <div className="flex items-center space-x-5">
          <span className="text-gray-400 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
            {truncateAddress(activeAccount)}
          </span>
          <Button
            variant="outline"
            onClick={handleDisconnect}
            className="text-sm border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-emerald-400 transition-all duration-200"
          >
            <Wallet className="mr-2 h-5 w-5" />
            Disconnect
          </Button>
        </div>
      ) : (
        <Button
        variant="default"
        onClick={() => setShowModal(true)}
        disabled={isConnecting}
        className="text-sm bg-emerald-500 hover:bg-emerald-600 text-white px-6 transform hover:scale-105 transition-all duration-200"
      >
        <Wallet className="mr-2 h-5 w-5" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}
    </header>
  );
};