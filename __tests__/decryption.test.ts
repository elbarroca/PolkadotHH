import { DecryptionService, DecryptionError } from '../utils/decryption';
import { EncryptionService } from '../utils/encryption';

describe('DecryptionService', () => {
  it('should decrypt an encrypted file correctly', async () => {
    // Create test data
    const originalContent = 'Test file content';
    const arrayBuffer = new TextEncoder().encode(originalContent).buffer;

    // Generate encryption key and encrypt data
    const encryptionKey = EncryptionService.generateEncryptionKey();
    const encryptedData = await EncryptionService.encryptFile(
      arrayBuffer,
      encryptionKey,
    );

    // Decrypt the data
    const decryptedBuffer = await DecryptionService.decryptFile(
      encryptedData,
      encryptionKey,
    );

    // Convert back to string and compare
    const decryptedContent = new TextDecoder().decode(decryptedBuffer);
    expect(decryptedContent).toBe(originalContent);
  });

  it('should decrypt text correctly', async () => {
    const originalText = 'Hello, World!';
    const arrayBuffer = new TextEncoder().encode(originalText).buffer;

    const encryptionKey = EncryptionService.generateEncryptionKey();
    const encryptedData = await EncryptionService.encryptFile(
      arrayBuffer,
      encryptionKey,
    );

    const decryptedText = await DecryptionService.decryptText(
      encryptedData,
      encryptionKey,
    );

    expect(decryptedText).toBe(originalText);
  });

  it('should throw error with invalid encryption key', async () => {
    const originalContent = 'Test content';
    const arrayBuffer = new TextEncoder().encode(originalContent).buffer;

    const encryptionKey = EncryptionService.generateEncryptionKey();
    const encryptedData = await EncryptionService.encryptFile(
      arrayBuffer,
      encryptionKey,
    );

    await expect(
      DecryptionService.decryptFile(encryptedData, 'invalid-key'),
    ).rejects.toThrow(DecryptionError);
  });

  it('should verify decryption without throwing errors', async () => {
    const originalContent = 'Test content';
    const arrayBuffer = new TextEncoder().encode(originalContent).buffer;

    const encryptionKey = EncryptionService.generateEncryptionKey();
    const encryptedData = await EncryptionService.encryptFile(
      arrayBuffer,
      encryptionKey,
    );

    const isValid = await DecryptionService.verifyDecryption(
      encryptedData,
      encryptionKey,
    );
    const isInvalid = await DecryptionService.verifyDecryption(
      encryptedData,
      'wrong-key',
    );

    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });

  it('should handle download functionality', async () => {
    // Mock browser APIs
    const mockUrl = 'blob:test';
    const mockCreateElement = jest.fn().mockReturnValue({
      href: '',
      download: '',
      click: jest.fn(),
    });
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();

    global.URL.createObjectURL = jest.fn().mockReturnValue(mockUrl);
    global.URL.revokeObjectURL = jest.fn();
    document.createElement = mockCreateElement;
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;

    // Test data
    const originalContent = 'Test content';
    const arrayBuffer = new TextEncoder().encode(originalContent).buffer;
    const encryptionKey = EncryptionService.generateEncryptionKey();
    const encryptedData = await EncryptionService.encryptFile(
      arrayBuffer,
      encryptionKey,
    );

    await DecryptionService.decryptAndDownload(
      encryptedData,
      encryptionKey,
      'test.txt',
      'text/plain',
    );

    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockAppendChild).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalled();
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
  });
});
