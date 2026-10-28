import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/auth.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import productsRoutes from './routes/products.routes.js';
import sellerRoutes from './routes/seller.routes.js';
import storesRoutes from './routes/stores.routes.js';
import { ordersRouter, reviewsRouter, notificationsRouter, vouchersRouter, ownerRouter } from './routes/commerce.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import { notFound, errorHandler } from './middleware/error-handler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '..', 'public');

export const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '4mb' }));

app.get('/api/health', (_req, res) => res.json({ success: true, data: { service: 'kuromart', phase: 4 } }));
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/stores', storesRoutes);
app.use('/api/orders', ordersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/vouchers', vouchersRouter);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/owner', ownerRouter);
app.use('/api', notFound);

app.use(express.static(publicDir, { extensions: ['html'] }));
app.use((_req, res) => res.status(404).sendFile(path.join(publicDir, 'pages', 'errors', '404.html')));
app.use(errorHandler);
