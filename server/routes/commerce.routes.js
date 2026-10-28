import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import * as c from '../controllers/commerce.controller.js';

export const ordersRouter = Router();
ordersRouter.use(authenticate);
ordersRouter.post('/', c.checkout);
ordersRouter.get('/', c.myOrders);
ordersRouter.get('/:id', c.myOrder);
ordersRouter.patch('/:id/status', c.updateMyOrder);

export const reviewsRouter = Router();
reviewsRouter.get('/product/:productId', c.productReviews);
reviewsRouter.post('/', authenticate, c.createReview);

export const notificationsRouter = Router();
notificationsRouter.use(authenticate);
notificationsRouter.get('/', c.listNotifications);
notificationsRouter.patch('/read-all', c.readAllNotifications);

export const vouchersRouter = Router();
vouchersRouter.post('/check', authenticate, c.checkVoucher);

export const ownerRouter = Router();
ownerRouter.use(authenticate, authorize('owner'));
ownerRouter.get('/stats', c.stats);
ownerRouter.get('/orders', c.ownerOrders);
ownerRouter.get('/vouchers', c.ownerVouchers);
ownerRouter.post('/vouchers', c.ownerCreateVoucher);
ownerRouter.patch('/vouchers/:id', c.ownerToggleVoucher);
