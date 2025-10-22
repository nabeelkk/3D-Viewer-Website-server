import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import Model3D from '../models/Model3D.js';

export const getModels = async (req, res) => {
  try {
    const models = await Model3D.find().select('-__v'); 

    res.json({
      success: true,
      data: models,
    });
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch models' });
  }
};


export const deleteModel = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid model ID' });
    }

    const model = await Model3D.findById(id);
    if (!model) {
      return res.status(404).json({ success: false, error: 'Model not found' });
    }

    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'models' });

    await bucket.delete(model.fileId);

    await Model3D.findByIdAndDelete(id);

    res.json({ success: true, message: 'Model deleted successfully' });
  } catch (error) {
    console.error('Delete model error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete model' });
  }
};

