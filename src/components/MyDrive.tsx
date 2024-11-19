import React, { useCallback } from 'react';
import { Button } from './ui/button';
import { Upload, FolderPlus } from 'lucide-react';
import { FolderCard } from './FolderCard';
import { FileCard } from './FileCard';
import { FolderMetadata, FileMetadata } from '@/types';
import { useStorage } from '@/hooks/useStorage';

interface MyDriveProps {
  currentFolder: FolderMetadata | null;
  folders: FolderMetadata[];
  onFolderClick: (folder: FolderMetadata | null) => void;
  onFolderDelete: (folderName: string) => void;
  onUploadClick: () => void;
  onCreateFolderClick: () => void;
}

export const MyDrive: React.FC<MyDriveProps> = ({
  currentFolder,
  folders,
  onFolderClick,
  onFolderDelete,
  onUploadClick,
  onCreateFolderClick,
}) => {
  const { deleteFile } = useStorage();

  const handleFileDelete = useCallback((cid: string) => {
    deleteFile(cid);
  }, [deleteFile]);

  const displayedFolders = currentFolder
    ? folders.filter((folder) => folder.parentFolder === currentFolder.name)
    : folders.filter((folder) => !folder.parentFolder);

  const displayedFiles = currentFolder
    ? currentFolder.files || []
    : folders.flatMap((folder) => folder.files || []);

  const getFolderPath = (folders: FolderMetadata[], currentFolder: FolderMetadata | null): FolderMetadata[] => {
    if (!currentFolder) {
      return [];
    }

    const path: FolderMetadata[] = [];
    let folder: FolderMetadata | undefined = currentFolder;

    while (folder) {
      path.unshift(folder);
      folder = folders.find(f => f.name === folder?.parentFolder);
    }

    return path;
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-3xl font-bold text-gray-100">
            <a href="#" onClick={() => onFolderClick(null)}>My Drive</a>
          </h2>
          {currentFolder && (
            <>
              {getFolderPath(folders, currentFolder).map((folder, index, array) => (
                <React.Fragment key={folder.name}>
                  <span className="text-gray-400">/</span>
                  <a 
                    href="#" 
                    onClick={() => onFolderClick(folder)}
                    className="text-xl font-semibold text-gray-100 hover:text-emerald-400"
                  >
                    {folder.name}
                  </a>
                </React.Fragment>
              ))}
            </>
          )}
        </div>
        <div>
          <Button
            onClick={onUploadClick}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 mr-4"
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload
          </Button>
          <Button
            onClick={onCreateFolderClick}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <FolderPlus className="mr-2 h-5 w-5" />
            Create Folder
          </Button>
        </div>
      </div>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
        {displayedFolders.map((folder) => (
          <FolderCard
            key={folder.name} 
            folder={folder}
            onClick={() => onFolderClick(folder)}
            onDelete={() => onFolderDelete(folder.name)}
          />
        ))}
        {displayedFiles.map((file) => (
          <FileCard
            key={file.cid}
            id={file.cid}
            title={file.name}
            size={file.size}
            onDelete={() => handleFileDelete(file.cid)}
          />
        ))}
      </div>
    </>
  );
};