'use client';

import { useState } from 'react';
import { FolderMetadata } from '../types';
import { Folder } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStorage } from '@/hooks/useStorage';
import { toast } from '@/hooks/useToast';
import { useWallet } from '@/contexts/WalletProvider';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFolderCreated: (folderMetadata: FolderMetadata) => void;
}

export const FolderModal: React.FC<FolderModalProps> = ({
  isOpen,
  onClose,
  onFolderCreated,
}: FolderModalProps) => {
  const [folderName, setFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { activeAccount } = useWallet();

  const { createFolder } = useStorage();

  const handleCreateFolder = async (folderMetadata: FolderMetadata) => {
    if (!folderName) {
      toast({
        title: 'Folder name is required',
        description: 'Please enter a name for the folder',
      });
      return;
    }

    setIsLoading(true);

    try {
      await createFolder(folderMetadata);
      onFolderCreated(folderMetadata);
      onClose();
      setFolderName('');
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: 'Error creating folder',
        description: 'An error occurred while creating the folder. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Folder</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name">Name</label>
            <Input
              id="name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            onClick={onClose}
            disabled={isLoading}
            className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleCreateFolder({ name: folderName, createdBy: activeAccount!, createdAt: new Date(), childFolders: [], files: [] })}
            disabled={!folderName || isLoading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white transform hover:scale-105 transition-all duration-200"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </span>
            ) : (
              'Create Folder'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};