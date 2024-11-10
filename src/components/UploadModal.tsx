import { useState, useRef, useCallback, useEffect } from 'react';
import { UploadModalProps, FileMetadata } from '../../types';
import { EncryptionService } from '../../utils/encryption';
import { UploadService } from '../../services/uploadService';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogTitle } from '@radix-ui/react-dialog';
import { Upload } from 'lucide-react';
import { DialogContent, DialogHeader } from './ui/dialog';
import { Button } from './ui/button';

export const UploadModal = ({ 
  isOpen, 
  onClose, 
  onUploadComplete,
  walletAddress 
}: UploadModalProps & { walletAddress: string }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const encryptionKey = useRef<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingToServer, setUploadingToServer] = useState(false);
  const [serverUploadProgress, setServerUploadProgress] = useState(0);
  const uploadId = useRef<string>(uuidv4());

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = event.target.files?.[0];
    
    if (!selectedFile) {
      setError('No file selected');
      return;
    }

    // Validate file size (e.g., max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (selectedFile.size > maxSize) {
      setError('File size exceeds 50MB limit');
      return;
    }

    setFile(selectedFile);
  }, []);

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(progress));
        }
      };
      
      reader.readAsArrayBuffer(file);
    });
  };
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Read and encrypt file
      const arrayBuffer = await readFileAsArrayBuffer(file);
      setEncryptionProgress(25);

      encryptionKey.current = EncryptionService.generateEncryptionKey();
      const encryptedData = await EncryptionService.encryptFile(
        arrayBuffer,
        encryptionKey.current
      );
      setEncryptionProgress(75);

      // Upload to server
      setUploadingToServer(true);
      const uploadResponse = await UploadService.uploadEncryptedFile(
        encryptedData,
        {
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedBy: walletAddress,
        }
      );

      // Create file metadata
      const fileMetadata: FileMetadata = {
        id: uploadId.current,
        name: file.name,
        size: file.size,
        uploadedBy: walletAddress,
        uploadedAt: new Date(),
        encryptionKey: encryptionKey.current,
        authorizedUsers: [walletAddress],
        cid: uploadResponse.cid,
      };

      setEncryptionProgress(100);
      
      if (onUploadComplete) {
        onUploadComplete(fileMetadata);
      }
      
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
      setEncryptionProgress(0);
      setUploadingToServer(false);
      setServerUploadProgress(0);
    }
  };

  // Progress polling
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (uploadingToServer) {
      pollInterval = setInterval(async () => {
        try {
          const progress = await UploadService.getUploadProgress(uploadId.current);
          setServerUploadProgress(progress);

          if (progress === 100) {
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error('Error polling upload progress:', error);
        }
      }, 1000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [uploadingToServer]);

  if (!isOpen) return null;

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              disabled={isLoading}
            >
              {file ? (
                <span className="flex items-center">
                  <Upload className="mr-2 h-4 w-4" />
                  {file.name}
                </span>
              ) : (
                <span className="flex items-center">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose a file or drag it here
                </span>
              )}
            </Button>
            </div>

          {(uploadProgress > 0 || encryptionProgress > 0 || serverUploadProgress > 0) && (
            <div className="space-y-2">
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Reading file...</div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {encryptionProgress > 0 && encryptionProgress < 100 && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Encrypting file...</div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${encryptionProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {serverUploadProgress > 0 && serverUploadProgress < 100 && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Uploading to server...</div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${serverUploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
              {error}
            </div>
          )}


<div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Upload'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}