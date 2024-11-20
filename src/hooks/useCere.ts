'use client';
import { useCallback, useState } from 'react';
import {
  File as DdcFile,
  AuthTokenOperation,
  BucketId,
  AuthToken,
  DagNode,
  DagNodeUri,
  Link,
} from '@cere-ddc-sdk/ddc-client';
import { FileMetadata } from '@/types';
import { useWallet } from '@/contexts/WalletProvider';

const CERE = BigInt('10000000000');
const clusterId = '0059f5ada35eee46802d80750d5ca4a490640511';

export const useCere = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { web3Signer, client, activeAccount } = useWallet();

  const createPrivateBucket = async () => {
    if (!client) throw new Error('Client not available');

    setIsLoading(true);
    try {
      const deposit = await client.getDeposit();
      if (deposit === BigInt('0')) {
        await client.depositBalance(BigInt('5') * CERE);
      }

      const bucketId = await client.createBucket(`0x${clusterId}`, {
        isPublic: false,
      });

      return bucketId;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const upload = useCallback(async (
    file: File,
    bucketId: BucketId,
    authorizedUsers: string[],
  ): Promise<FileMetadata> => {
    if (!client) throw new Error('Client not available');
    if (!activeAccount) throw new Error('Wallet address not available');
    setIsLoading(true);

    try {
      const fileBuffer = await file.arrayBuffer();
      const data = new Uint8Array(fileBuffer);
      const ddcFile = new DdcFile(data, { size: data.length });
      const bucketIdBigInt = BigInt(bucketId) as BucketId;
      const uploadedFileUri = await client.store(bucketIdBigInt, ddcFile);

      if (authorizedUsers.length > 0) {
        //await share(bucketId, uploadedFileUri.cid, authorizedUsers);
      }

      const fileMetadata = {
        cid: uploadedFileUri.cid,
        bucketId: bucketId.toString(),
        name: file.name,
        mimeType: file.type,
        size: file.size,
        uploadedBy: activeAccount,
        uploadedAt: new Date(),
        authorizedUsers,
      };

      await indexFile(fileMetadata, bucketId.toString(), file.size);

      return fileMetadata;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setIsLoading(false);
      }
    },
    [client],
  );

  const indexFile = async (
    fileMetadata: FileMetadata,
    bucketId: string,
    fileSize: number,
  ) => {
    if (!client) throw new Error('Client not available');

    try {
      // Indexing the file in the developer console
      const filePathInDeveloperConsole = `uploads/${fileMetadata.name}/`; // Define the path in the developer console
      const rootDagNode = await client
        .read(new DagNodeUri(BigInt(bucketId), 'fs'), {
          cacheControl: 'no-cache',
        })
        .catch((res) => {
          if (res.message == 'Cannot resolve CNS name: "fs"') {
            return new DagNode(null);
          } else {
            throw new Error("Failed to fetch 'fs' DAG node");
          }
        });

      // Ensure the rootDagNode is initialized if it was null
      if (!rootDagNode) {
        console.error('Failed to initialize root DAG node.');
        throw new Error('DAG node initialization failed');
      }

      // Add the uploaded file link to the DAG node
      rootDagNode.links.push(
        new Link(
          fileMetadata.cid,
          fileSize,
          filePathInDeveloperConsole + fileMetadata.name,
        ),
      );

      // Store the updated DAG node back to the bucket
      await client.store(BigInt(bucketId), rootDagNode, { name: 'fs' });
      console.log('The file has been indexed in the developer console.');
    } catch (error) {
      console.error('Error indexing file:', error);
    }
  };

  const share = async (
    bucketId: BucketId,
    cid: string,
    recipientAddresses: string[],
  ): Promise<void> => {
    if (!client) throw new Error('Client not available');
    if (!web3Signer) throw new Error('Signer not available');

    setIsLoading(true);
    try {
      for (const recipientAddress of recipientAddresses) {
        const token = await client.grantAccess(recipientAddress, {
          bucketId,
          operations: [AuthTokenOperation.GET],
          pieceCid: cid,
        });
        console.log(
          `Access token granted to ${recipientAddress}:`,
          token.toString(),
        );
      }
    } catch (error) {
      console.error('Error sharing file access:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const access = async (cid: string, token: string): Promise<string> => {
    if (!web3Signer) throw new Error('Signer not available');

    setIsLoading(true);
    try {
      const receivedToken = AuthToken.from(token);
      const wrappedToken = new AuthToken({
        operations: [AuthTokenOperation.GET],
        pieceCid: cid,
        prev: receivedToken,
        expiresIn: 24 * 60 * 60 * 1000,
      });
      await wrappedToken.sign(web3Signer);
      return wrappedToken.toString();
    } catch (error) {
      console.error('Error accessing file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { createPrivateBucket, upload, indexFile, share, access, isLoading };
};
