import { EncryptionService } from '../utils/encryption';
import { UploadService } from '../services/uploadService';
import { cleanup } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';

describe('File Upload and Encryption Process', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    cleanup();
  });

  it('should encrypt and upload a file successfully', async () => {
    // Mock file data
    const fileContent = 'Test file content';
    const file = new File([fileContent], 'test.txt', { type: 'text/plain' });
    const arrayBuffer = await file.arrayBuffer();

    // Test encryption
    const encryptionKey = EncryptionService.generateEncryptionKey();
    const encryptedData = await EncryptionService.encryptFile(
      arrayBuffer,
      encryptionKey,
    );

    // Verify encryption result
    expect(encryptedData).toHaveProperty('data');
    expect(encryptedData).toHaveProperty('iv');
    expect(encryptedData).toHaveProperty('salt');
    expect(typeof encryptedData.data).toBe('string');

    // Mock successful upload response
    fetchMock.mockResponseOnce(
      JSON.stringify({
        status: 'success',
        cid: 'test-cid',
        message: 'File uploaded successfully',
      }),
    );

    // Test upload
    const uploadResponse = await UploadService.uploadEncryptedFile(
      encryptedData,
      {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedBy: '0x123...789',
      },
    );

    expect(uploadResponse.status).toBe('success');
    expect(uploadResponse.cid).toBeDefined();
  });

  it('should decrypt the encrypted file correctly', async () => {
    // Original content
    const originalContent = 'Test file content';
    const arrayBuffer = new TextEncoder().encode(originalContent).buffer;

    // Encrypt
    const encryptionKey = EncryptionService.generateEncryptionKey();
    const encryptedData = await EncryptionService.encryptFile(
      arrayBuffer,
      encryptionKey,
    );

    // Decrypt
    const decryptedBuffer = await EncryptionService.decryptFile(
      encryptedData,
      encryptionKey,
    );

    // Convert back to string
    const decryptedContent = new TextDecoder().decode(decryptedBuffer);
    expect(decryptedContent).toBe(originalContent);
  });

  it('should handle large files correctly', async () => {
    // Create a large file (5MB)
    const largeContent = new Array(5 * 1024 * 1024).fill('A').join('');
    const file = new File([largeContent], 'large.txt', { type: 'text/plain' });
    const arrayBuffer = await file.arrayBuffer();

    // Test encryption of large file
    const encryptionKey = EncryptionService.generateEncryptionKey();
    const encryptedData = await EncryptionService.encryptFile(
      arrayBuffer,
      encryptionKey,
    );

    expect(encryptedData).toHaveProperty('data');
    expect(encryptedData.data.length).toBeGreaterThan(0);
  });

  it('should handle upload errors correctly', async () => {
    // Mock network error
    fetchMock.mockRejectOnce(new Error('Network error'));

    const encryptedData = {
      data: 'test-data',
      iv: 'test-iv',
      salt: 'test-salt',
    };

    await expect(
      UploadService.uploadEncryptedFile(encryptedData, {
        name: 'test.txt',
        size: 100,
        type: 'text/plain',
        uploadedBy: '0x123...789',
      }),
    ).rejects.toThrow('Failed to upload file');
  });
});
