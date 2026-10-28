import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import * as w from '../controllers/wishlist.controller.js';

const router = Router();
router.use(authenticate);
router.get('/', w.list);
router.get('/ids', w.savedIds);
router.post('/', w.add);
router.delete('/:productId', w.remove);
export default router;
