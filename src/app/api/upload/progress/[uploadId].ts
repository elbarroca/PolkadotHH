import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

// In-memory progress tracking (replace with Redis in production)
const uploadProgress = new Map<string, number>();

export function updateUploadProgress(uploadId: string, progress: number) {
  uploadProgress.set(uploadId, progress);
}

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req, res) => {
  const { uploadId } = req.query;
  
  if (typeof uploadId !== 'string') {
    return res.status(400).json({ 
      status: 'error',
      message: 'Invalid upload ID' 
    });
  }

  const progress = uploadProgress.get(uploadId) ?? 0;
  
  res.status(200).json({ progress });
});

export default router.handler(); 