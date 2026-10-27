import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import Brand from '../models/Brand.model.js';
import Category from '../models/Category.model.js';

// Setup env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const brandsToSeed = [
  { name: 'Nike', slug: 'nike', logo: '/assets/brands/nike.png', country: 'USA' },
  { name: 'Adidas', slug: 'adidas', logo: '/assets/brands/adidas.png', country: 'Germany' },
  { name: 'Puma', slug: 'puma', logo: '/assets/brands/puma.png', country: 'Germany' },
  { name: 'New Balance', slug: 'new-balance', logo: '/assets/brands/new-balance.png', country: 'USA' },
  { name: 'Under Armour', slug: 'under-armour', logo: '/assets/brands/under-armour.png', country: 'USA' },
  { name: 'Asics', slug: 'asics', logo: '/assets/brands/asics.png', country: 'Japan' },
  { name: 'Reebok', slug: 'reebok', logo: '/assets/brands/reebok.png', country: 'UK' },
  { name: 'Converse', slug: 'converse', logo: '/assets/brands/converse.png', country: 'USA' },
  { name: 'Vans', slug: 'vans', logo: '/assets/brands/vans.png', country: 'USA' },
];

const categoriesToSeed = [
  { name: { fr: 'Running', ar: 'جري' }, slug: 'running', type: 'sport' },
  { name: { fr: 'Basketball', ar: 'كرة السلة' }, slug: 'basketball', type: 'sport' },
  { name: { fr: 'Football', ar: 'كرة القدم' }, slug: 'football', type: 'sport' },
  { name: { fr: 'Lifestyle', ar: 'أسلوب الحياة' }, slug: 'lifestyle', type: 'sport' },
  { name: { fr: 'Outdoor', ar: 'في الهواء الطلق' }, slug: 'outdoor', type: 'sport' },
  { name: { fr: 'Slides', ar: 'شباشب' }, slug: 'slides', type: 'sport' },
  { name: { fr: 'Training', ar: 'تدريب' }, slug: 'training', type: 'sport' },
];

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // Clear existing data
    await Brand.deleteMany();
    await Category.deleteMany();
    console.log('Cleared existing brands and categories.');

    // Insert new data
    await Brand.insertMany(brandsToSeed);
    console.log(`Seeded ${brandsToSeed.length} brands.`);

    await Category.insertMany(categoriesToSeed);
    console.log(`Seeded ${categoriesToSeed.length} categories.`);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedData();
