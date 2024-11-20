import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { FolderMetadata } from '@/types';

interface SidebarProps {
  currentView: 'myDrive' | 'shared';
  onViewChange: (view: 'myDrive' | 'shared') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
}) => {
  const renderFolderTree = (
    folders: FolderMetadata[],
    parentFolderName?: string,
  ) => (
    <ul className='ml-4'>
      {folders
        .filter((folder) => folder.parentFolder === parentFolderName)
        .map((folder) => (
          <li key={folder.name} className='mb-2'>
            <div className='flex items-center justify-between'>
              <span className='cursor-pointer text-gray-400 hover:text-gray-200'>
                {folder.name}
              </span>
              <div></div>
            </div>
            {renderFolderTree(folders, folder.name)}
          </li>
        ))}
    </ul>
  );

  return (
    <aside className='w-80 border-r border-gray-800 bg-gray-900'>
      <ScrollArea className='h-full'>
        <div className='space-y-6 py-8'>
          <div className='px-6'>
            <h2 className='mb-6 text-xl font-semibold tracking-tight text-gray-200'>
              Menu
            </h2>
            <div className='space-y-2'>
              <Button
                variant={currentView === 'myDrive' ? 'default' : 'ghost'}
                className='w-full justify-start rounded-md px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                onClick={() => onViewChange('myDrive')}
              >
                My Drive
              </Button>
              <Button
                variant={currentView === 'shared' ? 'default' : 'ghost'}
                className='w-full justify-start rounded-md px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                onClick={() => onViewChange('shared')}
              >
                <Users className='mr-2 h-5 w-5' />
                Shared with me
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
};
