'use client'

import { Folder, Search, Wallet } from 'lucide-react';
import { useWallet } from '@/components/wallet/WalletTest';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export const Header = ({ onSearch, searchQuery }: HeaderProps) => {
  const { connectWallet, disconnectWallet, activeAccount, isLoading, error } = useWallet();

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
    <header className="flex flex-col border-b border-gray-800 bg-gray-900">
      <div className="flex items-center justify-between px-10 py-6">
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
              disabled={isLoading}
              className="text-sm border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-emerald-400 transition-all duration-200"
            >
              <Wallet className="mr-2 h-5 w-5" />
              {isLoading ? "Disconnecting..." : "Disconnect"}
            </Button>
          </div>
        ) : (
          <Button
            variant="default"
            onClick={connectWallet}
            disabled={isLoading}
            className="text-sm bg-emerald-500 hover:bg-emerald-600 text-white px-6 transform hover:scale-105 transition-all duration-200"
          >
            <Wallet className="mr-2 h-5 w-5" />
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </Button>
        )}
      </div>
      
      {/* Error message display */}
      {error && (
        <div className="bg-red-500/10 border-t border-red-500/20 px-10 py-3 text-red-400">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Connection Error</div>
              <div className="mt-1 text-sm whitespace-pre-line">
                {error}
              </div>
              {error.includes('No accounts found') && (
                <a 
                  href="https://support.polkadot.network/support/solutions/articles/65000098878-how-to-create-a-new-account"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center text-emerald-400 hover:text-emerald-300 text-sm"
                >
                  <span>View detailed guide</span>
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};