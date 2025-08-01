import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import File from '../models/File.js';

const router = express.Router();

router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.userId });
    const stats = {
      totalUploads: files.length,
      totalDownloads: files.reduce((sum, file) => sum + file.downloadCount, 0),
      activeFiles: files.filter((file) => file.expiresAt > new Date()).length,
    };
    res.json({ files, stats });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

export default router;