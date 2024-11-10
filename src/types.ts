export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  encryptionKey: string;
  authorizedUsers: string[];
  cid: string;
}

export interface FileItem {
  id: string;
  title: string;
  imageUrl: string;
  size: string;
  uploadedBy?: string;
  description?: string;
  folderId: string | null;
  name: string;
  starred?: boolean;
}

export interface Folder {
  id: string;
  name: string;
  files: FileItem[];
}

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (metadata: FileMetadata) => void;
  walletAddress: string;
  folders: Folder[];
} 