import CryptoJS from 'crypto-js';
import { EncryptedData } from './encryption';

export class DecryptionError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'DecryptionError';
  }
}

export class DecryptionService {
  private static generateKey(password: string, salt: string): CryptoJS.lib.WordArray {
    try {
      return CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 10000
      });
    } catch (error) {
      throw new DecryptionError(
        'Failed to generate decryption key',
        'KEY_GENERATION_FAILED'
      );
    }
  }

  public static async decryptFile(
    encryptedData: EncryptedData,
    encryptionKey: string
  ): Promise<ArrayBuffer> {
    try {
      // Validate inputs
      if (!this.validateEncryptionKey(encryptionKey)) {
        throw new DecryptionError(
          'Invalid encryption key format',
          'INVALID_KEY'
        );
      }

      if (!this.validateEncryptedData(encryptedData)) {
        throw new DecryptionError(
          'Invalid encrypted data format',
          'INVALID_DATA'
        );
      }

      // Generate key using stored salt
      const key = this.generateKey(encryptionKey, encryptedData.salt);

      // Decrypt the data
      const decrypted = CryptoJS.AES.decrypt(encryptedData.data, key, {
        iv: CryptoJS.enc.Base64.parse(encryptedData.iv),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
      });

      if (!decrypted) {
        throw new DecryptionError(
          'Decryption failed - invalid result',
          'DECRYPTION_FAILED'
        );
      }

      // Convert WordArray to ArrayBuffer
      const wordArray = decrypted;
      const arrayBuffer = new Uint8Array(wordArray.words.length * 4);
      
      for (let i = 0; i < wordArray.words.length; i++) {
        const word = wordArray.words[i];
        const offset = i * 4;
        arrayBuffer[offset] = (word >> 24) & 0xff;
        arrayBuffer[offset + 1] = (word >> 16) & 0xff;
        arrayBuffer[offset + 2] = (word >> 8) & 0xff;
        arrayBuffer[offset + 3] = word & 0xff;
      }

      return arrayBuffer.buffer.slice(0, wordArray.sigBytes);
    } catch (error) {
      if (error instanceof DecryptionError) {
        throw error;
      }
      console.error('Decryption error:', error);
      throw new DecryptionError(
        'Failed to decrypt file',
        'UNKNOWN_ERROR'
      );
    }
  }

  public static async decryptText(
    encryptedData: EncryptedData,
    encryptionKey: string
  ): Promise<string> {
    try {
      const decryptedBuffer = await this.decryptFile(encryptedData, encryptionKey);
      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      throw new DecryptionError(
        'Failed to decrypt text',
        'TEXT_DECRYPTION_FAILED'
      );
    }
  }

  public static async decryptAndDownload(
    encryptedData: EncryptedData,
    encryptionKey: string,
    fileName: string,
    mimeType: string = 'application/octet-stream'
  ): Promise<void> {
    try {
      const decryptedBuffer = await this.decryptFile(encryptedData, encryptionKey);
      
      // Create blob with proper MIME type
      const blob = new Blob([decryptedBuffer], { type: mimeType });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (error instanceof DecryptionError) {
        throw error;
      }
      throw new DecryptionError(
        'Failed to download decrypted file',
        'DOWNLOAD_FAILED'
      );
    }
  }

  private static validateEncryptionKey(key: string): boolean {
    return typeof key === 'string' && key.length >= 32;
  }

  private static validateEncryptedData(data: EncryptedData): boolean {
    return (
      typeof data === 'object' &&
      typeof data.data === 'string' &&
      typeof data.iv === 'string' &&
      typeof data.salt === 'string' &&
      data.data.length > 0 &&
      data.iv.length > 0 &&
      data.salt.length > 0
    );
  }

  public static async verifyDecryption(
    encryptedData: EncryptedData,
    encryptionKey: string
  ): Promise<boolean> {
    try {
      await this.decryptFile(encryptedData, encryptionKey);
      return true;
    } catch (error) {
      return false;
    }
  }
} 