import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import * as auth from '../controllers/auth.controller.js';

const router = Router();
router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/refresh', auth.refresh);
router.get('/me', authenticate, auth.me);
export default router;
