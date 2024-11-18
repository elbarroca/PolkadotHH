'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { UploadModal } from '../components/UploadModal';
import { useWallet } from '../contexts/WalletProvider';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Wallet,
  Upload,
  Lock,
  Layout,
} from 'lucide-react';
import { Header } from '../components/Header';
import { SharedDashboard } from '../components/SharedDashboard';
import { useToast } from '@/hooks/useToast';
import { useStorage } from '@/hooks/useStorage';
import { FileMetadata, FolderMetadata } from '@/types';
import { FolderModal } from '@/components/FolderModal';

export default function Home() {
  const { activeAccount, connectWallet } = useWallet();
  const { deleteFolder, folders } = useStorage();
  const { toast } = useToast()

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentView, setCurrentView] = useState<'myDrive' | 'shared'>('myDrive');

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderMetadata | null>(null);

  const handleCreateFolder = (parentFolderId?: string) => {
    setSelectedFolder(parentFolderId ? folders.find(folder => folder.name === parentFolderId) || null : null);
    setIsFolderModalOpen(true);
  };

  const handleFolderCreated = (folderMetadata: FolderMetadata) => {
    folders.push(folderMetadata);
  };

  const renderFolderTree = (folders: FolderMetadata[], parentFolderName?: string) => (
    <ul>
      {folders
        .filter(folder => folder.name === parentFolderName)
        .map(folder => (
          <li key={folder.name}>
            {folder.name}
            <button /*onClick={() => handleDeleteFolder(folder.id)}*/>Delete</button>
            <button onClick={() => handleCreateFolder()}>Create Subfolder</button>
            {renderFolderTree(folders, folder.name)}
          </li>
        ))}
    </ul>
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleUploadComplete = async (metadata: FileMetadata) => {
    setIsUploadModalOpen(false);
    const fileUrl = metadata.folder ? 
      `https://cdn.mainnet.cere.network/${metadata.folder}/${metadata.cid}` :
      `https://cdn.mainnet.cere.network/${metadata.cid}`;

    toast({
      title: "File uploaded",
      description: (
        <a
          href={fileUrl}
          className="text-blue-500"
          target="_blank"
          rel="noopener noreferrer"
        >
          Check your file on:
        </a>
      ),
  });
  };

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

  useEffect(() => {
    console.log('Folders updated:', folders);
  }, [folders]);

  return (
    <div className="flex h-screen flex-col bg-gray-900">
      <Header onSearch={handleSearch} searchQuery={searchQuery} />
      {activeAccount ? (
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-80 border-r border-gray-800 bg-gray-900">
            <ScrollArea className="h-full">
              <div className="space-y-6 py-8">
                <div className="px-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold tracking-tight text-gray-200">
                    Menu
                  </h2>
                  <div>
      <h2>Folders</h2>
      <button onClick={() => handleCreateFolder()}>Create Folder</button>
      {renderFolderTree(folders)}
    </div>

                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start ${currentView === 'shared' ? 'bg-gray-800 text-emerald-400' : 'text-gray-400'} hover:text-gray-200 hover:bg-gray-800 py-8 text-xl`}
                      onClick={() => setCurrentView('shared')}
                    >
                      <Users className="mr-4 h-8 w-8" />
                      Shared with me
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </aside>
          <main className="flex-1 overflow-auto bg-gray-900 p-8">
            {currentView === 'myDrive' ? (
              <>
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-100">
                    {selectedFolder 
                      ? folders.find(f => f.name === selectedFolder.name)?.name 
                      : "My Drive"}
                  </h2>
                  <Button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Upload
                  </Button>
                </div>
                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 animate-fadeIn">

                </div>
              </>
            ) : (
              <SharedDashboard onBackToMyDrive={() => setCurrentView('myDrive')} />
            )}
          </main>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center bg-gray-900 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-gray-100 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">
                Secure, Decentralized File Sharing
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Unlock the future of privacy with blockchain-based file storage and sharing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {[
                {
                  icon: <Wallet className="h-8 w-8 text-emerald-400" />,
                  title: "Blockchain Login",
                  description: "Connect your wallet for secure, password-free access"
                },
                {
                  icon: <Lock className="h-8 w-8 text-emerald-400" />,
                  title: "Encrypted Storage",
                  description: "Auto-encryption with decentralized storage"
                },
                {
                  icon: <Users className="h-8 w-8 text-emerald-400" />,
                  title: "Access Control",
                  description: "Choose who can view your files"
                },
                {
                  icon: <Layout className="h-8 w-8 text-emerald-400" />,
                  title: "File Dashboard",
                  description: "Track and manage your files easily"
                }
              ].map((feature, i) => (
                <div 
                  key={i}
                  className="group relative p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-emerald-500/50 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-emerald-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  <div className="relative space-y-4">
                    <div className="p-3 bg-gray-900/50 rounded-lg w-fit">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-100">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 space-y-6">
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="px-8 py-6 text-lg bg-emerald-500 hover:bg-emerald-600 text-white transform hover:scale-105 transition-all duration-200"
              >
                <Wallet className="mr-2 h-5 w-5" />
                {isConnecting ? "Connecting..." : "Connect Wallet to Start"}
              </Button>
              
              <p className="text-sm text-gray-500">
                Supported wallets: MetaMask, WalletConnect
              </p>
            </div>

            <div className="mt-16 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <h3 className="text-xl font-semibold text-gray-100 mb-4">
                Simple Upload Process
              </h3>
              <div className="flex items-center justify-center space-x-4">
                {[
                  { step: "1", text: "Select File" },
                  { step: "2", text: "Specify Viewers" },
                  { step: "3", text: "Upload & Encrypt" }
                ].map((step, i, arr) => (
                  <React.Fragment key={i}>
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        {step.step}
                      </div>
                      <p className="mt-2 text-sm text-gray-400">{step.text}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="h-px w-12 bg-gray-700" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        walletAddress={activeAccount ?? ''}
        folders={folders}
        onUploadComplete={handleUploadComplete}
      />
      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onFolderCreated={handleFolderCreated}
      />
    </div>
  );
}