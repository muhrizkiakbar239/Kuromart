import { ok, asyncHandler, HttpError } from '../utils/response.js';
import { validateProduct } from '../validators/product.validator.js';
import * as svc from '../services/products.service.js';

// Publik
export const catalog = asyncHandler(async (req, res) => ok(res, await svc.listCatalog(req.query)));
export const bySlug = asyncHandler(async (req, res) => ok(res, await svc.getPublishedBySlug(req.params.slug)));
export const byId = asyncHandler(async (req, res) => ok(res, await svc.getPublishedById(req.params.id)));
export const categories = asyncHandler(async (_req, res) => ok(res, await svc.listCategories()));

// Seller
export const sellerList = asyncHandler(async (req, res) => ok(res, await svc.listSellerProducts(req.user)));
export const sellerGet = asyncHandler(async (req, res) => ok(res, await svc.getSellerProduct(req.user, req.params.id)));

export const sellerCreate = asyncHandler(async (req, res) => {
  const { imageDataUrl, ...rest } = req.body || {};
  const body = validateProduct(rest);
  ok(res, await svc.createProduct(req.user, body, imageDataUrl), 201);
});

export const sellerUpdate = asyncHandler(async (req, res) => {
  const { imageDataUrl, ...rest } = req.body || {};
  const body = validateProduct(rest, true);
  if (!Object.keys(body).length && !imageDataUrl) throw new HttpError(422, 'Tidak ada perubahan yang dikirim.');
  ok(res, await svc.updateProduct(req.user, req.params.id, body, imageDataUrl));
});

export const sellerArchive = asyncHandler(async (req, res) => ok(res, await svc.archiveProduct(req.user, req.params.id)));
