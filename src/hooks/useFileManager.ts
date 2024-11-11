import { useState } from 'react';
import { UriSigner } from '@cere-ddc-sdk/ddc-client';
import { useDdcClient } from './useDdcClient';
import { useStorage } from './useStorage';
import { FileMetadata } from 'types';
import { v4 as uuidv4 } from 'uuid';

export const useFileManager = () => {
    const { client, error: clientError, isInitializing, walletAddress } = useDdcClient();
    const [myFiles, setMyFiles] = useState<FileMetadata[]>([]);
    
    const storage = useStorage({
      client: client!,
      walletAddress: walletAddress || ''
    });

  const uploadFile = async (file: File) => {
    if (!client) throw new Error('DDC client not initialized');
  
    try {
      let bucketId = localStorage.getItem('userBucketId');
      if (!bucketId) {
        const privateBucket = await storage.createPrivateBucket();
        bucketId = privateBucket.toString();
        localStorage.setItem('userBucketId', bucketId);
      }

      const uploadResult = await storage.uploadFile(file, bucketId!);
      const fileMetadata: FileMetadata = {
        id: uuidv4(),
        name: file.name,
        size: file.size,
        uploadedBy: walletAddress || '',
        uploadedAt: new Date(),
        authorizedUsers: [walletAddress || ''],
        cid: uploadResult.cid,
        mimeType: file.type || 'application/octet-stream',
        description: '',
        folderId: null
      };

      setMyFiles(prev => [...prev, fileMetadata]);

      return fileMetadata;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Upload failed');
      console.error('Upload failed:', error);
      throw error;
    }
  };

  const shareFile = async (
    fileMetadata: FileMetadata,
    recipientAddress: string,
    recipientSeed: string
  ) => {
    if (!client) throw new Error('DDC client not initialized');

    try {
      const recipientSigner = new UriSigner(recipientSeed);
      const bucketId = localStorage.getItem('userBucketId');
      if (!bucketId) throw new Error('User does not have bucket');

      const accessToken = await storage.shareFileAccess(
        bucketId,
        fileMetadata.cid,
        recipientAddress,
        recipientSigner
      );

      return accessToken;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sharing failed');
      console.error('Sharing failed:', error);
      throw error;
    }
  };

  const downloadFile = async (
    fileMetadata: FileMetadata,
    accessToken: string,
    signature: string
  ) => {
    if (!client) throw new Error('DDC client not initialized');
    const bucketId = localStorage.getItem('userBucketId');
    if (!bucketId) throw new Error('User does not have bucket');

    try {
      await storage.downloadFile(
        bucketId,
        fileMetadata.cid,
        accessToken,
        signature,
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Download failed');
      console.error('Download failed:', error);
      throw error;
    }
  };

  return {
    uploadFile,
    shareFile,
    downloadFile,
    myFiles,
    isInitializing,
    error: clientError || storage.error
  };
};