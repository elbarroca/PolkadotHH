import { useState } from 'react';
import { File as DdcFile, AuthTokenOperation, BucketId, AuthToken } from '@cere-ddc-sdk/ddc-client';
import { FileMetadata } from '@/types';
import { useDdcClient } from './useDdcClient';
import { Web3Signer } from '@cere-ddc-sdk/blockchain';
import { useWallet } from '@/contexts/WalletProvider';

const CERE = BigInt('10000000000');
const clusterId = '0059f5ada35eee46802d80750d5ca4a490640511';

export const useCere = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { client, walletAddress } = useDdcClient();
  const { web3Signer } = useWallet();

  const createPrivateBucket = async () => {
    if (!client) throw new Error('Client not available');

    setIsLoading(true);
    try {
      const deposit = await client.getDeposit();
      if (deposit === BigInt('0')) {
          await client.depositBalance(BigInt('5') * CERE);
      }

      const bucketId = await client.createBucket(`0x${clusterId}`, { 
          isPublic: false 
      });

      return bucketId;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  const upload = async (file: File, bucketId: BucketId, authorizedUsers: string[]): Promise<FileMetadata> => {
    if (!client) throw new Error('Client not available');
    if (!walletAddress) throw new Error('Wallet address not available');
    setIsLoading(true);

    try {
      const fileBuffer = await file.arrayBuffer();
      const data = new Uint8Array(fileBuffer);
      const ddcFile = new DdcFile(data, { size: data.length });  
      const bucketIdBigInt = BigInt(bucketId) as BucketId;
      const uploadedFileUri = await client.store(bucketIdBigInt, ddcFile);
      
      if (authorizedUsers.length > 0) {
        await share(bucketId, uploadedFileUri.cid, authorizedUsers);
      }
  
      return {
        cid: uploadedFileUri.cid,
        buckedId: bucketId.toString(),
        name: file.name,
        mimeType: file.type,
        size: file.size,
        uploadedBy: walletAddress,
        uploadedAt: new Date(),
        authorizedUsers,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const share = async (bucketId: BucketId, cid: string, recipientAddresses: string[]): Promise<void> => {
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
        console.log(`Access token granted to ${recipientAddress}:`, token.toString());
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

  const download = async (bucketId: BucketId, cid: string, token: string, fileName: string): Promise<void> => {
    setIsLoading(true);
    try {
      const url = `https://cdn.mainnet.cere.network/${bucketId}/${cid}?token=${token}`;
      const response = await fetch(url);
      const data = await response.arrayBuffer();
      const blob = new Blob([data]);
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { createPrivateBucket, upload, share, access, download, isLoading };
};