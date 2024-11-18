import { useState, useEffect } from 'react';
import { useDdcClient } from './useDdcClient';
import { useWallet } from '@/contexts/WalletProvider';
import { FileMetadata, FolderMetadata } from '@/types';
import ky from 'ky';
import { useCere } from './useCere';

export const useStorage = () => {
  const { isInitializing, walletAddress } = useDdcClient();
  const { web3Signer } = useWallet();
  const { upload, share, download, access, isLoading } = useCere();

  const [folders, setFolders] = useState<FolderMetadata[]>([]);
  const [sharedFiles, setSharedFiles] = useState<FileMetadata[]>([]);

  useEffect(() => {
    if (!walletAddress) return;

    fetchFolders();
    fetchSharedFiles();
  }, [walletAddress]);

  const fetchFolders = async () => {
    try {
      const response = await ky.get(`/api/folders?walletAddress=${walletAddress}`).json<FolderMetadata[]>();
      setFolders(response);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  const fetchSharedFiles = async () => {
    try {
      const response = await ky.get(`/api/files?walletAddress=${walletAddress}&type=shared`).json<FileMetadata[]>();
      setSharedFiles(response);
    } catch (error) {
      console.error("Error fetching shared files:", error);
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      await ky.delete(`/api/folders?folderId=${folderId}`);
      fetchFolders();
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  const createFile = async (fileMetadata: FileMetadata) => {
    try {
      await ky.post("/api/files", { json: fileMetadata });
      fetchFolders();
    } catch (error) {
      console.error("Error creating file:", error);
    }
  };

  const createPrivateBucket = async () => {
    try {
      return await createPrivateBucket();
    } catch (error) {
      console.error('Error creating private bucket:', error);
      throw error;
    }
  };

  const uploadFile = async (file: File, recipientAddresses: string[]) => {
    if (!walletAddress) throw new Error('Wallet address not available');

    try {
      const bucketId = localStorage.getItem('userBucketId');
      if (!bucketId) {
        throw new Error('User bucket not found');
      }

      return await upload(file, BigInt(bucketId), recipientAddresses);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const shareFile = async (fileMetadata: FileMetadata, recipientAddresses: string[]) => {
    if (!walletAddress) throw new Error('Wallet address not available');
    if (!web3Signer) throw new Error('Web3 signer not available');

    try {
      const bucketId = localStorage.getItem('userBucketId');
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

  const downloadFile = async (fileMetadata: FileMetadata, accessToken: string) => {
    if (!walletAddress) throw new Error('Wallet address not available');

    try {
      await download(
        BigInt(fileMetadata.buckedId),
        fileMetadata.cid,
        accessToken,
        fileMetadata.name
      );
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  };

  const createFolder = async (folderMetadata: FolderMetadata) => {
    try {
      return await ky.post("/api/folders", { json: folderMetadata });
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  return {
    createPrivateBucket,
    uploadFile,
    shareFile,
    downloadFile,
    isLoading,
    isInitializing,
    folders,
    sharedFiles,
    createFolder,
    deleteFolder,
    createFile,
  };
};