'use client';

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
  const [isConnecting] = useState(false);

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
    <header className='flex items-center justify-between border-b border-gray-800 bg-gray-900 px-10 py-6'>
      <div className='flex items-center space-x-6'>
        <div className='group relative'>
          <div className='absolute -inset-1 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-700 opacity-50 blur transition duration-200 group-hover:opacity-75'></div>
          <Folder className='relative h-12 w-12 text-emerald-400 transition-colors group-hover:text-emerald-300' />
        </div>
        <h1 className='text-3xl font-bold text-gray-100'>PolkaDrive</h1>
      </div>

      <div className='flex-1 px-8'>
        <div className='group relative mx-auto max-w-2xl'>
          <Search className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 transition-colors group-hover:text-emerald-400' />
          <Input
            placeholder='Search files'
            className='w-full border-gray-700 bg-gray-800 pl-11 text-gray-200 transition-all placeholder:text-gray-500 hover:border-gray-600 focus:border-emerald-500'
            onChange={(e) => onSearch(e.target.value)}
            value={searchQuery}
          />
        </div>
      </div>

      {activeAccount ? (
        <div className='flex items-center space-x-5'>
          <span className='rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-gray-400'>
            {truncateAddress(activeAccount)}
          </span>
          <Button
            variant='outline'
            onClick={handleDisconnect}
            className='border-gray-700 bg-gray-800 text-sm text-gray-200 transition-all duration-200 hover:bg-gray-700 hover:text-emerald-400'
          >
            <Wallet className='mr-2 h-5 w-5' />
            Disconnect
          </Button>
        </div>
      ) : (
        <Button
          variant='default'
          onClick={() => setShowModal(true)}
          disabled={isConnecting}
          className='transform bg-emerald-500 px-6 text-sm text-white transition-all duration-200 hover:scale-105 hover:bg-emerald-600'
        >
          <Wallet className='mr-2 h-5 w-5' />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
    </header>
  );
};
