'use client';

import React from 'react';
import { useWallet } from './WalletTest';

const ConnectWalletButton = () => {
  const { activeAccount, connectWallet, error, isLoading } = useWallet();

  return (
    <div className="p-4 space-y-4">
      {!activeAccount ? (
        <>
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
          
          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded-lg border border-red-200">
              {error}
              {error.includes('extension not found') && (
                <a 
                  href="https://polkadot.js.org/extension/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-blue-500 hover:underline"
                >
                  Install Polkadot.js Extension
                </a>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-2">
          <div className="text-green-600 font-medium flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Wallet Connected
          </div>
          <div className="text-sm text-gray-600 break-all">
            Address: {activeAccount}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectWalletButton;