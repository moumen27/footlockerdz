import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Brand from '../models/Brand.model.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const updates = [
    { slug: 'nike', logo: '/assets/brands/nike.svg' },
    { slug: 'adidas', logo: '/assets/brands/adidas.svg' },
    { slug: 'puma', logo: '/assets/brands/puma.png' },
    { slug: 'new-balance', logo: '/assets/brands/new-balance.png' },
    { slug: 'converse', logo: '/assets/brands/converse.svg' },
    { slug: 'asics', logo: '/assets/brands/asics.svg' },
    { slug: 'reebok', logo: '/assets/brands/reebok.png' },
    { slug: 'under-armour', logo: '/assets/brands/under-armour.svg' }
  ];

  for (const u of updates) {
    await Brand.updateOne({ slug: u.slug }, { $set: { logo: u.logo } });
  }

  // Ensure Campus exists
  const campus = await Brand.findOne({ slug: 'campus' });
  if (!campus) {
    await Brand.create({
      name: 'Campus',
      slug: 'campus',
      logo: '/assets/brands/campus.svg',
      country: 'India'
    });
    console.log('Created Campus brand');
  }

  const all = await Brand.find();
  console.log('SUCCESS: All brands updated:', all.map(b => ({ name: b.name, slug: b.slug, logo: b.logo })));
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
