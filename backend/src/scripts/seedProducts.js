import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import Brand from '../models/Brand.model.js';
import Category from '../models/Category.model.js';
import Product from '../models/Product.model.js';

// Setup env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedProductsData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // Fetch dependencies
    const brands = await Brand.find();
    const categories = await Category.find();

    if (brands.length === 0 || categories.length === 0) {
      console.error('Erreur: Veuillez lancer seedCatalogue.js en premier pour créer les Marques et Catégories.');
      process.exit(1);
    }

    // Helper functions to get IDs
    const getBrandId = (slug) => brands.find(b => b.slug === slug)?._id;
    const getCatId = (slug) => categories.find(c => c.slug === slug)?._id;

    // Base Variants structure
    const createVariants = (colors, sizes) => {
      let variants = [];
      colors.forEach(c => {
        sizes.forEach(s => {
          variants.push({
            color: c.name,
            colorCode: c.hex,
            size: s,
            stock: Math.floor(Math.random() * 20) + 1, // 1 to 20
            images: [
              'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800', // Mock Image
              'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800'
            ]
          });
        });
      });
      return variants;
    };

    // The 15 products
    const products = [
      {
        sku: 'NK-AIR-MAX-270',
        name: { fr: 'Nike Air Max 270', ar: 'نايك اير ماكس 270' },
        description: { fr: 'La chaussure Air Max conçue spécifiquement pour le quotidien.', ar: 'حذاء اير ماكس مصمم خصيصا لنمط الحياة اليومي.' },
        price: 24500,
        discountPrice: 19500,
        isNewProduct: true,
        brand: getBrandId('nike'),
        category: getCatId('lifestyle'),
        variants: createVariants([{name:'Noir', hex:'#000000'}, {name:'Blanc', hex:'#FFFFFF'}], ['40','41','42','43','44'])
      },
      {
        sku: 'AD-ULTRABOOST-23',
        name: { fr: 'Adidas Ultraboost 23', ar: 'أديداس ألترا بوست 23' },
        description: { fr: 'Retour d\'énergie infini pour courir plus longtemps.', ar: 'طاقة لا نهائية للجري لمسافات أطول.' },
        price: 28000,
        discountPrice: 0,
        isNewProduct: true,
        brand: getBrandId('adidas'),
        category: getCatId('running'),
        variants: createVariants([{name:'Gris', hex:'#808080'}, {name:'Bleu', hex:'#0000FF'}], ['41','42','42.5','43'])
      },
      {
        sku: 'PM-SUEDE-CLASSIC',
        name: { fr: 'Puma Suede Classic', ar: 'بوما سويد كلاسيك' },
        description: { fr: 'Le classique indémodable depuis 1968.', ar: 'الكلاسيكي الذي لا يموت منذ عام 1968.' },
        price: 15500,
        discountPrice: 0,
        isNewProduct: false,
        brand: getBrandId('puma'),
        category: getCatId('lifestyle'),
        variants: createVariants([{name:'Rouge', hex:'#FF0000'}, {name:'Noir', hex:'#000000'}], ['39','40','41','42'])
      },
      {
        sku: 'NB-550-V',
        name: { fr: 'New Balance 550', ar: 'نيو بالانس 550' },
        description: { fr: 'Style rétro basket pour tous les jours.', ar: 'تصميم كرة سلة كلاسيكي للاستخدام اليومي.' },
        price: 21000,
        discountPrice: 18000,
        isNewProduct: true,
        brand: getBrandId('new-balance'),
        category: getCatId('lifestyle'),
        variants: createVariants([{name:'Blanc/Vert', hex:'#F0FFF0'}], ['38','39','40','41','42','43'])
      },
      {
        sku: 'UA-CURRY-10',
        name: { fr: 'Under Armour Curry 10', ar: 'أندر آرمور كاري 10' },
        description: { fr: 'Agilité et adhérence pour le basketball.', ar: 'مرونة وتماسك رائع لكرة السلة.' },
        price: 26000,
        discountPrice: 22000,
        isNewProduct: false,
        brand: getBrandId('under-armour'),
        category: getCatId('basketball'),
        variants: createVariants([{name:'Jaune', hex:'#FFFF00'}, {name:'Noir', hex:'#000000'}], ['42','43','44','45'])
      },
      {
        sku: 'AS-GEL-KAYANO-29',
        name: { fr: 'Asics Gel-Kayano 29', ar: 'اسيكس جل كايانو 29' },
        description: { fr: 'Stabilité maximale pour les longs runs.', ar: 'ثبات أقصى للركض الطويل.' },
        price: 27500,
        discountPrice: 0,
        isNewProduct: true,
        brand: getBrandId('asics'),
        category: getCatId('running'),
        variants: createVariants([{name:'Bleu Marine', hex:'#000080'}, {name:'Noir', hex:'#000000'}], ['41','42','43','44','44.5'])
      },
      {
        sku: 'RB-CLUB-C-85',
        name: { fr: 'Reebok Club C 85', ar: 'ريبوك كلوب سي 85' },
        description: { fr: 'Design épuré inspiré du tennis.', ar: 'تصميم نظيف مستوحى من التنس.' },
        price: 13000,
        discountPrice: 11500,
        isNewProduct: false,
        brand: getBrandId('reebok'),
        category: getCatId('lifestyle'),
        variants: createVariants([{name:'Blanc', hex:'#FFFFFF'}, {name:'Beige', hex:'#F5F5DC'}], ['39','40','41','42'])
      },
      {
        sku: 'CV-CHUCK-T-70',
        name: { fr: 'Converse Chuck 70 High', ar: 'كونفيرس تشاك 70 عالي' },
        description: { fr: 'Toile premium et détails vintage.', ar: 'قماش ممتاز وتفاصيل كلاسيكية.' },
        price: 14000,
        discountPrice: 0,
        isNewProduct: false,
        brand: getBrandId('converse'),
        category: getCatId('lifestyle'),
        variants: createVariants([{name:'Noir', hex:'#000000'}, {name:'Parchemin', hex:'#EEDC82'}], ['36','37','38','39','40','41','42'])
      },
      {
        sku: 'NK-PEGASUS-40',
        name: { fr: 'Nike Air Zoom Pegasus 40', ar: 'نايك اير زوم بيغاسوس 40' },
        description: { fr: 'Le cheval ailé de retour pour votre course quotidienne.', ar: 'حصان مجنح لركضك اليومي.' },
        price: 19500,
        discountPrice: 16000,
        isNewProduct: true,
        brand: getBrandId('nike'),
        category: getCatId('running'),
        variants: createVariants([{name:'Gris/Orange', hex:'#A9A9A9'}, {name:'Noir', hex:'#000000'}], ['40','41','42','43'])
      },
      {
        sku: 'AD-PREDATOR-A',
        name: { fr: 'Adidas Predator Accuracy', ar: 'أديداس بريداتور أكيوراسي' },
        description: { fr: 'Précision chirurgicale sur le terrain.', ar: 'دقة جراحية في الملعب.' },
        price: 32000,
        discountPrice: 0,
        isNewProduct: true,
        brand: getBrandId('adidas'),
        category: getCatId('football'),
        variants: createVariants([{name:'Rose/Noir', hex:'#FFC0CB'}, {name:'Blanc', hex:'#FFFFFF'}], ['39','40','41','42','43'])
      },
      {
        sku: 'PM-FUTURE-Z',
        name: { fr: 'Puma Future Z 1.4', ar: 'بوما فيوتشر زد 1.4' },
        description: { fr: 'Créativité sans limite pour les meneurs de jeu.', ar: 'إبداع بلا حدود لصناع اللعب.' },
        price: 29000,
        discountPrice: 24000,
        isNewProduct: false,
        brand: getBrandId('puma'),
        category: getCatId('football'),
        variants: createVariants([{name:'Jaune Fluo', hex:'#CCFF00'}, {name:'Noir', hex:'#000000'}], ['40','41','42'])
      },
      {
        sku: 'NK-LEBRON-20',
        name: { fr: 'Nike LeBron XX', ar: 'نايك ليبرون 20' },
        description: { fr: 'Légèreté et maintien pour la prochaine génération.', ar: 'خفة ودعم للجيل القادم.' },
        price: 31000,
        discountPrice: 0,
        isNewProduct: true,
        brand: getBrandId('nike'),
        category: getCatId('basketball'),
        variants: createVariants([{name:'Violet', hex:'#800080'}, {name:'Blanc', hex:'#FFFFFF'}], ['42','43','44','45','46'])
      },
      {
        sku: 'AD-ADILETTE-22',
        name: { fr: 'Adidas Adilette 22', ar: 'أديداس أديليت 22' },
        description: { fr: 'Design futuriste pour un confort total.', ar: 'تصميم مستقبلي لراحة تامة.' },
        price: 7500,
        discountPrice: 0,
        isNewProduct: false,
        brand: getBrandId('adidas'),
        category: getCatId('slides'),
        variants: createVariants([{name:'Vert Désert', hex:'#9DC183'}, {name:'Sable', hex:'#C2B280'}], ['38','40','42','44'])
      },
      {
        sku: 'NK-METCON-8',
        name: { fr: 'Nike Metcon 8', ar: 'نايك ميتكون 8' },
        description: { fr: 'Stabilité extrême pour le cross-training.', ar: 'ثبات شديد للتدريب المتقاطع.' },
        price: 18000,
        discountPrice: 15000,
        isNewProduct: false,
        brand: getBrandId('nike'),
        category: getCatId('training'),
        variants: createVariants([{name:'Noir/Gris', hex:'#2F4F4F'}, {name:'Blanc/Rouge', hex:'#FFFafa'}], ['40','41','42','43','44'])
      },
      {
        sku: 'UA-PROJECT-ROCK',
        name: { fr: 'UA Project Rock 5', ar: 'أندر آرمور بروجكت روك 5' },
        description: { fr: 'Repoussez vos limites à la salle.', ar: 'تخطى حدودك في الصالة الرياضية.' },
        price: 22000,
        discountPrice: 0,
        isNewProduct: true,
        brand: getBrandId('under-armour'),
        category: getCatId('training'),
        variants: createVariants([{name:'Gris Métal', hex:'#778899'}, {name:'Noir/Jaune', hex:'#000000'}], ['41','42','43','44'])
      },
      {
        sku: 'VN-OLD-SKOOL',
        name: { fr: 'Vans Old Skool', ar: 'فانس أولد سكول' },
        description: { fr: 'L\'emblématique chaussure de skate classique avec la légendaire bande Sidestripe.', ar: 'حذاء التزلج الكلاسيكي الأيقوني مع الخط الجانبي الشهير.' },
        price: 11500,
        discountPrice: 0,
        isNewProduct: true,
        brand: getBrandId('vans'),
        category: getCatId('lifestyle'),
        variants: createVariants([{name:'Noir/Blanc', hex:'#000000'}], ['40','41','42','43'])
      }
    ];

    // Clear existing products
    await Product.deleteMany();
    console.log('Cleared existing products.');

    // Insert 15 products
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedProductsData();
