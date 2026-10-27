import express from 'express';
import Category from '../models/Category.model.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;