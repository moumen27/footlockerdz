import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import ordersRoutes from './routes/orders.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import cartRoutes from './routes/cart.routes.js';
import likesRoutes from './routes/likes.routes.js';
import productsRoutes from './routes/products.routes.js';
import stripeRoutes from './routes/stripe.routes.js';
import adminUsersRoutes from './routes/adminUsers.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import bannersRoutes from './routes/banners.routes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import translationsRoutes from './routes/translations.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import brandsRoutes from './routes/brands.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import commentsRoutes from './routes/comments.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';

const app = express();

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173'], // Frontend URL
  credentials: true,
}));
app.use(helmet());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Base Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Setup routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', likesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/users/admin', adminUsersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/translations', translationsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/newsletter', newsletterRoutes);

export default app;
