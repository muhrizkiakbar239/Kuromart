import { ok, HttpError, asyncHandler } from '../utils/response.js';
import { validateRegister, validateLogin } from '../validators/user.validator.js';
import * as authService from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const session = await authService.register(validateRegister(req.body));
  ok(res, session, 201);
});

export const login = asyncHandler(async (req, res) => {
  ok(res, await authService.login(validateLogin(req.body)));
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.body?.refreshToken;
  if (!token) throw new HttpError(422, 'Refresh token wajib diisi.');
  ok(res, await authService.refresh(token));
});

export const me = asyncHandler(async (req, res) => {
  const { id, email, fullName, role } = req.user;
  ok(res, { id, email, fullName, role });
});
