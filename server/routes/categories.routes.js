import { Router } from 'express';
import * as products from '../controllers/products.controller.js';

const router = Router();
router.get('/', products.categories);
export default router;
