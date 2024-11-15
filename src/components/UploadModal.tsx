'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { UploadModalProps, FileMetadata, Folder } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFileManager } from '@/hooks/useFileManager';

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen, 
  onClose, 
  onUploadComplete,
  walletAddress,
  folders 
}: UploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const encryptionKey = useRef<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingToServer, setUploadingToServer] = useState(false);
  const uploadId = useRef<string>(uuidv4());
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');

  const { uploadFile } = useFileManager();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = event.target.files?.[0];
    
    if (!selectedFile) {
      setError('No file selected');
      return;
    }

    // Validate file size (e.g., max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (selectedFile.size > maxSize) {
      setError('File size exceeds 50MB limit');
      return;
    }

    setFile(selectedFile);
  }, []);

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
            
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Upload file using FileManager
      const fileMetadata = await uploadFile(file);

      // Update metadata with additional info
      const updatedMetadata: FileMetadata = {
        ...fileMetadata,
        name: fileName || file.name,
        description: description,
        folderId: selectedFolder || null
      };
      
      if (onUploadComplete) {
        onUploadComplete(updatedMetadata);
      }
      
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md animate-slideIn bg-gray-900/95 border border-gray-800 shadow-xl shadow-emerald-500/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Upload className="h-6 w-6 text-emerald-400" />
            </div>
            Upload File
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">File Name</label>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
              className="bg-gray-800/50 border-gray-700 text-gray-200 focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter file description"
              className="w-full bg-gray-800/50 border border-gray-700 text-gray-200 rounded-md px-3 py-2 focus:border-emerald-500 outline-none min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Select Folder</label>
            <div className="relative">
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 text-gray-200 rounded-md px-3 py-2 focus:border-emerald-500 outline-none appearance-none"
              >
                <option value="">Root Directory</option>
                {folders?.map((folder: Folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="h-4 w-4 text-white hover:text-emerald-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 hover:border-emerald-500/50 transition-all duration-300 bg-gray-800/50 group">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-emerald-400 transition-all duration-300 h-40 rounded-lg group"
              disabled={isLoading}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700 opacity-0 group-hover:opacity-50 blur transition duration-200"></div>
                  <Upload className="relative h-12 w-12 text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
                </div>
                {file ? (
                  <div className="text-center">
                    <p className="text-emerald-400 font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-base">Choose a file or drag it here</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Maximum file size: 50MB
                    </p>
                  </div>
                )}
              </div>
            </Button>
          </div>

            <div className="space-y-2 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="flex justify-between text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full" />
                  Uploading...
                </span>
              </div>
            </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || isLoading}
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
                Uploading...
              </span>
            ) : (
              'Upload'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}