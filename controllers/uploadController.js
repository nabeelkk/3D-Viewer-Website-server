import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import Model3D from '../models/Model3D.js';


export const uploadModel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'models' });

    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${req.file.originalname}`;

    const uploadStream = bucket.openUploadStream(uniqueFilename, {
      metadata: {
        originalName: req.file.originalname,
        uploadDate: new Date(),
        mimeType: req.file.mimetype,
        uploadedBy: 'admin',
      },
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on('error', (error) => {
      console.error('Upload stream error:', error);
      return res.status(500).json({ success: false, error: 'Upload failed' });
    });

    uploadStream.on('finish', async () => {
      try {
        const model = new Model3D({
          name: req.body.name || req.file.originalname.replace('.glb', ''),
          description: req.body.description || '',
          filename: uniqueFilename,
          originalName: req.file.originalname,
          fileId: uploadStream.id,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          tags: req.body.tags
            ? req.body.tags.split(',').map((tag) => tag.trim())
            : [],
          category: req.body.category || 'other',
        });

        await model.save();

        res.status(201).json({
          success: true,
          message: 'Model uploaded successfully',
          data: {
            id: model._id,
            name: model.name,
            fileSize: model.fileSize,
            uploadDate: model.uploadDate,
          },
        });
      } catch (dbError) {
        console.error('DB save error:', dbError);
        try {
          await bucket.delete(uploadStream.id); 
        } catch (deleteError) {
          console.error('Failed to delete file from GridFS:', deleteError);
        }
        res.status(500).json({ success: false, error: 'Failed to save model to database' });
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
};


export const getModelFile = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("hbbhb",id)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file ID',
      });
    }

    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'models' });
    const fileId = new mongoose.Types.ObjectId(id);

    const files = await bucket.find({ _id: fileId }).toArray();
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Model file not found',
      });
    }

    const file = files[0];

    res.set('Content-Type', file.metadata?.mimeType || 'model/gltf-binary');
    res.set(
      'Content-Disposition',
      `inline; filename="${file.metadata?.originalName || file.filename}"`
    );
    res.set('Cache-Control', 'public, max-age=3600');

    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Error streaming file',
        });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve file',
    });
  }
};
