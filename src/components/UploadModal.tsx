'use client';

import { useState, useRef, useCallback } from 'react';
import { FileMetadata, FolderMetadata } from '../types';
import { Upload } from 'lucide-react';
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

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (fileMetadata: FileMetadata) => void;
  folders: FolderMetadata[];
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadComplete,
  folders,
}: UploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const { uploadFile } = useStorage();
  const [addresses, setAddresses] = useState<string[]>([]);
  const [currentAddress, setCurrentAddress] = useState('');

  const addAddress = () => {
    if (currentAddress.trim() !== '') {
      setAddresses([...addresses, currentAddress.trim()]);
      setCurrentAddress('');
    }
  };
  const removeAddress = (index: number) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];

      if (!selectedFile) {
        console.log('No file selected');
        return;
      }

      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (selectedFile.size > maxSize) {
        console.log('File size exceeds 50MB limit');
        return;
      }

      setFile(selectedFile);
    },
    [],
  );

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
      });
      return;
    }

    setIsLoading(true);

    try {
      const fileMetadata = await uploadFile(file, addresses, selectedFolder);
      const updatedMetadata: FileMetadata = {
        ...fileMetadata,
        name: fileName || file.name,
        folder: selectedFolder,
      };

      if (onUploadComplete) {
        onUploadComplete(updatedMetadata);
      }

      onClose();
      setAddresses([]);
    } catch (error) {
      console.log(
        error instanceof Error ? error.message : 'Failed to process file',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='animate-slideIn max-h-[90vh] overflow-y-auto border border-gray-800 bg-gray-900/95 shadow-xl shadow-emerald-500/10 sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-3 text-xl font-bold text-gray-100'>
            <div className='rounded-lg bg-emerald-500/10 p-2'>
              <Upload className='h-6 w-6 text-emerald-400' />
            </div>
            Upload File
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-6 py-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-300'>
              File Name
            </label>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder='Enter file name'
              className='border-gray-700 bg-gray-800/50 text-gray-200 focus:border-emerald-500'
            />
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-300'>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Enter file description'
              className='min-h-[100px] w-full resize-none rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-gray-200 outline-none focus:border-emerald-500'
            />
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-300'>
              Select Folder
            </label>
            <div className='relative'>
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className='w-full appearance-none rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-gray-200 outline-none focus:border-emerald-500'
              >
                <option value=''>Root Directory</option>
                {folders?.map((folder: FolderMetadata) => (
                  <option key={folder.name} value={folder.name}>
                    {folder.name}
                  </option>
                ))}
              </select>
              <div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2'>
                <svg
                  className='h-4 w-4 text-white transition-colors duration-200 hover:text-emerald-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <label htmlFor='currentAddress' className='text-sm font-medium'>
                Enter Address
              </label>
              <Input
                id='currentAddress'
                value={currentAddress}
                onChange={(e) => setCurrentAddress(e.target.value)}
                placeholder='Enter an address'
              />
              <Button onClick={addAddress} size='sm'>
                Add Address
              </Button>
            </div>
            <div className='flex flex-wrap gap-2'>
              {addresses.map((address, index) => (
                <div
                  key={index}
                  className='flex items-center gap-2 rounded-md bg-gray-100 px-2 py-1 text-sm'
                >
                  <span>{`${address.slice(0, 5)}...`}</span>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => removeAddress(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className='group rounded-xl border-2 border-dashed border-gray-700 bg-gray-800/50 p-8 transition-all duration-300 hover:border-emerald-500/50'>
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileSelect}
              className='hidden'
              accept='*/*'
            />
            <Button
              variant='outline'
              onClick={() => fileInputRef.current?.click()}
              className='group h-40 w-full rounded-lg border-gray-700 bg-gray-800 text-gray-300 transition-all duration-300 hover:bg-gray-700 hover:text-emerald-400'
              disabled={isLoading}
            >
              <div className='flex flex-col items-center space-y-4'>
                <div className='relative'>
                  <div className='absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700 opacity-0 blur transition duration-200 group-hover:opacity-50'></div>
                  <Upload className='relative h-12 w-12 text-emerald-400 transition-transform duration-200 group-hover:scale-110' />
                </div>
                {file ? (
                  <div className='text-center'>
                    <p className='font-medium text-emerald-400'>{file.name}</p>
                    <p className='mt-1 text-sm text-gray-500'>
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className='text-center'>
                    <p className='text-base'>Choose a file or drag it here</p>
                    <p className='mt-1 text-sm text-gray-500'>
                      Maximum file size: 100MB
                    </p>
                  </div>
                )}
              </div>
            </Button>
          </div>
        </div>

        <div className='mt-6 flex justify-end space-x-4'>
          <Button
            variant='outline'
            onClick={onClose}
            disabled={isLoading}
            className='border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white'
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || isLoading}
            className='transform bg-emerald-500 text-white transition-all duration-200 hover:scale-105 hover:bg-emerald-600'
          >
            {isLoading ? (
              <span className='flex items-center'>
                <svg
                  className='-ml-1 mr-2 h-4 w-4 animate-spin'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
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
  );
};
