import { EncryptedData } from '../utils/encryption';

export interface UploadResponse {
  cid: string;
  status: 'success' | 'error';
  message?: string;
}

export class UploadService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  public static async uploadEncryptedFile(
    encryptedData: EncryptedData,
    metadata: {
      name: string;
      size: number;
      type: string;
      uploadedBy: string;
    }
  ): Promise<UploadResponse> {
    try {
      // Create form data
      const formData = new FormData();
      
      // Convert encrypted data to Blob
      const encryptedBlob = new Blob(
        [JSON.stringify(encryptedData)],
        { type: 'application/json' }
      );
      
      // Append encrypted data and metadata
      formData.append('encryptedData', encryptedBlob);
      formData.append('metadata', JSON.stringify(metadata));

      // Make the upload request
      const response = await fetch(`${this.API_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      return data as UploadResponse;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upload file'
      );
    }
  }

  public static async getUploadProgress(uploadId: string): Promise<number> {
    try {
      const response = await fetch(
        `${this.API_URL}/upload/progress/${uploadId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch upload progress');
      }

      const data = await response.json();
      return data.progress;
    } catch (error) {
      console.error('Error fetching upload progress:', error);
      throw error;
    }
  }
} 