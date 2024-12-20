'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, X } from 'lucide-react';
import Image from 'next/image';
import { formatDistance } from 'date-fns';

interface FilePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    title: string;
    imageUrl: string;
    size: number;
    uploadedBy: string;
    mimeType: string;
    lastModified?: Date;
  };
}

export const FilePreview = ({ isOpen, onClose, file }: FilePreviewProps) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderPreview = () => {
    if (file.mimeType.startsWith('image/')) {
      return (
        <div className='relative aspect-video w-full overflow-hidden rounded-lg border border-gray-700'>
          <Image
            src={file.imageUrl}
            alt={file.title}
            fill
            className='object-contain'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
        </div>
      );
    }

    // For non-image files, show a placeholder
    return (
      <div className='flex aspect-video w-full items-center justify-center rounded-lg border border-gray-700 bg-gray-800'>
        <FileText className='h-20 w-20 text-gray-400' />
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='border border-gray-800 bg-gray-900 sm:max-w-2xl'>
        <DialogHeader className='flex flex-row items-center justify-between'>
          <DialogTitle className='text-xl font-bold text-gray-100'>
            {file.title}
          </DialogTitle>
          <button
            onClick={onClose}
            className='rounded-md p-1 transition-colors hover:bg-gray-800'
          >
            <X className='h-5 w-5 text-gray-400' />
          </button>
        </DialogHeader>

        <div className='mt-4 space-y-6'>
          {/* File Preview */}
          {renderPreview()}

          {/* File Details */}
          <div className='grid grid-cols-2 gap-4 rounded-lg border border-gray-700 bg-gray-800/50 p-4'>
            <div className='space-y-1'>
              <p className='text-sm text-gray-400'>Size</p>
              <p className='text-gray-200'>{formatFileSize(file.size)}</p>
            </div>
            <div className='space-y-1'>
              <p className='text-sm text-gray-400'>Type</p>
              <p className='text-gray-200'>{file.mimeType}</p>
            </div>
            <div className='space-y-1'>
              <p className='text-sm text-gray-400'>Uploaded by</p>
              <p className='text-gray-200'>{file.uploadedBy}</p>
            </div>
            {file.lastModified && (
              <div className='space-y-1'>
                <p className='text-sm text-gray-400'>Last modified</p>
                <p className='text-gray-200'>
                  {formatDistance(file.lastModified, new Date(), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Download Button */}
          <a
            href={file.imageUrl}
            download={file.title}
            className='flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700'
          >
            Download File
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};
