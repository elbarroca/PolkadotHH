import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { FolderModal } from '@/components/FolderModal';
import { FolderMetadata } from '@/types';
import { useStorage } from '@/hooks/useStorage';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [currentView, setCurrentView] = useState<'myDrive' | 'shared'>('myDrive');
  const [folders, setFolders] = useState<FolderMetadata[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FolderMetadata | null>(null);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const { getFolders } = useStorage();

  // Load existing folders on component mount
  useEffect(() => {
    const loadFolders = async () => {
      try {
        const existingFolders = await getFolders();
        if (existingFolders) {
          setFolders(existingFolders);
        }
      } catch (error) {
        console.error('Error loading folders:', error);
      }
    };

    loadFolders();
  }, []);

  const handleFolderCreated = (newFolder: FolderMetadata) => {
    setFolders(prevFolders => [...prevFolders, newFolder]);
    setCurrentFolder(newFolder);
  };

  const handleFolderSelect = (folder: FolderMetadata) => {
    setCurrentFolder(folder);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        folders={folders}
        currentFolder={currentFolder}
        onFolderSelect={handleFolderSelect}
      />
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-200">
            {currentFolder ? currentFolder.name : 'My Drive'}
          </h1>
          <Button
            onClick={() => setIsCreateFolderModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Create Folder
          </Button>
        </div>
        
        {currentFolder ? (
          <div className="mt-6">
            {currentFolder.files.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p>This folder is empty</p>
              </div>
            ) : (
              // Files list will go here
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* File items will go here */}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <p>Select a folder to view its contents</p>
          </div>
        )}
      </main>
      <FolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onFolderCreated={handleFolderCreated}
      />
    </div>
  );
} 