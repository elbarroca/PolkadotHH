import { useState } from 'react';
import { Header } from './components/Header';
import { useWallet } from '../../hooks/useWallet';
import { UploadModal } from './components/UploadModal';

export default function Home() {
  const { address, isConnected, connect, disconnect } = useWallet();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        walletAddress={address}
        onConnect={connect}
        onDisconnect={disconnect}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isConnected ? (
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
              walletAddress={address!}
              onUploadComplete={(metadata) => {
                // Handle successful upload
                console.log('File uploaded:', metadata);
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