import type { NextApiRequest, NextApiResponse } from 'next';
import { EncryptedData } from '../../../utils/encryption';
import formidable from 'formidable';
import { createRouter } from 'next-connect';

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

interface UploadMetadata {
  name: string;
  size: number;
  type: string;
  uploadedBy: string;
}

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .use(async (req, res, next) => {
    // Middleware to parse form data
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
    });

    return new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err);
          res.status(500).json({ 
            status: 'error',
            message: 'Error processing upload'
          });
          reject(err);
          return;
        }

        // Attach parsed data to request object
        req.body = {
          encryptedData: JSON.parse(fields.encryptedData as string),
          metadata: JSON.parse(fields.metadata as string),
        };
        resolve(next());
      });
    });
  })
  .post(async (req, res) => {
    try {
      const { encryptedData, metadata } = req.body as {
        encryptedData: EncryptedData;
        metadata: UploadMetadata;
      };

      // Log the received data
      console.log('Received encrypted file:', {
        filename: metadata.name,
        size: metadata.size,
        uploader: metadata.uploadedBy,
        encryptionDetails: {
          ivLength: encryptedData.iv.length,
          saltLength: encryptedData.salt.length,
          dataLength: encryptedData.data.length,
        },
      });

      // TODO: Store the file in IPFS
      const mockCid = `ipfs-${Date.now()}-${metadata.name}`;

      // Update upload progress
      const uploadId = req.query.uploadId as string;
      if (uploadId) {
        await updateUploadProgress(uploadId, 100);
      }

      res.status(200).json({
        status: 'success',
        cid: mockCid,
        message: 'File uploaded successfully',
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to process upload',
      });
    }
  });

export default router.handler(); 