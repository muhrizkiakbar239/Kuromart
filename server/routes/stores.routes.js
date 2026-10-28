import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import * as stores from '../controllers/stores.controller.js';

const router = Router();
router.post('/apply', authenticate, stores.apply);
router.get('/me', authenticate, stores.mine);
router.get('/owner/pending', authenticate, authorize('owner'), stores.pending);
router.patch('/owner/:id/approve', authenticate, authorize('owner'), stores.approve);
export default router;
