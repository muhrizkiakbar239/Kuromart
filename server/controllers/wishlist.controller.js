import { ok, asyncHandler, HttpError } from '../utils/response.js';
import * as wishlist from '../services/wishlist.service.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const list = asyncHandler(async (req, res) => ok(res, await wishlist.list(req.user)));
export const savedIds = asyncHandler(async (req, res) => ok(res, await wishlist.savedIds(req.user)));

export const add = asyncHandler(async (req, res) => {
  const productId = req.body?.productId;
  if (!UUID.test(productId || '')) throw new HttpError(422, 'Produk tidak valid.');
  ok(res, await wishlist.add(req.user, productId), 201);
});

export const remove = asyncHandler(async (req, res) => {
  if (!UUID.test(req.params.productId || '')) throw new HttpError(422, 'Produk tidak valid.');
  ok(res, await wishlist.remove(req.user, req.params.productId));
});
