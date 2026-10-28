import { ok, asyncHandler, HttpError } from '../utils/response.js';
import * as orders from '../services/orders.service.js';
import * as reviews from '../services/reviews.service.js';
import * as notifications from '../services/notifications.service.js';
import * as owner from '../services/owner.service.js';
import { validateReview, validateVoucher, validateNewVoucher } from '../validators/order.validator.js';

export const checkout = asyncHandler(async (req, res) => ok(res, await orders.checkout(req.user, req.body), 201));
export const myOrders = asyncHandler(async (req, res) => ok(res, await orders.listMine(req.user)));
export const myOrder = asyncHandler(async (req, res) => ok(res, await orders.getMine(req.user, req.params.id)));
export const updateMyOrder = asyncHandler(async (req, res) =>
  ok(res, await orders.updateBuyerStatus(req.user, req.params.id, req.body?.status)));

export const sellerOrders = asyncHandler(async (req, res) => ok(res, await orders.listStoreOrders(req.user)));
export const shipOrder = asyncHandler(async (req, res) =>
  ok(res, await orders.shipStoreOrder(req.user, req.params.id, req.body?.status, {
  courier: String(req.body?.courier || '').slice(0, 40),
  trackingNumber: String(req.body?.trackingNumber || '').slice(0, 60)
})));

export const createReview = asyncHandler(async (req, res) =>
  ok(res, await reviews.createReview(req.user, validateReview(req.body)), 201));
export const productReviews = asyncHandler(async (req, res) =>
  ok(res, await reviews.listForProduct(req.params.productId)));

export const listNotifications = asyncHandler(async (req, res) => ok(res, await notifications.listMine(req.user)));
export const readAllNotifications = asyncHandler(async (req, res) => ok(res, await notifications.markAllRead(req.user)));

export const checkVoucher = asyncHandler(async (req, res) => {
  const { code } = validateVoucher(req.body);
  const subtotal = Number(req.body?.subtotal) || 0;
  if (subtotal <= 0) throw new HttpError(422, 'Subtotal tidak valid.');
  ok(res, await owner.previewVoucher(code, subtotal));
});

export const stats = asyncHandler(async (_req, res) => ok(res, await owner.stats()));
export const ownerOrders = asyncHandler(async (_req, res) => ok(res, await owner.listOrders()));
export const ownerVouchers = asyncHandler(async (_req, res) => ok(res, await owner.listVouchers()));
export const ownerCreateVoucher = asyncHandler(async (req, res) =>
  ok(res, await owner.createVoucher(validateNewVoucher(req.body)), 201));
export const ownerToggleVoucher = asyncHandler(async (req, res) =>
  ok(res, await owner.setVoucherActive(req.params.id, Boolean(req.body?.active))));
