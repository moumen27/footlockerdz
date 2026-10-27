import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@footlocker.dz' });
    if (existingAdmin) {
      console.log('L\'utilisateur admin@footlocker.dz existe déjà !');
      process.exit(0);
    }

    const adminUser = new User({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@footlocker.dz',
      password: 'password123',
      role: 'super_admin',
      isVerified: true
    });

    await adminUser.save();
    console.log('✅ Utilisateur Administrateur créé avec succès !');
    console.log('👉 Email : admin@footlocker.dz');
    console.log('👉 Mot de passe : password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la création de l\'admin:', error);
    process.exit(1);
  }
};

seedAdmin();
