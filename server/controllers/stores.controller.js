import { ok, asyncHandler } from '../utils/response.js';
import { validateStore } from '../validators/store.validator.js';
import * as storesService from '../services/stores.service.js';

export const apply = asyncHandler(async (req, res) => {
  ok(res, await storesService.applyStore(req.user, validateStore(req.body)), 201);
});

export const mine = asyncHandler(async (req, res) => ok(res, await storesService.getMyStore(req.user)));

export const pending = asyncHandler(async (_req, res) => ok(res, await storesService.listPending()));

export const approve = asyncHandler(async (req, res) => ok(res, await storesService.approveStore(req.params.id)));
