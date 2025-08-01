import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let resourceType = 'auto'; // Let Cloudinary determine the resource type
    const fileExtension = file.mimetype.split('/')[1].toLowerCase();

    if (['jpeg', 'jpg', 'png', 'gif'].includes(fileExtension)) {
      resourceType = 'image';
    } else if (['mp4', 'avi', 'mov'].includes(fileExtension)) {
      resourceType = 'video';
    } else if (['pdf', 'docx', 'txt'].includes(fileExtension)) {
      resourceType = 'raw';
    }

    return {
      folder: 'vaultdrop',
      resource_type: resourceType,
    };
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});