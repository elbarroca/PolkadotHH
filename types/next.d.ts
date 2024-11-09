import { NextApiRequest } from 'next';
import { EncryptedData } from '../utils/encryption';

declare module 'next' {
  interface NextApiRequest {
    body: {
      encryptedData: EncryptedData;
      metadata: {
        name: string;
        size: number;
        type: string;
        uploadedBy: string;
      };
    };
  }
} 