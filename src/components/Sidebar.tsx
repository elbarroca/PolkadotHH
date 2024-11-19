import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Users, Folder } from 'lucide-react';
import { FolderMetadata } from '@/types';

interface SidebarProps {
  currentView: 'myDrive' | 'shared';
  onViewChange: (view: 'myDrive' | 'shared') => void;
  folders: FolderMetadata[];
  currentFolder?: FolderMetadata | null;
  onFolderSelect: (folder: FolderMetadata) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange,
  folders = [],
  currentFolder,
  onFolderSelect,
}) => {
  const renderFolderTree = (folderList: FolderMetadata[], parentFolderName?: string) => (
    <ul className="ml-4">
      {folderList
        .filter(folder => folder.parentFolder === parentFolderName)
        .map(folder => (
          <li key={folder.name} className="mb-2">
            <Button
              variant="ghost"
              className={`w-full justify-start text-gray-400 hover:text-gray-200 hover:bg-gray-800 py-2 px-4 rounded-md ${
                currentFolder?.name === folder.name ? 'bg-gray-800 text-gray-200' : ''
              }`}
              onClick={() => onFolderSelect(folder)}
            >
              <Folder className="mr-2 h-4 w-4" />
              <span className="truncate">{folder.name}</span>
            </Button>
            {renderFolderTree(folderList, folder.name)}
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
            
            {/* Folders Section - Only show if folders exist */}
            {folders && folders.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Folders
                </h3>
                {renderFolderTree(folders)}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
};