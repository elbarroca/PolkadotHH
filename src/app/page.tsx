'use client';

import { useState, useMemo, useEffect } from 'react';
import React from 'react';
import { UploadModal } from '../components/UploadModal';
import { useWallet } from '../contexts/WalletProvider';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Folder as FolderIcon, 
  Users, 
  Wallet,
  Upload,
  Lock,
  Layout,
  FolderPlus
} from 'lucide-react';
import { Header } from '../components/Header';
import { FileCard } from '../components/FileCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { v4 as uuidv4 } from 'uuid';
import { SharedDashboard } from '../components/SharedDashboard';
import { FileMetadata, Folder } from 'types';
import { FileItem } from '@/types';

const DUMMY_FILES = [
  {
    title: "Project Documentation",
    imageUrl: "/images/project-doc.jpg",
    size: "2.4 MB",
    uploadedBy: "5CUiis...D8gr",
    description: "Complete project documentation including architecture diagrams and technical specifications."
  },
  {
    title: "Design Assets",
    imageUrl: "/images/design-assets.jpg",
    size: "5.1 MB",
    uploadedBy: "5CUiis...D8gr",
    description: "UI/UX design assets and brand guidelines for the platform."
  },
  {
    title: "Technical Whitepaper",
    imageUrl: "/images/whitepaper.jpg",
    size: "1.8 MB",
    uploadedBy: "5CUiis...D8gr",
    description: "Detailed technical whitepaper explaining the system architecture and protocols."
  }
];

export default function Home() {
  const { activeAccount, connectWallet } = useWallet();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [showStarred, setShowStarred] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [dummyFiles, setDummyFiles] = useState<FileItem[]>(() => 
    DUMMY_FILES.map(file => ({
      ...file,
      id: uuidv4(),
      folderId: null as string | null,
      name: file.title,
      starred: false
    }))
  );
  const [currentView, setCurrentView] = useState<'myDrive' | 'shared'>('myDrive');
  const [refetchFolders, setRefetchFolders] = useState<(() => Promise<void>) | null>(null);

  const filteredFiles = useMemo(() => {
    return files.filter(file => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  const handleCreateFolder = (folderName: string) => {
    const newFolder: Folder = {
      id: uuidv4(),
      name: folderName,
      files: []
    };
    setFolders(prev => [...prev, newFolder]);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleDeleteFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const handleToggleStar = (id: string) => {
    setFiles(files.map(file => {
      if (file.id === id) {
        return {
          ...file,
          starred: !(file.starred ?? false)
        };
      }
      return file;
    }));
  };

  const updatedClasses = {
    folderIcon: "h-12 w-12 text-emerald-500 transform transition-transform hover:scale-110 duration-200",
    fileIcon: "h-12 w-12 text-emerald-400 transform transition-transform hover:scale-110 duration-200",
    fileCard: "flex flex-col items-center space-y-2 rounded-lg border p-4 hover:bg-emerald-50 transition-all duration-200 hover:shadow-lg hover:border-emerald-200",
    uploadButton: "bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200 hover:shadow-lg",
  };

  const handleUploadComplete = async (metadata: FileMetadata) => {
    console.log('File uploaded:', metadata);
    setIsUploadModalOpen(false);
    
    if (refetchFolders) {
      try {
        await refetchFolders();
      } catch (error) {
        console.error('Failed to refresh folders:', error);
      }
    }
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

  const AddFolderModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [folderName, setFolderName] = useState('');
    const [error, setError] = useState('');

    const handleCreateFolder = () => {
      if (!folderName.trim()) {
        setError('Folder name is required');
        return;
      }

      // Check if folder name already exists
      if (folders.some(f => f.name.toLowerCase() === folderName.trim().toLowerCase())) {
        setError('A folder with this name already exists');
        return;
      }

      const newFolder: Folder = { 
        id: uuidv4(), 
        name: folderName.trim(),
        files: [] 
      };
      
      setFolders(prev => [...prev, newFolder]);
      setFolderName('');
      setError('');
      onClose();
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-gray-900 border border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-100 flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <FolderPlus className="h-6 w-6 text-emerald-400" />
              </div>
              Create New Folder
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Folder Name</label>
              <Input
                value={folderName}
                onChange={(e) => {
                  setFolderName(e.target.value);
                  setError('');
                }}
                placeholder="Enter folder name"
                className="bg-gray-800 border-gray-700 text-gray-200 focus:border-emerald-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder();
                  }
                }}
              />
              {error && (
                <p className="text-sm text-red-400 mt-1">{error}</p>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFolder}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                disabled={!folderName.trim()}
              >
                Create Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const handleFileDelete = (fileId: string) => {
    setDummyFiles(prev => prev.filter(file => file.id !== fileId));
  };

  useEffect(() => {
    console.log('Folders updated:', folders);
  }, [folders]);

  const getCurrentFiles = () => {
    if (!selectedFolder) {
      return dummyFiles.filter(file => !file.folderId);
    }
    return dummyFiles.filter(file => file.folderId === selectedFolder);
  };

  // Add this function to handle moving files between folders
  const handleMoveFile = (fileId: string, targetFolderId: string | null) => {
    setDummyFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        return {
          ...file,
          folderId: targetFolderId
        };
      }
      return file;
    }));
  };

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
                    <Button 
                      variant="ghost" 
                      className="text-gray-400 hover:text-emerald-400"
                      onClick={() => setIsAddFolderModalOpen(true)}
                    >
                      <FolderPlus className="h-5 w-5" />
                      <span className="ml-2">New Folder</span>
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <Button 
                      variant="secondary" 
                      className={`w-full justify-start ${currentView === 'myDrive' ? 'bg-gray-800 text-emerald-400' : 'bg-gray-900 text-gray-200'} hover:bg-gray-700 py-8 text-xl`}
                      onClick={() => {
                        setCurrentView('myDrive');
                        setSelectedFolder(null);
                      }}
                    >
                      <FolderIcon className="mr-4 h-8 w-8 text-emerald-400" />
                      My Drive
                    </Button>

                    {/* Folders List */}
                    <div className="space-y-2 pl-4">
                      {folders.map((folder) => (
                        <Button
                          key={folder.id}
                          variant="ghost"
                          className={`w-full justify-start py-2 ${
                            selectedFolder === folder.id 
                              ? 'bg-gray-800 text-emerald-400' 
                              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                          }`}
                          onClick={() => setSelectedFolder(folder.id)}
                        >
                          <FolderIcon className="mr-2 h-5 w-5" />
                          <span className="truncate">{folder.name}</span>
                          <span className="ml-auto text-xs text-gray-500">
                            {folder.files.length} files
                          </span>
                        </Button>
                      ))}
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
                      ? folders.find(f => f.id === selectedFolder)?.name 
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
                  {getCurrentFiles().map((file) => (
                    <FileCard
                      key={file.id}
                      id={file.id}
                      title={file.title}
                      imageUrl={file.imageUrl}
                      size={file.size}
                      uploadedBy={file.uploadedBy}
                      description={file.description}
                      onDelete={(fileId: string) => {
                        setDummyFiles(prev => prev.filter(f => f.id !== fileId));
                      }}
                    />
                  ))}
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
      <AddFolderModal 
        isOpen={isAddFolderModalOpen} 
        onClose={() => setIsAddFolderModalOpen(false)} 
      />
    </div>
  );
}