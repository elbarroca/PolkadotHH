import { 
    DdcClient, 
    File as DdcFile, 
    AuthToken, 
    UriSigner, 
    AuthTokenOperation, 
    BucketId
} from '@cere-ddc-sdk/ddc-client';
import { useState } from 'react';
    
  const CERE = BigInt('10000000000');

  interface StorageConfig {
    client: DdcClient;
    clusterId?: string;
    walletAddress: string;
  }
  
  export const useStorage = ({ 
    client, 
    clusterId = '0059f5ada35eee46802d80750d5ca4a490640511',
  }: StorageConfig) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const createPrivateBucket = async () => {
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
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    };
  
    const uploadFile = async (
      file: File,
      bucketId: string
    ) => {
      setIsLoading(true);
      try {
        const fileBuffer = await file.arrayBuffer();
        const data = new Uint8Array(fileBuffer);
        const ddcFile = new DdcFile(data, { size: data.length });  
        const bucketIdBigInt = BigInt(bucketId) as BucketId;
        const uploadedFileUri = await client.store(bucketIdBigInt, ddcFile);
    
        return {
          cid: uploadedFileUri.cid,
          fileName: file.name,
          mimeType: file.type,
          size: file.size
        };
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    };
  
const shareFileAccess = async (
    bucketId: string,
    cid: string,
    recipientAddress: string,
    recipientSigner: UriSigner
  ) => {
    setIsLoading(true);
    try {
      // Grant access to recipient
      const bucketIdBigInt = BigInt(bucketId) as BucketId;
      const ownerToken = await client.grantAccess(recipientAddress, {
        bucketId: bucketIdBigInt,
        operations: [AuthTokenOperation.GET],
        pieceCid: cid
      });

      // Create recipient's access token
      const recipientToken = new AuthToken({
        operations: [AuthTokenOperation.GET],
        pieceCid: cid,
        prev: ownerToken,
        expiresIn: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      await recipientToken.sign(recipientSigner);

      return recipientToken.toString();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = async (
    bucketId: string,
    cid: string,
    token: string,
    fileName: string
  ) => {
    setIsLoading(true);
    try {
      // Construct download URL
      const url = `https://cdn.mainnet.cere.network/${bucketId}/${cid}?token=${token}`;
      
      // Download encrypted data
      const response = await fetch(url);
      const data = await response.arrayBuffer();

      // Create and download file
      const blob = new Blob([data]);
      const downloadUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPrivateBucket,
    uploadFile,
    shareFileAccess,
    downloadFile,
    isLoading,
    error
  };
};