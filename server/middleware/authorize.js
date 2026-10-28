import { HttpError } from '../utils/response.js';

export const authorize = (...roles) => (req, _res, next) => {
  if (req.user && roles.includes(req.user.role)) return next();
  return next(new HttpError(403, 'Anda tidak memiliki akses ke halaman ini.'));
};
