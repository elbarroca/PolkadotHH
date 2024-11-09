import CryptoJS from 'crypto-js';

export interface EncryptedData {
  data: string;  // Base64 encoded encrypted data
  iv: string;    // Initialization vector
  salt: string;  // Salt used for key derivation
}

export class EncryptionService {
  private static generateKey(password: string, salt: string): CryptoJS.lib.WordArray {
    // Use PBKDF2 for key derivation
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000
    });
  }

  private static generateRandomBytes(length: number): string {
    const randomWords = CryptoJS.lib.WordArray.random(length);
    return CryptoJS.enc.Base64.stringify(randomWords);
  }

  public static async encryptFile(
    arrayBuffer: ArrayBuffer,
    password: string
  ): Promise<EncryptedData> {
    try {
      // Convert ArrayBuffer to WordArray
      const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);

      // Generate random salt and IV
      const salt = this.generateRandomBytes(16);
      const iv = this.generateRandomBytes(16);

      // Generate encryption key using password and salt
      const key = this.generateKey(password, salt);

      // Encrypt the data
      const encrypted = CryptoJS.AES.encrypt(wordArray, key, {
        iv: CryptoJS.enc.Base64.parse(iv),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
      });

      return {
        data: encrypted.toString(),
        iv,
        salt
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt file');
    }
  }

  public static async decryptFile(
    encryptedData: EncryptedData,
    password: string
  ): Promise<ArrayBuffer> {
    try {
      // Generate key using stored salt
      const key = this.generateKey(password, encryptedData.salt);

      // Decrypt the data
      const decrypted = CryptoJS.AES.decrypt(encryptedData.data, key, {
        iv: CryptoJS.enc.Base64.parse(encryptedData.iv),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
      });

      // Convert WordArray to Uint8Array
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
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt file');
    }
  }

  public static generateEncryptionKey(): string {
    // Generate a random 256-bit key
    return this.generateRandomBytes(32);
  }
} 