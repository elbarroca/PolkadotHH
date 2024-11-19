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
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { getDownloadURL, downloadFile } = useStorage();
  const { toast } = useToast();

  useEffect(() => {
    const loadPreviewUrl = async () => {
      if (file.mimeType?.startsWith('image/')) {
        try {
          const url = await getDownloadURL(file);
          setPreviewUrl(url);
        } catch (error) {
          console.error('Error loading preview URL:', error);
          toast({
            title: 'Error',
            description: 'Failed to load preview',
            variant: 'destructive',
          });
        }
      }
    };

    loadPreviewUrl();
  }, [file, getDownloadURL, toast]);

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

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPreview(true);
  };

  return (
    <>
      <div
        className="relative p-4 bg-gray-800 rounded-lg shadow-md transition-all duration-200 hover:bg-gray-700 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* File Card Content */}
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500 rounded-lg">
            {file.mimeType?.startsWith('image/') ? (
              <Image className="h-6 w-6 text-white" src={''} alt={''} />
            ) : (
              <FileText className="h-6 w-6 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-100 truncate">
              {file.name}
            </h3>
            <p className="text-sm text-gray-400">
              {formatFileSize(file.size)}
            </p>
          </div>
          
          {/* Action Buttons */}
          {isHovered && (
            <div className="absolute top-2 right-2 flex space-x-2">
              <button
                onClick={handleDownload}
                disabled={isLoading}
                className="p-1 bg-emerald-500 rounded-md text-white hover:bg-emerald-600 transition-colors"
              >
                <Download className="h-4 w-4" />
              </button>
              {file.mimeType?.startsWith('image/') && (
                <button
                  onClick={handlePreview}
                  className="p-1 bg-blue-500 rounded-md text-white hover:bg-blue-600 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 bg-red-500 rounded-md text-white hover:bg-red-600 transition-colors"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <FilePreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        file={{
          title: file.name,
          imageUrl: previewUrl,
          size: file.size,
          uploadedBy: file.uploadedBy,
          mimeType: file.mimeType,
        }}
      />

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