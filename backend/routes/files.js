import express from 'express';
import { upload } from '../middleware/upload.js';
import { verifyToken } from '../middleware/auth.js';
import File from '../models/File.js';
import cloudinary from '../utils/cloudinary.js';
import { sendOtpEmail } from '../utils/email.js';
import bcrypt from 'bcryptjs';
import { v2 as cloudinaryV2 } from 'cloudinary';


const router = express.Router();


router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { password, expiresInHours, downloadLimit, description, isGlobal } = req.body;
    let hashedPassword = password ? await bcrypt.hash(password, 12) : null;

    // Determine resource type from mimetype
    let resourceType = 'raw';
    if (req.file.mimetype.startsWith('image/')) resourceType = 'image';
    else if (req.file.mimetype.startsWith('video/')) resourceType = 'video';

    const file = new File({
      userId: req.user.userId,
      cloudinaryUrl: req.file.path,
      publicId: req.file.filename,
      fileName: req.file.originalname,
      description,
      password: hashedPassword,
      expiresAt: new Date(Date.now() + (expiresInHours || 24) * 60 * 60 * 1000),
      downloadLimit: downloadLimit || 5,
      resourceType, // ✅ Save this
      isGlobal: isGlobal || false, // ✅ Save global visibility
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



router.post('/download/:fileId', async (req, res) => {
  try {
    const { password, otp } = req.body;
    const file = await File.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Handle expiry
    if (file.expiresAt < new Date()) {
      await cloudinary.uploader.destroy(file.publicId, {
        resource_type: file.resourceType || 'raw', // ✅ Use resourceType
      });
      await file.deleteOne();
      return res.status(410).json({ message: 'File has expired' });
    }

    // Handle download limit
    if (file.downloadCount >= file.downloadLimit) {
      await cloudinary.uploader.destroy(file.publicId, {
        resource_type: file.resourceType || 'raw', // ✅ Use resourceType
      });
      await file.deleteOne();
      return res.status(403).json({ message: 'Download limit reached' });
    }

    // Password check
    if (file.password && (!password || !(await bcrypt.compare(password, file.password)))) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // OTP check
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

    // ✅ Get resourceType from DB
    const resourceType = file.resourceType || 'raw';

    // ✅ Generate Cloudinary URL
    const transformedUrl = cloudinaryV2.url(file.publicId, {
      resource_type: resourceType,
      type: 'upload',
      secure: true,
      ...(resourceType === 'raw' && { attachment: file.fileName }), // Only force-download for raw
    });

    const response = {
      url: transformedUrl,
      filename: file.fileName,
      description: file.description || '',
    };

    // Delete if last download
    if (file.downloadCount >= file.downloadLimit) {
      await cloudinary.uploader.destroy(file.publicId, {
        resource_type: resourceType,
      });
      await file.deleteOne();
    } else {
      await file.save();
    }

    res.json(response);
  } catch (error) {
    console.error('Download error:', error.message, error.stack);
    res.status(500).json({ message: 'Download failed', error: error.message });
  }
});

// DELETE file by ID (from DB + Cloudinary)
router.delete('/delete/:fileId', verifyToken, async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    if (file.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await cloudinary.uploader.destroy(file.publicId, {
      resource_type: file.resourceType || 'raw',
    });

    await file.deleteOne();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error.message);
    res.status(500).json({ message: 'Failed to delete file', error: error.message });
  }
});

router.get('/explore', async (req, res) => {
  try {
    const files = await File.find({ isGlobal: true, expiresAt: { $gt: new Date() } })
      .populate('userId', 'email') // Only fetch email
      .sort({ createdAt: -1 }); // Optional: newest first

    res.json(files);
  } catch (error) {
    console.error('Explore error:', error.message);
    res.status(500).json({ message: 'Failed to fetch public files' });
  }
});


export default router;
