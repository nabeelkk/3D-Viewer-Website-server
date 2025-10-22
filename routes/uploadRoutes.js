import express from 'express';
import {uploadModel, getModelFile} from '../controllers/uploadController.js';
import { uploadMiddleware, handleUploadErrors } from '../middleware/upload.js';

const router = express.Router();

router.post('/', uploadMiddleware, handleUploadErrors, uploadModel);
router.get('/file/:id', getModelFile);

export default router;
