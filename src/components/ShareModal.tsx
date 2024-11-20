'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { FileMetadata } from '@/types';
import { useStorage } from '@/hooks/useStorage';
import { useToast } from '@/hooks/useToast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileMetadata: FileMetadata;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  fileMetadata,
}) => {
  const [publicKeys, setPublicKeys] = useState<string[]>(['']);
  const { shareFile } = useStorage();
  const { toast } = useToast();

  const handlePublicKeyChange = (index: number, value: string) => {
    const newPublicKeys = [...publicKeys];
    newPublicKeys[index] = value;
    setPublicKeys(newPublicKeys);
  };

  const addPublicKeyField = () => {
    setPublicKeys([...publicKeys, '']);
  };

  const handleShare = async () => {
    try {
      for (const publicKey of publicKeys) {
        if (publicKey.trim()) {
          await shareFile(fileMetadata, publicKeys);
        }
      }
      toast({
        title: 'Success',
        description: 'File shared successfully',
      });
      onClose();
    } catch (error) {
      console.error('Error sharing file:', error);
      toast({
        title: 'Error',
        description: 'Failed to share file',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          {publicKeys.map((publicKey, index) => (
            <input
              key={index}
              type='text'
              value={publicKey}
              onChange={(e) => handlePublicKeyChange(index, e.target.value)}
              placeholder='Enter public key'
              className='w-full rounded-md border border-gray-700 p-2'
            />
          ))}
          <button
            onClick={addPublicKeyField}
            className='w-full rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600'
          >
            Add Another Public Key
          </button>
          <button
            onClick={handleShare}
            className='w-full rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700'
          >
            Share
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
