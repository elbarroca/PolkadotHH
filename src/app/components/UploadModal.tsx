import { useState, useRef, useCallback, useEffect } from 'react';
import { UploadModalProps, FileMetadata } from '../../../types';
import { EncryptionService } from '../../../utils/encryption';
import { UploadService } from '../../../services/uploadService';
import { v4 as uuidv4 } from 'uuid';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Upload File
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-4 text-sm text-gray-600 hover:text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-blue-500"
              disabled={isLoading}
            >
              {file ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {file.name}
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M12 4v16m8-8H4"></path>
                  </svg>
                  Choose a file or drag it here
                </span>
              )}
            </button>
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
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 
                       bg-gray-100 hover:bg-gray-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-gray-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || isLoading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-offset-2 
                       focus:ring-blue-500 ${
                         !file || isLoading
                           ? 'bg-blue-400 cursor-not-allowed'
                           : 'bg-blue-600 hover:bg-blue-700'
                       }`}
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 