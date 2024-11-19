'use client';

import { useState, useCallback } from 'react';
import { SharedDashboard } from './SharedDashboard';
import { useToast } from '@/hooks/useToast';
import { useStorage } from '@/hooks/useStorage';
import { FileMetadata, FolderMetadata } from '@/types';
import { Sidebar } from './Sidebar';
import { UploadModal } from './UploadModal';
import { FolderModal } from './FolderModal';
import React from 'react';
import { MyDrive } from './MyDrive';
import { useWallet } from '@/contexts/WalletProvider';

interface GeneralDashboardProps {
  folders: FolderMetadata[];
}

export const GeneralDashboard: React.FC<GeneralDashboardProps> = ({ folders }) => {
  const { createFolder, deleteFolder } = useStorage();
  const [currentFolder, setCurrentFolder] = useState<FolderMetadata | null>(null);
  const { toast } = useToast();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'myDrive' | 'shared'>('myDrive');
  const { activeAccount } = useWallet();

  const handleUploadComplete = async (metadata: FileMetadata) => {
    setIsUploadModalOpen(false);
    const fileUrl = metadata.bucketId ? 
      `https://cdn.mainnet.cere.network/${metadata.bucketId}/${metadata.cid}` :
      `https://cdn.mainnet.cere.network/${metadata.cid}`;

    toast({
      title: "File uploaded",
      description: (
        <>
          Check your file
          <a
            href={fileUrl}
            className="text-green-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            <br/>here
          </a>
        </>
      ),
    });
  };

  const handleViewChange = useCallback((view: 'myDrive' | 'shared') => {
    setCurrentView(view);
  }, []);

  const handleFolderClick = useCallback((folder: FolderMetadata | null) => {
    setCurrentFolder(folder);
  }, []);

  const handleFolderCreated = useCallback(async (newFolder: FolderMetadata) => {
    await createFolder(newFolder);
  }, [createFolder]);

  const handleFolderDelete = useCallback((folderName: FolderMetadata) => {
    if (activeAccount) {
      deleteFolder(activeAccount, folderName.name);
      setCurrentFolder(null);
    }
  }, [deleteFolder, activeAccount]);
  
  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      <main className="flex-1 overflow-auto bg-gray-900 p-8">
        {currentView === 'myDrive' ? (
          <MyDrive
            currentFolder={currentFolder}
            folders={folders}
            onFolderClick={handleFolderClick}
            onFolderDelete={handleFolderDelete}
            onUploadClick={() => setIsUploadModalOpen(true)}
            onCreateFolderClick={() => setIsFolderModalOpen(true)}
          />
        ) : (
          <SharedDashboard onBackToMyDrive={() => setCurrentView('myDrive')} />
        )}

        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          folders={folders}
          onUploadComplete={handleUploadComplete}
        />
        <FolderModal
          isOpen={isFolderModalOpen}
          onClose={() => setIsFolderModalOpen(false)}
          onFolderCreated={handleFolderCreated}
        />
      </main>
    </div>
  );
};