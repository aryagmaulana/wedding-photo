const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE || 'service-account-key.json',
});

const bucketName = 'bucket-armalino-photo';
const bucket = storage.bucket(bucketName);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Wedding Photos Server is running' });
});

// Upload photo endpoint
app.post('/api/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo file provided' });
    }

    const { originalname, mimetype, buffer } = req.file;
    
    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const uniqueId = uuidv4().substring(0, 8);
    const fileExtension = path.extname(originalname);
    const filename = `wedding-photos/${timestamp}_${uniqueId}${fileExtension}`;

    // Create file object in bucket
    const file = bucket.file(filename);
    
    // Set metadata
    const metadata = {
      metadata: {
        contentType: mimetype,
        metadata: {
          originalName: originalname,
          uploadedAt: new Date().toISOString(),
          source: 'wedding-photos-app',
          coupleNames: 'Lita & Arya'
        }
      }
    };

    // Upload file to Google Cloud Storage
    await file.save(buffer, metadata);

    // Make the file publicly readable (optional - remove if you want private access)
    await file.makePublic();

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

    console.log(`Photo uploaded successfully: ${filename}`);
    console.log(`Public URL: ${publicUrl}`);

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      filename: filename,
      publicUrl: publicUrl,
      size: buffer.length,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Failed to upload photo',
      details: error.message
    });
  }
});

// Get uploaded photos list (optional - for admin purposes)
app.get('/api/photos', async (req, res) => {
  try {
    const [files] = await bucket.getFiles({ prefix: 'wedding-photos/' });
    
    const photos = files.map(file => ({
      name: file.name,
      size: file.metadata.size,
      uploadedAt: file.metadata.timeCreated,
      publicUrl: `https://storage.googleapis.com/${bucketName}/${file.name}`,
      contentType: file.metadata.contentType
    }));

    res.json({
      success: true,
      count: photos.length,
      photos: photos
    });

  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({
      error: 'Failed to fetch photos',
      details: error.message
    });
  }
});

// Delete photo endpoint (optional - for admin purposes)
app.delete('/api/photos/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const file = bucket.file(`wedding-photos/${filename}`);
    
    await file.delete();
    
    console.log(`Photo deleted: ${filename}`);
    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      error: 'Failed to delete photo',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        details: 'Maximum file size is 10MB'
      });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    details: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Wedding Photos Server running on port ${PORT}`);
  console.log(`📸 Photo uploads will be stored in: gs://${bucketName}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
});

module.exports = app; 