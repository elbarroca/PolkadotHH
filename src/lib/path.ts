import { FileMetadata, FolderMetadata } from '../types';

export function getFilePath(file: FileMetadata, folders: FolderMetadata[]): string {
  const folderPath = getFolderPath(file.folder, folders);
  return `${folderPath}/${file.name}`;
}

function getFolderPath(folderName: string | undefined, folders: FolderMetadata[]): string {
  if (!folderName) {
    return '';
  }

  const folder = folders.find((f) => f.name === folderName);
  if (!folder) {
    return folderName;
  }

  const parentPath = getFolderPath(folder.parentFolder, folders);
  return `${parentPath}/${folderName}`;
}