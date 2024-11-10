import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UploadModal } from '../src/components/UploadModal';
import { EncryptionService } from '../utils/encryption';
import { UploadService } from '../services/uploadService';

// Mock the services
jest.mock('../utils/encryption');
jest.mock('../services/uploadService');

describe('UploadModal Integration', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    onUploadComplete: jest.fn(),
    walletAddress: '0x123...789'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle file selection and upload process', async () => {
    // Mock successful encryption and upload
    (EncryptionService.generateEncryptionKey as jest.Mock).mockReturnValue('test-key');
    (EncryptionService.encryptFile as jest.Mock).mockResolvedValue({
      data: 'encrypted-data',
      iv: 'test-iv',
      salt: 'test-salt'
    });
    (UploadService.uploadEncryptedFile as jest.Mock).mockResolvedValue({
      status: 'success',
      cid: 'test-cid'
    });

    render(<UploadModal {...mockProps} />);

    // Create a test file
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/Choose a file/i);

    // Simulate file selection
    fireEvent.change(input, { target: { files: [file] } });

    // Click upload button
    const uploadButton = screen.getByText('Upload');
    fireEvent.click(uploadButton);

    // Wait for the upload process to complete
    await waitFor(() => {
      expect(mockProps.onUploadComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test.txt',
          cid: 'test-cid'
        })
      );
    });
  });

  it('should show error message when file is too large', () => {
    render(<UploadModal {...mockProps} />);

    // Create a file larger than 50MB
    const largeFile = new File(
      [new ArrayBuffer(51 * 1024 * 1024)],
      'large.txt',
      { type: 'text/plain' }
    );
    const input = screen.getByLabelText(/Choose a file/i);

    // Simulate file selection
    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(screen.getByText(/File size exceeds 50MB limit/i)).toBeInTheDocument();
  });

  it('should handle encryption errors', async () => {
    // Mock encryption error
    (EncryptionService.encryptFile as jest.Mock).mockRejectedValue(
      new Error('Encryption failed')
    );

    render(<UploadModal {...mockProps} />);

    // Create a test file
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/Choose a file/i);

    // Simulate file selection and upload
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByText('Upload'));

    await waitFor(() => {
      expect(screen.getByText(/Encryption failed/i)).toBeInTheDocument();
    });
  });
}); 