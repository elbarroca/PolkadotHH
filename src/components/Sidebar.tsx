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
  const renderFolderTree = (folders: FolderMetadata[], parentFolderName?: string) => (
    <ul className="ml-4">
      {folders
        .filter(folder => folder.parentFolder === parentFolderName)
        .map(folder => (
          <li key={folder.name} className="mb-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 hover:text-gray-200 cursor-pointer">
                {folder.name}
              </span>
              <div>
              </div>
            </div>
            {renderFolderTree(folders, folder.name)}
          </li>
        ))}
    </ul>
  );

  return (
    <aside className="w-80 border-r border-gray-800 bg-gray-900">
      <ScrollArea className="h-full">
        <div className="space-y-6 py-8">
          <div className="px-6">
            <h2 className="text-xl font-semibold tracking-tight text-gray-200 mb-6">
              Menu
            </h2>
            <div className="space-y-2">
              <Button 
                variant={currentView === 'myDrive' ? 'default' : 'ghost'}
                className="w-full justify-start text-gray-400 hover:text-gray-200 hover:bg-gray-800 py-2 px-4 rounded-md"
                onClick={() => onViewChange('myDrive')}
              >
                My Drive
              </Button>
              <Button 
                variant={currentView === 'shared' ? 'default' : 'ghost'}
                className="w-full justify-start text-gray-400 hover:text-gray-200 hover:bg-gray-800 py-2 px-4 rounded-md"
                onClick={() => onViewChange('shared')}
              >
                <Users className="mr-2 h-5 w-5" />
                Shared with me
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
};