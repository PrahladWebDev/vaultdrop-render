import express from 'express';
import { upload } from '../middleware/upload.js';
import { verifyToken } from '../middleware/auth.js';
import File from '../models/File.js';
import cloudinary from '../utils/cloudinary.js';
import { sendOtpEmail } from '../utils/email.js';
import bcrypt from 'bcryptjs';


const router = express.Router();

// Upload file
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const { password, expiresInHours, downloadLimit, description } = req.body;
    let hashedPassword = password ? await bcrypt.hash(password, 12) : null;

    const file = new File({
      userId: req.user.userId,
      cloudinaryUrl: req.file.path,
      publicId: req.file.filename,
      fileName: req.file.originalname,
      description,
      password: hashedPassword,
      expiresAt: new Date(Date.now() + (expiresInHours || 24) * 60 * 60 * 1000),
      downloadLimit: downloadLimit || 5,
    });

    await file.save();
    const shareableLink = `https://vaultdrop-render.onrender.com/download/${file._id}`;
    res.json({ shareableLink, message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Upload error:', error.message, error.stack);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});

// Share file via email with OTP
router.post('/share/:fileId', verifyToken, async (req, res) => {
  try {
    const { email } = req.body;

    const file = await File.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const shareableLink = `https://vaultdrop-render.onrender.com/download/${file._id}`;
    await sendOtpEmail(email, otp, shareableLink);

    file.otp = await bcrypt.hash(otp, 12);
    file.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    file.requiresOtp = true;
    await file.save();

    res.json({ message: 'OTP sent to email successfully', link: shareableLink });
  } catch (error) {
    console.error('Share error:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
});


// Check if file requires OTP
router.get('/check/:fileId', async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Clear expired OTP
    if (file.requiresOtp && file.otpExpires && file.otpExpires < new Date()) {
      file.otp = null;
      file.otpExpires = null;
      file.requiresOtp = false;
      await file.save();
    }

    res.json({
      requiresOtp: file.requiresOtp || false,
      hasPassword: !!file.password,
      description: file.description || '',
      downloadLimit: file.downloadLimit, // Add downloadLimit
      downloadCount: file.downloadCount, // Add downloadCount
    });
  } catch (error) {
    console.error('Check error:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to check file', error: error.message });
  }
});

// Download file
router.post('/download/:fileId', async (req, res) => {
  try {
    const { password, otp } = req.body;
    const file = await File.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    if (file.expiresAt < new Date()) {
      await cloudinary.uploader.destroy(file.publicId, {
        resource_type: file.publicId.startsWith('vaultdrop/video') ? 'video' :
                      file.publicId.startsWith('vaultdrop/image') ? 'image' : 'raw'
      });
      await file.deleteOne();
      return res.status(410).json({ message: 'File has expired' });
    }

    if (file.downloadCount >= file.downloadLimit) {
      await cloudinary.uploader.destroy(file.publicId, {
        resource_type: file.publicId.startsWith('vaultdrop/video') ? 'video' :
                      file.publicId.startsWith('vaultdrop/image') ? 'image' : 'raw'
      });
      await file.deleteOne();
      return res.status(403).json({ message: 'Download limit reached' });
    }

    // Enforce password if set
    if (file.password && (!password || !(await bcrypt.compare(password, file.password)))) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Enforce OTP if requiresOtp is true
    if (file.requiresOtp) {
      if (!otp) return res.status(401).json({ message: 'OTP is required' });
      if (!file.otp || file.otpExpires < new Date()) {
        file.otp = null;
        file.otpExpires = null;
        file.requiresOtp = false;
        await file.save();
        return res.status(401).json({ message: 'OTP has expired, please request a new OTP' });
      }
      if (!(await bcrypt.compare(otp, file.otp))) {
        return res.status(401).json({ message: 'Invalid OTP' });
      }
    }

    // Increment download count
    file.downloadCount += 1;

    // Prepare response before any deletion
    const response = {
      url: file.cloudinaryUrl,
      filename: file.fileName,
      description: file.description || ''
    };

    // Check if this was the last download
    if (file.downloadCount >= file.downloadLimit) {
      // Delete file from Cloudinary and MongoDB after preparing response
      await cloudinary.uploader.destroy(file.publicId, {
        resource_type: file.publicId.startsWith('vaultdrop/video') ? 'video' :
                      file.publicId.startsWith('vaultdrop/image') ? 'image' : 'raw'
      });
      await file.deleteOne();
    } else {
      await file.save();
    }

    // Send response with file details
    res.json(response);
  } catch (error) {
    console.error('Download error:', error.message, error.stack);
    res.status(500).json({ message: 'Download failed', error: error.message });
  }
});


export default router;
