export interface FolderMetadata {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  parentFolder?: string;
  files: string[];
} 