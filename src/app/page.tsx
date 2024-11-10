'use client';

import { useState } from 'react';
import { UploadModal } from '../components/UploadModal';
import { useWallet } from '../contexts/WalletProvider';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Folder, 
  File, 
  Search, 
  Clock, 
  Star, 
  Trash, 
  Users, 
  Wallet,
  Upload 
} from 'lucide-react';
import { Header } from '../components/Header';

export default function Home() {
  const { activeAccount } = useWallet();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      <Header />
      {activeAccount ? (
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-64 border-r">
            <ScrollArea className="h-full">
              <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                  <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                    Menu
                  </h2>
                  <div className="space-y-1">
                    <Button variant="secondary" className="w-full justify-start">
                      <Folder className="mr-2 h-4 w-4" />
                      My Drive
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Shared with me
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Clock className="mr-2 h-4 w-4" />
                      Recent
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Star className="mr-2 h-4 w-4" />
                      Starred
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Trash className="mr-2 h-4 w-4" />
                      Trash
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </aside>
          <main className="flex-1 overflow-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">My Drive</h2>
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center space-y-2 rounded-lg border p-4 hover:bg-accent"
                >
                  {i % 2 === 0 ? (
                    <Folder className="h-12 w-12 text-blue-500" />
                  ) : (
                    <File className="h-12 w-12 text-gray-500" />
                  )}
                  <span className="text-sm font-medium">
                    {i % 2 === 0 ? `Folder ${i + 1}` : `File ${i + 1}.pdf`}
                  </span>
                </div>
              ))}
            </div>
          </main>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <h2 className="text-2xl font-semibold text-gray-700">
            Please connect your wallet to access the file sharing system
          </h2>
        </div>
      )}

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        walletAddress={activeAccount || ''}
        onUploadComplete={(metadata) => {
          console.log('File uploaded:', metadata);
          setIsUploadModalOpen(false);
        }}
      />
    </div>
  );
}