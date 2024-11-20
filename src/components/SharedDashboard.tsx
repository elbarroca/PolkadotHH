'use client';

import { useState } from 'react';
import { FileCard } from './FileCard';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Share2, Search, ArrowLeft } from 'lucide-react';

interface SharedFile {
  id: string;
  title: string;
  imageUrl: string;
  size: string;
  sharedWith: string;
  sharedAt: string;
  description?: string;
}

interface SharedDashboardProps {
  onBackToMyDrive: () => void;
}

export const SharedDashboard = ({ onBackToMyDrive }: SharedDashboardProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([
    // Example shared files
    {
      id: '1',
      title: 'Shared Document 1',
      imageUrl:
        'https://www.cryptoquizz.com/wp-content/uploads/2021/02/polkadot_main-1.jpg',
      size: '2.4 MB',
      sharedWith: '5CUiis...D8gr',
      sharedAt: '2024-02-20',
      description: 'Shared with external collaborator',
    },
    // Add more dummy shared files as needed
  ]);

  return (
    <div className='space-y-8'>
      {/* Header Section */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            onClick={onBackToMyDrive}
            className='text-gray-400 hover:text-emerald-400'
          >
            <ArrowLeft className='mr-2 h-5 w-5' />
            Back to My Drive
          </Button>
          <h2 className='text-3xl font-bold text-gray-100'>Shared Files</h2>
        </div>
        <div className='flex items-center gap-4'>
          <div className='relative w-64'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500' />
            <Input
              placeholder='Search shared files'
              className='border-gray-700 bg-gray-800/50 pl-10'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Shared Files Grid */}
      <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
        {sharedFiles
          .filter(
            (file) =>
              file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              file.sharedWith.toLowerCase().includes(searchQuery.toLowerCase()),
          )
          .map((file) => (
            <div key={file.id} className='group relative'>
              <FileCard file={file} onDelete={() => handleDelete(file.id)} />
              <div className='absolute right-2 top-2 z-30'>
                <span className='rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-400'>
                  Shared
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
