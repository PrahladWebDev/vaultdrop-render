import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import fileRoutes from './routes/files.js';
import analyticsRoutes from './routes/analytics.js';
import File from './models/File.js';
import cloudinary from './utils/cloudinary.js';
import path from "path";

import cron from 'node-cron';


dotenv.config();
// Connect to MongoDB
connectDB();

const __dirname = path.resolve();
const app = express();

// Middleware
app.use(cors({ origin: 'https://vaultdrop-render.onrender.com', credentials: true }));
app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/analytics', analyticsRoutes);



// Cron job to delete expired files (runs every hour)
cron.schedule('0 * * * *', async () => {
  try {
    console.log('Running cleanup job for expired files...');
    const currentTime = new Date();
    
    // Find all files where expiresAt is in the past
    const expiredFiles = await File.find({ expiresAt: { $lt: currentTime } });

    for (const file of expiredFiles) {
      try {
        // Delete from Cloudinary
        await cloudinary.uploader.destroy(file.publicId, {
          resource_type: file.publicId.startsWith('vaultdrop/video') ? 'video' : 
                        file.publicId.startsWith('vaultdrop/image') ? 'image' : 'raw'
        });
        console.log(`Deleted file ${file.publicId} from Cloudinary`);

        // Delete from MongoDB
        await file.deleteOne();
        console.log(`Deleted file ${file._id} from MongoDB`);
      } catch (error) {
        console.error(`Failed to delete file ${file.publicId}:`, error.message);
      }
    }

    console.log(`Cleanup completed. Processed ${expiredFiles.length} expired files.`);
  } catch (error) {
    console.error('Error during cleanup job:', error.message, error.stack);
  }
});


// Serve static files from frontend
app.use(express.static(path.join(__dirname, "/frontend/dist")));

// Catch-all route for SPA
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
