export type FileMetadata = {
  cid: string;
  buckedId: string;
  name: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  authorizedUsers: string[];
  mimeType: string;
  folder?: string;
};

export type FolderMetadata = {
  name: string;
  createdBy: string;
  createdAt: Date;
  childFolders: FolderMetadata[];
  files: FileMetadata[];
  parentFolder?: string;
};

export interface SharedFile {
  accessToken: string;
  fileId: string;
  ownerId: string;
  recipientId: string;
  createdAt: Date;
  expiresAt: Date;
  signedToken?: boolean;
}

export interface TokenPayload {
  sub: string;
  iss: string;
  exp: number;
  fileId: string;
  permissions: string[];
}

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (fileMetadata: FileMetadata) => void;
  walletAddress: string;
  folders: FolderMetadata[];
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

export interface FileViewerProps {
  fileUrl: string;
  fileName?: string;
  mimeType: string;
  onClose?: () => void;
}

export interface PDFViewerProps {
  fileUrl: string;
  fileName?: string;
}

export type SupportedMimeTypes = 
  | 'application/pdf'
  | 'image/png'
  | 'image/jpeg'
  | 'image/gif';