'use client';

import React from 'react';
import { useWallet } from '@/components/wallet/WalletTest';
import { Button } from '@/components/ui/button';

export const Navbar = () => {
  const { activeAccount, connectWallet, isLoading } = useWallet();

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
      {/* Left side - Logo and Title */}
      <div className="flex items-center gap-2">
        <div className="text-emerald-500 text-2xl">
          <svg 
            className="w-8 h-8" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
          </svg>
        </div>
        <span className="text-emerald-500 text-xl font-medium">PolkaDrive</span>
      </div>

      {/* Center - Search Bar */}
      <div className="flex-1 max-w-3xl mx-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search files"
            className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Right side - Connect Wallet Button */}
      <div className="flex items-center">
        {!activeAccount ? (
          <Button
            onClick={connectWallet}
            disabled={isLoading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-emerald-500/10 rounded-lg text-sm text-emerald-400 border border-emerald-500/20">
              {`${activeAccount.slice(0, 6)}...${activeAccount.slice(-4)}`}
            </span>
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-gray-300"
              onClick={() => {}} // Add disconnect functionality if needed
            >
              Disconnect
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}; 