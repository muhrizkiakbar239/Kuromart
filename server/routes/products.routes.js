import { Router } from 'express';
import * as products from '../controllers/products.controller.js';

const router = Router();
router.get('/', products.catalog);
router.get('/id/:id', products.byId);
router.get('/:slug', products.bySlug);
export default router;
