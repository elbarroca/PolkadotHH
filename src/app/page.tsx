'use client';

import { useState } from 'react';
import { Header } from './components/Header';
import { UploadModal } from './components/UploadModal';
import { useWallet } from './contexts/WalletProvider';

export default function Home() {
  const { activeAccount } = useWallet();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeAccount ? (
          <div className="space-y-8">
            <div className="flex justify-end">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 
                         text-white rounded-lg transition-colors"
                aria-label="Upload file"
              >
                Upload File
              </button>
            </div>
            
            <UploadModal
              isOpen={isUploadModalOpen}
              onClose={() => setIsUploadModalOpen(false)}
              walletAddress={activeAccount}
              onUploadComplete={(metadata) => {
                console.log('File uploaded:', metadata);
                setIsUploadModalOpen(false);
              }}
            />
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-gray-700">
              Please connect your wallet to access the file sharing system
            </h2>
          </div>
        )}
      </main>
    </div>
  );
}