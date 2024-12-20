'use client';
import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletProvider';
import { FileMetadata, FolderMetadata } from '@/types';
import ky from 'ky';
import { useCere } from './useCere';
import { toast } from './useToast';
import { FileUri } from '@cere-ddc-sdk/ddc-client';

export const useStorage = () => {
  const { web3Signer, activeAccount, client } = useWallet();
  const { upload, share, access, isLoading } = useCere();

  const [folders, setFolders] = useState<FolderMetadata[]>([]);
  const [sharedFiles, setSharedFiles] = useState<FileMetadata[]>([]);

  useEffect(() => {
    const fetchFolders = async () => {
      if (activeAccount) {
        console.log(client)
        try {
          const foldersResponse = await ky
            .get(`/api/storage?walletAddress=${activeAccount}`)
            .json();
            
          setFolders(foldersResponse as FolderMetadata[]);
        } catch (error) {
          console.error('Error fetching folders:', error);
        }
      }
    };

    fetchFolders();
  }, [activeAccount]);

  const createFolder = useCallback(
    async (folderData: FolderMetadata) => {
      try {
        const response = await fetch('/api/storage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(folderData),
        });

        if (!response.ok) {
          throw new Error('Failed to create folder');
        }

        setFolders((prevFolders) => [...prevFolders, folderData]);

        toast({
          title: 'Success',
          description: `Folder created: ${folderData.name}`,
        });
      } catch (error) {
        console.error('Error creating folder:', error);
        toast({
          title: 'Error',
          description: 'Failed to create folder',
          variant: 'destructive',
        });
      }
    },
    [toast],
  );

  const createFile = useCallback(
    async (fileData: FileMetadata) => {
      try {
        const response = await fetch('/api/storage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fileData),
        });

        if (!response.ok) {
          throw new Error('Failed to create file metadata');
        }

        setFolders((prevFolders) =>
          prevFolders.map((folder) => {
            if (folder.name === fileData.folder) {
              return {
                ...folder,
                files: [...folder.files, fileData],
              };
            }
            return folder;
          }),
        );

        toast({
          title: 'Success',
          description: 'File metadata created successfully',
        });
      } catch (error) {
        console.error('Error creating file metadata:', error);
        toast({
          title: 'Error',
          description: 'Failed to create file metadata',
          variant: 'destructive',
        });
      }
    },
    [toast],
  );

  const createPrivateBucket = async () => {
    try {
      return await createPrivateBucket();
    } catch (error) {
      console.error('Error creating private bucket:', error);
      throw error;
    }
  };

  const uploadFile = useCallback(async (
    file: File,
    recipientAddresses: string[],
    selectedFolder: string,
  ) => {
    if (!activeAccount) throw new Error('Wallet address not available');
    if (!client) return null;

    try {
      let bucketId = localStorage.getItem('userBucketId');
      if (!bucketId) {
        localStorage.setItem('userBucketId', '1099');
        bucketId = localStorage.getItem('userBucketId');
        //bucketId = await createPrivateBucket();
        /// CHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANGEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
      }

      const metadata = await upload(
        file,
        BigInt(bucketId!),
        recipientAddresses,
      );
      metadata.folder = selectedFolder;
      console.log('metadata', metadata)
      await createFile(metadata);

      return metadata;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }, [activeAccount, client])

  const deleteFile = async (fileId: string) => {
    try {
      await ky.delete(`/api/files?fileId=${fileId}`);
      setFolders((prevFolders) =>
        prevFolders.filter((folder) => folder.name !== fileId),
      );
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const deleteFolder = useCallback(
    async (walletAddress: string, folderPath: string) => {
      try {
        const response = await fetch(
          `/api/storage?walletAddress=${walletAddress}&path=${encodeURIComponent(folderPath)}`,
          {
            method: 'DELETE',
          },
        );

        if (!response.ok) {
          throw new Error('Failed to delete folder');
        }

        setFolders((prevFolders) =>
          prevFolders.filter((folder) => folder.name !== folderPath),
        );

        toast({
          title: 'Success',
          description: 'Folder deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting folder:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete folder',
          variant: 'destructive',
        });
      }
    },
    [toast],
  );

  const shareFile = async (
    fileMetadata: FileMetadata,
    recipientAddresses: string[],
  ) => {
    if (!activeAccount) throw new Error('Wallet address not available');
    if (!web3Signer) throw new Error('Web3 signer not available');

    try {
      const bucketId = localStorage.getItem('userBucketId') || 1099;
      if (!bucketId) throw new Error('User bucket not found');

      return await share(
        BigInt(bucketId),
        fileMetadata.cid,
        recipientAddresses,
      );
    } catch (error) {
      console.error('Error sharing file:', error);
      throw error;
    }
  };

  const getDownloadURL = async (fileMetadata: FileMetadata) => {
    if (!activeAccount) throw new Error('Wallet address not available');

    try {
      // Get access token first
      const accessToken = await access(fileMetadata.bucketId, fileMetadata.cid);

      // Then get download URL
      // TODO: i think this is wrong, we should be using the cid to get the download url
      const response = await ky
        .get('/api/storage/download', {
          searchParams: {
            walletAddress: activeAccount,
            cid: fileMetadata.cid,
            accessToken,
          },
        })
        .json<{ url: string }>();

      return response.url;
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  };

  const downloadFile = async (fileMetadata: FileMetadata) => {
    if (!client) throw new Error('Client not available');

    try {
      const fileUri = new FileUri(
        BigInt(fileMetadata.bucketId),
        fileMetadata.cid,
      );
      const fileResponse = await client.read(fileUri);

      // Assuming the file is text-based, you can adjust this based on your file type
      const textContent = await fileResponse.text();

      // Create a blob and download link
      const blob = new Blob([textContent], { type: fileMetadata.mimeType });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileMetadata.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  };

  return {
    createPrivateBucket,
    uploadFile,
    shareFile,
    downloadFile,
    getDownloadURL,
    isLoading,
    folders,
    sharedFiles,
    createFolder,
    deleteFolder,
    createFile,
    deleteFile,
  };
};
