'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2 } from 'lucide-react';
import { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileTitle: string;
  onShare: (address: string) => void;
}

export const ShareModal = ({ isOpen, onClose, fileTitle, onShare }: ShareModalProps) => {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const handleShare = () => {
    if (!address.trim()) {
      setError('Please enter a wallet address');
      return;
    }
    // Add basic address validation here if needed
    onShare(address.trim());
    setAddress('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Share2 className="h-6 w-6 text-emerald-400" />
            </div>
            Share File
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-sm text-gray-400">
            Sharing: <span className="text-emerald-400">{fileTitle}</span>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Wallet Address</label>
            <Input
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setError('');
              }}
              placeholder="Enter recipient's wallet address"
              className="bg-gray-800/50 border-gray-700 text-gray-200 focus:border-emerald-500"
            />
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4 mt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 