import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import * as products from '../controllers/products.controller.js';
import * as c from '../controllers/commerce.controller.js';

const router = Router();
router.use(authenticate, authorize('seller'));
router.get('/products', products.sellerList);
router.post('/products', products.sellerCreate);
router.get('/products/:id', products.sellerGet);
router.patch('/products/:id', products.sellerUpdate);
router.delete('/products/:id', products.sellerArchive);
router.get('/orders', c.sellerOrders);
router.patch('/orders/:id/status', c.shipOrder);
export default router;
