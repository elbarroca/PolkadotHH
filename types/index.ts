export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  encryptionKey?: string;
  authorizedUsers: string[];
  cid: string; // IPFS Content Identifier
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  balance: string | null;
  connect: () => Promise<void>;
  connectWithWalletConnect: () => Promise<void>;
  disconnect: () => Promise<void>;
  error: string | null;
  connectionType: 'metamask' | 'walletconnect' | null;
}

export interface FileUploadState {
  file: File | null;
  progress: number;
  error: string | null;
  isLoading: boolean;
}

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (fileMetadata: FileMetadata) => void;
}

export interface HeaderProps {
  walletAddress: string | null;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
} 