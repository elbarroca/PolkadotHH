export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  authorizedUsers: string[];
  cid: string;
  mimeType: string;
  description?: string;
  folderId?: string | null;
}

export interface Folder {
  id: string;
  name: string;
  files: FileMetadata[];
}

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (fileMetadata: FileMetadata) => void;
  walletAddress: string;
  folders: Folder[];
}

export interface FileUploadState {
  file: File | null;
  progress: {
    upload: number;
    server: number;
  };
  error: string | null;
  isLoading: boolean;
  fileName: string;
  description: string;
  selectedFolder: string;
}