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
  onFolderDelete: (folder: FolderMetadata) => void;
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

  const handleFileDelete = useCallback(
    (file: FileMetadata) => {
      deleteFile(file.cid); // Use file.cid to delete
    },
    [deleteFile],
  );

  const displayedFolders = currentFolder
    ? folders.filter((folder) => folder.parentFolder === currentFolder.name)
    : folders.filter((folder) => !folder.parentFolder);

  const displayedFiles = currentFolder
    ? currentFolder.files || []
    : folders.flatMap((folder) => folder.files || []);

  const getFolderPath = (
    folders: FolderMetadata[],
    currentFolder: FolderMetadata | null,
  ): FolderMetadata[] => {
    if (!currentFolder) {
      return [];
    }

    const path: FolderMetadata[] = [];
    let folder: FolderMetadata | undefined = currentFolder;

    while (folder) {
      path.unshift(folder);
      folder = folders.find((f) => f.name === folder?.parentFolder);
    }

    return path;
  };

  return (
    <>
      <div className='mb-8 flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <h2 className='text-3xl font-bold text-gray-100'>
            <a href='#' onClick={() => onFolderClick(null)}>
              My Drive
            </a>
          </h2>
          {currentFolder && (
            <>
              {getFolderPath(folders, currentFolder).map(
                (folder, index, array) => (
                  <React.Fragment key={folder.name}>
                    <span className='text-gray-400'>/</span>
                    <a
                      href='#'
                      onClick={() => onFolderClick(folder)}
                      className='text-xl font-semibold text-gray-100 hover:text-emerald-400'
                    >
                      {folder.name}
                    </a>
                  </React.Fragment>
                ),
              )}
            </>
          )}
        </div>
        <div>
          <Button
            onClick={onUploadClick}
            className='mr-4 transform rounded-lg bg-emerald-500 px-6 py-2 text-white transition-all duration-200 hover:scale-105 hover:bg-emerald-600'
          >
            <Upload className='mr-2 h-5 w-5' />
            Upload
          </Button>
          <Button
            onClick={onCreateFolderClick}
            className='transform rounded-lg bg-green-500 px-6 py-2 text-white transition-all duration-200 hover:scale-105 hover:bg-green-600'
          >
            <FolderPlus className='mr-2 h-5 w-5' />
            Create Folder
          </Button>
        </div>
      </div>

      <div className='animate-fadeIn grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
        {displayedFolders.map((folder) => (
          <FolderCard
            key={folder.name}
            folder={folder}
            onClick={() => onFolderClick(folder)}
            onDelete={() => onFolderDelete(folder)} // Pass the whole folder object
          />
        ))}
        {displayedFiles.map((file) => (
          <FileCard
            key={file.cid}
            file={file}
            onDelete={() => handleFileDelete(file)} // Pass the whole file object
          />
        ))}
      </div>
    </>
  );
};
