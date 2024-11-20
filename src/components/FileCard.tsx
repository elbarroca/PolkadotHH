'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FileText, Download, Trash, Share2, Eye } from 'lucide-react';
import { FilePreview } from './FilePreview';
import { ShareModal } from './ShareModal';
import { useStorage } from '@/hooks/useStorage';
import { FileMetadata } from '@/types';
import { useToast } from '@/hooks/useToast';

interface FileCardProps {
  file: FileMetadata;
  onDelete: () => void;
}

export const FileCard: React.FC<FileCardProps> = ({ file, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { downloadFile } = useStorage();
  const { toast } = useToast();

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);

    try {
      await downloadFile(file);
      toast({
        title: 'Success',
        description: 'File downloaded successfully',
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className='group relative rounded-lg bg-gray-800 p-4 shadow-md transition-all duration-200 hover:bg-gray-700'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* File Card Content */}
        <div className='flex items-center space-x-4'>
          <div className='rounded-lg bg-emerald-500 p-3'>
            {file.mimeType?.startsWith('image/') ? (
              <Image className='h-6 w-6 text-white' src={''} alt={''} />
            ) : (
              <FileText className='h-6 w-6 text-white' />
            )}
          </div>
          <div className='min-w-0 flex-1'>
            <h3 className='truncate text-lg font-semibold text-gray-100'>
              {file.name}
            </h3>
            <p className='text-sm text-gray-400'>{formatFileSize(file.size)}</p>
          </div>

          {/* Action Buttons */}
          {isHovered && (
            <div className='absolute right-2 top-2 flex space-x-2'>
              <button
                onClick={handleDownload}
                disabled={isLoading}
                className='rounded-md bg-emerald-500 p-1 text-white transition-colors hover:bg-emerald-600'
              >
                <Download className='h-4 w-4' />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className='rounded-md bg-red-500 p-1 text-white transition-colors hover:bg-red-600'
              >
                <Trash className='h-4 w-4' />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        fileMetadata={file}
      />
    </>
  );
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
