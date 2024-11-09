'use client'

import { useWallet } from '../contexts/WalletProvider';
import { useState } from 'react';

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
    <header className="w-full px-6 py-4 bg-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          Decentralized File Sharing
        </h1>
        
        <div className="flex items-center space-x-4">
          {activeAccount ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                {truncateAddress(activeAccount)}
              </span>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 
                         text-white rounded-lg transition-colors"
                aria-label="Disconnect wallet"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 
                       text-white rounded-lg transition-colors
                       disabled:bg-blue-400 disabled:cursor-not-allowed"
              aria-label="Connect wallet"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};