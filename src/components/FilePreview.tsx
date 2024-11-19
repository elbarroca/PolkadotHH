'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, X } from 'lucide-react';
import Image from 'next/image';

interface FilePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    title: string;
    imageUrl: string;
    size: number;
    uploadedBy?: string;
    description?: string;
  };
}

const DEFAULT_IMAGE = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.MNqiZl7u5qQXf8ZHngXwdgHaE8%26pid%3DApi&f=1&ipt=51653442534b74a6b21852af102f8cb0723453af3425edfb09fc6fc0aa7caa63&ipo=images";

export const FilePreview = ({ isOpen, onClose, file }: FilePreviewProps) => {
  const imageUrl = file.imageUrl || DEFAULT_IMAGE;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-gray-900 border border-gray-800">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold text-gray-100">
            {file.title}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Image Preview */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-700">
            <Image
              src={imageUrl}
              alt={file.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {/* File Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Size</p>
              <p className="text-gray-200">{file.size}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Uploaded by</p>
              <p className="text-gray-200">{file.uploadedBy || 'Anonymous'}</p>
            </div>
            {file.description && (
              <div className="col-span-2 space-y-1">
                <p className="text-sm text-gray-400">Description</p>
                <p className="text-gray-200">{file.description}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 