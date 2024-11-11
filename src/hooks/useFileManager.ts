import { useState } from 'react';
import { DagNode, DagNodeUri, Link, UriSigner } from '@cere-ddc-sdk/ddc-client';
import { useDdcClient } from './useDdcClient';
import { useStorage } from './useStorage';
import { FileMetadata } from 'types';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from './use-toast';

export const useFileManager = () => {
    const { client, error: clientError, isInitializing, walletAddress } = useDdcClient();
    const [myFiles, setMyFiles] = useState<FileMetadata[]>([]);
    const { toast } = useToast()

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

          // Construct the URL for the uploaded file
          const fileUrl = `https://cdn.mainnet.cere.network/${bucketId!}/${fileMetadata.cid}?token=YOUR_TOKEN_HERE`;

          // Show toast notification with file information
          toast({
              title: "File uploaded",
              description: `Check your file on: <a href="${fileUrl}" target="_blank">${fileUrl}</a>`,
          });

          // Indexing the file in the developer console
          const filePathInDeveloperConsole = `uploads/${fileMetadata.name}/`; // Define the path in the developer console
          const rootDagNode = await client.read(new DagNodeUri(BigInt(bucketId), 'fs'), { cacheControl: 'no-cache' }).catch((res) => {
              if (res.message == 'Cannot resolve CNS name: "fs"') {
                  return new DagNode(null);
              } else {
                  throw new Error("Failed to fetch 'fs' DAG node");
              }
          });

          // Ensure the rootDagNode is initialized if it was null
          if (!rootDagNode) {
              console.error("Failed to initialize root DAG node.");
              throw new Error("DAG node initialization failed");
          }

          // Add the uploaded file link to the DAG node
          rootDagNode.links.push(new Link(uploadResult.cid, file.size, filePathInDeveloperConsole + fileMetadata.name));

          // Store the updated DAG node back to the bucket
          await client.store(BigInt(bucketId), rootDagNode, { name: 'fs' });
          console.log('The file has been indexed in the developer console.');

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