import express from 'express';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Setup multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', protect, authorizeRoles('super_admin', 'admin_catalog'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'footlocker',
      resource_type: 'auto',
    });

    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error('Erreur Cloudinary:', error);
    res.status(500).json({ message: 'Erreur lors du téléchargement de l\'image' });
  }
});

export default router;
